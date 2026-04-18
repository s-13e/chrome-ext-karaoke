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

/** 3-band EQ 파라미터 (보컬 체인 후반부) */
export interface VocalEqParams {
  lowShelf: { freq: number; gain: number };
  midPeak: { freq: number; Q: number; gain: number };
  highPeak: { freq: number; Q: number; gain: number };
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
  lowShelf: { freq: 80, gain: -4 },
  midPeak: { freq: 2500, Q: 1.5, gain: -6 },
  highPeak: { freq: 3500, Q: 2.0, gain: -4 },
};

interface VocalChain {
  splitter: ChannelSplitterNode;
  gainL: GainNode;
  gainRNeg: GainNode;
  sumNode: GainNode; // mono 믹스 버스 (L + (-R))
  stereoMerger: ChannelMergerNode; // mono → stereo 로 복제
  lowShelf: BiquadFilterNode;
  midPeak: BiquadFilterNode;
  highPeak: BiquadFilterNode; // 체인 출구
  // 입구: splitter / 출구: highPeak
}

interface SourceAnalyzers {
  spectrumAnalyser: AnalyserNode;
  analyzerSplitter: ChannelSplitterNode;
  lAnalyser: AnalyserNode;
  rAnalyser: AnalyserNode;
}

interface TunePipeline {
  audioCtx: AudioContext;
  source: MediaElementAudioSourceNode;
  scriptNode: ScriptProcessorNode;
  soundtouch: SoundTouch;
  vocal: VocalChain | null; // lazy: basic 활성화 시에 생성
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

    // 분석 탭 (항상 활성, 메인 오디오에는 영향 없음 — 병렬 탭)
    const spectrumAnalyser = audioCtx.createAnalyser();
    spectrumAnalyser.fftSize = 4096;
    spectrumAnalyser.smoothingTimeConstant = 0.2;
    source.connect(spectrumAnalyser);

    const analyzerSplitter = audioCtx.createChannelSplitter(2);
    source.connect(analyzerSplitter);
    const lAnalyser = audioCtx.createAnalyser();
    const rAnalyser = audioCtx.createAnalyser();
    lAnalyser.fftSize = 2048;
    rAnalyser.fftSize = 2048;
    analyzerSplitter.connect(lAnalyser, 0);
    analyzerSplitter.connect(rAnalyser, 1);

