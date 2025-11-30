import { YOUTUBE_PLAYER_SELECTOR } from '@constants/youtubeSelectors';
import styles from './LyricsOverlayRoot.module.css';

export function injectLyricsOverlayRoot() {
  let overlay = document.getElementById('lyrics-cc-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'lyrics-cc-overlay';
    overlay.className = styles.overlayRoot!;
    overlay.style.visibility = 'hidden'; // CSS 로드 전 깜빡임 방지용 숨김 처리 추가

    // 여러 선택자 시도 (기본 모드, 영화관 모드, fallback)
    const selectors = [
      YOUTUBE_PLAYER_SELECTOR, // #movie_player (기본 모드)
      '#player-container-outer', // 영화관 모드 컨테이너
      'ytd-player#ytd-player', // 최상위 플레이어
    ];

    let player: HTMLElement | null = null;
    for (const selector of selectors) {
      player = document.querySelector(selector) as HTMLElement | null;
      if (player) {
        console.log(`[LyricsOverlayRoot] 플레이어 발견: ${selector}`);
        break;
      }
    }

    if (player) {
      // 부모 요소 position 체크 및 relative 지정 (필수)
      const computedStyle = getComputedStyle(player);
      if (computedStyle.position === 'static' || !computedStyle.position) {
        player.style.position = 'relative';
        console.log('[LyricsOverlayRoot] 플레이어에 position: relative 설정');
      }

      player.appendChild(overlay);

      // CSS 로드 완료 후 visibility를 visible로 변경 (깜빡임 방지)
      requestAnimationFrame(() => {
        overlay!.style.visibility = 'visible';
      });

      console.log(
        'injectLyricsRoot: #lyrics-cc-overlay element exists?',
        !!document.getElementById('lyrics-cc-overlay'),
      );
    } else {
      console.warn('[LyricsOverlayRoot] 유튜브 플레이어 컨테이너를 찾지 못함');
    }
  } else {
    console.log('[LyricsOverlayRoot] 기존 오버레이 루트 DOM 재사용');
    // 기존 오버레이가 숨겨져 있을 수 있으므로 visible 보장
    overlay.style.visibility = 'visible';
  }
  return overlay;
}
