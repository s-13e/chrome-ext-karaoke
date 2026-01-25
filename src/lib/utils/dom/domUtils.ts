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
  // 주요 광고 표시 클래스
  const PLAYER_AD_CLASS = 'ad-showing';
  const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR) as HTMLElement | null;

  // 광고 표시 영역, 광고 DOM, 오버레이 등 다양한 광고 상태 DOM
  const adOverlay = document.querySelector('.ytp-ad-player-overlay, .ytp-ad-overlay-container, .ytp-ad-image-overlay');
  const adText = document.querySelector('.ytp-ad-text');
  const adSkip = document.querySelector('.ytp-ad-skip-button');
  const adIndicator = document.querySelector('.ytp-ad-player-overlay');

  // 광고 상태 클래스 우선 판별
  const playerAdState = player && player.classList.contains(PLAYER_AD_CLASS);
  // 개별 요소 로그 출력
  // if (playerAdState) {
  //   console.log('[isAdPlaying] player에 ad-showing 클래스 감지됨');
  // }
  if (adOverlay) {
    console.log('[isAdPlaying] adOverlay 요소 감지됨:', adOverlay);
  }
  if (adText) {
    console.log('[isAdPlaying] adText 요소 감지됨:', adText);
  }
  if (adSkip) {
    console.log('[isAdPlaying] adSkip 요소 감지됨:', adSkip);
  }
  if (adIndicator) {
    console.log('[isAdPlaying] adIndicator 요소 감지됨:', adIndicator);
  }
  // 광고 오버레이/컨테이너 중 하나라도 있으면 광고 중으로 판정
  const domAdsExist = !!adOverlay || !!adText || !!adSkip || !!adIndicator;

  // 광고 상태 포괄적 OR조건
  return !!playerAdState || domAdsExist;
}
