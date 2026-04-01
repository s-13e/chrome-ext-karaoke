// ModeOnboarding.tsx
// 첫 팝업 진입 시 사용 유형 선택 온보딩
// Step 0: 유형 선택 → Step 1: 프리뷰 + 옵션(표시방식 → 색상/로마자) → Step 2: 완료
// 내부 로직(storage 저장)은 미구현 — UI 프리뷰 전용

import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

type UserMode = 'simple' | 'karaoke' | null;
type LyricsDisplayMode = 'dual' | 'single' | 'full';
type LyricsColor = '#357aff' | '#ffffff' | '#facc15' | '#00d4aa' | '#ff6b6b';

// 옵션 패널 내부 탭: 표시방식 → 색상/로마자
type OptionTab = 'display' | 'style';

interface ModeOnboardingProps {
  onComplete: () => void;
}

export function ModeOnboarding({ onComplete }: ModeOnboardingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [displayMode, setDisplayMode] = useState<LyricsDisplayMode>('dual');
  const [lyricsColor, setLyricsColor] = useState<LyricsColor>('#357aff');
  const [romanization, setRomanization] = useState(true);
  const [optionTab, setOptionTab] = useState<OptionTab>('display');

  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
    setStep(1);
    setOptionTab('display');
  };

  const handleComplete = async () => {
    // 온보딩의 displayMode → storage의 lyricsMode 매핑
    const lyricsModeMap: Record<LyricsDisplayMode, string> = {
      single: 'single',
      dual: 'sync',
      full: 'full',
    };

    // 기본 설정 저장
    const storageData: Record<string, unknown> = {
      lyricsMode: lyricsModeMap[displayMode],
      announceLyrics: romanization,
      hasCompletedModeOnboarding: true,
      userMode: userMode,
    };

    // dual/full일 때 하이라이트 색상 저장
    if (displayMode !== 'single') {
      const highlightStyle = { color: lyricsColor, fontWeight: 700 };

      if (displayMode === 'dual') {
        storageData.lyricsStyleDual = {
          lyrics: { highlight: highlightStyle },
        };
      }
      if (displayMode === 'full') {
        storageData.lyricsStyleFull = {
          lyrics: { highlight: highlightStyle },
        };
      }
      // 둘 다 저장 — 나중에 모드 전환해도 색상 유지
      storageData.lyricsStyleDual = { lyrics: { highlight: highlightStyle } };
      storageData.lyricsStyleFull = { lyrics: { highlight: highlightStyle } };
    }

    await chrome.storage.sync.set(storageData);
    console.log('[ModeOnboarding] 설정 저장 완료:', storageData);
    onComplete();
  };

  const handleOptionNext = () => {
    if (optionTab === 'display') {
      setOptionTab('style');
    } else {
      setStep(2);
    }
  };

  const handleOptionBack = () => {
    if (optionTab === 'style') {
      setOptionTab('display');
    } else {
      setStep(0);
    }
  };

  // single은 하이라이트 색상 선택 불필요
  const showColorPicker = optionTab === 'style' && displayMode !== 'single';

  // 프리뷰에서 하이라이트에 적용할 색상
  const highlightColor = displayMode === 'single' ? '#ffffff' : lyricsColor;

  return (
    <div style={styles.container}>
      {/* Step 0: 유형 선택 */}
      {step === 0 && (
        <div style={styles.centeredStep}>
          <div style={styles.stepInner}>
            <h2 style={styles.title}>{t('extModeOnboardingTitle')}</h2>
            <p style={styles.subtitle}>{t('extModeOnboardingSubtitle')}</p>

            <div style={styles.modeCards}>
              <button
                type="button"
                style={styles.modeCard}
                onClick={() => handleModeSelect('simple')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                }}
              >
                <span style={styles.modeIcon}>📝</span>
                <span style={styles.modeName}>{t('extModeOnboardingSimple')}</span>
                <span style={styles.modeDesc}>{t('extModeOnboardingSimpleDesc')}</span>
              </button>

              <button
                type="button"
                style={styles.modeCard}
                onClick={() => handleModeSelect('karaoke')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.5)';
                  e.currentTarget.style.background = 'rgba(0, 212, 170, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                }}
              >
                <span style={styles.modeIcon}>🎤</span>
                <span style={styles.modeName}>{t('extModeOnboardingKaraoke')}</span>
                <span style={styles.modeDesc}>{t('extModeOnboardingKaraokeDesc')}</span>
              </button>
            </div>

            <p style={styles.hint}>{t('extModeOnboardingHint')}</p>
          </div>
        </div>
      )}

      {/* Step 1: 프리뷰 + 옵션 패널 (탭 전환) */}
      {step === 1 && (
        <div style={styles.stepContainer}>
          <h2 style={{ ...styles.title, marginBottom: '8px' }}>{t('extModeOnboardingDisplayTitle')}</h2>

          {/* 프리뷰 — 항상 표시 */}
          <div
            style={{
              ...styles.previewBox,
              alignItems: displayMode === 'full' ? 'center' : 'flex-end',
            }}
          >
            <div
              style={{
                ...styles.previewContent,
                gap: displayMode === 'full' && !romanization ? '6px' : '4px',
              }}
            >
              {displayMode === 'single' && (
                <>
                  <span style={styles.previewLine}>絶えず関わってく</span>
                  {romanization && <span style={styles.previewRoman}>taezu kakawatteku</span>}
                </>
              )}
              {displayMode === 'dual' && (
                <>
                  <span style={{ ...styles.previewLine, color: highlightColor, fontWeight: 600 }}>
                    絶えず関わってく
                  </span>
                  {romanization && <span style={styles.previewRoman}>taezu kakawatteku</span>}
                  <span style={styles.previewLine}>何処にだっていける</span>
                  {romanization && <span style={styles.previewRoman}>doko ni datte ikeru</span>}
                </>
              )}
              {displayMode === 'full' && !romanization && (
                <>
                  <span style={styles.previewLine}>忘れないように</span>
                  <span style={styles.previewLine}>色褪せないように</span>
                  <span style={styles.previewLine}>形に残るように</span>
                  <span style={{ ...styles.previewLine, color: highlightColor, fontWeight: 600 }}>
                    絶えず関わってく
                  </span>
                  <span style={styles.previewLine}>何処にだっていける</span>
                  <span style={styles.previewLine}>君と夏の終わり</span>
                  <span style={styles.previewLine}>将来の夢大きな希望</span>
                  <span style={styles.previewLine}>忘れない十年後の八月</span>
                </>
              )}
              {displayMode === 'full' && romanization && (
                <>
                  <span style={styles.previewLine}>忘れないように</span>
                  <span style={styles.previewRoman}>wasurenai you ni</span>
                  <span style={styles.previewLine}>色褪せないように</span>
                  <span style={styles.previewRoman}>iroasenai you ni</span>
                  <span style={{ ...styles.previewLine, color: highlightColor, fontWeight: 600 }}>
                    絶えず関わってく
                  </span>
                  <span style={styles.previewRoman}>taezu kakawatteku</span>
                  <span style={styles.previewLine}>何処にだっていける</span>
                  <span style={styles.previewRoman}>doko ni datte ikeru</span>
                  <span style={styles.previewLine}>君と夏の終わり</span>
                  <span style={styles.previewRoman}>kimi to natsu no owari</span>
                </>
              )}
            </div>
          </div>

          {/* 옵션 패널 — 탭에 따라 전환 */}
          <div style={styles.optionPanel}>
            {optionTab === 'display' && (
              <div style={styles.displayBtnRow}>
                {(
                  [
                    { value: 'single', label: t('extModeOnboardingDisplaySingle') },
                    { value: 'dual', label: t('extModeOnboardingDisplayDual') },
                    { value: 'full', label: t('extModeOnboardingDisplayFull') },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.displayBtn,
                      ...(displayMode === option.value ? styles.displayBtnSelected : {}),
                    }}
                    onClick={() => setDisplayMode(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {optionTab === 'style' && (
              <div style={styles.stylePanel}>
                {/* 하이라이트 글자 색상 (single 제외) */}
                {showColorPicker && (
                  <>
                    <span style={styles.sectionLabel}>{t('extModeOnboardingColorLabel')}</span>
                    <div style={styles.colorRow}>
                      {[
                        { value: '#357aff' as const, label: t('extModeOnboardingColorBlue') },
                        { value: '#ffffff' as const, label: t('extModeOnboardingColorWhite') },
                        { value: '#facc15' as const, label: t('extModeOnboardingColorYellow') },
                        { value: '#00d4aa' as const, label: t('extModeOnboardingColorTeal') },
                        { value: '#ff6b6b' as const, label: t('extModeOnboardingColorRed') },
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          style={{
                            ...styles.colorDotBtn,
                            borderColor: lyricsColor === color.value ? color.value : 'rgba(0,0,0,0.1)',
                            background: lyricsColor === color.value ? `${color.value}20` : 'transparent',
                          }}
                          onClick={() => setLyricsColor(color.value)}
                          title={color.label}
                        >
                          <span
                            style={{
                              ...styles.colorDot,
                              background: color.value,
                              border: color.value === '#ffffff' ? '1px solid rgba(0,0,0,0.2)' : 'none',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* 로마자 토글 */}
                <div style={styles.toggleRow}>
                  <div>
                    <span style={styles.sectionLabel}>{t('extModeOnboardingRomanLabel')}</span>
                    <span style={styles.toggleDesc}>{t('extModeOnboardingRomanDesc')}</span>
                  </div>
                  <button
                    type="button"
                    style={{
                      ...styles.toggle,
                      background: romanization ? '#00d4aa' : 'rgba(0,0,0,0.2)',
                    }}
                    onClick={() => setRomanization(!romanization)}
                  >
                    <span
                      style={{
                        ...styles.toggleKnob,
                        transform: romanization ? 'translateX(18px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.navRow}>
            <button type="button" style={styles.backBtn} onClick={handleOptionBack}>
              {t('extWelcomeBack')}
            </button>
            <button type="button" style={styles.nextBtn} onClick={handleOptionNext}>
              {t('extWelcomeNext')}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 완료 */}
      {step === 2 && (
        <div style={styles.centeredStep}>
          <div style={styles.stepInner}>
            <div style={styles.doneIcon}>🎉</div>
            <h2 style={styles.title}>{t('extModeOnboardingDoneTitle')}</h2>
            <p style={styles.subtitle}>{t('extModeOnboardingDoneDesc')}</p>

            {userMode === 'simple' && (
              <div style={styles.tipBox}>
                <span>💡</span>
                <span style={styles.tipText}>{t('extModeOnboardingSimpleTip')}</span>
              </div>
            )}

            <button type="button" style={styles.startBtn} onClick={handleComplete}>
              {t('extModeOnboardingStart')}
            </button>

            <button
              type="button"
              style={styles.backLink}
              onClick={() => {
                setStep(1);
                setOptionTab('style');
              }}
            >
              {t('extWelcomeBack')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    padding: '16px',
    color: '#1a1a1a',
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  centeredStep: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  stepInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },
  stepContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  title: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '12px',
    color: 'rgba(0,0,0,0.45)',
    margin: 0,
    textAlign: 'center',
    lineHeight: '1.5',
  },
  modeCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '4px',
  },
  modeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '16px',
    background: 'rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  modeIcon: {
    fontSize: '24px',
  },
  modeName: {
    fontSize: '14px',
    fontWeight: 600,
  },
  modeDesc: {
    fontSize: '11px',
    color: 'rgba(0,0,0,0.45)',
    lineHeight: '1.4',
  },
  hint: {
    fontSize: '11px',
    color: 'rgba(0,0,0,0.35)',
    textAlign: 'center',
    margin: 0,
  },
  // 프리뷰
  previewBox: {
    display: 'flex',
    justifyContent: 'center',
    background: '#1a1a1a',
    borderRadius: '8px',
    width: '100%',
    height: '180px',
    flexShrink: 0,
    overflow: 'hidden',
    padding: '12px 0',
  },
  previewContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    width: '100%',
  },
  previewLine: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
  },
  previewRoman: {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.35)',
    lineHeight: '1.4',
    marginBottom: '2px',
  },
  // 옵션 패널 (프리뷰 아래)
  optionPanel: {
    flexShrink: 0,
  },
  stylePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  displayBtnRow: {
    display: 'flex',
    gap: '6px',
  },
  displayBtn: {
    flex: 1,
    padding: '10px 4px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.12)',
    background: 'transparent',
    color: 'rgba(0,0,0,0.5)',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
  displayBtnSelected: {
    borderColor: '#00d4aa',
    background: 'rgba(0, 212, 170, 0.06)',
    color: '#00a080',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  colorRow: {
    display: 'flex',
    gap: '6px',
  },
  colorDotBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid rgba(0,0,0,0.1)',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
  },
  colorDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  toggleDesc: {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(0,0,0,0.4)',
    marginTop: '2px',
  },
  toggle: {
    width: '38px',
    height: '20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
    flexShrink: 0,
    padding: 0,
  },
  toggleKnob: {
    display: 'block',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.2s',
    position: 'absolute',
    top: '2px',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    flexShrink: 0,
    marginTop: 'auto',
    paddingBottom: '4px',
  },
  backBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'transparent',
    color: 'rgba(0,0,0,0.5)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  nextBtn: {
    padding: '8px 24px',
    borderRadius: '6px',
    border: 'none',
    background: '#00d4aa',
    color: '#0f0f0f',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  doneIcon: {
    fontSize: '36px',
    textAlign: 'center',
  },
  tipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    background: 'rgba(0, 212, 170, 0.06)',
    border: '1px solid rgba(0, 212, 170, 0.2)',
    borderRadius: '8px',
    fontSize: '11px',
  },
  tipText: {
    color: 'rgba(0,0,0,0.55)',
    lineHeight: '1.5',
  },
  startBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: '#00d4aa',
    color: '#0f0f0f',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: 'rgba(0,0,0,0.35)',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '4px',
  },
};
