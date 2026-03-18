// SidebarContainer.tsx
// 가라오케 모드 오른쪽 사이드바 컨테이너 — 아이콘 탭 내비게이션 + 콘텐츠 패널 2패널 구조
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from '@lib/types/lyrics';
import {
  MdMusicNote,
  MdSearch,
  MdTrendingUp,
  MdFolderOpen,
  MdTune,
  MdHelpOutline,
  MdSettings,
  MdChevronRight,
  MdChevronLeft,
  MdSkipNext,
  MdTextFields,
} from 'react-icons/md';
import styles from './styles.module.css';

// Sidebar 컴포넌트들을 lazy loading으로 변경 (메모리 최적화)
const RecordingsList = lazy(() =>
  import('./sideBar/RecordingsList').then((module) => ({ default: module.RecordingsList })),
);
const SyncOffsetList = lazy(() =>
  import('./sideBar/SyncOffsetList').then((module) => ({ default: module.SyncOffsetList })),
);
const PopularChart = lazy(() => import('./sideBar/PopularChart').then((module) => ({ default: module.PopularChart })));
const ManualLyricsSearch = lazy(() =>
  import('./sideBar/ManualLyricsSearch').then((module) => ({ default: module.ManualLyricsSearch })),
);
const TutorialMenu = lazy(() => import('./sideBar/TutorialMenu').then((module) => ({ default: module.TutorialMenu })));

/** 탭 식별자 */
type SidebarTabId = 'lyrics' | 'search' | 'charts' | 'library' | 'tune' | 'tutorial' | 'settings';

/** 보관함 서브탭 */
type LibrarySubTab = 'recordings' | 'syncPresets';

/** 탭 설정 */
interface TabConfig {
  id: SidebarTabId;
  icon: React.ComponentType<{ size?: number }>;
  labelKey: string;
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'lyrics', icon: MdMusicNote, labelKey: 'extSidebarTabLyrics' },
  { id: 'search', icon: MdSearch, labelKey: 'extSidebarTabSearch' },
  { id: 'charts', icon: MdTrendingUp, labelKey: 'extSidebarTabCharts' },
  { id: 'library', icon: MdFolderOpen, labelKey: 'extSidebarTabLibrary' },
  { id: 'tune', icon: MdTune, labelKey: 'extSidebarTabTune' },
  { id: 'tutorial', icon: MdHelpOutline, labelKey: 'extSidebarTabGuide' },
  { id: 'settings', icon: MdSettings, labelKey: 'extSidebarTabSettings' },
];

interface SidebarContainerProps {
  lyrics?: Line[];
  width?: number;
  songTitle?: string;
  songArtist?: string;
}

/** Suspense 로딩 폴백 */
const SuspenseFallback = () => <div style={{ padding: '20px', color: '#fff' }}>Loading...</div>;

/**
 * 가라오케 모드 사이드바 컨테이너
 * - 왼쪽: 52px 아이콘 탭 내비게이션 바
 * - 오른쪽: 접기/펼치기 가능한 콘텐츠 패널
 */
