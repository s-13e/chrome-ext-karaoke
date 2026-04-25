// tunePipelineManager.ts
// Tune 탭의 Web Audio + SoundTouch 파이프라인을 싱글톤으로 관리
// 사이드바 탭 전환 시에도 파이프라인과 설정이 유지됨
// 페이지 새로고침/전환 시에만 초기화
//
// 체인 구성 (state machine): pitchActive × vocalActive 의 4가지 조합
//   00: source → destination                              (둘 다 off)
//   01: source → vocalChain → destination                 (보컬 제거만)
//   10: source → pitchNode → destination                  (피치만, 기존)
//   11: source → vocalChain → pitchNode → destination     (둘 다)
//
// 보컬 체인(Tier 1, L−R 센터 캔슬 + 3-밴드 EQ):
//   splitter[0] (L) ─Gain(+1)─┐
//                              ├─→ sumNode ─→ stereoMerger (mono→stereo)
//   splitter[1] (R) ─Gain(−1)─┘                    │
//                                                  ▼
//                            lowShelf ─→ midPeak ─→ highPeak ─→ out
//
// 분석 탭(입력 분석용, 메인 오디오에 영향 없음):
//   source ─→ spectrumAnalyser (mono FFT)
//   source ─→ analyzerSplitter ─→ lAnalyser (L 채널, 시간영역)
//                                └→ rAnalyser (R 채널, 시간영역)
//
// Tier 2(HD, ML 기반)는 추후 동일한 vocalChain 자리에 AudioWorkletNode 로 대체 예정.

import { SoundTouch } from 'soundtouchjs';
import { STORAGE_KEYS } from '@constants/storageKeys';

export type VocalMode = 'off' | 'basic' | 'hd';

/** EQ 파라미터 (보컬 체인 후반부) + 멀티밴드 crossover 주파수 */
export interface VocalEqParams {
  lowShelf: { freq: number; gain: number };
  midPeak: { freq: number; Q: number; gain: number };
  highPeak: { freq: number; Q: number; gain: number };
  // 멀티밴드 모드 전용 — 'basic' 모드에서는 무시됨
  crossover: { lowHz: number; highHz: number };
}

/** 디버그 스냅샷 — Dev 튜닝 UI에서 복사 버튼 누를 때 생성 */
export interface VocalDebugSnapshot {
  timestamp: string;
  audio: {
    sampleRate: number;
    audioCtxState: AudioContextState; // 'running' 이어야 분석 유효
    stereoCorrelation: number; // -1~1, 1에 가까울수록 L/R 유사 (센터 보컬일수록 L-R 효과 ↑)
    frequencyBands_dB: {
      bass_20_150: number;
      lowMid_150_500: number;
      mid_500_2000: number;
      highMid_2000_5000: number;
      high_5000_20000: number;
    };
    topPeaks_Hz: number[];
    isSilent: boolean; // 분석 결과가 사실상 무음이면 true (context suspended 등 진단)
  };
  eq: VocalEqParams;
}

export const DEFAULT_VOCAL_EQ: VocalEqParams = {
  // 저역 능동 부스트 — 킥/베이스 존재감 강화 + 크로스오버 phase dip 보상
  lowShelf: { freq: 100, gain: 3 },
  // 후처리 EQ: midPeak(보컬 본체) + highPeak(고음 보컬 잔여 — 더 넓고 강하게)
  midPeak: { freq: 3000, Q: 1.5, gain: -6 },
  highPeak: { freq: 6000, Q: 1.2, gain: -8 },
  // 멀티밴드 crossover:
  // - <250Hz: 킥 body(60~300Hz) + 베이스 라인 거의 전부 스테레오 유지
  // - 250~13000Hz: L-R 캔슬 (보컬 본체 + 포먼트 + 치찰음)
  // - >13000Hz: 공기감·심벌만 스테레오 유지
  // 남성 보컬 펀더멘털(85~250Hz) 보존 영역에 들어가지만 보컬 본체(500~3000Hz 포먼트)는
  // 여전히 처리되어 인식 감소. 킥/베이스 그루브 보존이 청취 경험에 더 중요.
  crossover: { lowHz: 250, highHz: 13000 },
};

