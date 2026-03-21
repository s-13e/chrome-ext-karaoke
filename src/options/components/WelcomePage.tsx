// WelcomePage.tsx
// 설치 직후 표시되는 3단계 슬라이드 위저드
// Slide 1: 소개 + 기대치 설정 → Slide 2: 사용법 (팝업 ON + 모드 안내) → Slide 3: 완료 + CTA

import React, { useState } from 'react';
import { WelcomeSlide } from './slides/WelcomeSlide';
import { HowItWorksSlide } from './slides/HowItWorksSlide';
import { ReadySlide } from './slides/ReadySlide';

const TOTAL_SLIDES = 3;

export const WelcomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goNext = () => setCurrentSlide((prev) => Math.min(prev + 1, TOTAL_SLIDES - 1));
  const goBack = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* 진행 표시 */}
        <div style={styles.progressBar}>
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <div
              key={i}
              style={{
                ...styles.progressDot,
                ...(i === currentSlide ? styles.progressDotActive : {}),
                ...(i < currentSlide ? styles.progressDotCompleted : {}),
              }}
            />
          ))}
        </div>

        {/* 슬라이드 콘텐츠 */}
        {currentSlide === 0 && <WelcomeSlide onNext={goNext} />}
        {currentSlide === 1 && <HowItWorksSlide onNext={goNext} onBack={goBack} />}
        {currentSlide === 2 && <ReadySlide onBack={goBack} />}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    background: '#0f0f0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  container: {
    maxWidth: '560px',
    width: '100%',
  },
  progressBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  progressDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    transition: 'all 0.2s',
  },
  progressDotActive: {
    background: '#00d4aa',
    transform: 'scale(1.3)',
  },
  progressDotCompleted: {
    background: 'rgba(0, 212, 170, 0.4)',
  },
};
