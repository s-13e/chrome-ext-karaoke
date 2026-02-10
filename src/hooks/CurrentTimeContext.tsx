// CurrentTimeContext.tsx
// 여러 컴포넌트에서 공유하는 currentTime을 Context로 제공
// useSyncExternalStore를 사용하여 Context value 변경 없이 개별 구독 방식으로 리렌더 최적화

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  useSyncExternalStore,
} from 'react';

/**
 * Context value는 subscribe/getSnapshot 함수 쌍으로 구성.
 * 이 객체 자체는 Provider 생명주기 동안 변하지 않으므로,
 * Context 변경으로 인한 자식 컴포넌트의 불필요한 리렌더가 발생하지 않는다.
 */
interface CurrentTimeStore {
  subscribe: (callback: () => void) => () => void;
  getSnapshot: () => number;
}

const CurrentTimeContext = createContext<CurrentTimeStore | null>(null);

interface CurrentTimeProviderProps {
  children: ReactNode;
}

export const CurrentTimeProvider: React.FC<CurrentTimeProviderProps> = ({ children }) => {
  const timeRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const updateFnRef = useRef<(() => void) | null>(null);

  const subscribe = useCallback((callback: () => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const getSnapshot = useCallback(() => timeRef.current, []);

  useEffect(() => {
    const notifyListeners = () => {
      listenersRef.current.forEach((cb) => cb());
    };

    const attachListener = (video: HTMLVideoElement) => {
      if (videoRef.current === video && updateFnRef.current) {
        return;
      }

      const update = () => {
        timeRef.current = video.currentTime;
        notifyListeners();
      };

      if (videoRef.current && updateFnRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateFnRef.current);
      }

      video.addEventListener('timeupdate', update);
      timeRef.current = video.currentTime;
      videoRef.current = video;
      updateFnRef.current = update;
      notifyListeners();
    };

    const video = document.querySelector<HTMLVideoElement>('video');
    if (video) {
      attachListener(video);
    }

    // video 요소가 교체될 수 있으므로 주기적으로 확인
    const checkInterval = setInterval(() => {
      const currentVideo = document.querySelector<HTMLVideoElement>('video');
      if (currentVideo && currentVideo !== videoRef.current) {
        attachListener(currentVideo);
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
      if (videoRef.current && updateFnRef.current) {
        videoRef.current.removeEventListener('timeupdate', updateFnRef.current);
        updateFnRef.current = null;
      }
    };
  }, []);

  // store 객체는 useRef로 안정적으로 유지 (매 렌더마다 새 객체 생성 방지)
  const storeRef = useRef<CurrentTimeStore>({ subscribe, getSnapshot });

  return <CurrentTimeContext.Provider value={storeRef.current}>{children}</CurrentTimeContext.Provider>;
};

// Context 사용을 위한 커스텀 훅
export const useCurrentTime = (): number => {
  const store = useContext(CurrentTimeContext);
  if (!store) {
    throw new Error('useCurrentTime must be used within CurrentTimeProvider');
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
};
