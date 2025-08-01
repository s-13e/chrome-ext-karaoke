import { getOrCreateMediaElementSource, getSharedAudioContext } from './audio';
import { isAdPlaying } from '@lib/utils/dom/domUtils';

export async function detectMusicStart(
  el: HTMLMediaElement,
  options?: { threshold?: number; requiredContinuousFrames?: number },
): Promise<{ timestamp: number }> {
  if (isAdPlaying()) {
    // 광고 재생 중에는 분석하지 않고 reject 혹은 즉시 종료
    return Promise.reject(new Error('광고 재생 중 - 분석 건너뜀'));
  }
  console.log('detectMusicStart 실행 시작!');
  const context = getSharedAudioContext();

  if (!context.audioWorklet) {
    throw new Error('AudioWorklet not supported in this environment');
  }

  if (context.state === 'suspended') {
    await context.resume();
  }

  await context.audioWorklet.addModule(chrome.runtime.getURL('content/audioProcessor.js'));

  // 캐시된 source 노드 재사용
  const source = getOrCreateMediaElementSource(el);
  const node = new AudioWorkletNode(context, 'onset-rms-processor');

  if (options) {
    node.port.postMessage({ type: 'setOptions', options });
  }

  // 분석용 경로 연결(출력 경로와 분리)
  source.connect(node);

  return new Promise<{ timestamp: number }>((resolve, reject) => {
    const cleanup = () => {
      try {
        source.disconnect(node);
        node.disconnect();
      } catch {
        /* 무시 */
      }
    };

    node.port.onmessage = (event) => {
      if (event.data.type === 'musicStart') {
        cleanup();
        resolve({ timestamp: event.data.timestamp });
      }
    };

    node.port.onmessageerror = (e) => {
      cleanup();
      reject(e);
    };

    // const timeoutId = setTimeout(() => {
    //   cleanup();
    //   reject(new Error('detectMusicStart: 분석 timeout'));
    // }, 10_000);

    // Promise 내부에 clearTimeout 추가하여 깔끔히 종료
  });
}