/**
 * 보컬 제거 체인 (Tier 1, 멀티밴드 L−R):
 * 저역(<crossover.lowHz)과 고역(>crossover.highHz)은 스테레오 유지,
 * 중역만 L−R 캔슬 → 베이스/심벌 보존하면서 보컬 처리.
 *
 *   inputBus ─┬─ bassLP ──────────────────────────────────────┐
 *             ├─ midHP → midLP → splitter → L(+1)/R(-1) ────┤── bandSum
 *             │                              → sum → stereoMerger
 *             └─ trebleHP ────────────────────────────────────┘
 *                                                              ↓
 *                                          lowShelf → midPeak → highPeak (출구)
 */
interface VocalChain {
  // 입력 분기 버스 (3개 병렬 path)
  inputBus: GainNode;
  // 저역 path (lowpass, 스테레오 유지)
  bassLP: BiquadFilterNode;
  // 중역 path (highpass + lowpass + L-R)
  midHP: BiquadFilterNode;
  midLP: BiquadFilterNode;
  midSplitter: ChannelSplitterNode;
  midGainL: GainNode;
  midGainRNeg: GainNode;
  midSumNode: GainNode;
  midStereoMerger: ChannelMergerNode;
  // 고역 path (highpass, 스테레오 유지)
  trebleHP: BiquadFilterNode;
  // 3밴드 합산
  bandSum: GainNode;
  // 후처리 3-밴드 EQ
  lowShelf: BiquadFilterNode;
  midPeak: BiquadFilterNode;
  highPeak: BiquadFilterNode; // 체인 출구
  // 입구: inputBus / 출구: highPeak
}

interface SourceAnalyzers {
  // AnalyserNode는 pass-through (input=output). Chrome의 dead-end 최적화로 parallel tap이
  // 실제 처리되지 않는 이슈를 피하기 위해 메인 오디오 체인 내부에 직접 삽입한다.
  //   source → spectrumAnalyser → analyzerSplitter → lAna → analyzerMerger(ch0)
  //                                                └→ rAna → analyzerMerger(ch1) → [vocal | direct] → destination
  spectrumAnalyser: AnalyserNode;
  analyzerSplitter: ChannelSplitterNode;
  lAnalyser: AnalyserNode;
  rAnalyser: AnalyserNode;
  analyzerMerger: ChannelMergerNode; // 체인 출구 (다음 단의 입력으로 사용)
}

interface TunePipeline {
  audioCtx: AudioContext;
  source: MediaElementAudioSourceNode;
  scriptNode: ScriptProcessorNode;
  soundtouch: SoundTouch;
  vocal: VocalChain | null; // lazy: basic/multiband 활성화 시 해당 종류로 생성
  analyzers: SourceAnalyzers; // 항상 생성 (디버그/분석 용도)
}

/** 싱글톤 상태 */
let pipeline: TunePipeline | null = null;
let currentPitch = 0; // 반음 단위
let currentTempo = 1.0;
let currentVocalMode: VocalMode = 'off';
let currentEq: VocalEqParams = { ...DEFAULT_VOCAL_EQ };
let listeners: Array<() => void> = [];

/** 상태 변경 리스너 등록 */
export function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

/** 현재 설정 조회 */
export function getTuneState(): { pitch: number; tempo: number; vocalMode: VocalMode } {
  return { pitch: currentPitch, tempo: currentTempo, vocalMode: currentVocalMode };
}

/** YouTube 비디오 요소 */
function getVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video.html5-main-video');
}

