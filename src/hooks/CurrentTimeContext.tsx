// CurrentTimeContext.tsx
// 여러 컴포넌트에서 공유하는 currentTime을 Context로 제공
// 중복된 timeupdate 이벤트 리스너 방지 (메모리 최적화)

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';

interface CurrentTimeContextValue {
  currentTime: number;
}

const CurrentTimeContext = createContext<CurrentTimeContextValue | null>(null);

interface CurrentTimeProviderProps {
  children: ReactNode;
}

export const CurrentTimeProvider: React.FC<CurrentTimeProviderProps> = ({ children }) => {
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
        console.log('[CurrentTimeProvider] 기존 video 요소 리스너 제거');
      }

      // 새 리스너 연결
      video.addEventListener('timeupdate', update);
      setCurrentTime(video.currentTime);
      videoRef.current = video;
      updateFnRef.current = update;
      console.log('[CurrentTimeProvider] video 요소에 timeupdate 리스너 연결 (단일 인스턴스)');
    };

    const video = document.querySelector<HTMLVideoElement>('video');
    if (!video) {
      console.warn('[CurrentTimeProvider] video 엘리먼트 없음');
      return;
    }

    attachListener(video);

    // video 요소가 교체될 수 있으므로 주기적으로 확인
    const checkInterval = setInterval(() => {
      const currentVideo = document.querySelector<HTMLVideoElement>('video');
      if (currentVideo && currentVideo !== videoRef.current) {
        console.log('[CurrentTimeProvider] video 요소 교체 감지 - 리스너 재연결');
        attachListener(currentVideo);
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
      if (videoRef.current && updateFnRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateFnRef.current);
        updateFnRef.current = null;
        console.log('[CurrentTimeProvider] cleanup - 리스너 제거');
      }
    };
  }, []);

  return <CurrentTimeContext.Provider value={{ currentTime }}>{children}</CurrentTimeContext.Provider>;
};

// Context 사용을 위한 커스텀 훅
export const useCurrentTime = (): number => {
  const context = useContext(CurrentTimeContext);
  if (!context) {
    throw new Error('useCurrentTime must be used within CurrentTimeProvider');
  }
  return context.currentTime;
};
