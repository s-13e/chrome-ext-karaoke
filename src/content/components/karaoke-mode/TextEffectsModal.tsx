// TextEffectsModal.tsx
// 텍스트 효과 설정 모달 컴포넌트
import React, { useState, useEffect, useRef } from 'react';
import styles from './TextEffectsModal.module.css';
import {
  GlobalLyricsStyleConfig,
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
} from '@lib/types/lyricsStyles';
type TabType = 'global' | 'dual' | 'full' | 'single';
interface TextEffectsModalProps {
  onClose: () => void;
}
// 기본 색상 값 정의
const DEFAULT_LYRICS_COLOR = '#ffffff';
const DEFAULT_HIGHLIGHT_COLOR = '#357aff';
const DEFAULT_PRONUNCIATION_COLOR = '#aaaaaa';
/**
 * 텍스트 효과 설정 모달
 * - 전역 설정: 모든 가사 타입에 공통 적용
 * - 개별 설정(Dual/Full/Single): 특정 가사 타입에만 적용
 * - 각 탭은 기본 스타일, 하이라이트 스타일, 발음 스타일 섹션으로 구성
 */
export const TextEffectsModal: React.FC<TextEffectsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('global');
  // 전역 설정 상태
  const [globalConfig, setGlobalConfig] = useState<Partial<GlobalLyricsStyleConfig>>({});
  // 개별 설정 상태
  const [dualConfig, setDualConfig] = useState<Partial<DualHighlightLyricsStyleConfig>>({});
  const [fullConfig, setFullConfig] = useState<Partial<FullLyricsStyleConfig>>({});
  const [singleConfig, setSingleConfig] = useState<Partial<SingleLineLyricsStyleConfig>>({});
  // 원본 설정 저장 (취소 시 복구용)
  const originalConfigsRef = useRef<{
    global: Partial<GlobalLyricsStyleConfig>;
    dual: Partial<DualHighlightLyricsStyleConfig>;
    full: Partial<FullLyricsStyleConfig>;
    single: Partial<SingleLineLyricsStyleConfig>;
  }>({
    global: {},
    dual: {},
    full: {},
    single: {},
  });
  // chrome.storage에서 초기값 로드
  useEffect(() => {
    chrome.storage.sync.get(
      ['lyricsStyleGlobal', 'lyricsStyleDual', 'lyricsStyleFull', 'lyricsStyleSingle'],
      (items) => {
        const global = items.lyricsStyleGlobal || {};
        const dual = items.lyricsStyleDual || {};
        const full = items.lyricsStyleFull || {};
        const single = items.lyricsStyleSingle || {};

        console.log('[TextEffectsModal] 초기 로드:', { global, dual, full, single });

        setGlobalConfig(global);
        setDualConfig(dual);
        setFullConfig(full);
        setSingleConfig(single);
        // 원본 저장
        originalConfigsRef.current = {
          global: JSON.parse(JSON.stringify(global)),
          dual: JSON.parse(JSON.stringify(dual)),
          full: JSON.parse(JSON.stringify(full)),
          single: JSON.parse(JSON.stringify(single)),
        };

        console.log('[TextEffectsModal] 원본 저장 완료:', originalConfigsRef.current);
      },
    );
  }, []);
  // 실시간 미리보기를 위한 임시 storage 저장
  const handlePreviewUpdate = () => {
    // 실시간 미리보기: storage에 임시로 저장 (적용 전까지는 확정 아님)
    chrome.storage.sync.set({
      lyricsStyleGlobal: globalConfig,
      lyricsStyleDual: dualConfig,
      lyricsStyleFull: fullConfig,
      lyricsStyleSingle: singleConfig,
    });
  };

  // 초기화 버튼
  const handleReset = () => {
    const emptyConfig = {};
    setGlobalConfig(emptyConfig);
    setDualConfig(emptyConfig);
    setFullConfig(emptyConfig);
    setSingleConfig(emptyConfig);

    // 즉시 storage에도 반영 (실시간 미리보기)
    chrome.storage.sync.set({
      lyricsStyleGlobal: emptyConfig,
      lyricsStyleDual: emptyConfig,
      lyricsStyleFull: emptyConfig,
      lyricsStyleSingle: emptyConfig,
    });
  };
  // 적용 버튼
  const handleApply = () => {
    chrome.storage.sync.set({
      lyricsStyleGlobal: globalConfig,
      lyricsStyleDual: dualConfig,
      lyricsStyleFull: fullConfig,
      lyricsStyleSingle: singleConfig,
    });
    // 원본 업데이트 (다음 취소 시 현재 상태가 기준이 됨)
    originalConfigsRef.current = {
      global: JSON.parse(JSON.stringify(globalConfig)),
      dual: JSON.parse(JSON.stringify(dualConfig)),
      full: JSON.parse(JSON.stringify(fullConfig)),
      single: JSON.parse(JSON.stringify(singleConfig)),
    };
    onClose();
  };
  // 취소/모달 닫기 공통 로직
  const handleCancelOrClose = () => {
    console.log('[TextEffectsModal] 취소/닫기 - 원본으로 복구:', originalConfigsRef.current);

    // 원본 설정으로 복구
    setGlobalConfig(originalConfigsRef.current.global);
    setDualConfig(originalConfigsRef.current.dual);
    setFullConfig(originalConfigsRef.current.full);
    setSingleConfig(originalConfigsRef.current.single);

    // 즉시 원본 설정을 storage에 복구
    chrome.storage.sync.set({
      lyricsStyleGlobal: originalConfigsRef.current.global,
      lyricsStyleDual: originalConfigsRef.current.dual,
      lyricsStyleFull: originalConfigsRef.current.full,
      lyricsStyleSingle: originalConfigsRef.current.single,
    });

    onClose();
  };
  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>텍스트 효과 설정</h3>
        <button className={styles.closeButton} onClick={handleCancelOrClose} aria-label="닫기">
          ×
        </button>
      </div>
      {/* 탭 네비게이션 */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'global' ? styles.active : ''}`}
          onClick={() => setActiveTab('global')}
        >
          전역 설정
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'dual' ? styles.active : ''}`}
          onClick={() => setActiveTab('dual')}
        >
          Dual
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'full' ? styles.active : ''}`}
          onClick={() => setActiveTab('full')}
        >
          Full
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'single' ? styles.active : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single
        </button>
      </div>
      {/* 탭 컨텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'global' && (
          <GlobalSettingsPanel
            config={globalConfig}
            setConfig={setGlobalConfig}
            onPreviewUpdate={handlePreviewUpdate}
          />
        )}
        {activeTab === 'dual' && (
          <DualSettingsPanel config={dualConfig} setConfig={setDualConfig} onPreviewUpdate={handlePreviewUpdate} />
        )}
        {activeTab === 'full' && (
          <FullSettingsPanel config={fullConfig} setConfig={setFullConfig} onPreviewUpdate={handlePreviewUpdate} />
        )}
        {activeTab === 'single' && (
          <SingleSettingsPanel
            config={singleConfig}
            setConfig={setSingleConfig}
            onPreviewUpdate={handlePreviewUpdate}
          />
        )}
      </div>
      {/* 하단 버튼 */}
      <div className={styles.modalFooter}>
        <button className={styles.resetButton} onClick={handleReset}>
          초기화
        </button>
        <div className={styles.footerRight}>
          <button className={styles.cancelButton} onClick={handleCancelOrClose}>
            취소
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            적용
          </button>
        </div>
      </div>
    </div>
  );
};
/**
 * 전역 설정 패널
 * 모든 가사 타입에 공통 적용되는 스타일 설정
 */
interface GlobalSettingsPanelProps {
  config: Partial<GlobalLyricsStyleConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<GlobalLyricsStyleConfig>>>;
  onPreviewUpdate: () => void;
}
const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate }) => {
  // 발음 하이라이트 활성화 여부
  const [pronunciationHighlightEnabled, setPronunciationHighlightEnabled] = useState(!!config.pronunciation?.highlight);
  // 색상 변경 핸들러
  const updateConfig = (path: string[], value: string | number | undefined) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      let current: Record<string, unknown> = newConfig as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key && !current[key]) {
          current[key] = {};
        }
        if (key) {
          current = current[key] as Record<string, unknown>;
        }
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      return newConfig;
    });
  };
  // 발음 하이라이트 토글
  const handlePronunciationHighlightToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPronunciationHighlightEnabled(enabled);
    if (!enabled) {
      // 하이라이트 비활성화 시 하이라이트 스타일 제거
      setConfig((prev) => ({
        ...prev,
        pronunciation: {
          ...prev.pronunciation,
          highlight: undefined,
        },
      }));
    }
  };
  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>모든 가사 타입에 공통으로 적용됩니다. 개별 설정이 우선합니다.</p>
      {/* 기본 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>기본 스타일</h4>
        <p className={styles.sectionDescription}>타임스탬프 전/재생 중이 아닌 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.default?.color || DEFAULT_LYRICS_COLOR}
            onChange={(e) =>
              updateConfig(['lyrics', 'default', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.default?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'default', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">기본</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.lyrics?.default?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(['lyrics', 'default', 'fontSize'], e.target.value ? Number(e.target.value) : undefined)
            }
            min={10}
            max={48}
            placeholder="16"
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
      {/* 하이라이트 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>하이라이트 스타일</h4>
        <p className={styles.sectionDescription}>현재 재생 중인 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['lyrics', 'highlight', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.highlight?.animation ?? 'none'}
            onChange={(e) => updateConfig(['lyrics', 'highlight', 'animation'], e.target.value || undefined)}
          >
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>발음 스타일</h4>
        <p className={styles.sectionDescription}>로마자 발음 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.default?.color || DEFAULT_PRONUNCIATION_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'default', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.default?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'default', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">기본</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.pronunciation?.default?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(
                ['pronunciation', 'default', 'fontSize'],
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            min={10}
            max={48}
            placeholder="14"
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 표시</label>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={pronunciationHighlightEnabled}
            onChange={handlePronunciationHighlightToggle}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'highlight', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
            disabled={!pronunciationHighlightEnabled}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.highlight?.animation ?? 'none'}
            onChange={(e) => updateConfig(['pronunciation', 'highlight', 'animation'], e.target.value || undefined)}
            disabled={!pronunciationHighlightEnabled}
          >
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
    </div>
  );
};
/**
 * Dual 설정 패널
 * DualHighlightLyrics 전용 스타일 설정 (전역 설정 오버라이드)
 */
interface DualSettingsPanelProps {
  config: Partial<DualHighlightLyricsStyleConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<DualHighlightLyricsStyleConfig>>>;
  onPreviewUpdate: () => void;
}
const DualSettingsPanel: React.FC<DualSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate }) => {
  // 색상 변경 핸들러
  const updateConfig = (path: string[], value: string | number | undefined) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      let current: Record<string, unknown> = newConfig as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key && !current[key]) {
          current[key] = {};
        }
        if (key) {
          current = current[key] as Record<string, unknown>;
        }
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      return newConfig;
    });
  };
  // 발음 하이라이트는 기본적으로 활성화
  const [pronunciationHighlightEnabled, setPronunciationHighlightEnabled] = useState(
    config.pronunciation?.highlight !== undefined ? !!config.pronunciation?.highlight : true,
  );
  const handlePronunciationHighlightToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPronunciationHighlightEnabled(enabled);
    if (!enabled) {
      setConfig((prev) => ({
        ...prev,
        pronunciation: {
          ...prev.pronunciation,
          highlight: undefined,
        },
      }));
    }
  };
  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>Dual 가사 타입에만 적용됩니다. 전역 설정을 오버라이드합니다.</p>
      {/* 기본 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>기본 스타일</h4>
        <p className={styles.sectionDescription}>타임스탬프 전 가사 (아직 불리지 않은 가사)</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.default?.color || DEFAULT_LYRICS_COLOR}
            onChange={(e) =>
              updateConfig(['lyrics', 'default', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.default?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'default', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.lyrics?.default?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(['lyrics', 'default', 'fontSize'], e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="전역 설정 사용"
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
      {/* 하이라이트 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>하이라이트 스타일</h4>
        <p className={styles.sectionDescription}>현재 재생 중인 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['lyrics', 'highlight', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.highlight?.animation ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'highlight', 'animation'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>

      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>발음 스타일</h4>
        <p className={styles.sectionDescription}>로마자 발음 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.default?.color || DEFAULT_PRONUNCIATION_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'default', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.default?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'default', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.pronunciation?.default?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(
                ['pronunciation', 'default', 'fontSize'],
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="전역 설정 사용"
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 표시</label>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={pronunciationHighlightEnabled}
            onChange={handlePronunciationHighlightToggle}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'highlight', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
            disabled={!pronunciationHighlightEnabled}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.highlight?.animation ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'highlight', 'animation'], e.target.value || undefined)}
            disabled={!pronunciationHighlightEnabled}
          >
            <option value="">전역 설정 사용</option>
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
    </div>
  );
};
/**
 * Full 설정 패널
 * FullLyrics 전용 스타일 설정 (전역 설정 오버라이드)
 */
interface FullSettingsPanelProps {
  config: Partial<FullLyricsStyleConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<FullLyricsStyleConfig>>>;
  onPreviewUpdate: () => void;
}
const FullSettingsPanel: React.FC<FullSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate }) => {
  const updateConfig = (path: string[], value: string | number | undefined) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      let current: Record<string, unknown> = newConfig as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key && !current[key]) {
          current[key] = {};
        }
        if (key) {
          current = current[key] as Record<string, unknown>;
        }
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      return newConfig;
    });
  };
  // 발음 하이라이트는 기본적으로 활성화
  const [pronunciationHighlightEnabled, setPronunciationHighlightEnabled] = useState(
    config.pronunciation?.highlight !== undefined ? !!config.pronunciation?.highlight : true,
  );
  const handlePronunciationHighlightToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPronunciationHighlightEnabled(enabled);
    if (!enabled) {
      setConfig((prev) => ({
        ...prev,
        pronunciation: {
          ...prev.pronunciation,
          highlight: undefined,
        },
      }));
    }
  };
  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>Full 가사 타입에만 적용됩니다. 전역 설정을 오버라이드합니다.</p>
      {/* 기본 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>기본 스타일</h4>
        <p className={styles.sectionDescription}>현재 재생 중이 아닌 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.default?.color || DEFAULT_LYRICS_COLOR}
            onChange={(e) =>
              updateConfig(['lyrics', 'default', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.default?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'default', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.lyrics?.default?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(['lyrics', 'default', 'fontSize'], e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="전역 설정 사용"
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
      {/* 하이라이트 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>하이라이트 스타일</h4>
        <p className={styles.sectionDescription}>현재 재생 중인 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['lyrics', 'highlight', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.highlight?.animation ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'highlight', 'animation'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>발음 스타일</h4>
        <p className={styles.sectionDescription}>로마자 발음 가사</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.default?.color || DEFAULT_PRONUNCIATION_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'default', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.default?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'default', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.pronunciation?.default?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(
                ['pronunciation', 'default', 'fontSize'],
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="전역 설정 사용"
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 표시</label>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={pronunciationHighlightEnabled}
            onChange={handlePronunciationHighlightToggle}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>하이라이트 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'highlight', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
            disabled={!pronunciationHighlightEnabled}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.highlight?.animation ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'highlight', 'animation'], e.target.value || undefined)}
            disabled={!pronunciationHighlightEnabled}
          >
            <option value="">전역 설정 사용</option>
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
    </div>
  );
};
/**
 * Single 설정 패널
 * SingleLineLyrics 전용 스타일 설정 (전역 설정 오버라이드)
 * Single은 기본/하이라이트 구분 없이 항상 하이라이트 스타일 적용
 */
interface SingleSettingsPanelProps {
  config: Partial<SingleLineLyricsStyleConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<SingleLineLyricsStyleConfig>>>;
  onPreviewUpdate: () => void;
}
const SingleSettingsPanel: React.FC<SingleSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate }) => {
  const updateConfig = (path: string[], value: string | number | undefined) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      let current: Record<string, unknown> = newConfig as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key && !current[key]) {
          current[key] = {};
        }
        if (key) {
          current = current[key] as Record<string, unknown>;
        }
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      return newConfig;
    });
  };
  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>
        Single 가사 타입에만 적용됩니다. Single은 모든 가사가 하이라이트 스타일을 사용합니다.
      </p>
      {/* 가사 스타일 섹션 (기본/하이라이트 구분 없음) */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>가사 스타일</h4>
        <p className={styles.sectionDescription}>현재 표시되는 가사 (하이라이트 스타일 적용)</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.lyrics?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) => updateConfig(['lyrics', 'color'], (e.target as HTMLInputElement).value || undefined)}
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.lyrics?.fontSize ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'fontSize'], e.target.value ? Number(e.target.value) : undefined)}
            placeholder="전역 설정 사용"
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.lyrics?.animation ?? ''}
            onChange={(e) => updateConfig(['lyrics', 'animation'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>발음 스타일</h4>
        <p className={styles.sectionDescription}>로마자 발음 가사 (하이라이트 스타일 적용)</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글자 색</label>
          <input
            type="color"
            className={styles.colorInput}
            value={config.pronunciation?.color || DEFAULT_HIGHLIGHT_COLOR}
            onChange={(e) =>
              updateConfig(['pronunciation', 'color'], (e.target as HTMLInputElement).value || undefined)
            }
            onBlur={onPreviewUpdate}
            onMouseUp={onPreviewUpdate}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 종류</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.fontFamily ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'fontFamily'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="Arial">Arial</option>
            <option value="Noto Sans KR">Noto Sans KR</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>글꼴 크기</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.pronunciation?.fontSize ?? ''}
            onChange={(e) =>
              updateConfig(['pronunciation', 'fontSize'], e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="전역 설정 사용"
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>애니메이션 효과</label>
          <select
            className={styles.selectInput}
            value={config.pronunciation?.animation ?? ''}
            onChange={(e) => updateConfig(['pronunciation', 'animation'], e.target.value || undefined)}
          >
            <option value="">전역 설정 사용</option>
            <option value="none">없음</option>
            <option value="fade">페이드</option>
            <option value="scale">크기 변화</option>
            <option value="glow">글로우</option>
          </select>
        </div>
      </div>
    </div>
  );
};