/** 파이프라인 초기화 (한 번만 실행) */
function ensurePipeline(): TunePipeline | null {
  if (pipeline) return pipeline;

  const video = getVideo();
  if (!video) return null;

  try {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(video);
    const st = new SoundTouch();

    const bufferSize = 4096;
    const scriptNode = audioCtx.createScriptProcessor(bufferSize, 2, 2);

    scriptNode.onaudioprocess = (e) => {
      const inLeft = e.inputBuffer.getChannelData(0);
      const inRight = e.inputBuffer.getChannelData(1);
      const outLeft = e.outputBuffer.getChannelData(0);
      const outRight = e.outputBuffer.getChannelData(1);
      const numFrames = inLeft.length;

      // 피치 0이면 패스스루
      if (currentPitch === 0) {
        outLeft.set(inLeft);
        outRight.set(inRight);
        return;
      }

      // 입력 → SoundTouch (interleaved)
      const interleaved = new Float32Array(numFrames * 2);
      for (let i = 0; i < numFrames; i++) {
        interleaved[i * 2] = inLeft[i]!;
        interleaved[i * 2 + 1] = inRight[i]!;
      }
      st.inputBuffer.putSamples(interleaved, 0, numFrames);

      // process를 반복 호출하여 충분한 출력 확보
      let loopCount = 0;
      while (st.outputBuffer.frameCount < numFrames && loopCount < 8) {
        st.process();
        loopCount++;
      }

      // 출력 추출
      const available = st.outputBuffer.frameCount;
      if (available >= numFrames) {
        const outInterleaved = new Float32Array(numFrames * 2);
        st.outputBuffer.receiveSamples(outInterleaved, numFrames);
        for (let i = 0; i < numFrames; i++) {
          outLeft[i] = outInterleaved[i * 2]!;
          outRight[i] = outInterleaved[i * 2 + 1]!;
        }
      } else if (available > 0) {
        const outInterleaved = new Float32Array(available * 2);
        st.outputBuffer.receiveSamples(outInterleaved, available);
        for (let i = 0; i < available; i++) {
          outLeft[i] = outInterleaved[i * 2]!;
          outRight[i] = outInterleaved[i * 2 + 1]!;
        }
        // 부족분은 입력 복사
        for (let i = available; i < numFrames; i++) {
          outLeft[i] = inLeft[i]!;
          outRight[i] = inRight[i]!;
        }
      } else {
        outLeft.set(inLeft);
        outRight.set(inRight);
      }
    };

    // 분석 노드를 메인 오디오 체인 내부에 pass-through로 삽입.
    // AnalyserNode는 input==output이라 삽입해도 음질/볼륨 변화 없음.
    // 장점: Chrome이 audible path로 인식 → FFT 처리 보장 (dead-end 최적화 회피).
    const spectrumAnalyser = audioCtx.createAnalyser();
    spectrumAnalyser.fftSize = 4096;
    spectrumAnalyser.smoothingTimeConstant = 0.2;

    const analyzerSplitter = audioCtx.createChannelSplitter(2);
    const lAnalyser = audioCtx.createAnalyser();
    const rAnalyser = audioCtx.createAnalyser();
    lAnalyser.fftSize = 2048;
    rAnalyser.fftSize = 2048;
    const analyzerMerger = audioCtx.createChannelMerger(2);

    // 고정 내부 배선 (한 번 연결하고 유지):
    // spectrumAnalyser → analyzerSplitter → lAna → merger[0]
    //                                   └→ rAna → merger[1]
    spectrumAnalyser.connect(analyzerSplitter);
    analyzerSplitter.connect(lAnalyser, 0);
    analyzerSplitter.connect(rAnalyser, 1);
    lAnalyser.connect(analyzerMerger, 0, 0);
    rAnalyser.connect(analyzerMerger, 0, 1);
    // 체인 입구: spectrumAnalyser / 출구: analyzerMerger (applyChain에서 연결)

    pipeline = {
      audioCtx,
      source,
      scriptNode,
      soundtouch: st,
      vocal: null,
      analyzers: { spectrumAnalyser, analyzerSplitter, lAnalyser, rAnalyser, analyzerMerger },
    };

    // AudioContext가 Chrome 정책으로 'suspended' 상태일 수 있음 — 즉시 재개 시도
    // (분석 애널라이저가 실제 데이터를 받으려면 running 상태 필요)
    audioCtx.resume().catch((err) => {
      console.warn('[TunePipeline] AudioContext resume 실패:', err);
    });

    // 초기 연결: bypass 상태 (pitch=0, vocal=off)
    applyChain();

    console.log('[TunePipeline] 파이프라인 초기화 성공');
    return pipeline;
  } catch (error) {
    console.error('[TunePipeline] 파이프라인 초기화 실패:', error);
    return null;
  }
}

