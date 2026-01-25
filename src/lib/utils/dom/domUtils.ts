// src/lib/utils/domUtils.ts
import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';

// 요소 대기 함수
export const waitForElement = <T extends Element>(selector: string, timeout = 5000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector<T>(selector);
    if (element) return resolve(element);

    const observer = new MutationObserver(() => {
      const found = document.querySelector<T>(selector);
      if (found) {
        cleanup();
        resolve(found);
      }
    });

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Element ${selector} not found in ${timeout}ms`));
    }, timeout);

    const cleanup = () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// 요소 생성 함수
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: ElementCreationOptions,
): HTMLElementTagNameMap[K] => {
  return document.createElement(tagName, options);
};

// 안전한 요소 삽입
export const safeAppendChild = (parent: Node, child: Node): boolean => {
  try {
    parent.appendChild(child);
    return true;
  } catch (error) {
    console.error('DOM append failed:', error);
    return false;
  }
};
// 요소 제거 유틸리티
export const removeElement = (selector: string): boolean => {
  const element = document.querySelector(selector);
  if (!element) return false;
  element.remove();
  return true;
};

// CSS 클래스 토글
export const toggleClass = (element: Element, className: string, force?: boolean): boolean => {
  if (!element) return false;
  element.classList.toggle(className, force);
  return true;
};

export function isAdPlaying(): boolean {
  // 주요 광고 표시 클래스 - 가장 신뢰할 수 있는 광고 감지 방법
  const PLAYER_AD_CLASS = 'ad-showing';
  const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR) as HTMLElement | null;

  // ad-showing 클래스가 플레이어에 있으면 광고 중
  const playerAdState = player && player.classList.contains(PLAYER_AD_CLASS);

  // ad-showing 클래스만 신뢰
  // 참고: .ytp-ad-player-overlay 등 DOM 요소는 광고 종료 후에도 남아있을 수 있어 제외
  return !!playerAdState;
}
