// src/utils/playerUtils.ts

// YouTube 플레이어 이동 유틸리티
export const moveYouTubePlayer = (targetContainer: HTMLElement, playerSelector = '#movie_player'): boolean => {
  const player = document.querySelector(playerSelector) as HTMLElement;
  if (!player || !targetContainer) {
    console.error('[moveYouTubePlayer] 플레이어 또는 컨테이너를 찾을 수 없음');
    return false;
  }

  try {
    console.log('[moveYouTubePlayer] 플레이어 이동 시작');

    // // 플레이어 스타일 백업
    // const originalStyles = {
    //   position: player.style.position,
    //   zIndex: player.style.zIndex,
    //   opacity: player.style.opacity,
    //   visibility: player.style.visibility
    // };

    // 플레이어 강제 표시
    player.style.opacity = '1';
    player.style.visibility = 'visible';
    player.style.display = 'block';
    player.style.position = 'relative';
    player.style.zIndex = '1000';

    // 플레이어 이동
    targetContainer.appendChild(player);

    console.log('[moveYouTubePlayer] 플레이어 이동 완료');

    // 리사이즈 트리거
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return true;
  } catch (error) {
    console.error('[moveYouTubePlayer] 플레이어 이동 실패:', error);
    return false;
  }
};

// 플레이어 상태 체크
export const isPlayerReady = (): boolean => {
  return !!document.querySelector('video');
};
