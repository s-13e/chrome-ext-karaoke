import { YOUTUBE_TITLE_SELECTOR, YOUTUBE_VIDEO_ID_PARAM, YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';

// 유튜브 영상 감지 및 메타데이터 추출
export const detectYouTubeVideo = (): { videoId: string; title?: string } | null => {
  if (!location.pathname.includes(YOUTUBE_WATCH_PATH)) return null;

  const urlParams = new URLSearchParams(location.search);
  const videoId = urlParams.get(YOUTUBE_VIDEO_ID_PARAM);

  if (!videoId) return null;

  // title은 optional - DOM에 없을 수 있음 (새로고침 직후)
  const titleElement = document.querySelector(YOUTUBE_TITLE_SELECTOR) as HTMLHeadingElement;

  return {
    videoId,
    title: titleElement?.innerText.trim(),
  };
};

// 유튜브 영상 페이지 진입(또는 변화) 시점을 감지
export function setupSPAObserver(callback: () => void): MutationObserver {
  const targetNode = document.querySelector('#page-manager') || document.body;

  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false,
  };

  const observer = new MutationObserver(() => {
    callback();
  });

  observer.observe(targetNode, config);

  return observer;
}
