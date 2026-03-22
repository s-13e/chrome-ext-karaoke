// HowItWorksSlide.tsx
// Slide 2: 사용 방법 — 팝업 ON → 심플 모드 vs 가라오케 모드 안내

import React from 'react';
import { useTranslation } from 'react-i18next';

interface HowItWorksSlideProps {
  onNext: () => void;
  onBack: () => void;
}

export const HowItWorksSlide: React.FC<HowItWorksSlideProps> = ({ onNext, onBack }) => {
  const { t } = useTranslation();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t('extWelcomeHowTitle')}</h2>

      {/* Step A: 확장 고정하기 — 큰 카드 */}
      <div style={styles.step1Card}>
        <div style={styles.step1Header}>
          <div style={styles.stepBadge}>1</div>
          <div>
            <h3 style={styles.stepTitle}>{t('extWelcomeHowStep1Title')}</h3>
            <p style={styles.stepDesc}>{t('extWelcomeHowStep1Desc')}</p>
          </div>
        </div>

        {/* 고정 가이드 이미지 3장 — 큰 사이즈 */}
        <div style={styles.step1ImageRow}>
          {[
            { file: 'welcome-step1-pin1.png', captionKey: 'extWelcomeImgPin1' },
            { file: 'welcome-step1-pin2.png', captionKey: 'extWelcomeImgPin2' },
            { file: 'welcome-step1-pin3.png', captionKey: 'extWelcomeImgPin3' },
          ].map((img, i) => (
            <React.Fragment key={img.file}>
              {i > 0 && <span style={styles.step1Arrow}>→</span>}
              <div style={styles.step1ImageStep}>
                <img
                  src={chrome.runtime.getURL(`assets/images/${img.file}`)}
                  alt={t(img.captionKey)}
                  style={styles.step1Image}
                />
                <span style={styles.step1Caption}>{t(img.captionKey)}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step B: 팝업에서 ON */}
      <div style={styles.stepCard}>
        <div style={styles.stepBadge}>2</div>
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>{t('extWelcomeHowStep2aTitle')}</h3>

          {/* 팝업 가이드 이미지 2장 */}
          <div style={styles.imageRow}>
            {[
              { file: 'welcome-step1-popup.png', captionKey: 'extWelcomeImgPopup1' },
              { file: 'welcome-step1-popup2.png', captionKey: 'extWelcomeImgPopup2' },
            ].map((img, i) => (
              <React.Fragment key={img.file}>
                {i > 0 && <span style={styles.imageArrow}>→</span>}
                <div style={styles.imageStep}>
                  <img
                    src={chrome.runtime.getURL(`assets/images/${img.file}`)}
                    alt={t(img.captionKey)}
                    style={styles.stepImage}
                  />
                  <span style={styles.imageCaption}>{t(img.captionKey)}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Step C: 두 가지 모드 */}
      <div style={styles.stepCard}>
        <div style={styles.stepBadge}>3</div>
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>{t('extWelcomeHowStep2Title')}</h3>

          {/* 심플 모드 */}
          <div style={styles.modeCard}>
            <div style={styles.modeHeader}>
              <span style={styles.modeIcon}>📝</span>
              <span style={styles.modeName}>{t('extWelcomeSimpleMode')}</span>
              <span style={styles.modeDefault}>{t('extWelcomeDefault')}</span>
            </div>
            <p style={styles.modeDesc}>{t('extWelcomeSimpleModeDesc')}</p>
            <div style={styles.featureChips}>
              <span style={styles.chipDefault}>{t('extWelcomeChipSyncLyrics')}</span>
            </div>
          </div>

          {/* 가라오케 모드 */}
          <div style={{ ...styles.modeCard, ...styles.modeCardHighlight }}>
            <div style={styles.modeHeader}>
              <span style={styles.modeIcon}>🎤</span>
              <span style={styles.modeName}>{t('extWelcomeKaraokeMode')}</span>
            </div>
            <p style={styles.modeDesc}>{t('extWelcomeKaraokeModeDesc')}</p>
            <div style={styles.featureChips}>
              {['extWelcomeChipSync', 'extWelcomeChipLoop', 'extWelcomeChipCustom', 'extWelcomeChipSidebar'].map(
                (key) => (
                  <span key={key} style={styles.chip}>
                    {t(key)}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step C: 음표 버튼 안내 */}
      <div style={styles.tipBox}>
        <span style={styles.tipIcon}>💡</span>
        <p style={styles.tipText}>{t('extWelcomeHowTip')}</p>
      </div>

      <div style={styles.navRow}>
        <button type="button" onClick={onBack} style={styles.backBtn}>
          {t('extWelcomeBack')}
        </button>
        <button type="button" onClick={onNext} style={styles.nextBtn}>
          {t('extWelcomeNext')}
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '32px 24px',
    maxWidth: '680px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    textAlign: 'center',
    marginBottom: '4px',
  },
  step1Card: {
    padding: '20px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  step1Header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  step1ImageRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  step1ImageStep: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  step1Image: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  step1Caption: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    fontWeight: 500,
  },
  step1Arrow: {
    display: 'none',
  },
  stepCard: {
    display: 'flex',
    gap: '14px',
    padding: '16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  stepBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#00d4aa',
    color: '#0f0f0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  stepTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  stepDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    lineHeight: '1.5',
  },
  modeCard: {
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  modeCardHighlight: {
    border: '1px solid rgba(0, 212, 170, 0.25)',
    background: 'rgba(0, 212, 170, 0.04)',
  },
  modeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  modeIcon: {
    fontSize: '16px',
  },
  modeName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
  },
  modeDefault: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    padding: '2px 6px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '4px',
  },
  modeDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
    lineHeight: '1.5',
  },
  featureChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
  },
  chip: {
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '10px',
    background: 'rgba(0, 212, 170, 0.1)',
    color: '#00d4aa',
    whiteSpace: 'nowrap',
  },
  chipDefault: {
    fontSize: '11px',
    padding: '3px 8px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.06)',
    color: 'rgba(255,255,255,0.5)',
    whiteSpace: 'nowrap',
  },
  imageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    justifyContent: 'center',
  },
  imageStep: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
    flex: 1,
  },
  stepImage: {
    width: '100%',
    maxWidth: '200px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  imageCaption: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center' as const,
  },
  imageArrow: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.25)',
    flexShrink: 0,
  },
  tipBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    background: 'rgba(0, 212, 170, 0.06)',
    border: '1px solid rgba(0, 212, 170, 0.15)',
    borderRadius: '10px',
  },
  tipIcon: {
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '1px',
  },
  tipText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    margin: 0,
    lineHeight: '1.5',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  backBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  nextBtn: {
    padding: '10px 36px',
    borderRadius: '8px',
    border: 'none',
    background: '#00d4aa',
    color: '#0f0f0f',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
};
