// KaraokeModeContainer.tsx
// 가라오케 모드의 메인 컨테이너 컴포넌트
// MusicNoteButton 클릭 시 헤더, 사이드바, 하단 컨테이너를 표시/숨김 처리
import React, { useEffect } from 'react';
import { HeaderContainer } from './HeaderContainer';
import { SidebarContainer } from './SidebarContainer';
import { BottomContainer } from './BottomContainer';

interface KaraokeModeContainerProps {
  visible: boolean;
}

/**
 * 가라오케 모드의 전체 컨테이너
 * - HeaderContainer: 상단에 로고와 설정 버튼 표시
 * - SidebarContainer: 동영상 플레이어 오른쪽에 가라오케 서비스 제공
 * - BottomContainer: 하단에 구간 반복, 싱크셋 등 기능 제공
 */
export const KaraokeModeContainer: React.FC<KaraokeModeContainerProps> = ({ visible }) => {
  useEffect(() => {
    if (!visible) return;

    // YouTube 페이지 메인 컨테이너들
    const primary = document.querySelector<HTMLElement>('#primary');
    const related = document.querySelector<HTMLElement>('#secondary-inner');
    const aboveTheFold = document.querySelector<HTMLElement>('#above-the-fold');

    // 레이아웃 조정
    if (primary) primary.style.paddingTop = '30px';
    if (aboveTheFold) aboveTheFold.style.marginTop = '120px';
    if (related) related.style.setProperty('display', 'none', 'important');

    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 클린업: 원래 상태로 복원
    return () => {
      if (primary) primary.style.paddingTop = '';
      if (aboveTheFold) aboveTheFold.style.marginTop = '';
      if (related) related.style.removeProperty('display');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <HeaderContainer />
      <SidebarContainer />
      <BottomContainer />
    </>
  );
};
