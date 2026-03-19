// SidebarContainer.tsx
// 가라오케 모드 오른쪽 사이드바 컨테이너 — 아이콘 탭 내비게이션 + 콘텐츠 패널 2패널 구조
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
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
  MdSubtitles,
  MdRecordVoiceOver,
  MdFlag,
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
const TunePanel = lazy(() => import('./sideBar/TunePanel').then((module) => ({ default: module.TunePanel })));
const LyricsSidebarPanel = lazy(() =>
  import('./sideBar/LyricsSidebarPanel').then((module) => ({ default: module.LyricsSidebarPanel })),
);

/** 탭 식별자 */
type SidebarTabId = 'lyrics' | 'search' | 'charts' | 'library' | 'tune' | 'tutorial' | 'settings';

/** 보관함 서브탭 */
type LibrarySubTab = 'recordings' | 'syncPresets';

const IS_DEV_MODE = process.env.DEV_MODE === 'true';

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
export const SidebarContainer: React.FC<SidebarContainerProps> = ({ lyrics, width, songTitle, songArtist }) => {
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
            {/* 피드백 신고 버튼 */}
            <FeedbackReportButton />
          </div>

          {/* 탭 콘텐츠 영역 */}
          <div className={styles.tabContent}>
            {/* 가사 탭 — 전체 가사 뷰 + 자동 하이라이트 + 하단 컨트롤 */}
            {activeTab === 'lyrics' && (
              <Suspense fallback={<SuspenseFallback />}>
                <LyricsSidebarPanel lyrics={lyrics ?? []} />
              </Suspense>
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

            {/* 보관함 탭 — 일반: 녹음 목록만 / DEV: 녹음 + 싱크 프리셋 서브탭 */}
            {activeTab === 'library' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {IS_DEV_MODE && (
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
                )}
                <div style={{ flex: 1, overflow: 'auto' }}>
                  {(!IS_DEV_MODE || librarySubTab === 'recordings') && (
                    <Suspense fallback={<SuspenseFallback />}>
                      <RecordingsList onBack={() => {}} />
                    </Suspense>
                  )}
                  {IS_DEV_MODE && librarySubTab === 'syncPresets' && (
                    <Suspense fallback={<SuspenseFallback />}>
                      <SyncOffsetList onBack={() => {}} />
                    </Suspense>
                  )}
                </div>
              </div>
            )}

            {/* 조율 탭 — 피치/템포 조절 */}
            {activeTab === 'tune' && (
              <Suspense fallback={<SuspenseFallback />}>
                <TunePanel />
              </Suspense>
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

/** 피드백 신고 버튼 — 곡 정보 헤더 오른쪽에 배치 */
const FeedbackReportButton: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleReport = (type: 'wrong_lyrics' | 'sync_mismatch') => {
    // content/index.tsx의 handleFeedback과 동일한 메시지 전달
    window.dispatchEvent(new CustomEvent('send-lyrics-feedback', { detail: { type } }));
    setIsOpen(false);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', flexShrink: 0 }}>
      <span
        role="button"
        tabIndex={0}
        onClick={() => !sent && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setIsOpen((prev) => !prev);
        }}
        title={t('extFeedbackReportIssue')}
        style={{
          color: sent ? '#00d4aa' : 'rgba(255,255,255,0.3)',
          cursor: 'pointer',
          fontSize: '14px',
          padding: '4px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!sent) e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
        }}
        onMouseLeave={(e) => {
          if (!sent) e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
        }}
      >
        {sent ? '✓' : <MdFlag size={14} />}
      </span>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'rgba(30, 30, 45, 0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            zIndex: 100,
            minWidth: '120px',
          }}
        >
          <span
            role="button"
            tabIndex={0}
            onClick={() => handleReport('wrong_lyrics')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleReport('wrong_lyrics');
            }}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {t('extFeedbackWrongLyrics')}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => handleReport('sync_mismatch')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleReport('sync_mismatch');
            }}
            style={{
              padding: '6px 10px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: '4px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {t('extFeedbackSyncMismatch')}
          </span>
        </div>
      )}
    </div>
  );
};

