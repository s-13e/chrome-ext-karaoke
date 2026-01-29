import { useState, useEffect } from 'react';

/**
 * 전체화면 상태를 감지하는 커스텀 훅
 * fullscreenchange 이벤트를 구독하여 상태 변경 시 리렌더링 트리거
 */
export function useFullscreenState(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return isFullscreen;
}
