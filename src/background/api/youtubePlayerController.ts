// background/api/youtubePlayerController.ts
// YouTube IFrame API 사용한 플레이어 제어 모듈

// 자동 재생 실행 함수
export async function skipPreviewSegment(
  player: YT.Player, // YouTubePlayer 대신 YT.Player 사용
  segmentStart: number,
  segmentEnd: number,
  maxDuration = 5,
): Promise<void> {
  if (!player) throw new Error('YouTube Player 객체가 필요합니다.');

  const originalTime = player.getCurrentTime();
  const playStart = Math.max(0, segmentStart);
  const playEnd = Math.min(segmentEnd, playStart + maxDuration);

  return new Promise((resolve, _reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      player.pauseVideo();
      player.seekTo(originalTime, true);

      if (!player.removeEventListener) throw new Error('removeEventListener 함수가 없습니다');
      player.removeEventListener('onStateChange', onStateChange);
    };

    const onStateChange = () => {
      const currentTime = player.getCurrentTime();
      if (currentTime >= playEnd) {
        cleanup();
        resolve();
      }
    };

    player.seekTo(playStart, true);
    player.playVideo();

    if (!player.addEventListener) throw new Error('addEventListener 함수가 없습니다');
    player.addEventListener('onStateChange', onStateChange);

    // 만약 재생이 maxDuration 초가 넘도록 끝나지 않는 경우 강제 종료
    timeoutId = setTimeout(
      () => {
        cleanup();
        resolve();
      },
      (playEnd - playStart) * 1000 + 1000,
    );
  });
}
