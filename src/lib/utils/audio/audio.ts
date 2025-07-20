/**
 * HTMLMediaElement(YouTube <video> 등)에서 지정 구간(초)의 Mono PCM을 추출
 * @param elem HTMLMediaElement (video/audio)
 * @param durationSec 분석 구간(초), 기본 15
 * @param sampleRate 목표 샘플레이트 (기본 44100)
 * @returns { pcm: Float32Array, sampleRate: number }
 */

let cachedAudioCtx: AudioContext | null = null;
let cachedSourceNode: MediaElementAudioSourceNode | null = null;

export async function extractPCMFromMediaElement(
  elem: HTMLMediaElement,
  durationSec = 15,
  sampleRate = 44100,
): Promise<{ pcm: Float32Array; sampleRate: number }> {
  // AudioContext 재사용 (required for createMediaElementSource)
  if (!cachedAudioCtx || cachedAudioCtx.sampleRate !== sampleRate) {
    cachedAudioCtx?.close(); // 이전거 clean up (옵션)
    cachedAudioCtx = new AudioContext({ sampleRate });
  }
  const audioCtx = cachedAudioCtx;
  const analyser = audioCtx.createAnalyser();

  // ⛔ createMediaElementSource는 한 번만! → memoization
  if (!cachedSourceNode) {
    cachedSourceNode = audioCtx.createMediaElementSource(elem);
    cachedSourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  // 버퍼의 길이(초)
  const frameSize = analyser.fftSize;
  const framesNeeded = Math.ceil((sampleRate * durationSec) / frameSize);
  const pcmResult = new Float32Array(sampleRate * durationSec);

  // 미디어 위치 백업 → 0 시작
  const prevCurrentTime = elem.currentTime;
  elem.currentTime = 0;

  await elem.play();

  // 각 프레임마다 PCM 추출
  let written = 0;
  for (let i = 0; i < framesNeeded; i++) {
    await new Promise((res) => setTimeout(res, (frameSize / sampleRate) * 1000));
    const buf = new Float32Array(frameSize);
    analyser.getFloatTimeDomainData(buf);
    const slice = buf.slice(0, Math.min(frameSize, pcmResult.length - written));
    pcmResult.set(slice, written);
    written += slice.length;
    if (written >= pcmResult.length) break;
  }
  audioCtx.close(); // 리소스 해제

  elem.currentTime = prevCurrentTime; // 원복

  return { pcm: pcmResult, sampleRate };
}

/**
 * AudioBuffer를 받아서 지정 채널의 PCM(mono) 추출
 */
export function stereoToMono(buffer: AudioBuffer, channelIndex = 0): Float32Array {
  return buffer.getChannelData(channelIndex);
}