/** 후처리 3-밴드 EQ 노드 3개 생성 (basic/multiband 공통) */
function createPostEq(ctx: AudioContext): {
  lowShelf: BiquadFilterNode;
  midPeak: BiquadFilterNode;
  highPeak: BiquadFilterNode;
} {
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = currentEq.lowShelf.freq;
  lowShelf.gain.value = currentEq.lowShelf.gain;

  const midPeak = ctx.createBiquadFilter();
  midPeak.type = 'peaking';
  midPeak.frequency.value = currentEq.midPeak.freq;
  midPeak.Q.value = currentEq.midPeak.Q;
  midPeak.gain.value = currentEq.midPeak.gain;

  const highPeak = ctx.createBiquadFilter();
  highPeak.type = 'peaking';
  highPeak.frequency.value = currentEq.highPeak.freq;
  highPeak.Q.value = currentEq.highPeak.Q;
  highPeak.gain.value = currentEq.highPeak.gain;

  return { lowShelf, midPeak, highPeak };
}

/** 보컬 제거 체인(lazy 생성) — 'basic' 모드 첫 활성화 시 호출 */
function ensureVocalChain(p: TunePipeline): VocalChain {
  if (p.vocal) return p.vocal;

  const ctx = p.audioCtx;
  const inputBus = new GainNode(ctx, { gain: 1 });

  // 저역 path: lowpass (스테레오 유지)
  const bassLP = ctx.createBiquadFilter();
  bassLP.type = 'lowpass';
  bassLP.frequency.value = currentEq.crossover.lowHz;
  bassLP.Q.value = 0.707; // Butterworth (-3dB at cutoff)

  // 중역 path: highpass → lowpass → L-R 캔슬
  const midHP = ctx.createBiquadFilter();
  midHP.type = 'highpass';
  midHP.frequency.value = currentEq.crossover.lowHz;
  midHP.Q.value = 0.707;

  const midLP = ctx.createBiquadFilter();
  midLP.type = 'lowpass';
  midLP.frequency.value = currentEq.crossover.highHz;
  midLP.Q.value = 0.707;

  const midSplitter = ctx.createChannelSplitter(2);
  const midGainL = new GainNode(ctx, { gain: 1 });
  const midGainRNeg = new GainNode(ctx, { gain: -1 });
  const midSumNode = new GainNode(ctx, { gain: 1 });
  const midStereoMerger = ctx.createChannelMerger(2);

  // 고역 path: highpass (스테레오 유지)
  const trebleHP = ctx.createBiquadFilter();
  trebleHP.type = 'highpass';
  trebleHP.frequency.value = currentEq.crossover.highHz;
  trebleHP.Q.value = 0.707;

  const bandSum = new GainNode(ctx, { gain: 1 });
  const { lowShelf, midPeak, highPeak } = createPostEq(ctx);

  // 배선:
  // inputBus ─┬─ bassLP ──────────────────────────────────────────┐
  //           ├─ midHP → midLP → midSplitter → L(+1)/R(-1) ─┐    │
  //           │                                              ├──→ │── bandSum → lowShelf → midPeak → highPeak
  //           │                       midSumNode → midStereoMerger
  //           └─ trebleHP ────────────────────────────────────────┘
  inputBus.connect(bassLP);
  inputBus.connect(midHP);
  inputBus.connect(trebleHP);

  // 저역: 그대로 합산 버스로
  bassLP.connect(bandSum);

  // 중역: L-R 캔슬
  midHP.connect(midLP);
  midLP.connect(midSplitter);
  midSplitter.connect(midGainL, 0);
  midSplitter.connect(midGainRNeg, 1);
  midGainL.connect(midSumNode);
  midGainRNeg.connect(midSumNode);
  midSumNode.connect(midStereoMerger, 0, 0);
  midSumNode.connect(midStereoMerger, 0, 1);
  midStereoMerger.connect(bandSum);

  // 고역: 그대로 합산 버스로
  trebleHP.connect(bandSum);

  // 합산 → 후처리 EQ
  bandSum.connect(lowShelf);
  lowShelf.connect(midPeak);
  midPeak.connect(highPeak);

  const chain: VocalChain = {
    inputBus,
    bassLP,
    midHP,
    midLP,
    midSplitter,
    midGainL,
    midGainRNeg,
    midSumNode,
    midStereoMerger,
    trebleHP,
    bandSum,
    lowShelf,
    midPeak,
    highPeak,
  };
  p.vocal = chain;
  return chain;
}