    pipeline = {
      audioCtx,
      source,
      scriptNode,
      soundtouch: st,
      vocal: null,
      analyzers: { spectrumAnalyser, analyzerSplitter, lAnalyser, rAnalyser },
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

/** 보컬 제거 체인(lazy 생성) — basic 모드 첫 활성화 시 호출 */
function ensureVocalChain(p: TunePipeline): VocalChain {
  if (p.vocal) return p.vocal;

  const ctx = p.audioCtx;
  const splitter = ctx.createChannelSplitter(2);
  const gainL = new GainNode(ctx, { gain: 1 });
  const gainRNeg = new GainNode(ctx, { gain: -1 });
  const sumNode = new GainNode(ctx, { gain: 1 }); // mono 합산 버스
  const stereoMerger = ctx.createChannelMerger(2);

  // 3-밴드 EQ: 저역 쉘프 → 중역 피킹 → 고역 피킹 (Dev UI 에서 실시간 조정 가능)
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

  // 내부 고정 연결(체인 켜고 끄는 건 입구(splitter 앞)만 재연결):
  // splitter[L]  → gainL (+1)  ─┐
  //                              ├─→ sumNode(mono) → stereoMerger[0]+[1]
  // splitter[R]  → gainRNeg(-1)─┘                    │
  //                                                  ▼
  //                            lowShelf → midPeak → highPeak (출구)
  splitter.connect(gainL, 0);
  splitter.connect(gainRNeg, 1);
  gainL.connect(sumNode);
  gainRNeg.connect(sumNode);
  sumNode.connect(stereoMerger, 0, 0);
  sumNode.connect(stereoMerger, 0, 1);
  stereoMerger.connect(lowShelf);
  lowShelf.connect(midPeak);
  midPeak.connect(highPeak);

  p.vocal = { splitter, gainL, gainRNeg, sumNode, stereoMerger, lowShelf, midPeak, highPeak };
  return p.vocal;
}

/**
 * 현재 상태(pitch + vocalMode)에 맞게 체인을 재배선한다.
 * 4가지 조합을 모두 처리하는 단일 함수.
 *
 * 주의: 외부 노드(source, scriptNode, vocal.highPeak)의 output 연결만 끊고 재연결.
 * vocal 체인의 내부 배선(splitter→...→highPeak)은 고정이므로 건드리지 않음.
 * 분석 탭(analyzers)은 source에 항상 연결되어 있고 메인 체인과 분리되어 있으므로 영향 없음.
 */
function applyChain(): void {
  if (!pipeline) return;
  const p = pipeline;

  const pitchActive = currentPitch !== 0;
  const vocalActive = currentVocalMode === 'basic';
  // 'hd'는 아직 미구현 → 'off'와 동일하게 취급 (UI에서도 disabled)

  // 1) 외부 엣지 전부 해제 (내부 고정 배선 + 분석 탭은 유지)
  try {
    // source의 destination 방향 연결만 끊고 싶지만 disconnect()는 모두 끊음.
    // 분석 탭은 아래에서 다시 연결한다.
    p.source.disconnect();
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

  // 2) 분석 탭 재연결 (source.disconnect()로 같이 끊겼으므로)
  p.source.connect(p.analyzers.spectrumAnalyser);
  p.source.connect(p.analyzers.analyzerSplitter);

  // 3) vocal 체인 필요 시 lazy 생성
  if (vocalActive) ensureVocalChain(p);

  // 4) 메인 체인 배선: source → [vocal] → [pitch] → destination
  let tail: AudioNode = p.source;
  if (vocalActive && p.vocal) {
    tail.connect(p.vocal.splitter);
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
    const stored = result[STORAGE_KEYS.VOCAL_MODE] as VocalMode | undefined;
    // 'hd'는 아직 미구현이므로 복원 시 'off'로 강등
    const safe: VocalMode = stored === 'basic' ? 'basic' : 'off';
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
    // 모든 외부 연결 해제 (내부 고정 배선은 GC로 정리됨)
    pipeline.source.disconnect();
    pipeline.scriptNode.disconnect();
    if (pipeline.vocal) {
      pipeline.vocal.splitter.disconnect();
      pipeline.vocal.gainL.disconnect();
      pipeline.vocal.gainRNeg.disconnect();
      pipeline.vocal.sumNode.disconnect();
      pipeline.vocal.stereoMerger.disconnect();
      pipeline.vocal.lowShelf.disconnect();
      pipeline.vocal.midPeak.disconnect();
      pipeline.vocal.highPeak.disconnect();
    }
    pipeline.analyzers.analyzerSplitter.disconnect();
    pipeline.analyzers.spectrumAnalyser.disconnect();
    pipeline.analyzers.lAnalyser.disconnect();
    pipeline.analyzers.rAnalyser.disconnect();
    // 마지막 bypass 배선 (video 재생 유지를 위해)
    pipeline.source.connect(pipeline.audioCtx.destination);
  } catch {
    // ignore
  }
  pipeline = null;
  currentPitch = 0;
  currentTempo = 1.0;
  currentVocalMode = 'off';
  currentEq = { ...DEFAULT_VOCAL_EQ };
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
  };
}

/**
 * EQ 파라미터 실시간 반영.
 * BiquadFilterNode의 AudioParam(frequency/Q/gain)은 실시간 변경 허용 — 체인 재배선 불필요.
 */
export function setVocalEqParams(params: VocalEqParams): void {
  currentEq = {
    lowShelf: { ...params.lowShelf },
    midPeak: { ...params.midPeak },
    highPeak: { ...params.highPeak },
  };

  const v = pipeline?.vocal;
  if (!v) return; // 파이프라인 아직 없으면 저장만 하고 반환 (다음 ensureVocalChain 때 적용)

  v.lowShelf.frequency.value = currentEq.lowShelf.freq;
  v.lowShelf.gain.value = currentEq.lowShelf.gain;
  v.midPeak.frequency.value = currentEq.midPeak.freq;
  v.midPeak.Q.value = currentEq.midPeak.Q;
  v.midPeak.gain.value = currentEq.midPeak.gain;
  v.highPeak.frequency.value = currentEq.highPeak.freq;
  v.highPeak.Q.value = currentEq.highPeak.Q;
  v.highPeak.gain.value = currentEq.highPeak.gain;
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
