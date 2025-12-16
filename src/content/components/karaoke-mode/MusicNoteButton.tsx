// MusicNoteButton.tsx
import React, { ReactNode, useRef, useEffect, useCallback } from 'react';
import styles from './musicNoteButton.module.css';
import ReactDOM from 'react-dom/client';

interface Props {
  icon: ReactNode;
  contentEnabled: boolean;
  menuVisible: boolean;
  onClick?: () => void;
}

/**
 * YouTube 플레이어 컨트롤에 뮤직노트 버튼을 삽입하는 컴포넌트
 * YouTube UI 업데이트에도 안정적으로 표시되도록 MutationObserver 활용
 */
export const MusicNoteButton: React.FC<Props> = ({ icon, contentEnabled, menuVisible, onClick }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRootRef = useRef<ReactDOM.Root | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const insertionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  /**
   * 전체화면 상태 감지
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // 전체화면 진입 시 버튼 제거
      if (isCurrentlyFullscreen && btnRef.current) {
        console.log('[MusicNoteButton] 전체화면 진입 - 버튼 제거');
        btnRef.current.remove();
        btnRef.current = null;
      }
      // 전체화면 종료 시 버튼 재삽입
      else if (!isCurrentlyFullscreen && contentEnabled) {
        console.log('[MusicNoteButton] 전체화면 종료 - 버튼 재삽입');
        setTimeout(() => {
          insertButton();
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [contentEnabled]);

  /**
   * 버튼 생성 및 DOM 삽입
   */
  const insertButton = useCallback(() => {
    // 전체화면 모드일 때는 버튼 삽입하지 않음
    if (isFullscreen) {
      console.log('[MusicNoteButton] 전체화면 모드 - 버튼 삽입 스킵');
      return;
    }

    // 이미 버튼이 존재하고 DOM에 연결되어 있으면 스킵
    if (btnRef.current && document.contains(btnRef.current)) {
      return;
    }

    // YouTube 새 구조: .ytp-right-controls-right 우선 확인
    const targetContainer: Element | null =
      document.querySelector('.ytp-right-controls-right') || document.querySelector('.ytp-right-controls');

    if (!targetContainer) {
      console.warn('[MusicNoteButton] targetContainer를 찾을 수 없음');
      return;
    }

    // 기존 버튼 제거 (중복 방지)
    const existingBtn = document.querySelector('.ytp-music-note-button');
    if (existingBtn) {
      existingBtn.remove();
    }

    // 버튼 생성
    const btn = document.createElement('button');
    btnRef.current = btn;

    btn.className = `${styles.musicNoteButton} ytp-button ytp-music-note-button`;
    btn.setAttribute('aria-label', '노트');
    btn.setAttribute('data-tooltip', '노트');
    btn.tabIndex = 0;

    // 아이콘 렌더링
    if (iconRootRef.current) {
      // 비동기로 unmount 처리하여 React 렌더링 사이클 충돌 방지
      const oldRoot = iconRootRef.current;
      iconRootRef.current = null;
      setTimeout(() => {
        oldRoot.unmount();
      }, 0);
    }
    iconRootRef.current = ReactDOM.createRoot(btn);
    iconRootRef.current.render(icon);

    // 클릭 이벤트
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick?.();
    });

    // 외부 클릭 시 clicked 클래스 제거 (툴팁 숨김 해제용)
    const handleBodyClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && !btn.contains(target)) {
        btn.classList.remove('clicked');
      }
    };
    document.body.addEventListener('click', handleBodyClick);

    // 버튼 삽입: targetContainer 맨 앞에 추가
    targetContainer.insertBefore(btn, targetContainer.firstChild);
  }, [icon, onClick, isFullscreen]);

  /**
   * YouTube UI 변경 감지 및 버튼 재삽입
   */
  const setupMutationObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // YouTube 새 구조 또는 기존 구조 확인
          const rightControlsRight = document.querySelector('.ytp-right-controls-right');
          const rightControls = document.querySelector('.ytp-right-controls');
          const hasContainer = rightControlsRight || rightControls;

          // 버튼이 DOM에서 제거되었거나 존재하지 않으면 재삽입
          if (hasContainer && (!btnRef.current || !document.contains(btnRef.current))) {
            // 디바운스를 위해 기존 타이머 클리어
            if (insertionTimeoutRef.current) {
              clearTimeout(insertionTimeoutRef.current);
            }

            // 200ms 후 재삽입 (빠른 연속 변경 방지)
            insertionTimeoutRef.current = setTimeout(() => {
              insertButton();
            }, 200);
          }
        }
      }
    });

    // YouTube 플레이어 전체를 관찰
    const playerContainer = document.querySelector('#movie_player');
    if (playerContainer) {
      observer.observe(playerContainer, {
        childList: true,
        subtree: true,
      });
      observerRef.current = observer;
    }
  }, [insertButton]);

  /**
   * contentEnabled 변경 시 버튼 삽입/제거
   */
  useEffect(() => {
    if (!contentEnabled) {
      // 버튼 제거
      if (btnRef.current) {
        btnRef.current.remove();
        btnRef.current = null;
      }

      // 아이콘 루트 언마운트 (비동기 처리)
      if (iconRootRef.current) {
        const oldRoot = iconRootRef.current;
        iconRootRef.current = null;
        setTimeout(() => {
          oldRoot.unmount();
        }, 0);
      }

      // 옵저버 중단
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      return;
    }

    // contentEnabled=true일 때 버튼 삽입 및 옵저버 설정
    // 초기 삽입
    insertButton();

    // MutationObserver 설정 (YouTube UI 변경 감지)
    setupMutationObserver();

    // Cleanup
    return () => {
      if (insertionTimeoutRef.current) {
        clearTimeout(insertionTimeoutRef.current);
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (iconRootRef.current) {
        const oldRoot = iconRootRef.current;
        iconRootRef.current = null;
        setTimeout(() => {
          oldRoot.unmount();
        }, 0);
      }

      if (btnRef.current) {
        btnRef.current.remove();
        btnRef.current = null;
      }
    };
  }, [contentEnabled, insertButton, setupMutationObserver]);

  /**
   * menuVisible 상태에 따라 버튼 스타일 업데이트
   */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    btn.classList.toggle('clicked', menuVisible);
    btn.setAttribute('data-menu-visible', menuVisible ? 'true' : 'false');
  }, [menuVisible]);

  /**
   * icon prop 변경 시 아이콘 재렌더링
   */
  useEffect(() => {
    if (iconRootRef.current && btnRef.current && document.contains(btnRef.current)) {
      iconRootRef.current.render(icon);
    }
  }, [icon]);

  return null;
};
