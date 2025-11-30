// KaraokeModeContainer.tsx
// 가라오케 모드의 메인 컨테이너 컴포넌트
// MusicNoteButton 클릭 시 헤더, 사이드바, 하단 컨테이너를 표시/숨김 처리
import React, { useEffect } from 'react';
import { HeaderContainer } from './HeaderContainer';
import { SidebarContainer } from './SidebarContainer';
import { BottomContainer } from './BottomContainer';
import { Line } from '@lib/types/lyrics';

interface KaraokeModeContainerProps {
  visible: boolean;
  lyrics: Line[];
}

/**
 * 가라오케 모드의 전체 컨테이너
 * - HeaderContainer: 상단에 로고와 설정 버튼 표시
 * - SidebarContainer: 동영상 플레이어 오른쪽에 가라오케 서비스 제공
 * - BottomContainer: 하단에 구간 반복, 싱크셋 등 기능 제공
 */
export const KaraokeModeContainer: React.FC<KaraokeModeContainerProps> = ({ visible, lyrics }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // 전체화면 상태 감지
  useEffect(() => {
    if (!visible) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
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

    const YOUTUBE_TOOLBAR = 56;
    const HEADER_HEIGHT = 30; // HeaderContainer 높이
    const BOTTOM_BAR_HEIGHT = 80; // BottomContainer 높이
    const SIDEBAR_WIDTH = 250; // SidebarContainer 너비

    // 영화관 모드 전환 완료를 기다린 후 DOM 조작
    const timeoutId = setTimeout(() => {
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
      fullBleedContainer.style.setProperty('top', `${YOUTUBE_TOOLBAR + HEADER_HEIGHT}px`, 'important');
      fullBleedContainer.style.setProperty('left', '0', 'important');
      fullBleedContainer.style.setProperty('width', `calc(100vw - ${SIDEBAR_WIDTH}px)`, 'important');
      fullBleedContainer.style.setProperty(
        'height',
        `calc(100vh - ${YOUTUBE_TOOLBAR + HEADER_HEIGHT + BOTTOM_BAR_HEIGHT}px)`,
        'important',
      );
      fullBleedContainer.style.setProperty('z-index', '2000', 'important');
      fullBleedContainer.style.setProperty('margin', '0', 'important');
      fullBleedContainer.style.setProperty('padding', '0', 'important');
      fullBleedContainer.style.setProperty('max-width', `calc(100vw - ${SIDEBAR_WIDTH}px)`, 'important');

      // 내부 플레이어 컨테이너도 함께 조정
      const playerContainer = fullBleedContainer.querySelector<HTMLElement>('#player-container');
      if (playerContainer) {
        playerContainer.style.setProperty('width', '100%', 'important');
        playerContainer.style.setProperty('max-width', '100%', 'important');
      }

      const moviePlayer = fullBleedContainer.querySelector<HTMLElement>('#movie_player');
      if (moviePlayer) {
        moviePlayer.style.setProperty('width', '100%', 'important');
        moviePlayer.style.setProperty('max-width', '100%', 'important');
      }

      // 강제 리플로우 트리거 (스타일 적용 강제)
      void fullBleedContainer.offsetHeight;

      // YouTube 플레이어의 resize 핸들러를 강제로 호출하기 위한 window resize 이벤트 발생
      window.dispatchEvent(new Event('resize'));

      // 스크롤 방지
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }, 300); // 영화관 모드 전환 대기 (300ms)

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
      }
      if (columns) {
        columns.style.removeProperty('display');
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      // 이벤트 리스너 제거
      if (theaterModeButton) {
        theaterModeButton.removeEventListener('click', handleTheaterModeButtonClick);
      }
    };
  }, [visible]);

  if (!visible) return null;

  // 전체화면일 때는 커스텀 컨테이너들 숨김
  if (isFullscreen) return null;

  return (
    <>
      <HeaderContainer />
      <SidebarContainer lyrics={lyrics} />
      <BottomContainer lyrics={lyrics} />
    </>
  );
};