/** vocal 체인 모든 연결 해제 (off 전환 또는 destroy 시) */
function disposeVocalChain(p: TunePipeline): void {
  if (!p.vocal) return;
  const v = p.vocal;
  try {
    v.inputBus.disconnect();
    v.bassLP.disconnect();
    v.midHP.disconnect();
    v.midLP.disconnect();
    v.midSplitter.disconnect();
    v.midGainL.disconnect();
    v.midGainRNeg.disconnect();
    v.midSumNode.disconnect();
    v.midStereoMerger.disconnect();
    v.trebleHP.disconnect();
    v.bandSum.disconnect();
    v.lowShelf.disconnect();
    v.midPeak.disconnect();
    v.highPeak.disconnect();
  } catch {
    // ignore
  }
  p.vocal = null;
}

/**
 * 현재 상태(pitch + vocalMode)에 맞게 체인을 재배선한다.
 * 4가지 조합을 모두 처리하는 단일 함수.
 *
 * 주의: 외부 노드(source, scriptNode, vocal.highPeak, analyzer 체인 입출구)의 output
 * 연결만 끊고 재연결. 내부 고정 배선(vocal 체인 내부, analyzer 체인 내부)은 유지.
 *
 * 체인 구성: source → spectrumAnalyser → ... → analyzerMerger → [vocal] → [pitch] → destination
 * AnalyserNode는 pass-through라 음질/볼륨 영향 없음.
 */
function applyChain(): void {
  if (!pipeline) return;
  const p = pipeline;

  const pitchActive = currentPitch !== 0;
  const vocalActive = currentVocalMode === 'basic';
  // 'hd'는 아직 미구현 → 'off'와 동일하게 취급 (UI에서도 disabled)

  // 1) 외부 엣지 전부 해제 (내부 고정 배선은 유지)
  try {
    p.source.disconnect();
  } catch {
    // ignore
  }
  try {
    p.analyzers.analyzerMerger.disconnect();
  } catch {
    // ignore
  }
  try {
    p.scriptNode.disconnect();
  } catch {
    // ignore
  }
  if (p.vocal) {
    try {
      p.vocal.highPeak.disconnect();
    } catch {
      // ignore
    }
  }

  // 2) vocal 체인 필요 시 lazy 생성 (off 전환 시 dispose로 메모리 회수)
  if (vocalActive) {
    ensureVocalChain(p);
  } else if (p.vocal) {
    disposeVocalChain(p);
  }

  // 3) 체인 배선: source → analyzer 체인 → [vocal] → [pitch] → destination
  p.source.connect(p.analyzers.spectrumAnalyser);
  let tail: AudioNode = p.analyzers.analyzerMerger;
  if (vocalActive && p.vocal) {
    tail.connect(p.vocal.inputBus);
    tail = p.vocal.highPeak;
  }
  if (pitchActive) {
    tail.connect(p.scriptNode);
    tail = p.scriptNode;
  }
  tail.connect(p.audioCtx.destination);
}

