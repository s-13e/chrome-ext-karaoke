// YouTube 비디오의 현재 재생 시간을 React 상태로 실시간 추적하여,
// 가사 오버레이, 전체 가사 하이라이트 등에서 재사용할 수 있도록 합니다.

import { useEffect, useState, useRef } from 'react';

/**
 * 유튜브 비디오의 현재 재생 시간을 반환하는 커스텀 훅
 */
export function useCurrentTime(): number {
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const updateFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const attachListener = (video: HTMLVideoElement) => {
      // 이미 같은 video 요소에 리스너가 연결되어 있으면 스킵
      if (videoRef.current === video && updateFnRef.current) {
        return;
      }

      // 새 리스너 함수 생성
      const update = () => setCurrentTime(video.currentTime);

      // 기존 리스너가 있다면 제거
      if (videoRef.current && updateFnRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateFnRef.current);
        console.log('[useCurrentTime] 기존 video 요소 리스너 제거');
      }

      // 새 리스너 연결
      video.addEventListener('timeupdate', update);
      setCurrentTime(video.currentTime);
      videoRef.current = video;
      updateFnRef.current = update;
      console.log('[useCurrentTime] video 요소에 timeupdate 리스너 연결');
    };

    const video = document.querySelector<HTMLVideoElement>('video');
    if (!video) {
      console.warn('[useCurrentTime] video 엘리먼트 없음');
      return;
    }

    attachListener(video);

    // video 요소가 교체될 수 있으므로 주기적으로 확인
    const checkInterval = setInterval(() => {
      const currentVideo = document.querySelector<HTMLVideoElement>('video');
      if (currentVideo && currentVideo !== videoRef.current) {
        console.log('[useCurrentTime] video 요소 교체 감지 - 리스너 재연결');
        attachListener(currentVideo);
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
      if (videoRef.current && updateFnRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateFnRef.current);
        updateFnRef.current = null;
        console.log('[useCurrentTime] cleanup - 리스너 제거');
      }
    };
  }, []);

  return currentTime;
}