export const SidebarContainer: React.FC<SidebarContainerProps> = ({ width, songTitle, songArtist }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SidebarTabId | null>(null);
  const [librarySubTab, setLibrarySubTab] = useState<LibrarySubTab>('recordings');

  const isPanelOpen = activeTab !== null;

  // 탭 클릭 핸들러 — 같은 탭 클릭 시 패널 접기
  const handleTabClick = useCallback(
    (tabId: SidebarTabId) => {
      const nextTab = activeTab === tabId ? null : tabId;
      setActiveTab(nextTab);
      const expanded = nextTab !== null;
      window.dispatchEvent(
        new CustomEvent('sidebar-panel-toggle', {
          detail: { expanded },
        }),
      );
    },
    [activeTab],
  );

  // 패널 접기/펼치기 토글
  const handleCollapseToggle = useCallback(() => {
    if (isPanelOpen) {
      setActiveTab(null);
      window.dispatchEvent(
        new CustomEvent('sidebar-panel-toggle', {
          detail: { expanded: false },
        }),
      );
    } else {
      setActiveTab('search');
      window.dispatchEvent(
        new CustomEvent('sidebar-panel-toggle', {
          detail: { expanded: true },
        }),
      );
    }
  }, [isPanelOpen]);

  // 수동 검색: 가사 선택
  const handleLyricsSelected = useCallback((newLyrics: Line[]) => {
    console.log('[SidebarContainer] 수동 검색으로 가사 선택:', newLyrics.length, '줄');
    window.dispatchEvent(
      new CustomEvent('manual-lyrics-selected', {
        detail: { lyrics: newLyrics },
      }),
    );
  }, []);

  // 커스텀 이벤트 리스너 등록
  useEffect(() => {
    const handleOpenManualSearch = () => {
      console.log('[SidebarContainer] open-manual-search 이벤트 수신');
      setActiveTab('search');
      window.dispatchEvent(new CustomEvent('sidebar-panel-toggle', { detail: { expanded: true } }));
    };

    const handleOpenSyncSettings = () => {
      console.log('[SidebarContainer] open-sync-settings 이벤트 수신');
      window.dispatchEvent(new CustomEvent('show-sync-panel'));
    };

    const handleTutorialComplete = () => {
      console.log('[SidebarContainer] tutorial-complete 이벤트 수신 - 튜토리얼 탭으로 이동');
      setActiveTab('tutorial');
      window.dispatchEvent(new CustomEvent('sidebar-panel-toggle', { detail: { expanded: true } }));
    };

    const handleTutorialGoMain = () => {
      console.log('[SidebarContainer] tutorial-go-main 이벤트 수신 - 패널 접기');
      setActiveTab(null);
      window.dispatchEvent(new CustomEvent('sidebar-panel-toggle', { detail: { expanded: false } }));
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

  // 콘텐츠 패널 인라인 너비 (아이콘 바 68px 제외)
  const contentPanelWidth = width ? width - 68 : undefined;

  return (
    <div className={styles.sidebarWrapper} style={width ? { width: `${width}px` } : {}}>
      {/* 아이콘 탭 내비게이션 */}
      <nav className={styles.iconNav}>
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`${styles.iconNavButton} ${isActive ? styles.iconNavButtonActive : ''}`}
              onClick={() => handleTabClick(tab.id)}
              aria-label={t(tab.labelKey)}
              title={t(tab.labelKey)}
            >
              <Icon size={16} />
              <span className={styles.iconNavLabel}>{t(tab.labelKey)}</span>
            </button>
          );
        })}

        <div className={styles.iconNavSpacer} />

        {/* 접기/펼치기 토글 */}
        <button
          className={styles.collapseToggle}
          onClick={handleCollapseToggle}
          title={isPanelOpen ? t('extSidebarCollapsePanel') : t('extSidebarExpandPanel')}
          aria-label={isPanelOpen ? t('extSidebarCollapsePanel') : t('extSidebarExpandPanel')}
        >
          {isPanelOpen ? <MdChevronRight size={18} /> : <MdChevronLeft size={18} />}
        </button>
      </nav>

      {/* 콘텐츠 패널 */}
      <div
        className={`${styles.contentPanel} ${!isPanelOpen ? styles.contentPanelCollapsed : ''}`}
        style={isPanelOpen && contentPanelWidth ? { width: `${contentPanelWidth}px` } : {}}
      >
        <div className={styles.contentPanelInner}>
          {/* 곡 정보 헤더 */}
          <div className={styles.songInfoHeader}>
            <div className={styles.songInfoLeft}>
              <div className={styles.songInfoIcon}>
                <MdMusicNote size={16} />
              </div>
              <div className={styles.songInfoText}>
                <p className={styles.songInfoTitle}>{songTitle || 'YouTube Karaoke'}</p>
                <p className={styles.songInfoArtist}>{songArtist || ''}</p>
              </div>
            </div>
          </div>

          {/* 탭 콘텐츠 영역 */}
          <div className={styles.tabContent}>
            {/* 가사 탭 — Phase 1에서는 placeholder */}
            {activeTab === 'lyrics' && (
              <div className={styles.comingSoon}>
                <MdMusicNote size={32} />
                <span>{t('extSidebarComingSoon')}</span>
              </div>
            )}

            {/* 검색 탭 — ManualLyricsSearch 재사용 */}
            {activeTab === 'search' && (
              <Suspense fallback={<SuspenseFallback />}>
                <ManualLyricsSearch onBack={() => {}} onLyricsSelected={handleLyricsSelected} />
              </Suspense>
            )}

            {/* 차트 탭 — 수평 카테고리 탭 + 곡 목록 단일 뷰 */}
            {activeTab === 'charts' && (
              <Suspense fallback={<SuspenseFallback />}>
                <PopularChart />
              </Suspense>
            )}

            {/* 보관함 탭 — 녹음 목록 / 싱크셋 목록 */}
            {activeTab === 'library' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className={styles.librarySubTabs}>
                  <button
                    className={`${styles.librarySubTab} ${librarySubTab === 'recordings' ? styles.librarySubTabActive : ''}`}
                    onClick={() => setLibrarySubTab('recordings')}
                  >
                    {t('extSidebarTabRecordings')}
                  </button>
                  <button
                    className={`${styles.librarySubTab} ${librarySubTab === 'syncPresets' ? styles.librarySubTabActive : ''}`}
                    onClick={() => setLibrarySubTab('syncPresets')}
                  >
                    {t('extSidebarTabSyncPresets')}
                  </button>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                  {librarySubTab === 'recordings' && (
                    <Suspense fallback={<SuspenseFallback />}>
                      <RecordingsList onBack={() => {}} />
                    </Suspense>
                  )}
                  {librarySubTab === 'syncPresets' && (
                    <Suspense fallback={<SuspenseFallback />}>
                      <SyncOffsetList onBack={() => {}} />
                    </Suspense>
                  )}
                </div>
              </div>
            )}

            {/* 조율 탭 — Phase 1에서는 placeholder */}
            {activeTab === 'tune' && (
              <div className={styles.comingSoon}>
                <MdTune size={32} />
                <span>{t('extSidebarComingSoon')}</span>
              </div>
            )}

            {/* 가이드 탭 — TutorialMenu 재사용 */}
            {activeTab === 'tutorial' && (
              <Suspense fallback={<SuspenseFallback />}>
                <TutorialMenu onBack={() => {}} />
              </Suspense>
            )}

            {/* 설정 탭 */}
            {activeTab === 'settings' && <SettingsPanel t={t} />}
          </div>
        </div>
      </div>
    </div>
  );
};

