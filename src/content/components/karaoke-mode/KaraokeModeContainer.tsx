// KaraokeModeContainer.tsx
// 가라오케 모드의 메인 컨테이너 컴포넌트
// MusicNoteButton 클릭 시 사이드바, 하단 컨테이너를 표시/숨김 처리
import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { SidebarContainer } from './SidebarContainer';
import { BottomContainer } from './BottomContainer';
import { Line } from '@lib/types/lyrics';
import { CurrentTimeProvider } from '@hooks/CurrentTimeContext';
import styles from './styles.module.css';

// TextEffectsModal lazy loading (KaraokeModeContainer 레벨에서 관리)
const TextEffectsModal = lazy(() =>
  import('./TextEffectsModal').then((module) => ({ default: module.TextEffectsModal })),
);

/**
 * 레이아웃 상수
 * styles.module.css의 값과 일치해야 함
 */
const YOUTUBE_TOOLBAR = 56; // YouTube 상단 툴바 높이
const BOTTOM_BAR_HEIGHT = 100; // 동영상 플레이어 하단 여백 (실제 하단바는 100px이지만 겹치도록 설정)
const ICON_NAV_WIDTH = 71; // 아이콘 탭 내비게이션 너비 (68px + border 3px)

const KARAOKE_STYLE_ID = 'yt-karaoke-player-overrides';

/**
 * 플레이어 내부 요소 스타일을 <style> 태그로 주입
 * stylesheet !important > 일반 inline style (CSS specificity 규칙)
 * → YouTube JS가 inline style로 left/top/width/height를 재설정해도 이 규칙이 우선
 */
