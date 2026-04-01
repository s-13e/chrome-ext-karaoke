// TutorialTooltip.tsx
// 첫 사용자를 위한 튜토리얼 툴팁 컴포넌트
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdArrowForward, MdClose } from 'react-icons/md';
import styles from './tutorialTooltip.module.css';

export type TutorialStep = 'step1' | 'step2' | 'feature';

// 위치 타입 정의
export type FeaturePosition = 'bottom-center' | 'bottom-right' | 'sidebar-left';

// 기능 튜토리얼 스텝 구조 (Step 2, 3, 4)
export interface FeatureStepConfig {
  id: string;
  position: FeaturePosition;
  substeps: Array<{ titleKey: string; descKey: string }>;
}

// Feature Tutorial 스텝 정의
export const FEATURE_TUTORIAL_CONFIG: FeatureStepConfig[] = [
  {
    id: 'step2',
    position: 'bottom-center', // 하단바 위 중앙에서 살짝 오른쪽
    substeps: [
      { titleKey: 'extTutorialStep2_1Title', descKey: 'extTutorialStep2_1Desc' },
      { titleKey: 'extTutorialStep2_2Title', descKey: 'extTutorialStep2_2Desc' },
    ],
  },
  {
    id: 'step3',
    position: 'bottom-right', // 하단바 오른쪽 위
    substeps: [
      { titleKey: 'extTutorialStep3_1Title', descKey: 'extTutorialStep3_1Desc' },
      { titleKey: 'extTutorialStep3_2Title', descKey: 'extTutorialStep3_2Desc' },
    ],
  },
  {
    id: 'step4',
    position: 'sidebar-left', // 사이드바 왼쪽
    substeps: [
      { titleKey: 'extTutorialStep4_1Title', descKey: 'extTutorialStep4_1Desc' },
      { titleKey: 'extTutorialStep4_2Title', descKey: 'extTutorialStep4_2Desc' },
    ],
  },
];

export interface TutorialTooltipProps {
  step: TutorialStep;
  visible: boolean;
  onDismiss?: () => void;
  autoHideDelay?: number; // step2용 자동 숨김 딜레이 (ms)
  // Feature 튜토리얼 전용 props
  featureStepIndex?: number; // 현재 Feature Step (0=step2, 1=step3, 2=step4)
  featureSubstepIndex?: number; // 현재 서브스텝
  onFeatureStepChange?: (stepIndex: number, substepIndex: number) => void;
  // 메뉴 튜토리얼용 커스텀 substeps (이 값이 있으면 FEATURE_TUTORIAL_CONFIG 대신 사용)
  customSubsteps?: Array<{ titleKey: string; descKey: string }>;
}

/**
 * 튜토리얼 툴팁 컴포넌트
 * - step1: 가라오케 모드 활성화 안내 (버튼 위에 표시, 클릭 시 사라짐)
 * - step2: 원래 화면으로 돌아가기 안내 (10초 후 자동 사라짐)
 * - feature: 기능 튜토리얼 (Step 2-4, 각 Step마다 서브스텝 네비게이션)
 */
