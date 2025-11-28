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

    // YouTube 페이지 메인 컨테이너들
    const related = document.querySelector<HTMLElement>('#secondary-inner');
    const aboveTheFold = document.querySelector<HTMLElement>('#above-the-fold');
    const player = document.querySelector<HTMLElement>('#movie_player');
    const playerContainer = document.querySelector<HTMLElement>('#player-container');
    const primary = document.querySelector<HTMLElement>('#primary');

    // 추천 동영상 및 영상 설명 숨기기
    if (related) related.style.setProperty('display', 'none', 'important');
    if (aboveTheFold) aboveTheFold.style.setProperty('display', 'none', 'important');

    // 플레이어를 전체화면처럼 확장
    const YOUTUBE_TOOLBAR = 56;

    if (primary) {
      primary.style.setProperty('position', 'fixed', 'important');
      primary.style.setProperty('top', `${YOUTUBE_TOOLBAR}px`, 'important');
      primary.style.setProperty('left', '0', 'important');
      primary.style.setProperty('width', '100vw', 'important');
      primary.style.setProperty('height', `calc(100vh - ${YOUTUBE_TOOLBAR}px)`, 'important');
      primary.style.setProperty('z-index', '2000', 'important');
      primary.style.setProperty('margin', '0', 'important');
      primary.style.setProperty('padding', '0', 'important');
    }

    if (player) {
      player.style.setProperty('width', '100%', 'important');
      player.style.setProperty('height', '100%', 'important');
    }

    if (playerContainer) {
      playerContainer.style.setProperty('width', '100%', 'important');
      playerContainer.style.setProperty('height', '100%', 'important');
    }

    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 클린업: 원래 상태로 복원
    return () => {
      if (primary) {
        primary.style.removeProperty('position');
        primary.style.removeProperty('top');
        primary.style.removeProperty('left');
        primary.style.removeProperty('width');
        primary.style.removeProperty('height');
        primary.style.removeProperty('z-index');
        primary.style.removeProperty('margin');
        primary.style.removeProperty('padding');
      }
      if (player) {
        player.style.removeProperty('width');
        player.style.removeProperty('height');
      }
      if (playerContainer) {
        playerContainer.style.removeProperty('width');
        playerContainer.style.removeProperty('height');
      }
      if (aboveTheFold) {
        aboveTheFold.style.removeProperty('display');
      }
      if (related) {
        related.style.removeProperty('display');
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
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
