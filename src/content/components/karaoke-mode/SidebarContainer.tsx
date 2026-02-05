// SidebarContainer.tsx
// 가라오케 모드 오른쪽 사이드바 컨테이너
// 가라오케 확장의 다양한 서비스 제공
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from '@lib/types/lyrics';
import { ChartCategory } from '@lib/types/chart';
import styles from './styles.module.css';

// Sidebar 컴포넌트들을 lazy loading으로 변경 (메모리 최적화)
const AcapellaRecording = lazy(() =>
  import('./sideBar/AcapellaRecording').then((module) => ({ default: module.AcapellaRecording })),
);
const RecordingsList = lazy(() =>
  import('./sideBar/RecordingsList').then((module) => ({ default: module.RecordingsList })),
);
const SyncOffsetList = lazy(() =>
  import('./sideBar/SyncOffsetList').then((module) => ({ default: module.SyncOffsetList })),
);
const ChartCategoryMenu = lazy(() =>
  import('./sideBar/ChartCategoryMenu').then((module) => ({ default: module.ChartCategoryMenu })),
);
const PopularChart = lazy(() => import('./sideBar/PopularChart').then((module) => ({ default: module.PopularChart })));
const ManualLyricsSearch = lazy(() =>
  import('./sideBar/ManualLyricsSearch').then((module) => ({ default: module.ManualLyricsSearch })),
);
const TutorialMenu = lazy(() => import('./sideBar/TutorialMenu').then((module) => ({ default: module.TutorialMenu })));

type SidebarView =
  | 'main'
  | 'reservation' // 예약
  | 'queue' // 예약 전환
  | 'chart-category' // 차트 카테고리 선택
  | 'chart-list' // 특정 차트의 곡 목록
  | 'acapella'
  | 'recordings-list'
  | 'sync-offset-list'
  | 'manual-lyrics-search'
  | 'tutorial'
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

  // ActionableToast에서 발생하는 이벤트 리스너 등록
  useEffect(() => {
    const handleOpenManualSearch = () => {
      console.log('[SidebarContainer] open-manual-search 이벤트 수신');
      setCurrentView('manual-lyrics-search');
    };

    const handleOpenSyncSettings = () => {
      console.log('[SidebarContainer] open-sync-settings 이벤트 수신');
      // 싱크셋 기능은 BottomContainer에 있으므로, 해당 이벤트를 전달
      // BottomContainer에서 처리하도록 이벤트 재전송
      window.dispatchEvent(new CustomEvent('show-sync-panel'));
    };

    // 튜토리얼 완료 시 튜토리얼 탭으로 돌아오기
    const handleTutorialComplete = () => {
      console.log('[SidebarContainer] tutorial-complete 이벤트 수신 - 튜토리얼 탭으로 이동');
      setCurrentView('tutorial');
    };

    // 튜토리얼 중 메인으로 이동 요청 (나중에 튜토리얼 탭으로 복귀)
    const handleTutorialGoMain = () => {
      console.log('[SidebarContainer] tutorial-go-main 이벤트 수신 - 메인으로 이동');
      setCurrentView('main');
    };

    window.addEventListener('open-manual-search', handleOpenManualSearch);
    window.addEventListener('open-sync-settings', handleOpenSyncSettings);
    window.addEventListener('tutorial-complete', handleTutorialComplete);
    window.addEventListener('tutorial-go-main', handleTutorialGoMain);

    return () => {
      window.removeEventListener('open-manual-search', handleOpenManualSearch);
      window.removeEventListener('open-sync-settings', handleOpenSyncSettings);
      window.removeEventListener('tutorial-complete', handleTutorialComplete);
      window.removeEventListener('tutorial-go-main', handleTutorialGoMain);
    };
  }, []);

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
        <div className={styles.sidebarFooter}>
          <button className={styles.tutorialFooterButton} onClick={() => handleMenuClick('tutorial')}>
            {t('extSidebarTutorial')}
          </button>
        </div>
      </div>
    );
  }

  // 무반주 녹음 화면
  if (currentView === 'acapella') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <AcapellaRecording onBack={handleBackToMain} lyrics={lyrics} />
        </Suspense>
      </div>
    );
  }

  // 녹음 목록 화면
  if (currentView === 'recordings-list') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <RecordingsList onBack={handleBackToMain} />
        </Suspense>
      </div>
    );
  }

  // 싱크셋 목록 화면
  if (currentView === 'sync-offset-list') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <SyncOffsetList onBack={handleBackToMain} />
        </Suspense>
      </div>
    );
  }

  // 차트 카테고리 선택 화면
  if (currentView === 'chart-category') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <ChartCategoryMenu onBackToMain={handleBackToMain} onSelectCategory={handleSelectCategory} />
        </Suspense>
      </div>
    );
  }

  // 차트 목록 화면
  if (currentView === 'chart-list' && selectedChartCategory) {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <PopularChart category={selectedChartCategory} onBackToCategoryMenu={handleBackToCategoryMenu} />
        </Suspense>
      </div>
    );
  }

  // 수동 가사 검색 화면
  if (currentView === 'manual-lyrics-search') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <ManualLyricsSearch onBack={handleBackToMain} onLyricsSelected={handleLyricsSelected} />
        </Suspense>
      </div>
    );
  }

  // 튜토리얼 메뉴 화면
  if (currentView === 'tutorial') {
    return (
      <div className={styles.sidebarContainer} style={sidebarStyle}>
        <Suspense fallback={<div style={{ padding: '20px', color: '#fff' }}>Loading...</div>}>
          <TutorialMenu onBack={handleBackToMain} />
        </Suspense>
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