export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  step,
  visible,
  onDismiss,
  autoHideDelay = 10000,
  featureStepIndex = 0,
  featureSubstepIndex = 0,
  onFeatureStepChange,
  customSubsteps,
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    setIsVisible(visible);
    setIsAnimatingOut(false);
  }, [visible]);

  // step2: 자동 숨김 타이머
  useEffect(() => {
    if (step === 'step2' && isVisible && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [step, isVisible, autoHideDelay]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300); // 애니메이션 시간
  };

  // Feature 튜토리얼 네비게이션
  // customSubsteps가 제공되면 그것을 사용, 아니면 FEATURE_TUTORIAL_CONFIG 사용
  const currentFeatureConfig = FEATURE_TUTORIAL_CONFIG[featureStepIndex];
  const currentSubsteps = customSubsteps || currentFeatureConfig?.substeps || [];
  const currentSubstep = currentSubsteps[featureSubstepIndex];

  // customSubsteps 모드일 때의 네비게이션 (단일 스텝 내에서만 이동)
  const isCustomMode = !!customSubsteps;

  const handlePrev = () => {
    if (featureSubstepIndex > 0) {
      // 같은 Step 내에서 이전 서브스텝
      onFeatureStepChange?.(featureStepIndex, featureSubstepIndex - 1);
    } else if (!isCustomMode && featureStepIndex > 0) {
      // 이전 Step의 마지막 서브스텝으로 (customMode가 아닐 때만)
      const prevStepConfig = FEATURE_TUTORIAL_CONFIG[featureStepIndex - 1];
      if (prevStepConfig) {
        onFeatureStepChange?.(featureStepIndex - 1, prevStepConfig.substeps.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (featureSubstepIndex < currentSubsteps.length - 1) {
      // 같은 Step 내에서 다음 서브스텝
      onFeatureStepChange?.(featureStepIndex, featureSubstepIndex + 1);
    } else if (!isCustomMode && featureStepIndex < FEATURE_TUTORIAL_CONFIG.length - 1) {
      // 다음 Step의 첫 번째 서브스텝으로 (customMode가 아닐 때만)
      onFeatureStepChange?.(featureStepIndex + 1, 0);
    } else {
      // 마지막 서브스텝 → 튜토리얼 완료 (onFeatureStepChange로 알림하여 tutorial-complete 발생)
      onFeatureStepChange?.(featureStepIndex, currentSubsteps.length);
    }
  };

  const isFirstSubstep = isCustomMode ? featureSubstepIndex === 0 : featureStepIndex === 0 && featureSubstepIndex === 0;
  const isLastSubstep = isCustomMode
    ? featureSubstepIndex === currentSubsteps.length - 1
    : featureStepIndex === FEATURE_TUTORIAL_CONFIG.length - 1 && featureSubstepIndex === currentSubsteps.length - 1;

  if (!isVisible) return null;

  return (
    <div className={`${styles.tooltipContainer} ${styles[step]} ${isAnimatingOut ? styles.fadeOut : styles.fadeIn}`}>
      <div className={styles.tooltipContent}>
        {step === 'step1' ? (
          <>
            <div className={styles.step1Text}>
              <span className={styles.title}>{t('extTutorialStep1Title')}</span>
              <span className={styles.desc}>{t('extTutorialStep1Desc')}</span>
              {t('extTutorialStep1Extra') && <span className={styles.step1Extra}>{t('extTutorialStep1Extra')}</span>}
            </div>
            {t('extTutorialStep1Action') && <span className={styles.action}>{t('extTutorialStep1Action')}</span>}
          </>
        ) : step === 'step2' ? (
          <span className={styles.step2Text}>{t('extTutorialStep2')}</span>
        ) : (
          // feature step
          <div className={styles.featureContent}>
            <button className={styles.closeButton} onClick={handleDismiss} aria-label={t('extClose')}>
              <MdClose size={18} />
            </button>
            <div className={styles.featureText}>
              <span className={styles.featureTitle}>{currentSubstep ? t(currentSubstep.titleKey) : ''}</span>
              <span className={styles.featureDesc}>{currentSubstep ? t(currentSubstep.descKey) : ''}</span>
            </div>
            <div className={styles.featureNav}>
              <button
                className={styles.navButton}
                onClick={handlePrev}
                disabled={isFirstSubstep}
                aria-label={t('extPrevious')}
              >
                <MdArrowBack size={20} />
              </button>
              <span className={styles.stepIndicator}>
                {featureSubstepIndex + 1} / {currentSubsteps.length}
              </span>
              <button
                className={styles.navButton}
                onClick={handleNext}
                aria-label={isLastSubstep ? t('extDone') : t('extNext')}
              >
                <MdArrowForward size={20} />
              </button>
            </div>
            {/* Step 진행 표시 - customSubsteps 모드가 아닐 때만 표시 */}
            {!isCustomMode && (
              <div className={styles.stepProgress}>
                {FEATURE_TUTORIAL_CONFIG.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.stepDot} ${idx === featureStepIndex ? styles.stepDotActive : ''} ${idx < featureStepIndex ? styles.stepDotCompleted : ''}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
