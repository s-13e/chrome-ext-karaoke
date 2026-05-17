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

      {/* Step B (NEW): 팝업 첫 화면 = 모드 온보딩 — 사용자가 popup 첫 진입에서 보는 화면 안내 */}
      <div style={styles.stepCard}>
        <div style={styles.stepBadge}>2</div>
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>{t('extWelcomeHowStepOnboardingTitle')}</h3>
          <p style={styles.stepDesc}>{t('extWelcomeHowStepOnboardingDesc')}</p>
        </div>
      </div>

      {/* Step C: 팝업에서 ON (기존 step2 → step3) */}
      <div style={styles.stepCard}>
        <div style={styles.stepBadge}>3</div>
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>{t('extWelcomeHowStep2aTitle')}</h3>

          {/* 팝업 가이드 이미지 2장 */}
          <div style={styles.imageRow}>
            {[
              { file: 'welcome-step2-popup1.png', captionKey: 'extWelcomeImgPopup1' },
              { file: 'welcome-step2-popup2.png', captionKey: 'extWelcomeImgPopup2' },
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

      {/* Step D (NEW): 가사 신뢰성 회복 — 가사 위 microFeedback 👎로 잘못된/싱크 안 맞는 가사 숨김.
          노래방 모드 무관 작동이라 노래방 모드 안내(step5)보다 앞에 위치. churn 막는 핵심 정보. */}
      <div style={styles.stepCard}>
        <div style={styles.stepBadge}>4</div>
        <div style={styles.stepContent}>
          <h3 style={styles.stepTitle}>{t('extWelcomeHowStep4LyricsRecoveryTitle')}</h3>
          <p style={styles.stepDesc}>{t('extWelcomeHowStep4LyricsRecoveryDesc')}</p>
        </div>
      </div>

      {/* Step E: 영상에서 노래방 모드 켜기 (기존 step4 → step5) */}
      <div style={styles.step1Card}>
        <div style={styles.step1Header}>
          <div style={styles.stepBadge}>5</div>
          <div>
            <h3 style={styles.stepTitle}>{t('extWelcomeHowStep3Title')}</h3>
            <p style={styles.stepDesc}>{t('extWelcomeHowStep3Desc')}</p>
          </div>
        </div>

        {/* 노래방 모드 버튼 위치 2장 — 위→아래 큰 사이즈 */}
        <div style={styles.step1ImageRow}>
          {[
            { file: 'welcome-step3-1.png', captionKey: 'extWelcomeImgKaraoke1' },
            { file: 'welcome-step3-2.png', captionKey: 'extWelcomeImgKaraoke2' },
          ].map((img) => (
            <div key={img.file} style={styles.step1ImageStep}>
              <img
                src={chrome.runtime.getURL(`assets/images/${img.file}`)}
                alt={t(img.captionKey)}
                style={styles.step1Image}
              />
              <span style={styles.step1Caption}>{t(img.captionKey)}</span>
            </div>
          ))}
        </div>

        {/* 사이드바 가이드 메뉴 안내 — 사용자가 노래방 모드 안의 가이드 메뉴 존재를 모르는 문제 해소 */}
        <div style={styles.step3SidebarHint}>
          <p style={styles.step3SidebarHintText}>{t('extWelcomeHowStep3SidebarHint')}</p>
          <img
            src={chrome.runtime.getURL('assets/images/welcome-step-guide.png')}
            alt={t('extWelcomeHowStep3SidebarHint')}
            style={styles.step3SidebarHintImage}
          />
        </div>
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
  step3SidebarHint: {
    marginTop: '4px',
    padding: '12px 14px',
    background: 'rgba(0, 212, 170, 0.08)',
    border: '1px solid rgba(0, 212, 170, 0.2)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  step3SidebarHintText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.5',
    margin: 0,
  },
  step3SidebarHintImage: {
    display: 'block',
    maxWidth: '180px',
    width: '100%',
    height: 'auto',
    margin: '0 auto',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.08)',
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
