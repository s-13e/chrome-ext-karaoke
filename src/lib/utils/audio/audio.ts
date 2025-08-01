let sharedAudioContext: AudioContext | null = null;

// MediaElementAudioSourceNode 캐시: 비디오 엘리먼트별 저장 (WeakMap 사용해 GC 최적화)
const sourceNodeCache = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

/**
 * 싱글톤 AudioContext 반환
 */
export function getSharedAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
}
/**
 * MediaElementAudioSourceNode를 비디오 엘리먼트별로 캐싱 후 재사용
 *
 * 이미 존재하면 재활용, 없으면 새로 생성 후 저장
 */
export function getOrCreateMediaElementSource(el: HTMLMediaElement): MediaElementAudioSourceNode {
  const context = getSharedAudioContext();

  const cachedNode = sourceNodeCache.get(el);
  if (cachedNode) return cachedNode;

  const newNode = context.createMediaElementSource(el);
  sourceNodeCache.set(el, newNode);
  return newNode;
}

/**
 * MediaElementAudioSourceNode가 필요없어졌을 때 캐시 및 연결 해제
 */
export function cleanupMediaElementSource(el: HTMLMediaElement): void {
  const cachedNode = sourceNodeCache.get(el);
  if (cachedNode) {
    cachedNode.disconnect();
    sourceNodeCache.delete(el);
  }
}

/**
 * HTMLMediaElement로부터 MediaElementAudioSourceNode 생성
 * (YouTube video 등 오디오 입력 스트림 연결용)
 */
export function createMediaElementSource(el: HTMLMediaElement): MediaElementAudioSourceNode {
  const context = getSharedAudioContext();
  return context.createMediaElementSource(el);
}

/**
 * AudioBuffer를 받아서 지정 채널의 PCM(mono) 추출
 */
export function stereoToMono(buffer: AudioBuffer, channelIndex = 0): Float32Array {
  return buffer.getChannelData(channelIndex);
}
