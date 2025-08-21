import { YOUTUBE_WATCH_PATH } from '@constants/youtubeSelectors';

/**
 * URL이 유튜브 영상 페이지인지 판단
 * 보통 '/watch' 경로 포함 여부로 판단
 * @param url - 검사할 URL 문자열
 * @returns boolean 영상 페이지 여부
 */
export function isWatchPage(url: string): boolean {
  return url.includes(YOUTUBE_WATCH_PATH);
}
