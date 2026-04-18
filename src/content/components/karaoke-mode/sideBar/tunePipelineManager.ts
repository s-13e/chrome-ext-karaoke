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
// 보컬 체인(Tier 1, L−R 센터 캔슬 + 가벼운 EQ):
//   splitter[0] (L) ─Gain(+1)─┐
//                              ├─→ sumNode ─→ stereoMerger (mono→stereo) ─→ biquad(peaking) ─→ out
//   splitter[1] (R) ─Gain(−1)─┘
//
// Tier 2(HD, ML 기반)는 추후 동일한 vocalChain 자리에 AudioWorkletNode 로 대체 예정.

import { SoundTouch } from 'soundtouchjs';

export type VocalMode = 'off' | 'basic' | 'hd';

interface VocalChain {
  splitter: ChannelSplitterNode;
  gainL: GainNode;
  gainRNeg: GainNode;
  sumNode: GainNode; // mono 믹스 버스 (L + (-R))
  stereoMerger: ChannelMergerNode; // mono → stereo 로 복제
  filter: BiquadFilterNode; // 가벼운 EQ (잔여 보컬 대역 감쇠)
  // 입구: splitter / 출구: filter
}

interface TunePipeline {
  audioCtx: AudioContext;
  source: MediaElementAudioSourceNode;
  scriptNode: ScriptProcessorNode;
  soundtouch: SoundTouch;
  vocal: VocalChain | null; // lazy: basic 활성화 시에 생성
}

/** 싱글톤 상태 */
let pipeline: TunePipeline | null = null;
let currentPitch = 0; // 반음 단위
let currentTempo = 1.0;
let currentVocalMode: VocalMode = 'off';
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

    pipeline = { audioCtx, source, scriptNode, soundtouch: st, vocal: null };

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
  const filter = ctx.createBiquadFilter();

  // EQ: 중고역 보컬 대역을 가볍게 감쇠 (L-R 잔여 성분 정리)
  filter.type = 'peaking';
  filter.frequency.value = 2500; // 상위 포만트 영역
  filter.Q.value = 1.5;
  filter.gain.value = -3; // dB

  // 내부 고정 연결(한 번 연결하고 바꾸지 않음 — 체인 켜고 끄는 건 입구(splitter 앞)만 재연결):
  // splitter[L]  → gainL (+1)  ─┐
  //                              ├─→ sumNode(mono) → stereoMerger[0] and [1] → filter
  // splitter[R]  → gainRNeg(-1)─┘
  splitter.connect(gainL, 0);
  splitter.connect(gainRNeg, 1);
  gainL.connect(sumNode);
  gainRNeg.connect(sumNode);
  sumNode.connect(stereoMerger, 0, 0);
  sumNode.connect(stereoMerger, 0, 1);
  stereoMerger.connect(filter);

  p.vocal = { splitter, gainL, gainRNeg, sumNode, stereoMerger, filter };
  return p.vocal;
}

/**
 * 현재 상태(pitch + vocalMode)에 맞게 체인을 재배선한다.
 * 4가지 조합을 모두 처리하는 단일 함수.
 *
 * 주의: 외부 노드(source, scriptNode, vocal.filter)의 output 연결만 끊고 재연결.
 * vocal 체인의 내부 배선(splitter→gainL/R→sum→merger→filter)은 고정이므로 건드리지 않음.
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
    p.scriptNode.disconnect();
  } catch {
    // ignore
  }
  if (p.vocal) {
    try {
      p.vocal.filter.disconnect();
    } catch {
      // ignore
    }
  }

  // 2) vocal 체인 필요 시 lazy 생성
  if (vocalActive) ensureVocalChain(p);

  // 3) 순서대로 배선: source → [vocal] → [pitch] → destination
  let tail: AudioNode = p.source;
  if (vocalActive && p.vocal) {
    tail.connect(p.vocal.splitter);
    tail = p.vocal.filter;
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
 */
export function setVocalMode(mode: VocalMode): void {
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

/** 파이프라인 완전 파괴 (페이지 전환 시) */
export function destroyPipeline(): void {
  if (!pipeline) return;
  try {
    // 모든 외부 연결 해제 (내부 고정 배선은 GC로 정리됨)
    pipeline.source.disconnect();
    pipeline.scriptNode.disconnect();
    if (pipeline.vocal) {
      pipeline.vocal.filter.disconnect();
      pipeline.vocal.splitter.disconnect();
      pipeline.vocal.gainL.disconnect();
      pipeline.vocal.gainRNeg.disconnect();
      pipeline.vocal.sumNode.disconnect();
      pipeline.vocal.stereoMerger.disconnect();
    }
    // 마지막 bypass 배선 (video 재생 유지를 위해)
    pipeline.source.connect(pipeline.audioCtx.destination);
  } catch {
    // ignore
  }
  pipeline = null;
  currentPitch = 0;
  currentTempo = 1.0;
  currentVocalMode = 'off';
}