const injectPlayerStyles = () => {
  if (document.getElementById(KARAOKE_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = KARAOKE_STYLE_ID;
  style.textContent = `
    #player-container {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      min-height: 100% !important;
      aspect-ratio: auto !important;
    }
    #movie_player {
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      min-height: 100% !important;
      aspect-ratio: auto !important;
    }
    .html5-video-container {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      aspect-ratio: auto !important;
    }
    video.html5-main-video {
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      left: 0 !important;
      top: 0 !important;
      object-fit: contain !important;
      object-position: center center !important;
    }
  `;
  document.head.appendChild(style);
};

/** 주입된 플레이어 스타일 제거 */
const removePlayerStyles = () => {
  document.getElementById(KARAOKE_STYLE_ID)?.remove();
};

interface KaraokeModeContainerProps {
  visible: boolean;
  lyrics: Line[];
  songTitle?: string;
  songArtist?: string;
}

/**
 * 가라오케 모드의 전체 컨테이너
 * - SidebarContainer: 동영상 플레이어 오른쪽에 가라오케 서비스 제공
 * - BottomContainer: 하단에 구간 반복, 싱크셋 등 기능 제공
 */
// 반응형 콘텐츠 패널 너비 계산 함수
const getContentPanelWidth = () => {
  const width = window.innerWidth;
  if (width <= 768) return 280; // 모바일: 280px
  if (width <= 1024) return 320; // 태블릿: 320px
  return 380; // 데스크톱: 380px
};

// 전체 사이드바 너비 (아이콘 내비 + 콘텐츠 패널)
const getSidebarWidth = (isPanelExpanded: boolean) => {
  if (!isPanelExpanded) return ICON_NAV_WIDTH;
  return ICON_NAV_WIDTH + getContentPanelWidth();
};

export const KaraokeModeContainer: React.FC<KaraokeModeContainerProps> = ({
  visible,
  lyrics,
  songTitle,
  songArtist,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(getSidebarWidth(false));

  // visible 변경 시 패널 상태 리셋 (SidebarContainer는 remount되어 activeTab=null이 되므로 동기화)
  useEffect(() => {
    if (visible) {
      setIsPanelExpanded(false);
      setSidebarWidth(getSidebarWidth(false));
    }
  }, [visible]);

  // 전체화면 상태 감지 및 처리
  useEffect(() => {
    if (!visible) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      // 전체화면 해제 시 사이드바 패널 접기 (remount 후 빈 패널 방지)
      if (!isCurrentlyFullscreen) {
        setIsPanelExpanded(false);
        setSidebarWidth(getSidebarWidth(false));
      }

      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      const columns = document.querySelector<HTMLElement>('#columns');
      const ytdApp = document.querySelector<HTMLElement>('ytd-app');

      if (isCurrentlyFullscreen) {
        // 전체화면 진입: 플레이어를 화면 전체로 확장 (하단 여백 제거)
        console.log('[KaraokeModeContainer] 전체화면 진입 - 전체 화면 스타일 적용');
        if (fullBleedContainer) {
          // 전체화면에서는 100vh로 화면 전체 채우기 (하단바 공간 없음)
          fullBleedContainer.style.setProperty('position', 'fixed', 'important');
          fullBleedContainer.style.setProperty('top', '0', 'important');
          fullBleedContainer.style.setProperty('left', '0', 'important');
          fullBleedContainer.style.setProperty('width', '100vw', 'important');
          fullBleedContainer.style.setProperty('height', '100vh', 'important');
          fullBleedContainer.style.setProperty('z-index', '2147483647', 'important'); // 최상위
          fullBleedContainer.style.setProperty('margin', '0', 'important');
          fullBleedContainer.style.setProperty('padding', '0', 'important');
          fullBleedContainer.style.setProperty('max-width', '100vw', 'important');
          fullBleedContainer.style.setProperty('max-height', '100vh', 'important');
        }
        if (columns) {
          columns.style.setProperty('display', 'none', 'important');
        }
        // ytd-app 하단 여백 방지
        if (ytdApp) {
          ytdApp.style.setProperty('overflow', 'hidden', 'important');
          ytdApp.style.setProperty('max-height', '100vh', 'important');
          ytdApp.style.setProperty('height', '100vh', 'important');
        }
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      } else {
        // 전체화면 종료: 카라오케 모드가 켜져있으면 스타일 재적용, 꺼져있으면 완전 제거
        console.log('[KaraokeModeContainer] 전체화면 종료 - 스타일 복원');

        if (!visible) {
          // 카라오케 모드가 꺼져있으면 모든 스타일 제거
          if (fullBleedContainer) {
            fullBleedContainer.style.removeProperty('position');
            fullBleedContainer.style.removeProperty('top');
            fullBleedContainer.style.removeProperty('left');
            fullBleedContainer.style.removeProperty('width');
            fullBleedContainer.style.removeProperty('height');
            fullBleedContainer.style.removeProperty('z-index');
            fullBleedContainer.style.removeProperty('margin');
            fullBleedContainer.style.removeProperty('padding');
            fullBleedContainer.style.removeProperty('max-width');
            fullBleedContainer.style.removeProperty('max-height');
          }
          if (columns) {
            columns.style.removeProperty('display');
          }
          if (ytdApp) {
            ytdApp.style.removeProperty('margin');
            ytdApp.style.removeProperty('padding');
            ytdApp.style.removeProperty('min-height');
            // 전체화면 관련 스타일(position, top, left, width, height, max-height, overflow)은
            // index.tsx의 fullscreenchange 핸들러에서 관리하므로 여기서는 제거하지 않음
          }
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        } else {
          // 카라오케 모드가 켜져있으면 가라오케 스타일 재적용
          setTimeout(() => {
            // 전체화면에서 변경된 내부 요소 스타일 초기화
            if (fullBleedContainer) {
              const playerContainer = fullBleedContainer.querySelector<HTMLElement>('#player-container');
              const moviePlayer = fullBleedContainer.querySelector<HTMLElement>('#movie_player');
              const videoContainer = fullBleedContainer.querySelector<HTMLElement>('.html5-video-container');
              const videoElement = fullBleedContainer.querySelector<HTMLVideoElement>('video.html5-main-video');

              // 모든 스타일 제거 (YouTube 기본값으로 복원 후 재적용)
              if (playerContainer) {
                playerContainer.style.removeProperty('width');
                playerContainer.style.removeProperty('height');
                playerContainer.style.removeProperty('max-width');
                playerContainer.style.removeProperty('max-height');
                playerContainer.style.removeProperty('min-height');
                playerContainer.style.removeProperty('aspect-ratio');
                playerContainer.style.removeProperty('left');
                playerContainer.style.removeProperty('right');
                playerContainer.style.removeProperty('top');
                playerContainer.style.removeProperty('bottom');
                playerContainer.style.removeProperty('transform');
                playerContainer.style.removeProperty('position');
              }
              if (moviePlayer) {
                moviePlayer.style.removeProperty('width');
                moviePlayer.style.removeProperty('height');
                moviePlayer.style.removeProperty('max-width');
                moviePlayer.style.removeProperty('max-height');
                moviePlayer.style.removeProperty('min-height');
                moviePlayer.style.removeProperty('aspect-ratio');
                moviePlayer.style.removeProperty('left');
                moviePlayer.style.removeProperty('right');
                moviePlayer.style.removeProperty('top');
                moviePlayer.style.removeProperty('bottom');
                moviePlayer.style.removeProperty('transform');
              }
              if (videoContainer) {
                videoContainer.style.removeProperty('width');
                videoContainer.style.removeProperty('height');
                videoContainer.style.removeProperty('max-width');
                videoContainer.style.removeProperty('max-height');
                videoContainer.style.removeProperty('aspect-ratio');
                videoContainer.style.removeProperty('left');
                videoContainer.style.removeProperty('right');
                videoContainer.style.removeProperty('top');
                videoContainer.style.removeProperty('bottom');
                videoContainer.style.removeProperty('transform');
              }
              if (videoElement) {
                videoElement.style.removeProperty('width');
                videoElement.style.removeProperty('height');
                videoElement.style.removeProperty('max-width');
                videoElement.style.removeProperty('max-height');
                videoElement.style.removeProperty('object-fit');
                videoElement.style.removeProperty('object-position');
                videoElement.style.removeProperty('left');
                videoElement.style.removeProperty('right');
                videoElement.style.removeProperty('top');
                videoElement.style.removeProperty('bottom');
                videoElement.style.removeProperty('transform');
              }
            }

            // 강제 리플로우 (레이아웃 재계산)
            if (fullBleedContainer) {
              void fullBleedContainer.offsetHeight;
            }

            // 사이드바 너비 재계산 (viewport 변경에 대응)
            const newSidebarWidth = getSidebarWidth(isPanelExpanded);
            setSidebarWidth(newSidebarWidth);

            // 스타일 재적용을 위해 useEffect 재실행 트리거
            window.dispatchEvent(new CustomEvent('karaoke-restore-styles'));
          }, 100);
        }
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
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    // 사이드바 패널 토글 이벤트 리스너
    const handlePanelToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ expanded: boolean }>;
      const expanded = customEvent.detail.expanded;
      setIsPanelExpanded(expanded);
      const newWidth = getSidebarWidth(expanded);
      setSidebarWidth(newWidth);

      // YouTube 플레이어 너비 즉시 재조정
      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      if (fullBleedContainer) {
        fullBleedContainer.style.setProperty('width', `calc(100vw - ${newWidth}px)`, 'important');
        fullBleedContainer.style.setProperty('max-width', `calc(100vw - ${newWidth}px)`, 'important');
      }
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    };
    window.addEventListener('sidebar-panel-toggle', handlePanelToggle);

    // 가라오케 스타일 적용 함수
    const applyKaraokeStyles = () => {
      const SIDEBAR_WIDTH = getSidebarWidth(isPanelExpanded);
      // YouTube 페이지 메인 컨테이너들
      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      const columns = document.querySelector<HTMLElement>('#columns');
      const ytdApp = document.querySelector<HTMLElement>('ytd-app');

      console.log('[KaraokeModeContainer] DOM 요소 확인:', {
        fullBleedContainer: !!fullBleedContainer,
        columns: !!columns,
        ytdApp: !!ytdApp,
      });

      if (!fullBleedContainer) {
        console.error('[KaraokeModeContainer] 영화관 모드 전환 실패 - #full-bleed-container 없음');
        return;
      }

      // ytd-app 하단 여백 제거 + 배경색 YouTube 다크 테마와 일치
      if (ytdApp) {
        ytdApp.style.setProperty('margin', '0', 'important');
        ytdApp.style.setProperty('padding', '0', 'important');
        ytdApp.style.setProperty('overflow', 'hidden', 'important');
        ytdApp.style.setProperty('max-height', '100vh', 'important');
        ytdApp.style.setProperty('height', '100vh', 'important');
        ytdApp.style.setProperty('background-color', '#0f0f0f', 'important');
      }

      // YouTube Ambient mode(영화 조명) 효과를 하단 영역까지 확장
      const cinematics = document.querySelector<HTMLElement>('#cinematics-container, #cinematics');
      if (cinematics) {
        cinematics.style.setProperty('height', '100vh', 'important');
        cinematics.style.setProperty('max-height', '100vh', 'important');
        cinematics.style.setProperty('overflow', 'visible', 'important');
      }

      // #columns 숨기기 (영상 설명, 추천/댓글 영역 모두 포함)
      if (columns) columns.style.setProperty('display', 'none', 'important');

      // 플레이어를 전체화면처럼 확장 (영화관 모드의 #full-bleed-container 조작)
      fullBleedContainer.style.setProperty('position', 'fixed', 'important');
      fullBleedContainer.style.setProperty('top', `${YOUTUBE_TOOLBAR}px`, 'important');
      fullBleedContainer.style.setProperty('left', '0', 'important');
      fullBleedContainer.style.setProperty('width', `calc(100vw - ${SIDEBAR_WIDTH}px)`, 'important');
      fullBleedContainer.style.setProperty(
        'height',
        `calc(100vh - ${YOUTUBE_TOOLBAR + BOTTOM_BAR_HEIGHT}px)`,
        'important',
      );
      fullBleedContainer.style.setProperty('z-index', '2000', 'important');
      fullBleedContainer.style.setProperty('margin', '0', 'important');
      fullBleedContainer.style.setProperty('padding', '0', 'important');
      fullBleedContainer.style.setProperty('max-width', `calc(100vw - ${SIDEBAR_WIDTH}px)`, 'important');
      fullBleedContainer.style.setProperty(
        'max-height',
        `calc(100vh - ${YOUTUBE_TOOLBAR + BOTTOM_BAR_HEIGHT}px)`,
        'important',
      );
      // 플레이어 내부 요소 스타일은 <style> 태그로 주입 (YouTube의 inline style 재설정에 강건함)
      // stylesheet !important > 일반 inline style 이므로 YouTube JS가 덮어쓸 수 없음
      injectPlayerStyles();

      // 강제 리플로우 트리거 (스타일 적용 강제)
      void fullBleedContainer.offsetHeight;

      // 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // 레이아웃 재계산을 위한 resize 이벤트 트리거
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    };

    // 초기 스타일 적용 (영화관 모드 전환 대기)
    const timeoutId = setTimeout(applyKaraokeStyles, 300);

    // 전체화면 종료 후 복원 이벤트 리스너
    const handleRestoreStyles = () => {
      console.log('[KaraokeModeContainer] 스타일 복원 이벤트 수신');
      applyKaraokeStyles();
    };

    window.addEventListener('karaoke-restore-styles', handleRestoreStyles);

    // 영화관/기본 모드 버튼 클릭 시 가라오케 모드 자동 비활성화
    const handleTheaterModeButtonClick = () => {
      console.log('[KaraokeModeContainer] 모드 버튼 클릭 감지 - 가라오케 모드 비활성화');
      // 가라오케 모드 비활성화 이벤트 발생
      window.dispatchEvent(new CustomEvent('karaoke-mode-exit'));
    };

    const theaterModeButton = document.querySelector<HTMLButtonElement>('button.ytp-size-button');
    if (theaterModeButton) {
      theaterModeButton.addEventListener('click', handleTheaterModeButtonClick);
    }

    // 윈도우 리사이즈 시 플레이어 크기 및 사이드바 너비 재조정
    const handleResize = () => {
      const newSidebarWidth = getSidebarWidth(isPanelExpanded);

      // 사이드바 너비가 실제로 변경된 경우에만 상태 업데이트
      setSidebarWidth((prevWidth) => {
        if (prevWidth !== newSidebarWidth) {
          console.log('[KaraokeModeContainer] 사이드바 너비 변경:', prevWidth, '→', newSidebarWidth);
          return newSidebarWidth;
        }
        return prevWidth;
      });

      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      if (fullBleedContainer) {
        // 너비 재조정
        fullBleedContainer.style.setProperty('width', `calc(100vw - ${newSidebarWidth}px)`, 'important');
        fullBleedContainer.style.setProperty('max-width', `calc(100vw - ${newSidebarWidth}px)`, 'important');

        // 높이 재조정 (창 높이 변경 시 대응)
        fullBleedContainer.style.setProperty(
          'height',
          `calc(100vh - ${YOUTUBE_TOOLBAR + BOTTOM_BAR_HEIGHT}px)`,
          'important',
        );
        fullBleedContainer.style.setProperty(
          'max-height',
          `calc(100vh - ${YOUTUBE_TOOLBAR + BOTTOM_BAR_HEIGHT}px)`,
          'important',
        );
      }
    };

    window.addEventListener('resize', handleResize);

    // 클린업: 원래 상태로 복원
    return () => {
      clearTimeout(timeoutId);
      removePlayerStyles();

      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      const columns = document.querySelector<HTMLElement>('#columns');
      const ytdApp = document.querySelector<HTMLElement>('ytd-app');

      if (fullBleedContainer) {
        fullBleedContainer.style.removeProperty('position');
        fullBleedContainer.style.removeProperty('top');
        fullBleedContainer.style.removeProperty('left');
        fullBleedContainer.style.removeProperty('width');
        fullBleedContainer.style.removeProperty('height');
        fullBleedContainer.style.removeProperty('z-index');
        fullBleedContainer.style.removeProperty('margin');
        fullBleedContainer.style.removeProperty('padding');
        fullBleedContainer.style.removeProperty('max-width');
      }
      if (columns) {
        columns.style.removeProperty('display');
      }
      if (ytdApp) {
        ytdApp.style.removeProperty('margin');
        ytdApp.style.removeProperty('padding');
        ytdApp.style.removeProperty('min-height');
        ytdApp.style.removeProperty('max-height');
        ytdApp.style.removeProperty('height');
        ytdApp.style.removeProperty('overflow');
        ytdApp.style.removeProperty('background-color');
      }
      // Ambient mode 복원
      const cinematicsRestore = document.querySelector<HTMLElement>('#cinematics-container, #cinematics');
      if (cinematicsRestore) {
        cinematicsRestore.style.removeProperty('height');
        cinematicsRestore.style.removeProperty('max-height');
        cinematicsRestore.style.removeProperty('overflow');
      }
      // body/documentElement overflow 복원
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // 이벤트 리스너 제거
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('karaoke-restore-styles', handleRestoreStyles);
      window.removeEventListener('sidebar-panel-toggle', handlePanelToggle);
      if (theaterModeButton) {
        theaterModeButton.removeEventListener('click', handleTheaterModeButtonClick);
      }
    };
  }, [visible, isPanelExpanded]);

  // TextEffectsModal 상태 (KaraokeModeContainer 레벨에서 관리)
  const [showTextEffectsModal, setShowTextEffectsModal] = useState(false);
  const textEffectsModalRef = useRef<HTMLDivElement | null>(null);
  const textEffectsCancelRef = useRef<(() => void) | null>(null);

  // 커스텀 이벤트로 TextEffectsModal 열기/닫기 (사이드바, 하단바 모두 사용 가능)
  useEffect(() => {
    const handleOpen = () => setShowTextEffectsModal(true);
    const handleClose = () => {
      if (textEffectsCancelRef.current) {
        textEffectsCancelRef.current();
        textEffectsCancelRef.current = null;
      }
      setShowTextEffectsModal(false);
    };
    window.addEventListener('open-text-effects-modal', handleOpen);
    window.addEventListener('close-text-effects-modal', handleClose);
    return () => {
      window.removeEventListener('open-text-effects-modal', handleOpen);
      window.removeEventListener('close-text-effects-modal', handleClose);
    };
  }, []);

  // TextEffectsModal 외부 클릭 감지
  useEffect(() => {
    if (!showTextEffectsModal) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (textEffectsModalRef.current && !textEffectsModalRef.current.contains(target)) {
        if (textEffectsCancelRef.current) {
          textEffectsCancelRef.current();
          textEffectsCancelRef.current = null;
        }
        setShowTextEffectsModal(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTextEffectsModal]);

  if (!visible) return null;

  // 전체화면일 때는 커스텀 컨테이너들 숨김
  if (isFullscreen) return null;

  return (
    <CurrentTimeProvider>
      <SidebarContainer lyrics={lyrics} width={sidebarWidth} songTitle={songTitle} songArtist={songArtist} />
      <BottomContainer lyrics={lyrics} sidebarWidth={sidebarWidth} />

      {/* TextEffectsModal — KaraokeModeContainer 레벨에서 렌더링 */}
      {showTextEffectsModal && (
        <div className={styles.textEffectsModalContainer} ref={textEffectsModalRef}>
          <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
            <TextEffectsModal
              onClose={() => setShowTextEffectsModal(false)}
              registerCancel={(fn) => {
                textEffectsCancelRef.current = fn || null;
              }}
            />
          </Suspense>
        </div>
      )}
    </CurrentTimeProvider>
  );
};
