// TextEffectsModal.tsx
// 텍스트 효과 설정 모달 컴포넌트
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './TextEffectsModal.module.css';
import {
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
  LinearGradientOptions,
} from '@lib/types/lyricsStyles';
import { DEFAULT_LYRICS_COLOR, DEFAULT_HIGHLIGHT_COLOR, DEFAULT_PRONUNCIATION_COLOR } from '@constants/lyricsStyles';
import { DEFAULT_PRONUNCIATION_FONT_WEIGHT } from '@constants/fontWeights';
import { useTranslation } from 'react-i18next';
import {
  calculateDualFontSizes,
  calculateFullFontSizes,
  calculateSingleFontSizes,
  calculateCommonFontSizes,
} from '@lib/utils/lyrics/styles/fontSizeCalculator';
import { FontFamilySelect } from './FontFamilySelect';
import { FontWeightSelect } from './FontWeightSelect';
import { ColorPickerInput } from './ColorPickerInput';

type TabType = 'dual' | 'full' | 'single';
interface TextEffectsModalProps {
  onClose: () => void;
  // 부모가 모달의 '취소(원본 복구)' 콜백을 등록할 수 있도록 함
  registerCancel?: (fn: (() => void) | null) => void;
  // 초기 탭 설정 (현재 가사 표시 모드에 따라)
  initialTab?: TabType;
}
/**
 * 텍스트 효과 설정 모달
 * - 개별 설정(Dual/Full/Single): 특정 가사 타입에만 적용
 * - 각 탭은 기본 스타일, 하이라이트 스타일, 발음 스타일 섹션으로 구성
 */
