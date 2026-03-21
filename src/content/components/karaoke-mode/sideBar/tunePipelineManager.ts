// tunePipelineManager.ts
// Tune 탭의 Web Audio + SoundTouch 파이프라인을 싱글톤으로 관리
// 사이드바 탭 전환 시에도 파이프라인과 설정이 유지됨
// 페이지 새로고침/전환 시에만 초기화

import { SoundTouch } from 'soundtouchjs';

interface PitchPipeline {
  audioCtx: AudioContext;
  source: MediaElementAudioSourceNode;
  scriptNode: ScriptProcessorNode;
  soundtouch: SoundTouch;
}

/** 싱글톤 상태 */
let pipeline: PitchPipeline | null = null;
let currentPitch = 0; // 반음 단위
let currentTempo = 1.0;
let isActive = false; // SoundTouch 처리 활성 여부
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
export function getTuneState(): { pitch: number; tempo: number } {
  return { pitch: currentPitch, tempo: currentTempo };
}

/** YouTube 비디오 요소 */
function getVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>('video.html5-main-video');
}

/** 파이프라인 초기화 (한 번만 실행) */
function ensurePipeline(): PitchPipeline | null {
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

    // 초기 연결: source → destination (bypass 상태)
    source.connect(audioCtx.destination);

    pipeline = { audioCtx, source, scriptNode, soundtouch: st };
    console.log('[TunePipeline] 파이프라인 초기화 성공');
    return pipeline;
  } catch (error) {
    console.error('[TunePipeline] 파이프라인 초기화 실패:', error);
    return null;
  }
}

/** SoundTouch 처리 경로 활성화 (source → scriptNode → destination) */
function activateProcessing() {
  if (!pipeline || isActive) return;
  try {
    pipeline.source.disconnect();
    pipeline.source.connect(pipeline.scriptNode);
    pipeline.scriptNode.connect(pipeline.audioCtx.destination);
    isActive = true;
  } catch {
    // ignore
  }
}

/** bypass 모드 (source → destination 직접) */
function deactivateProcessing() {
  if (!pipeline || !isActive) return;
  try {
    pipeline.scriptNode.disconnect();
    pipeline.source.disconnect();
    pipeline.source.connect(pipeline.audioCtx.destination);
    isActive = false;
  } catch {
    // ignore
  }
}

/** 피치 설정 (반음 단위, -6 ~ +6) */
export function setPitch(semitones: number): void {
  currentPitch = semitones;
  const video = getVideo();

  if (semitones === 0) {
    // 피치 없음 → bypass, 템포만 playbackRate로
    deactivateProcessing();
    if (video) {
      video.playbackRate = currentTempo;
      video.preservesPitch = true;
    }
    // SoundTouch 리셋
    if (pipeline) {
      pipeline.soundtouch.clear();
      pipeline.soundtouch.pitchSemitones = 0;
    }
  } else {
    // 피치 있음 → SoundTouch 활성화
    const p = ensurePipeline();
    if (!p) return;

    p.soundtouch.pitchSemitones = semitones;
    activateProcessing();

    // video는 원래 속도 유지 (템포만)
    if (video) {
      video.playbackRate = currentTempo;
      video.preservesPitch = true;
    }
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

/** 전체 리셋 */
export function resetAll(): void {
  currentPitch = 0;
  currentTempo = 1.0;
  deactivateProcessing();
  if (pipeline) {
    pipeline.soundtouch.clear();
    pipeline.soundtouch.pitchSemitones = 0;
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
    deactivateProcessing();
    pipeline.scriptNode.disconnect();
    pipeline.source.disconnect();
    pipeline.source.connect(pipeline.audioCtx.destination);
  } catch {
    // ignore
  }
  pipeline = null;
  currentPitch = 0;
  currentTempo = 1.0;
  isActive = false;
}
