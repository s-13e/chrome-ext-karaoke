// SidebarContainer.tsx
// 가라오케 모드 오른쪽 사이드바 컨테이너
// 가라오케 확장의 다양한 서비스 제공
import React, { useState } from 'react';
import { AcapellaRecording } from './sideBar/AcapellaRecording';
import { RecordingsList } from './sideBar/RecordingsList';
import { Line } from '@lib/types/lyrics';
import styles from './styles.module.css';

type SidebarView = 'main' | 'reservation' | 'queue' | 'chart' | 'acapella' | 'recordings-list' | 'analysis';

interface SidebarContainerProps {
  lyrics?: Line[];
}

/**
 * 가라오케 모드 사이드바 컨테이너
 * - 동영상 플레이어 오른쪽에 위치
 * - 가라오케 확장의 다양한 서비스 제공
 * - 버튼: 다음 곡 예약, 예약 전환, 인기 차트, 무반주 녹음, 나의 노래 스타일 분석
 */
export const SidebarContainer: React.FC<SidebarContainerProps> = ({ lyrics }) => {
  const [currentView, setCurrentView] = useState<SidebarView>('main');

  const handleMenuClick = (view: SidebarView) => {
    console.log(`[SidebarContainer] ${view} 메뉴 클릭`);
    setCurrentView(view);
  };

  const handleBackToMain = () => {
    console.log('[SidebarContainer] 메인으로 돌아가기');
    setCurrentView('main');
  };

  // 메인 메뉴 화면
  if (currentView === 'main') {
    return (
      <div className={styles.sidebarContainer}>
        <div className={styles.sidebarContent}>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('chart')}>
            인기 차트
          </button>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('acapella')}>
            무반주 녹음
          </button>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('recordings-list')}>
            녹음 목록
          </button>
        </div>
      </div>
    );
  }

  // 무반주 녹음 화면
  if (currentView === 'acapella') {
    return (
      <div className={styles.sidebarContainer}>
        <AcapellaRecording onBack={handleBackToMain} lyrics={lyrics} />
      </div>
    );
  }

  // 녹음 목록 화면
  if (currentView === 'recordings-list') {
    return (
      <div className={styles.sidebarContainer}>
        <RecordingsList onBack={handleBackToMain} />
      </div>
    );
  }

  // 다른 메뉴들은 아직 구현 전
  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarContent}>
        <button className={styles.sidebarButton} onClick={handleBackToMain}>
          ← 뒤로가기
        </button>
        <p style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>{currentView} 화면 (구현 예정)</p>
      </div>
    </div>
  );
};
