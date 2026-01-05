// SidebarContainer.tsx
// 가라오케 모드 오른쪽 사이드바 컨테이너
// 가라오케 확장의 다양한 서비스 제공
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AcapellaRecording } from './sideBar/AcapellaRecording';
import { RecordingsList } from './sideBar/RecordingsList';
import { SyncOffsetList } from './sideBar/SyncOffsetList';
import { ChartCategoryMenu } from './sideBar/ChartCategoryMenu';
import { PopularChart } from './sideBar/PopularChart';
import { ManualLyricsSearch } from './sideBar/ManualLyricsSearch';
import { Line } from '@lib/types/lyrics';
import { ChartCategory } from '@lib/types/chart';
import styles from './styles.module.css';

type SidebarView =
  | 'main'
  | 'reservation' // 예약
  | 'queue' // 예약 전환
  | 'chart-category' // 차트 카테고리 선택
  | 'chart-list' // 특정 차트의 곡 목록
  | 'acapella'
  | 'recordings-list'
  | 'sync-offset-list' // 싱크셋 목록
  | 'manual-lyrics-search' // 수동 가사 검색
  | 'analysis';

interface SidebarContainerProps {
  lyrics?: Line[];
  width?: number; // 사이드바 너비 (px)
}

/**
 * 가라오케 모드 사이드바 컨테이너
 * - 동영상 플레이어 오른쪽에 위치
 * - 가라오케 확장의 다양한 서비스 제공
 * - 버튼: 다음 곡 예약, 예약 전환, 인기 차트, 무반주 녹음, 나의 노래 스타일 분석
 */
export const SidebarContainer: React.FC<SidebarContainerProps> = ({ lyrics, width }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<SidebarView>('main');
  const [selectedChartCategory, setSelectedChartCategory] = useState<ChartCategory | null>(null);

  // 인라인 스타일: 동적 너비 주입
  const sidebarStyle: React.CSSProperties = width ? { width: `${width}px` } : {};

  const handleMenuClick = (view: SidebarView) => {
    console.log(`[SidebarContainer] ${view} 메뉴 클릭`);
    setCurrentView(view);
  };

  const handleBackToMain = () => {
    console.log('[SidebarContainer] 메인으로 돌아가기');
    setCurrentView('main');
  };

  const handleSelectCategory = (category: ChartCategory) => {
    console.log(`[SidebarContainer] 차트 카테고리 선택: ${category}`);
    setSelectedChartCategory(category);
    setCurrentView('chart-list');
  };

  const handleBackToCategoryMenu = () => {
    console.log('[SidebarContainer] 차트 카테고리 메뉴로 돌아가기');
    setCurrentView('chart-category');
  };

  const handleLyricsSelected = (newLyrics: Line[]) => {
    console.log('[SidebarContainer] 수동 검색으로 가사 선택:', newLyrics.length, '줄');
    // 커스텀 이벤트로 가사 업데이트 요청
    window.dispatchEvent(
      new CustomEvent('manual-lyrics-selected', {
        detail: { lyrics: newLyrics },
      }),
    );
  };

  // 메인 메뉴 화면
  if (currentView === 'main') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <div className={styles.sidebarContent}>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('manual-lyrics-search')}>
            {t('extManualSearchTitle')}
          </button>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('chart-category')}>
            {t('extSidebarPopularChart')}
          </button>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('acapella')}>
            {t('extSidebarAcapellaRecording')}
          </button>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('recordings-list')}>
            {t('extSidebarRecordingsList')}
          </button>
          <button className={styles.sidebarButton} onClick={() => handleMenuClick('sync-offset-list')}>
            {t('extSidebarSyncOffsetList')}
          </button>
        </div>
      </div>
    );
  }

  // 무반주 녹음 화면
  if (currentView === 'acapella') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <AcapellaRecording onBack={handleBackToMain} lyrics={lyrics} />
      </div>
    );
  }

  // 녹음 목록 화면
  if (currentView === 'recordings-list') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <RecordingsList onBack={handleBackToMain} />
      </div>
    );
  }

  // 싱크셋 목록 화면
  if (currentView === 'sync-offset-list') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <SyncOffsetList onBack={handleBackToMain} />
      </div>
    );
  }

  // 차트 카테고리 선택 화면
  if (currentView === 'chart-category') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <ChartCategoryMenu onBackToMain={handleBackToMain} onSelectCategory={handleSelectCategory} />
      </div>
    );
  }

  // 차트 목록 화면
  if (currentView === 'chart-list' && selectedChartCategory) {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <PopularChart category={selectedChartCategory} onBackToCategoryMenu={handleBackToCategoryMenu} />
      </div>
    );
  }

  // 수동 가사 검색 화면
  if (currentView === 'manual-lyrics-search') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <ManualLyricsSearch onBack={handleBackToMain} onLyricsSelected={handleLyricsSelected} />
      </div>
    );
  }

  // 다른 메뉴들은 아직 구현 전
  return (
    <div className={styles.sidebarContainer} style={sidebarStyle}>
      <div className={styles.sidebarContent}>{/* 구현 예정 메시지 */}</div>
    </div>
  );
};