/** 피치 설정 (반음 단위, -6 ~ +6) */
export function setPitch(semitones: number): void {
  currentPitch = semitones;
  const video = getVideo();

  // 체인 재배선 전에 파이프라인 보장 (피치가 처음 켜지는 경우)
  if (semitones !== 0 && !pipeline) {
    ensurePipeline();
  }

  // SoundTouch 동기화
  if (pipeline) {
    if (semitones === 0) {
      pipeline.soundtouch.clear();
      pipeline.soundtouch.pitchSemitones = 0;
    } else {
      pipeline.soundtouch.pitchSemitones = semitones;
    }
  }

  // 체인 재배선
  applyChain();

  // 비디오 재생 속도/preservesPitch 는 SoundTouch와 별개
  if (video) {
    video.playbackRate = currentTempo;
    video.preservesPitch = true;
  }

  notifyListeners();
}

/** 템포 설정 (0.5 ~ 2.0) */
export function setTempo(tempoValue: number): void {
  currentTempo = tempoValue;
  const video = getVideo();
  if (video) {
    video.playbackRate = tempoValue;
    video.preservesPitch = true;
  }
  notifyListeners();
}

/**
 * 보컬 제거 모드 설정 (Tier 1: 'basic' = L−R 센터 캔슬).
 * 'hd'는 v2.3.0 UI에 자리만 예약, 실제 동작은 추후 Tier 2에서.
 *
 * Idempotent: 동일 모드로 재호출 시 no-op (오디오 재배선 글리치 방지).
 */
export function setVocalMode(mode: VocalMode): void {
  if (mode === currentVocalMode) return;
  currentVocalMode = mode;

  // basic 활성화인데 파이프라인 아직 없으면 초기화
  if (mode === 'basic' && !pipeline) {
    ensurePipeline();
  }

  applyChain();
  notifyListeners();
}

/** 전체 리셋 */
export function resetAll(): void {
  currentPitch = 0;
  currentTempo = 1.0;
  currentVocalMode = 'off';

  if (pipeline) {
    pipeline.soundtouch.clear();
    pipeline.soundtouch.pitchSemitones = 0;
    applyChain();
  }

  const video = getVideo();
  if (video) {
    video.playbackRate = 1.0;
    video.preservesPitch = true;
  }
  notifyListeners();
}

/**
 * 저장된 vocalMode를 페이지 로드 시점에 복원.
 * TunePanel(카라오케 사이드바) mount 전에 콘텐츠 스크립트 레벨에서 호출되어
 * 카라오케 모드 on 여부와 무관하게 적용된다.
 *
 * 초기 로드 중 AudioContext/MediaElementSource 생성이 YouTube 오디오 경로를
 * 끊어 렉을 유발하는 걸 방지하기 위해 video 'playing' 이벤트 후로 지연.
 *
 * 이미 vocalMode가 설정된 상태면 no-op (중복 적용 방지).
 */
export function initVocalModeFromStorage(): void {
  if (currentVocalMode !== 'off') return; // 이미 설정됨 → 스킵

  chrome.storage.sync.get([STORAGE_KEYS.VOCAL_MODE], (result) => {
    const stored = result[STORAGE_KEYS.VOCAL_MODE] as string | undefined;
    // 'hd'는 미구현 → 'off' 강등. 구버전 'multiband'는 'basic'으로 마이그레이션.
    const safe: VocalMode = stored === 'basic' || stored === 'multiband' ? 'basic' : 'off';
    if (safe === 'off') return;
    // 대기 중 사이 사용자가 이미 다른 모드로 바꿨으면 덮어쓰지 않음
    if (currentVocalMode !== 'off') return;

    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (!video) return;

    const activate = () => {
      if (currentVocalMode !== 'off') return; // 대기 중 바뀌었으면 덮어쓰지 않음
      setVocalMode(safe);
    };

    if (!video.paused && video.currentTime > 0) {
      // 이미 재생 중: 초기 로드 안정화 시간 확보 후 활성화
      window.setTimeout(activate, 400);
    } else {
      const onPlaying = () => {
        video.removeEventListener('playing', onPlaying);
        activate();
      };
      video.addEventListener('playing', onPlaying);
    }
  });
}

