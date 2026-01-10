// KaraokeModeContainer.tsx
// 가라오케 모드의 메인 컨테이너 컴포넌트
// MusicNoteButton 클릭 시 사이드바, 하단 컨테이너를 표시/숨김 처리
import React, { useEffect } from 'react';
import { SidebarContainer } from './SidebarContainer';
import { BottomContainer } from './BottomContainer';
import { Line } from '@lib/types/lyrics';
import { CurrentTimeProvider } from '@hooks/CurrentTimeContext';

/**
 * 레이아웃 상수
 * styles.module.css의 값과 일치해야 함
 */
const YOUTUBE_TOOLBAR = 56; // YouTube 상단 툴바 높이
const BOTTOM_BAR_HEIGHT = 100; // 동영상 플레이어 하단 여백 (실제 하단바는 100px이지만 겹치도록 설정)

interface KaraokeModeContainerProps {
  visible: boolean;
  lyrics: Line[];
}

/**
 * 가라오케 모드의 전체 컨테이너
 * - SidebarContainer: 동영상 플레이어 오른쪽에 가라오케 서비스 제공
 * - BottomContainer: 하단에 구간 반복, 싱크셋 등 기능 제공
 */
// 반응형 사이드바 너비 계산 함수
const getSidebarWidth = () => {
  const width = window.innerWidth;
  if (width <= 768) return 250; // 모바일: 250px
  if (width <= 1024) return 320; // 태블릿: 320px
  return 400; // 데스크톱: 400px
};

export const KaraokeModeContainer: React.FC<KaraokeModeContainerProps> = ({ visible, lyrics }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(getSidebarWidth());

  // 전체화면 상태 감지 및 처리
  useEffect(() => {
    if (!visible) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      const columns = document.querySelector<HTMLElement>('#columns');

      if (isCurrentlyFullscreen) {
        // 전체화면 진입: 가라오케 모드 스타일 제거 (YouTube 기본 전체화면으로)
        console.log('[KaraokeModeContainer] 전체화면 진입 - 가라오케 스타일 일시 해제');
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
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      } else {
        // 전체화면 종료: 가라오케 모드 스타일 재적용
        console.log('[KaraokeModeContainer] 전체화면 종료 - 가라오케 스타일 복원');
        // 잠시 후 스타일 재적용 (전체화면 종료 애니메이션 완료 대기)
        setTimeout(() => {
          // 스타일 재적용을 위해 useEffect 재실행 트리거
          window.dispatchEvent(new CustomEvent('karaoke-restore-styles'));
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
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    let styleObserver: MutationObserver | null = null;

    // 가라오케 스타일 적용 함수
    const applyKaraokeStyles = () => {
      const SIDEBAR_WIDTH = getSidebarWidth();
      // YouTube 페이지 메인 컨테이너들
      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      const columns = document.querySelector<HTMLElement>('#columns');

      console.log('[KaraokeModeContainer] DOM 요소 확인:', {
        fullBleedContainer: !!fullBleedContainer,
        columns: !!columns,
      });

      if (!fullBleedContainer) {
        console.error('[KaraokeModeContainer] 영화관 모드 전환 실패 - #full-bleed-container 없음');
        return;
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
      // 내부 플레이어 컨테이너도 함께 조정
      const playerContainer = fullBleedContainer.querySelector<HTMLElement>('#player-container');
      if (playerContainer) {
        playerContainer.style.setProperty('width', '100%', 'important');
        playerContainer.style.setProperty('height', '100%', 'important');
        playerContainer.style.setProperty('max-width', 'none', 'important');
        playerContainer.style.setProperty('max-height', 'none', 'important');
        playerContainer.style.setProperty('min-height', '100%', 'important');
        // aspect-ratio 제거 시도
        playerContainer.style.setProperty('aspect-ratio', 'auto', 'important');
      }

      const moviePlayer = fullBleedContainer.querySelector<HTMLElement>('#movie_player');
      if (moviePlayer) {
        moviePlayer.style.setProperty('width', '100%', 'important');
        moviePlayer.style.setProperty('height', '100%', 'important');
        moviePlayer.style.setProperty('max-width', 'none', 'important');
        moviePlayer.style.setProperty('max-height', 'none', 'important');
        moviePlayer.style.setProperty('min-height', '100%', 'important');
        // aspect-ratio 제거 시도
        moviePlayer.style.setProperty('aspect-ratio', 'auto', 'important');
      }

      // YouTube 플레이어 내부의 비디오 컨테이너도 조정
      const videoContainer = fullBleedContainer.querySelector<HTMLElement>('.html5-video-container');
      if (videoContainer) {
        videoContainer.style.setProperty('width', '100%', 'important');
        videoContainer.style.setProperty('height', '100%', 'important');
        videoContainer.style.setProperty('max-width', '100%', 'important');
        videoContainer.style.setProperty('max-height', '100%', 'important');
        // aspect-ratio 제거 시도
        videoContainer.style.setProperty('aspect-ratio', 'auto', 'important');
      }

      // 실제 비디오 요소도 조정
      const videoElement = fullBleedContainer.querySelector<HTMLVideoElement>('video.html5-main-video');
      if (videoElement) {
        videoElement.style.setProperty('width', '100%', 'important');
        videoElement.style.setProperty('height', '100%', 'important');
        videoElement.style.setProperty('max-width', '100%', 'important');
        videoElement.style.setProperty('max-height', '100%', 'important');
        videoElement.style.setProperty('object-fit', 'contain', 'important');
      }

      // 강제 리플로우 트리거 (스타일 적용 강제)
      void fullBleedContainer.offsetHeight;

      // 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // 레이아웃 재계산을 위한 resize 이벤트 트리거
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // MutationObserver로 YouTube의 동적 스타일 변경 감지 및 재적용
      if (styleObserver) {
        styleObserver.disconnect();
      }

      if (playerContainer) {
        styleObserver = new MutationObserver(() => {
          // YouTube가 높이를 변경하면 다시 100%로 강제
          if (playerContainer.style.height !== '100%') {
            playerContainer.style.setProperty('height', '100%', 'important');
            playerContainer.style.setProperty('aspect-ratio', 'auto', 'important');
          }
        });

        styleObserver.observe(playerContainer, {
          attributes: true,
          attributeFilter: ['style'],
        });
      }
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
      const newSidebarWidth = getSidebarWidth();

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

      const fullBleedContainer = document.querySelector<HTMLElement>('#full-bleed-container');
      const columns = document.querySelector<HTMLElement>('#columns');

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
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // 이벤트 리스너 제거
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('karaoke-restore-styles', handleRestoreStyles);
      if (theaterModeButton) {
        theaterModeButton.removeEventListener('click', handleTheaterModeButtonClick);
      }
    };
  }, [visible]);

  if (!visible) return null;

  // 전체화면일 때는 커스텀 컨테이너들 숨김
  if (isFullscreen) return null;

  return (
    <CurrentTimeProvider>
      <SidebarContainer lyrics={lyrics} width={sidebarWidth} />
      <BottomContainer lyrics={lyrics} />
    </CurrentTimeProvider>
  );
};
