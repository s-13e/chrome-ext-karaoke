// MediaElementAudioSourceNode 캐시: 비디오 엘리먼트별 저장 (WeakMap 사용해 GC 최적화)
const sourceNodeCache = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

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