/** 파이프라인 완전 파괴 (페이지 전환 시) */
export function destroyPipeline(): void {
  if (!pipeline) return;
  try {
    pipeline.source.disconnect();
    pipeline.scriptNode.disconnect();
    disposeVocalChain(pipeline);
    pipeline.analyzers.spectrumAnalyser.disconnect();
    pipeline.analyzers.analyzerSplitter.disconnect();
    pipeline.analyzers.lAnalyser.disconnect();
    pipeline.analyzers.rAnalyser.disconnect();
    pipeline.analyzers.analyzerMerger.disconnect();
    // 마지막 bypass 배선 (video 재생 유지를 위해)
    pipeline.source.connect(pipeline.audioCtx.destination);
  } catch {
    // ignore
  }
  pipeline = null;
  currentPitch = 0;
  currentTempo = 1.0;
  currentVocalMode = 'off';
  currentEq = {
    lowShelf: { ...DEFAULT_VOCAL_EQ.lowShelf },
    midPeak: { ...DEFAULT_VOCAL_EQ.midPeak },
    highPeak: { ...DEFAULT_VOCAL_EQ.highPeak },
    crossover: { ...DEFAULT_VOCAL_EQ.crossover },
  };
}

// ─────────────────────────────────────────────────────────────
//  Dev 모드 전용: EQ 실시간 조정 + 디버그 스냅샷
// ─────────────────────────────────────────────────────────────

/**
 * AudioContext가 running 상태가 되도록 보장.
 * Chrome 정책으로 user-gesture 없이 생성된 context는 suspended일 수 있어
 * 분석 애널라이저 / 오디오 체인이 무음을 반환함.
 */
export async function ensurePipelineRunning(): Promise<boolean> {
  if (!pipeline) return false;
  if (pipeline.audioCtx.state !== 'running') {
    try {
      await pipeline.audioCtx.resume();
    } catch (err) {
      console.error('[TunePipeline] AudioContext resume 실패:', err);
      return false;
    }
  }
  return pipeline.audioCtx.state === 'running';
}

/** 현재 EQ 파라미터 조회 (UI 초기값용) */
export function getVocalEqParams(): VocalEqParams {
  return {
    lowShelf: { ...currentEq.lowShelf },
    midPeak: { ...currentEq.midPeak },
    highPeak: { ...currentEq.highPeak },
    crossover: { ...currentEq.crossover },
  };
}

/**
 * EQ 파라미터 실시간 반영.
 * BiquadFilterNode의 AudioParam(frequency/Q/gain)은 실시간 변경 허용 — 체인 재배선 불필요.
 * crossover 주파수는 multiband 체인에만 적용 (basic 체인이면 다음 multiband 활성화 시 반영).
 */
export function setVocalEqParams(params: VocalEqParams): void {
  currentEq = {
    lowShelf: { ...params.lowShelf },
    midPeak: { ...params.midPeak },
    highPeak: { ...params.highPeak },
    crossover: { ...params.crossover },
  };

  const v = pipeline?.vocal;
  if (!v) return; // 파이프라인 아직 없으면 저장만 하고 반환

  v.lowShelf.frequency.value = currentEq.lowShelf.freq;
  v.lowShelf.gain.value = currentEq.lowShelf.gain;
  v.midPeak.frequency.value = currentEq.midPeak.freq;
  v.midPeak.Q.value = currentEq.midPeak.Q;
  v.midPeak.gain.value = currentEq.midPeak.gain;
  v.highPeak.frequency.value = currentEq.highPeak.freq;
  v.highPeak.Q.value = currentEq.highPeak.Q;
  v.highPeak.gain.value = currentEq.highPeak.gain;

  // crossover 필터 주파수 동기화
  v.bassLP.frequency.value = currentEq.crossover.lowHz;
  v.midHP.frequency.value = currentEq.crossover.lowHz;
  v.midLP.frequency.value = currentEq.crossover.highHz;
  v.trebleHP.frequency.value = currentEq.crossover.highHz;
}

