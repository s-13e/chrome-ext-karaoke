import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';
import styles from './LyricsOverlayRoot.module.css';

export function injectLyricsOverlayRoot() {
  console.log('[injectLyricsOverlayRoot] 실행, 기존 root:', document.getElementById('lyrics-cc-overlay'));

  let overlay = document.getElementById('lyrics-cc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lyrics-cc-overlay';
    overlay.className = styles.overlayRoot!;
    // CSS 로드 전 깜빡임 방지용 숨김 처리 추가
    overlay.style.visibility = 'hidden';

    const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR) as HTMLElement | null;

    if (player) {
      // 부모 요소 position 체크 및 relative 지정 (필수)
      const computedStyle = getComputedStyle(player);
      if (computedStyle.position === 'static' || !computedStyle.position) {
        player.style.position = 'relative';
        console.log('[LyricsOverlayRoot] #movie_player에 position: relative 설정');
      }

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
