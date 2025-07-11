// YouTube 비디오의 현재 재생 시간을 React 상태로 실시간 추적하여,
// 가사 오버레이, 전체 가사 하이라이트 등에서 재사용할 수 있도록 합니다.

import { useEffect, useState } from 'react';

/**
 * 유튜브 비디오의 현재 재생 시간을 반환하는 커스텀 훅
 */
export function useCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = document.querySelector('video');
    if (!video) {
      console.warn('[useCurrentTime] video 엘리먼트 없음');
      return;
    }
    const update = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', update);

    // 초기값 동기화
    setCurrentTime(video.currentTime);

    return () => video.removeEventListener('timeupdate', update);
  }, []);

  return currentTime;
}
