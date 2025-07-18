import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';
import styles from './styles.module.css';

export function injectLyricsOverlayRoot() {
  let overlay = document.getElementById('lyrics-cc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lyrics-cc-overlay';
    overlay.className = styles.overlayRoot!;

    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
    if (player) {
      player.appendChild(overlay);
      console.log('[LyricsOverlayRoot] 오버레이 루트 DOM 삽입 성공');
    } else {
      console.warn('[LyricsOverlayRoot] 유튜브 플레이어 컨테이너를 찾지 못함');
    }
  } else {
    console.log('[LyricsOverlayRoot] 기존 오버레이 루트 DOM 재사용');
  }
  return overlay;
}