/**
 * 디버그 스냅샷 — Dev UI의 "복사" 버튼에서 호출.
 * 현재 재생 중인 오디오의 L/R 상관, 주파수 대역별 평균 에너지, 상위 피크를 계산.
 * 보컬 제거 효과 예측 지표 + 튜닝 근거 데이터로 활용.
 */
export function captureVocalDebugSnapshot(): VocalDebugSnapshot | null {
  if (!pipeline) return null;
  const { analyzers, audioCtx } = pipeline;
  const sampleRate = audioCtx.sampleRate;

  // 시간영역: L/R 상관 계산
  const lBuf = new Float32Array(analyzers.lAnalyser.fftSize);
  const rBuf = new Float32Array(analyzers.rAnalyser.fftSize);
  analyzers.lAnalyser.getFloatTimeDomainData(lBuf);
  analyzers.rAnalyser.getFloatTimeDomainData(rBuf);
  const stereoCorrelation = pearsonCorrelation(lBuf, rBuf);

  // 주파수영역: 대역별 평균 에너지 + 피크
  const specBins = new Float32Array(analyzers.spectrumAnalyser.frequencyBinCount);
  analyzers.spectrumAnalyser.getFloatFrequencyData(specBins);
  const nyquist = sampleRate / 2;
  const binFreq = (i: number): number => (i / specBins.length) * nyquist;

  const avgDb = (fMin: number, fMax: number): number => {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < specBins.length; i++) {
      const f = binFreq(i);
      if (f >= fMin && f < fMax) {
        const v = specBins[i];
        if (v !== undefined && Number.isFinite(v)) {
          sum += v;
          count++;
        }
      }
    }
    return count > 0 ? sum / count : -Infinity;
  };

  const bands = {
    bass_20_150: round(avgDb(20, 150), 1),
    lowMid_150_500: round(avgDb(150, 500), 1),
    mid_500_2000: round(avgDb(500, 2000), 1),
    highMid_2000_5000: round(avgDb(2000, 5000), 1),
    high_5000_20000: round(avgDb(5000, 20000), 1),
  };

  // 로컬 피크 상위 5개
  const peaks: Array<{ freq: number; mag: number }> = [];
  for (let i = 2; i < specBins.length - 2; i++) {
    const v = specBins[i];
    const vm1 = specBins[i - 1];
    const vp1 = specBins[i + 1];
    if (v !== undefined && vm1 !== undefined && vp1 !== undefined && v > vm1 && v > vp1 && Number.isFinite(v)) {
      peaks.push({ freq: binFreq(i), mag: v });
    }
  }
  peaks.sort((a, b) => b.mag - a.mag);
  const topPeaksHz = peaks.slice(0, 5).map((p) => Math.round(p.freq));

  // 무음 진단: 대역 평균이 전부 -Infinity거나 피크 없음 → analyzer 데이터 없음
  const isSilent = topPeaksHz.length === 0 && Object.values(bands).every((v) => !Number.isFinite(v));

  return {
    timestamp: new Date().toISOString(),
    audio: {
      sampleRate,
      audioCtxState: audioCtx.state,
      stereoCorrelation: round(stereoCorrelation, 3),
      frequencyBands_dB: bands,
      topPeaks_Hz: topPeaksHz,
      isSilent,
    },
    eq: getVocalEqParams(),
  };
}

/** Pearson 상관계수 — 두 같은 길이 배열 간 선형 유사도 (-1~1) */
function pearsonCorrelation(a: Float32Array, b: Float32Array): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let sumA = 0;
  let sumB = 0;
  let sumAB = 0;
  let sumA2 = 0;
  let sumB2 = 0;
  for (let i = 0; i < n; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    sumA += ai;
    sumB += bi;
    sumAB += ai * bi;
    sumA2 += ai * ai;
    sumB2 += bi * bi;
  }
  const num = n * sumAB - sumA * sumB;
  const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));
  return den === 0 ? 0 : num / den;
}

function round(n: number, digits: number): number {
  if (!Number.isFinite(n)) return n;
  const m = 10 ** digits;
  return Math.round(n * m) / m;
}