/** 설정 패널 — v0 reference 기반 */
interface SettingsPanelProps {
  t: (key: string) => string;
}

type LyricsDisplayMode = 'sync' | 'single' | 'full';

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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#fff',
  margin: 0,
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  paddingTop: '12px',
};

/** 토글 스위치 공통 컴포넌트 */
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <span
    role="switch"
    tabIndex={0}
    aria-checked={checked}
    onClick={onChange}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onChange();
    }}
    style={{
      width: '36px',
      height: '20px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      display: 'inline-block',
      transition: 'background 0.2s',
      background: checked ? '#00d4aa' : 'rgba(255,255,255,0.15)',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '2px',
        left: checked ? '18px' : '2px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
      }}
    />
  </span>
);

/** 표시 모드 선택 버튼 그룹 */
const DisplayModeSelector: React.FC<{
  mode: LyricsDisplayMode;
  onChange: (mode: LyricsDisplayMode) => void;
  t: (key: string) => string;
}> = ({ mode, onChange, t }) => {
  const modes: { value: LyricsDisplayMode; labelKey: string }[] = [
    { value: 'sync', labelKey: 'extSidebarSettingsModeDual' },
    { value: 'single', labelKey: 'extSidebarSettingsModeSingle' },
    { value: 'full', labelKey: 'extSidebarSettingsModeFull' },
  ];

  return (
    <div
      style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px' }}
    >
      {modes.map((m) => (
        <span
          key={m.value}
          role="button"
          tabIndex={0}
          onClick={() => onChange(m.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onChange(m.value);
          }}
          style={{
            flex: 1,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: mode === m.value ? 600 : 400,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s',
            background: mode === m.value ? 'rgba(0, 212, 170, 0.2)' : 'transparent',
            color: mode === m.value ? '#00d4aa' : 'rgba(255,255,255,0.5)',
            userSelect: 'none',
          }}
        >
          {t(m.labelKey)}
        </span>
      ))}
    </div>
  );
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ t }) => {
  const [autoSkipEnabled, setAutoSkipEnabled] = useState(false);
  const [displayMode, setDisplayMode] = useState<LyricsDisplayMode>('sync');
  const [showCurrentLyrics, setShowCurrentLyrics] = useState(true);
  const [showPronunciation, setShowPronunciation] = useState(true);

  // Chrome Storage에서 초기값 로드 + 변경 리스닝
  useEffect(() => {
    chrome.storage.sync.get(['lyricsMode', 'realtimeLyrics', 'announceLyrics'], (result) => {
      if (result.lyricsMode !== undefined) setDisplayMode(result.lyricsMode as LyricsDisplayMode);
      if (result.realtimeLyrics !== undefined) setShowCurrentLyrics(result.realtimeLyrics as boolean);
      if (result.announceLyrics !== undefined) setShowPronunciation(result.announceLyrics as boolean);
    });
    chrome.storage.local.get(['karaokeAutoSkipEnabled'], (result) => {
      if (result.karaokeAutoSkipEnabled !== undefined) setAutoSkipEnabled(result.karaokeAutoSkipEnabled as boolean);
    });

    const handleChange = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'sync') {
        if (changes.lyricsMode) setDisplayMode(changes.lyricsMode.newValue as LyricsDisplayMode);
        if (changes.realtimeLyrics) setShowCurrentLyrics(changes.realtimeLyrics.newValue as boolean);
        if (changes.announceLyrics) setShowPronunciation(changes.announceLyrics.newValue as boolean);
      }
      if (area === 'local' && changes.karaokeAutoSkipEnabled) {
        setAutoSkipEnabled(changes.karaokeAutoSkipEnabled.newValue as boolean);
      }
    };
    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }, []);

  const handleDisplayModeChange = (mode: LyricsDisplayMode) => {
    setDisplayMode(mode);
    chrome.storage.sync.set({ lyricsMode: mode });
  };

  const handleCurrentLyricsToggle = () => {
    const newVal = !showCurrentLyrics;
    setShowCurrentLyrics(newVal);
    chrome.storage.sync.set({ realtimeLyrics: newVal });
  };

  const handlePronunciationToggle = () => {
    const newVal = !showPronunciation;
    setShowPronunciation(newVal);
    chrome.storage.sync.set({ announceLyrics: newVal });
  };

  const handleAutoSkipToggle = () => {
    const newVal = !autoSkipEnabled;
    setAutoSkipEnabled(newVal);
    chrome.storage.local.set({ karaokeAutoSkipEnabled: newVal });
    // BottomContainer도 storage 변경을 리스닝하므로 자동 동기화됨
  };

  const handleOpenTextEffects = () => {
    window.dispatchEvent(new CustomEvent('open-text-effects-modal'));
  };

  const iconStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.5)', flexShrink: 0 };

  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {/* 가사 표시 섹션 */}
      <h3 style={sectionTitleStyle}>{t('extSidebarSettingsLyricsDisplay')}</h3>

      {/* 표시 모드 */}
      <div style={{ ...settingsRowStyle, flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={settingsRowLeftStyle}>
            <MdTune size={16} style={iconStyle} />
            <div>
              <span style={settingsLabelStyle}>{t('extSidebarSettingsDisplayMode')}</span>
              <p style={settingsDescStyle}>{t('extSidebarSettingsDisplayModeDesc')}</p>
            </div>
          </div>
        </div>
        <DisplayModeSelector mode={displayMode} onChange={handleDisplayModeChange} t={t} />
      </div>

      {/* 현재 가사 표시 */}
      <div style={settingsRowStyle}>
        <div style={settingsRowLeftStyle}>
          <MdSubtitles size={16} style={iconStyle} />
          <div>
            <span style={settingsLabelStyle}>{t('extSidebarSettingsShowCurrentLyrics')}</span>
            <p style={settingsDescStyle}>{t('extSidebarSettingsShowCurrentLyricsDesc')}</p>
          </div>
        </div>
        <ToggleSwitch checked={showCurrentLyrics} onChange={handleCurrentLyricsToggle} />
      </div>

      {/* 발음 표시 */}
      <div style={settingsRowStyle}>
        <div style={settingsRowLeftStyle}>
          <MdRecordVoiceOver size={16} style={iconStyle} />
          <div>
            <span style={settingsLabelStyle}>{t('extSidebarSettingsShowPronunciation')}</span>
            <p style={settingsDescStyle}>{t('extSidebarSettingsShowPronunciationDesc')}</p>
          </div>
        </div>
        <ToggleSwitch checked={showPronunciation} onChange={handlePronunciationToggle} />
      </div>

      {/* 재생 섹션 */}
      <div style={dividerStyle}>
        <h3 style={sectionTitleStyle}>{t('extSidebarSettingsPlayback')}</h3>
      </div>

      {/* 자동 간주 점프 */}
      <div style={settingsRowStyle}>
        <div style={settingsRowLeftStyle}>
          <MdSkipNext size={16} style={iconStyle} />
          <div>
            <span style={settingsLabelStyle}>{t('extKaraokeAutoSkip')}</span>
            <p style={settingsDescStyle}>{t('extSidebarSettingsAutoSkipDesc')}</p>
          </div>
        </div>
        <ToggleSwitch checked={autoSkipEnabled} onChange={handleAutoSkipToggle} />
      </div>

      {/* 외관 섹션 */}
      <div style={dividerStyle}>
        <h3 style={sectionTitleStyle}>{t('extSidebarSettingsAppearance')}</h3>
      </div>

      {/* 텍스트 효과 설정 */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenTextEffects}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleOpenTextEffects();
        }}
        style={{ ...settingsRowStyle, cursor: 'pointer' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
        }}
      >
        <div style={settingsRowLeftStyle}>
          <MdTextFields size={16} style={iconStyle} />
          <span style={settingsLabelStyle}>{t('extKaraokeTextEffects')}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#00d4aa' }}>{t('extSidebarSettingsOpen')}</span>
      </div>
    </div>
  );
};