export const TextEffectsModal: React.FC<TextEffectsModalProps> = ({ onClose, registerCancel, initialTab = 'dual' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // 개별 설정 상태
  const [dualConfig, setDualConfig] = useState<Partial<DualHighlightLyricsStyleConfig>>({});
  const [fullConfig, setFullConfig] = useState<Partial<FullLyricsStyleConfig>>({});
  const [singleConfig, setSingleConfig] = useState<Partial<SingleLineLyricsStyleConfig>>({});
  // 원본 설정 저장 (취소 시 복구용)
  const originalConfigsRef = useRef<{
    dual: Partial<DualHighlightLyricsStyleConfig>;
    full: Partial<FullLyricsStyleConfig>;
    single: Partial<SingleLineLyricsStyleConfig>;
  }>({
    dual: {},
    full: {},
    single: {},
  });
  const { t } = useTranslation();

  // chrome.storage에서 초기값 로드
  useEffect(() => {
    chrome.storage.sync.get(['lyricsStyleDual', 'lyricsStyleFull', 'lyricsStyleSingle'], (items) => {
      const dual = items.lyricsStyleDual || {};
      const full = items.lyricsStyleFull || {};
      const single = items.lyricsStyleSingle || {};

      setDualConfig(dual);
      setFullConfig(full);
      setSingleConfig(single);
      // 원본 저장
      originalConfigsRef.current = {
        dual: JSON.parse(JSON.stringify(dual)),
        full: JSON.parse(JSON.stringify(full)),
        single: JSON.parse(JSON.stringify(single)),
      };
    });
  }, []);
  // 실시간 미리보기를 위한 임시 storage 저장
  const handlePreviewUpdate = () => {
    // 실시간 미리보기: storage에 임시로 저장 (적용 전까지는 확정 아님)
    chrome.storage.sync.set({
      lyricsStyleDual: dualConfig,
      lyricsStyleFull: fullConfig,
      lyricsStyleSingle: singleConfig,
    });
  };

  // 초기화 버튼
  const handleReset = () => {
    const emptyConfig = {};
    setDualConfig(emptyConfig);
    setFullConfig(emptyConfig);
    setSingleConfig(emptyConfig);

    // 즉시 storage에도 반영 (실시간 미리보기)
    chrome.storage.sync.set({
      lyricsStyleDual: emptyConfig,
      lyricsStyleFull: emptyConfig,
      lyricsStyleSingle: emptyConfig,
    });
  };
  // 적용 버튼
  const handleApply = () => {
    chrome.storage.sync.set({
      lyricsStyleDual: dualConfig,
      lyricsStyleFull: fullConfig,
      lyricsStyleSingle: singleConfig,
    });
    // 원본 업데이트 (다음 취소 시 현재 상태가 기준이 됨)
    originalConfigsRef.current = {
      dual: JSON.parse(JSON.stringify(dualConfig)),
      full: JSON.parse(JSON.stringify(fullConfig)),
      single: JSON.parse(JSON.stringify(singleConfig)),
    };
    onClose();
  };
  // 취소/모달 닫기 공통 로직
  const handleCancelOrClose = useCallback(() => {
    // 원본 설정으로 복구
    setDualConfig(originalConfigsRef.current.dual);
    setFullConfig(originalConfigsRef.current.full);
    setSingleConfig(originalConfigsRef.current.single);

    // 즉시 원본 설정을 storage에 복구
    chrome.storage.sync.set({
      lyricsStyleDual: originalConfigsRef.current.dual,
      lyricsStyleFull: originalConfigsRef.current.full,
      lyricsStyleSingle: originalConfigsRef.current.single,
    });

    onClose();
  }, [onClose]);

  // 부모 컴포넌트가 이 모달의 취소 콜백을 받을 수 있게 등록해줌
  useEffect(() => {
    if (registerCancel) {
      registerCancel(handleCancelOrClose);
      return () => {
        try {
          registerCancel(null);
        } catch {
          // ignore
        }
      };
    }
    return undefined;
  }, [registerCancel, handleCancelOrClose]);

  // 페이지 언로드 시 원본 설정으로 복구 (모달이 열려있을 때 페이지 이동/닫기 대응)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 모달이 열려있는 상태에서 페이지가 닫히면 원본 설정으로 복구
      chrome.storage.sync.set({
        lyricsStyleDual: originalConfigsRef.current.dual,
        lyricsStyleFull: originalConfigsRef.current.full,
        lyricsStyleSingle: originalConfigsRef.current.single,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalHeader}>
        <h3 className={styles.modalTitle}>{t('extTextEffectsModalTitle')}</h3>
        <button className={styles.closeButton} onClick={handleCancelOrClose} aria-label={t('extTextEffectsModalClose')}>
          ×
        </button>
      </div>
      {/* 탭 네비게이션 */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'dual' ? styles.active : ''}`}
          onClick={() => setActiveTab('dual')}
        >
          Dual
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'single' ? styles.active : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'full' ? styles.active : ''}`}
          onClick={() => setActiveTab('full')}
        >
          Full
        </button>
      </div>
      {/* 탭 컨텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'dual' && (
          <DualSettingsPanel
            config={dualConfig}
            setConfig={setDualConfig}
            onPreviewUpdate={handlePreviewUpdate}
            t={t}
          />
        )}
        {activeTab === 'single' && (
          <SingleSettingsPanel
            config={singleConfig}
            setConfig={setSingleConfig}
            onPreviewUpdate={handlePreviewUpdate}
            t={t}
          />
        )}
        {activeTab === 'full' && (
          <FullSettingsPanel
            config={fullConfig}
            setConfig={setFullConfig}
            onPreviewUpdate={handlePreviewUpdate}
            t={t}
          />
        )}
      </div>
      {/* 하단 버튼 */}
      <div className={styles.modalFooter}>
        <button className={styles.resetButton} onClick={handleReset}>
          {t('extReset')}
        </button>
        <div className={styles.footerRight}>
          <button className={styles.cancelButton} onClick={handleCancelOrClose}>
            {t('extCancel')}
          </button>
          <button className={styles.applyButton} onClick={handleApply}>
            {t('extApply')}
          </button>
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
  t: (key: string) => string;
}
const DualSettingsPanel: React.FC<DualSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate, t }) => {
  // 현재 뷰포트 기준 계산된 폰트 크기
  const calculatedSizes = useMemo(() => {
    const dualSize = calculateDualFontSizes();
    const commonSizes = calculateCommonFontSizes();
    return {
      lyrics: dualSize,
      pronunciation: commonSizes.pronunciationDefault,
    };
  }, []); // 모달 오픈 시 한 번만 계산

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

      // 즉시 storage에 저장 (실시간 미리보기)
      chrome.storage.sync.set({
        lyricsStyleDual: newConfig,
      });

      return newConfig;
    });
  };
  // 발음 하이라이트 토글 상태
  const [pronunciationHighlightEnabled, setPronunciationHighlightEnabled] = useState(
    config.pronunciationAsMainHighlight ?? false,
  );

  // 색상 모드 상태 (단색 vs 다색)
  const [colorMode, setColorMode] = useState<'solid' | 'multi'>('solid');

  // config 변경 시 상태 동기화 (초기화 버튼 대응)
  useEffect(() => {
    setPronunciationHighlightEnabled(config.pronunciationAsMainHighlight ?? false);
  }, [config.pronunciationAsMainHighlight]);

  const handlePronunciationHighlightToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPronunciationHighlightEnabled(enabled);
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        pronunciationAsMainHighlight: enabled,
      };
      // 즉시 storage에 저장
      chrome.storage.sync.set({
        lyricsStyleDual: newConfig,
      });
      return newConfig;
    });
  };

  const handleColorModeChange = (mode: 'solid' | 'multi') => {
    setColorMode(mode);
    if (mode === 'solid') {
      // 단색 모드: gradient 비활성화
      updateGradientConfig('enabled', false);
    } else {
      // 다색 모드: gradient 활성화
      updateGradientConfig('enabled', true);
    }
  };

  const updateGradientConfig = <K extends keyof LinearGradientOptions>(key: K, value: LinearGradientOptions[K]) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        lyrics: {
          ...prev.lyrics,
          highlight: {
            ...prev.lyrics?.highlight,
            linearGradient: {
              ...prev.lyrics?.highlight?.linearGradient,
              enabled: prev.lyrics?.highlight?.linearGradient?.enabled ?? false,
              color1: prev.lyrics?.highlight?.linearGradient?.color1 || '#357aff',
              color2: prev.lyrics?.highlight?.linearGradient?.color2 || '#e91e63',
              direction: prev.lyrics?.highlight?.linearGradient?.direction || 'right',
              [key]: value,
            },
          },
        },
      };
      // 즉시 storage에 저장
      chrome.storage.sync.set({
        lyricsStyleDual: newConfig,
      });
      return newConfig;
    });
  };

  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>{t('extTextEffectsDualDescription')}</p>
      {/* 기본 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionDefaultStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsDefaultStyleDescription')}</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelTextColor')}</label>
          <ColorPickerInput
            value={config.lyrics?.default?.color || DEFAULT_LYRICS_COLOR}
            onChange={(value) => updateConfig(['lyrics', 'default', 'color'], value)}
            // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontFamily')}</label>
          <FontFamilySelect
            value={config.lyrics?.default?.fontFamily}
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['lyrics', 'default', 'fontFamily'], value);
              updateConfig(['lyrics', 'highlight', 'fontFamily'], value);
            }}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontWeight')}</label>
          <FontWeightSelect
            value={
              typeof config.lyrics?.default?.fontWeight === 'number' ? config.lyrics.default.fontWeight : undefined
            }
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['lyrics', 'default', 'fontWeight'], value);
              updateConfig(['lyrics', 'highlight', 'fontWeight'], value);
            }}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontSize')}</label>
          <input
            type="number"
            className={styles.numberInput}
            value={
              config.lyrics?.default?.fontSize !== undefined ? config.lyrics.default.fontSize : calculatedSizes.lyrics
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputNum = Number(inputValue);

              const value = inputValue === '' ? calculatedSizes.lyrics : inputNum;

              // 기본과 하이라이트 모두에 적용 (updateConfig 내부에서 storage 저장)
              updateConfig(['lyrics', 'default', 'fontSize'], value);
              updateConfig(['lyrics', 'highlight', 'fontSize'], value);
            }}
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
      {/* 하이라이트 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionHighlightStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsHighlightStyleDescription')}</p>

        {/* 텍스트 색상 효과 */}
        <div className={styles.subSection}>
          <h5 className={styles.subSectionTitle}>{t('extTextEffectsSubsectionTextColorEffect')}</h5>

          {/* 색상 모드 선택 */}
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>{t('extTextEffectsLabelColorMode')}</label>
            <select
              className={styles.selectInput}
              value={colorMode}
              onChange={(e) => handleColorModeChange(e.target.value as 'solid' | 'multi')}
            >
              <option value="solid">{t('extTextEffectsColorModeSolid')}</option>
              <option value="multi">{t('extTextEffectsColorModeGradient')}</option>
            </select>
          </div>

          {/* 단색 모드 */}
          {colorMode === 'solid' && (
            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsLabelHighlightColor')}</label>
              <ColorPickerInput
                value={config.lyrics?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
                onChange={(value) => updateConfig(['lyrics', 'highlight', 'color'], value)}
                // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
              />
            </div>
          )}

          {/* 다색 모드 */}
          {colorMode === 'multi' && (
            <>
              <div className={styles.settingRow}>
                <label className={styles.settingLabel}>{t('extPattern')}</label>
                <select className={styles.selectInput} value="linear" disabled>
                  <option value="linear">Linear Gradient</option>
                </select>
              </div>

              {/* 색상 1 */}
              <div className={styles.settingRow}>
                <label className={styles.settingLabel}>{t('extTextEffectsLabelColor1')}</label>
                <ColorPickerInput
                  value={config.lyrics?.highlight?.linearGradient?.color1 || '#357aff'}
                  onChange={(value) => {
                    updateGradientConfig('color1', value || '#357aff');
                    onPreviewUpdate();
                  }}
                  // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
                />
              </div>

              {/* 색상 2 */}
              <div className={styles.settingRow}>
                <label className={styles.settingLabel}>{t('extTextEffectsLabelColor2')}</label>
                <ColorPickerInput
                  value={config.lyrics?.highlight?.linearGradient?.color2 || '#e91e63'}
                  onChange={(value) => {
                    updateGradientConfig('color2', value || '#e91e63');
                    onPreviewUpdate();
                  }}
                  // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
                />
              </div>

              {/* 방향 선택 */}
              <div className={styles.settingRow}>
                <label className={styles.settingLabel}>{t('extTextEffectsDirectionLabel')}</label>
                <select
                  className={styles.selectInput}
                  value={config.lyrics?.highlight?.linearGradient?.direction || 'right'}
                  onChange={(e) => {
                    updateGradientConfig('direction', e.target.value as 'right' | 'left' | 'down' | 'up');
                    onPreviewUpdate();
                  }}
                >
                  <option value="right">{t('extTextEffectsDirectionRight')}</option>
                  <option value="left">{t('extTextEffectsDirectionLeft')}</option>
                  <option value="down">{t('extTextEffectsDirectionDown')}</option>
                  <option value="up">{t('extTextEffectsDirectionUp')}</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionPronunciationStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsPronunciationStyleDescription')}</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelTextColor')}</label>
          <ColorPickerInput
            value={config.pronunciation?.default?.color || DEFAULT_PRONUNCIATION_COLOR}
            onChange={(value) => updateConfig(['pronunciation', 'default', 'color'], value)}
            // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontFamily')}</label>
          <FontFamilySelect
            value={config.pronunciation?.default?.fontFamily}
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['pronunciation', 'default', 'fontFamily'], value);
              updateConfig(['pronunciation', 'highlight', 'fontFamily'], value);
            }}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontWeight')}</label>
          <FontWeightSelect
            value={
              typeof config.pronunciation?.default?.fontWeight === 'number'
                ? config.pronunciation.default.fontWeight
                : undefined
            }
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['pronunciation', 'default', 'fontWeight'], value);
              updateConfig(['pronunciation', 'highlight', 'fontWeight'], value);
            }}
            defaultValue={DEFAULT_PRONUNCIATION_FONT_WEIGHT}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontSize')}</label>
          <input
            type="number"
            className={styles.numberInput}
            value={
              config.pronunciation?.default?.fontSize !== undefined
                ? config.pronunciation.default.fontSize
                : calculatedSizes.pronunciation
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputNum = Number(inputValue);

              let value = inputValue === '' ? calculatedSizes.pronunciation : inputNum;

              // config가 undefined일 때 증감 버튼 처리
              if (config.pronunciation?.default?.fontSize === undefined) {
                const diff = inputNum - calculatedSizes.pronunciation;
                // 증감 버튼은 ±1씩 변경됨
                if (diff === 1 || diff === -1) {
                  // 첫 클릭: calculatedSize + diff를 적용
                  value = calculatedSizes.pronunciation + diff;
                }
              }

              // 기본과 하이라이트 모두에 적용 (updateConfig 내부에서 storage 저장)
              updateConfig(['pronunciation', 'default', 'fontSize'], value);
              updateConfig(['pronunciation', 'highlight', 'fontSize'], value);
            }}
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelHighlightDisplay')}</label>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={pronunciationHighlightEnabled}
            onChange={handlePronunciationHighlightToggle}
          />
        </div>
        <p className={styles.settingDescription}>{t('extTextEffectsPronunciationHighlightHint')}</p>
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
  t: (key: string) => string;
}
const FullSettingsPanel: React.FC<FullSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate, t }) => {
  // 현재 뷰포트 기준 계산된 폰트 크기
  const calculatedSizes = useMemo(() => calculateFullFontSizes(), []); // 모달 오픈 시 한 번만 계산

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

      // 즉시 storage에 저장 (실시간 미리보기)
      chrome.storage.sync.set({
        lyricsStyleFull: newConfig,
      });

      return newConfig;
    });
  };

  // Linear Gradient 업데이트 함수
  const updateGradientConfig = <K extends keyof LinearGradientOptions>(key: K, value: LinearGradientOptions[K]) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        lyrics: {
          ...prev.lyrics,
          highlight: {
            ...prev.lyrics?.highlight,
            linearGradient: {
              ...prev.lyrics?.highlight?.linearGradient,
              enabled: prev.lyrics?.highlight?.linearGradient?.enabled ?? false,
              color1: prev.lyrics?.highlight?.linearGradient?.color1 || '#357aff',
              color2: prev.lyrics?.highlight?.linearGradient?.color2 || '#e91e63',
              direction: prev.lyrics?.highlight?.linearGradient?.direction || 'right',
              [key]: value,
            },
          },
        },
      };
      chrome.storage.sync.set({ lyricsStyleFull: newConfig });
      return newConfig;
    });
  };

  // 색상 모드 (단색 / 다색)
  const colorMode = config.lyrics?.highlight?.linearGradient?.enabled ? 'multi' : 'single';

  const handleColorModeChange = (mode: 'single' | 'multi') => {
    if (mode === 'single') {
      // 단색 모드: gradient 비활성화
      updateGradientConfig('enabled', false);
    } else {
      // 다색 모드: gradient 활성화
      updateGradientConfig('enabled', true);
    }
  };
  // 발음 하이라이트 토글 상태
  const [pronunciationHighlightEnabled, setPronunciationHighlightEnabled] = useState(
    config.pronunciationAsMainHighlight ?? false,
  );

  // config 변경 시 체크박스 상태 동기화 (초기화 버튼 대응)
  useEffect(() => {
    setPronunciationHighlightEnabled(config.pronunciationAsMainHighlight ?? false);
  }, [config.pronunciationAsMainHighlight]);

  const handlePronunciationHighlightToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPronunciationHighlightEnabled(enabled);
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        pronunciationAsMainHighlight: enabled,
      };
      // 즉시 storage에 저장
      chrome.storage.sync.set({
        lyricsStyleFull: newConfig,
      });
      return newConfig;
    });
  };
  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>{t('extTextEffectsFullDescription')}</p>
      {/* 기본 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionDefaultStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsFullDefaultStyleDescription')}</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelTextColor')}</label>
          <ColorPickerInput
            value={config.lyrics?.default?.color || DEFAULT_LYRICS_COLOR}
            onChange={(value) => updateConfig(['lyrics', 'default', 'color'], value)}
            // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontFamily')}</label>
          <FontFamilySelect
            value={config.lyrics?.default?.fontFamily}
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['lyrics', 'default', 'fontFamily'], value);
              updateConfig(['lyrics', 'highlight', 'fontFamily'], value);
            }}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontWeight')}</label>
          <FontWeightSelect
            value={
              typeof config.lyrics?.default?.fontWeight === 'number' ? config.lyrics.default.fontWeight : undefined
            }
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['lyrics', 'default', 'fontWeight'], value);
              updateConfig(['lyrics', 'highlight', 'fontWeight'], value);
            }}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontSize')}</label>
          <input
            type="number"
            className={styles.numberInput}
            value={
              config.lyrics?.default?.fontSize !== undefined
                ? config.lyrics.default.fontSize
                : calculatedSizes.lyricsDefault
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputNum = Number(inputValue);

              let value = inputValue === '' ? calculatedSizes.lyricsDefault : inputNum;

              // config가 undefined일 때 증감 버튼 처리
              if (config.lyrics?.default?.fontSize === undefined) {
                const diff = inputNum - calculatedSizes.lyricsDefault;
                // 증감 버튼은 ±1씩 변경됨
                if (diff === 1 || diff === -1) {
                  // 첫 클릭: calculatedSize + diff를 적용
                  value = calculatedSizes.lyricsDefault + diff;
                }
              }

              // 기본과 하이라이트 모두에 적용 (updateConfig 내부에서 storage 저장)
              updateConfig(['lyrics', 'default', 'fontSize'], value);
              updateConfig(['lyrics', 'highlight', 'fontSize'], value);
            }}
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
      {/* 하이라이트 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionHighlightStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsFullHighlightStyleDescription')}</p>

        {/* 색상 모드 선택 */}
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsColorModeLabel')}</label>
          <select
            className={styles.selectInput}
            value={colorMode}
            onChange={(e) => handleColorModeChange(e.target.value as 'single' | 'multi')}
          >
            <option value="single">{t('extTextEffectsColorModeSolid')}</option>
            <option value="multi">{t('extTextEffectsColorModeGradient')}</option>
          </select>
        </div>

        {/* 단색 모드: 하나의 색상 선택 */}
        {colorMode === 'single' && (
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>{t('extTextEffectsHighlightColorLabel')}</label>
            <ColorPickerInput
              value={config.lyrics?.highlight?.color || DEFAULT_HIGHLIGHT_COLOR}
              onChange={(value) => updateConfig(['lyrics', 'highlight', 'color'], value)}
              // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
            />
          </div>
        )}

        {/* 다색 모드: 그라데이션 설정 */}
        {colorMode === 'multi' && (
          <>
            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsColor1Label')}</label>
              <ColorPickerInput
                value={config.lyrics?.highlight?.linearGradient?.color1 || '#357aff'}
                onChange={(value) => {
                  updateGradientConfig('color1', value || '#357aff');
                  onPreviewUpdate();
                }}
                // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
              />
            </div>

            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsColor2Label')}</label>
              <ColorPickerInput
                value={config.lyrics?.highlight?.linearGradient?.color2 || '#e91e63'}
                onChange={(value) => {
                  updateGradientConfig('color2', value || '#e91e63');
                  onPreviewUpdate();
                }}
                // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
              />
            </div>

            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsDirectionLabel')}</label>
              <select
                className={styles.selectInput}
                value={config.lyrics?.highlight?.linearGradient?.direction || 'right'}
                onChange={(e) => {
                  updateGradientConfig('direction', e.target.value as 'right' | 'left' | 'down' | 'up');
                  onPreviewUpdate();
                }}
              >
                <option value="right">{t('extTextEffectsDirectionRight')}</option>
                <option value="left">{t('extTextEffectsDirectionLeft')}</option>
                <option value="down">{t('extTextEffectsDirectionDown')}</option>
                <option value="up">{t('extTextEffectsDirectionUp')}</option>
              </select>
            </div>
          </>
        )}
      </div>
      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionPronunciationStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsPronunciationStyleDescription')}</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelTextColor')}</label>
          <ColorPickerInput
            value={config.pronunciation?.default?.color || DEFAULT_PRONUNCIATION_COLOR}
            onChange={(value) => updateConfig(['pronunciation', 'default', 'color'], value)}
            // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontFamily')}</label>
          <FontFamilySelect
            value={config.pronunciation?.default?.fontFamily}
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['pronunciation', 'default', 'fontFamily'], value);
              updateConfig(['pronunciation', 'highlight', 'fontFamily'], value);
            }}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontWeight')}</label>
          <FontWeightSelect
            value={
              typeof config.pronunciation?.default?.fontWeight === 'number'
                ? config.pronunciation.default.fontWeight
                : undefined
            }
            onChange={(value) => {
              // 기본과 하이라이트 모두에 적용
              updateConfig(['pronunciation', 'default', 'fontWeight'], value);
              updateConfig(['pronunciation', 'highlight', 'fontWeight'], value);
            }}
            defaultValue={DEFAULT_PRONUNCIATION_FONT_WEIGHT}
          />
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontSize')}</label>
          <input
            type="number"
            className={styles.numberInput}
            value={
              config.pronunciation?.default?.fontSize !== undefined
                ? config.pronunciation.default.fontSize
                : calculatedSizes.pronunciationDefault
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputNum = Number(inputValue);

              let value = inputValue === '' ? calculatedSizes.pronunciationDefault : inputNum;

              // config가 undefined일 때 증감 버튼 처리
              if (config.pronunciation?.default?.fontSize === undefined) {
                const diff = inputNum - calculatedSizes.pronunciationDefault;
                // 증감 버튼은 ±1씩 변경됨
                if (diff === 1 || diff === -1) {
                  // 첫 클릭: calculatedSize + diff를 적용
                  value = calculatedSizes.pronunciationDefault + diff;
                }
              }

              // 기본과 하이라이트 모두에 적용 (updateConfig 내부에서 storage 저장)
              updateConfig(['pronunciation', 'default', 'fontSize'], value);
              updateConfig(['pronunciation', 'highlight', 'fontSize'], value);
            }}
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelHighlightDisplay')}</label>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={pronunciationHighlightEnabled}
            onChange={handlePronunciationHighlightToggle}
          />
        </div>
        <p className={styles.settingDescription}>{t('extTextEffectsPronunciationHighlightHint')}</p>
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
  t: (key: string) => string;
}
const SingleSettingsPanel: React.FC<SingleSettingsPanelProps> = ({ config, setConfig, onPreviewUpdate, t }) => {
  // 현재 뷰포트 기준 계산된 폰트 크기
  const calculatedSizes = useMemo(() => calculateSingleFontSizes(), []); // 모달 오픈 시 한 번만 계산

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

      // 즉시 storage에 저장 (실시간 미리보기)
      chrome.storage.sync.set({
        lyricsStyleSingle: newConfig,
      });

      return newConfig;
    });
  };

  // Linear Gradient 업데이트 함수
  const updateGradientConfig = <K extends keyof LinearGradientOptions>(key: K, value: LinearGradientOptions[K]) => {
    setConfig((prev) => {
      const newConfig = {
        ...prev,
        lyrics: {
          ...prev.lyrics,
          linearGradient: {
            ...prev.lyrics?.linearGradient,
            enabled: prev.lyrics?.linearGradient?.enabled ?? false,
            color1: prev.lyrics?.linearGradient?.color1 || '#357aff',
            color2: prev.lyrics?.linearGradient?.color2 || '#e91e63',
            direction: prev.lyrics?.linearGradient?.direction || 'right',
            [key]: value,
          },
        },
      };
      chrome.storage.sync.set({ lyricsStyleSingle: newConfig });
      return newConfig;
    });
  };

  // 색상 모드 (단색 / 다색)
  const colorMode = config.lyrics?.linearGradient?.enabled ? 'multi' : 'single';

  const handleColorModeChange = (mode: 'single' | 'multi') => {
    if (mode === 'single') {
      // 단색 모드: gradient 비활성화
      updateGradientConfig('enabled', false);
    } else {
      // 다색 모드: gradient 활성화
      updateGradientConfig('enabled', true);
    }
  };
  return (
    <div className={styles.settingsPanel}>
      <p className={styles.panelDescription}>{t('extTextEffectsSingleDescription')}</p>
      {/* 가사 스타일 섹션 (기본/하이라이트 구분 없음) */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionLyricsStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsLyricsStyleDescription')}</p>

        {/* 색상 모드 선택 */}
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsColorModeLabel')}</label>
          <select
            className={styles.selectInput}
            value={colorMode}
            onChange={(e) => handleColorModeChange(e.target.value as 'single' | 'multi')}
          >
            <option value="single">{t('extTextEffectsColorModeSolid')}</option>
            <option value="multi">{t('extTextEffectsColorModeGradient')}</option>
          </select>
        </div>

        {/* 단색 모드: 하나의 색상 선택 */}
        {colorMode === 'single' && (
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>{t('extTextEffectsLabelTextColor')}</label>
            <ColorPickerInput
              value={config.lyrics?.color || DEFAULT_LYRICS_COLOR}
              onChange={(value) => updateConfig(['lyrics', 'color'], value)}
              // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
            />
          </div>
        )}

        {/* 다색 모드: 그라데이션 설정 */}
        {colorMode === 'multi' && (
          <>
            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsColor1Label')}</label>
              <ColorPickerInput
                value={config.lyrics?.linearGradient?.color1 || '#357aff'}
                onChange={(value) => {
                  updateGradientConfig('color1', value || '#357aff');
                  onPreviewUpdate();
                }}
                // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
              />
            </div>

            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsColor2Label')}</label>
              <ColorPickerInput
                value={config.lyrics?.linearGradient?.color2 || '#e91e63'}
                onChange={(value) => {
                  updateGradientConfig('color2', value || '#e91e63');
                  onPreviewUpdate();
                }}
                // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
              />
            </div>

            <div className={styles.settingRow}>
              <label className={styles.settingLabel}>{t('extTextEffectsDirectionLabel')}</label>
              <select
                className={styles.selectInput}
                value={config.lyrics?.linearGradient?.direction || 'right'}
                onChange={(e) => {
                  updateGradientConfig('direction', e.target.value as 'right' | 'left' | 'down' | 'up');
                  onPreviewUpdate();
                }}
              >
                <option value="right">{t('extTextEffectsDirectionRight')}</option>
                <option value="left">{t('extTextEffectsDirectionLeft')}</option>
                <option value="down">{t('extTextEffectsDirectionDown')}</option>
                <option value="up">{t('extTextEffectsDirectionUp')}</option>
              </select>
            </div>
          </>
        )}

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontFamily')}</label>
          <FontFamilySelect
            value={config.lyrics?.fontFamily}
            onChange={(value) => updateConfig(['lyrics', 'fontFamily'], value)}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontWeight')}</label>
          <FontWeightSelect
            value={typeof config.lyrics?.fontWeight === 'number' ? config.lyrics.fontWeight : undefined}
            onChange={(value) => updateConfig(['lyrics', 'fontWeight'], value)}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontSize')}</label>
          <input
            type="number"
            className={styles.numberInput}
            value={config.lyrics?.fontSize !== undefined ? config.lyrics.fontSize : calculatedSizes.lyrics}
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputNum = Number(inputValue);

              let value = inputValue === '' ? calculatedSizes.lyrics : inputNum;

              // config가 undefined일 때 증감 버튼 처리
              if (config.lyrics?.fontSize === undefined) {
                const diff = inputNum - calculatedSizes.lyrics;
                // 증감 버튼은 ±1씩 변경됨
                if (diff === 1 || diff === -1) {
                  // 첫 클릭: calculatedSize + diff를 적용
                  value = calculatedSizes.lyrics + diff;
                }
              }

              // updateConfig 내부에서 storage 저장
              updateConfig(['lyrics', 'fontSize'], value);
            }}
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
      {/* 발음 스타일 섹션 */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('extTextEffectsSectionPronunciationStyle')}</h4>
        <p className={styles.sectionDescription}>{t('extTextEffectsSinglePronunciationStyleDescription')}</p>
        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelTextColor')}</label>
          <ColorPickerInput
            value={config.pronunciation?.color || DEFAULT_LYRICS_COLOR}
            onChange={(value) => updateConfig(['pronunciation', 'color'], value)}
            // onPreviewUpdate 제거 (ColorPickerInput의 onChange에서 이미 storage 저장)
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontFamily')}</label>
          <FontFamilySelect
            value={config.pronunciation?.fontFamily}
            onChange={(value) => updateConfig(['pronunciation', 'fontFamily'], value)}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontWeight')}</label>
          <FontWeightSelect
            value={typeof config.pronunciation?.fontWeight === 'number' ? config.pronunciation.fontWeight : undefined}
            onChange={(value) => updateConfig(['pronunciation', 'fontWeight'], value)}
            defaultValue={DEFAULT_PRONUNCIATION_FONT_WEIGHT}
          />
        </div>

        <div className={styles.settingRow}>
          <label className={styles.settingLabel}>{t('extTextEffectsLabelFontSize')}</label>
          <input
            type="number"
            className={styles.numberInput}
            value={
              config.pronunciation?.fontSize !== undefined
                ? config.pronunciation.fontSize
                : calculatedSizes.pronunciation
            }
            onChange={(e) => {
              const inputValue = e.target.value;
              const inputNum = Number(inputValue);

              let value = inputValue === '' ? calculatedSizes.pronunciation : inputNum;

              // config가 undefined일 때 증감 버튼 처리
              if (config.pronunciation?.fontSize === undefined) {
                const diff = inputNum - calculatedSizes.pronunciation;
                // 증감 버튼은 ±1씩 변경됨
                if (diff === 1 || diff === -1) {
                  // 첫 클릭: calculatedSize + diff를 적용
                  value = calculatedSizes.pronunciation + diff;
                }
              }

              // updateConfig 내부에서 storage 저장
              updateConfig(['pronunciation', 'fontSize'], value);
            }}
            min={10}
            max={48}
          />
          <span className={styles.unit}>px</span>
        </div>
      </div>
    </div>
  );
};
