import { getSharedAudioContext } from './audioUtils';
interface PCMExtractorWithSourceNode {
  _sourceNode?: MediaElementAudioSourceNode | null;
}
/**
 * HTMLMediaElement에서 Mono PCM 추출 (Singleton AudioContext 활용)
 */
export async function extractPCMFromMediaElement(
  elem: HTMLMediaElement,
  durationSec = 15,
  sampleRate = 44100,
): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const audioCtx = getSharedAudioContext();
  const analyser = audioCtx.createAnalyser();
  const ext = extractPCMFromMediaElement as PCMExtractorWithSourceNode;

  // 단일 SourceNode 재사용: 기존 연결이 있을 경우 분리
  let sourceNode = ext._sourceNode as MediaElementAudioSourceNode | null;
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch {
      // console.warn('뭔 오류남');
    }
  }
  sourceNode = audioCtx.createMediaElementSource(elem);
  ext._sourceNode = sourceNode;

  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  const frameSize = analyser.fftSize;
  const framesNeeded = Math.ceil((sampleRate * durationSec) / frameSize);
  const pcmResult = new Float32Array(sampleRate * durationSec);

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

  return { pcm: pcmResult, sampleRate };
}

/**
 * AudioBuffer를 받아서 지정 채널의 PCM(mono) 추출
 */
export function stereoToMono(buffer: AudioBuffer, channelIndex = 0): Float32Array {
  return buffer.getChannelData(channelIndex);
}