/** 설정 패널 — v0 reference 기반 */
interface SettingsPanelProps {
  t: (key: string) => string;
}

const settingsRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 14px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.04)',
};

const settingsRowLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const settingsLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#fff',
};

const settingsDescStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'rgba(255, 255, 255, 0.45)',
  margin: 0,
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ t }) => {
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);

  // BottomContainer의 자동점프 아이콘 글로우 상태로 초기값 동기화
  useEffect(() => {
    const autoSkipIcon = document.querySelector('[class*="autoSkipIconActive"]');
    if (autoSkipIcon) {
      setAutoSkipEnabled(true);
    }
  }, []);

  const handleAutoSkipToggle = () => {
    // BottomContainer의 자동점프 버튼을 직접 클릭
    const autoSkipBtn = document.querySelector<HTMLButtonElement>('[aria-label="' + t('extKaraokeAutoSkip') + '"]');
    if (autoSkipBtn) {
      autoSkipBtn.click();
    }
    setAutoSkipEnabled((prev) => !prev);
  };

  const handleOpenTextEffects = () => {
    // BottomContainer의 텍스트 효과 버튼을 직접 클릭
    const textEffectsBtn = document.querySelector<HTMLButtonElement>(
      '[aria-label="' + t('extKaraokeTextEffects') + '"]',
    );
    if (textEffectsBtn) {
      textEffectsBtn.click();
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 }}>{t('extSidebarSettingsGeneral')}</h3>

      {/* 자동 간주 점프 토글 */}
      <div style={settingsRowStyle}>
        <div style={settingsRowLeftStyle}>
          <MdSkipNext size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <div>
            <span style={settingsLabelStyle}>{t('extKaraokeAutoSkip')}</span>
            <p style={settingsDescStyle}>{t('extSidebarSettingsAutoSkipDesc')}</p>
          </div>
        </div>
        <button
          onClick={handleAutoSkipToggle}
          role="switch"
          aria-checked={autoSkipEnabled}
          style={{
            width: '36px',
            height: '20px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s',
            background: autoSkipEnabled ? '#00d4aa' : 'rgba(255,255,255,0.15)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: autoSkipEnabled ? '18px' : '2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
            }}
          />
        </button>
      </div>

      {/* 텍스트 효과 설정 바로가기 */}
      <button
        onClick={handleOpenTextEffects}
        style={{
          ...settingsRowStyle,
          border: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
      >
        <div style={settingsRowLeftStyle}>
          <MdTextFields size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <span style={settingsLabelStyle}>{t('extKaraokeTextEffects')}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#00d4aa' }}>{t('extSidebarSettingsOpen')}</span>
      </button>
    </div>
  );
};
