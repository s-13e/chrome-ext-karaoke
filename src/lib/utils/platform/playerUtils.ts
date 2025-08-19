// src/utils/playerUtils.ts
import { YOUTUBE_MINI_PLAYER_CLASSES, YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR } from '@constants/youtubeSelectors';

export function checkIfMiniPlayerActive(): boolean {
  // 예시 1: 플레이어 루트 엘리먼트 확인
  const player = document.querySelector(YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR) as HTMLElement | null;
  if (!player) return false;

  // 예시 2: 미니 플레이어 관련 클래스 체크
  // YOUTUBE_MINI_PLAYER_CLASSES에 포함된 클래스를 하나라도 가지고 있으면 true 반환
  if (YOUTUBE_MINI_PLAYER_CLASSES.some((cls) => player.classList.contains(cls))) {
    if (
      player.offsetParent !== null &&
      player.getBoundingClientRect().width > 0 &&
      player.getBoundingClientRect().height > 0
    ) {
      return true;
    }
  }
  // 미니플레이어 UI 엘리먼트 기반 추가 탐지 (필요 시 활성화)
  const miniUI = document.querySelector('.ytp-miniplayer-ui') as HTMLElement | null;
  if (miniUI && miniUI.offsetParent !== null) {
    return true;
  }

  return false;
}
