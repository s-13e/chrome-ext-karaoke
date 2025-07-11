import { YOUTUBE_TITLE_SELECTOR, YOUTUBE_VIDEO_ID_PARAM, YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';

// 유튜브 영상 감지 및 메타데이터 추출
export const detectYouTubeVideo = (): { videoId: string; title: string } | null => {
  if (!location.pathname.includes(YOUTUBE_WATCH_PATH)) return null;

  const urlParams = new URLSearchParams(location.search);
  const videoId = urlParams.get(YOUTUBE_VIDEO_ID_PARAM);
  const titleElement = document.querySelector(YOUTUBE_TITLE_SELECTOR) as HTMLHeadingElement;

  return videoId && titleElement
    ? {
        videoId,
        title: titleElement.innerText.trim(),
      }
    : null;
};

// SPA 네비게이션 대응
export const setupSPAObserver = (callback: () => void): MutationObserver => {
  const observer = new MutationObserver(() => {
    if (detectYouTubeVideo()) callback();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  return observer; // MutationObserver 반환
};

/**
 * YouTube 플레이어(#movie_player) DOM이 문서에 추가되는 즉시 콜백을 실행하는 MutationObserver를 생성합니다.
 *
 * @param callback - 플레이어가 감지되었을 때 실행할 함수
 * @returns MutationObserver 인스턴스
 */
export const setupPlayerReadyObserver = (callback: () => void): MutationObserver => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.id === 'movie_player' || node.querySelector('#movie_player')) {
            callback();
            observer.disconnect(); // 한 번 감지 후 관찰 중지
            return;
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
};
