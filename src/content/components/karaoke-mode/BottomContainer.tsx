// BottomContainer.tsx
// 가라오케 모드 하단 컨테이너
// 구간 반복, 싱크셋 등 음악 영상 관련 기능 제공
import React from 'react';
import styles from './styles.module.css';
import { IoRepeat } from 'react-icons/io5';

/**
 * 가라오케 모드 하단 컨테이너
 * - 동영상 플레이어 하단에 위치
 * - 구간반복, 간주집프, 노래처음으로, 싱크셋 등 기능 제공
 */
export const BottomContainer: React.FC = () => {
  const handleFeatureClick = (featureName: string) => {
    console.log(`[BottomContainer] ${featureName} 기능 클릭`);
    // TODO: 각 기능 구현
  };

  return (
    <div className={styles.bottomContainer}>
      <div className={styles.bottomContent}>
        <button className={styles.bottomButton} onClick={() => handleFeatureClick('구간반복')} aria-label="구간반복">
          <IoRepeat size={16} />
          <span>구간반복</span>
        </button>
        <button className={styles.bottomButton} onClick={() => handleFeatureClick('간주집프')} aria-label="간주집프">
          간주점프
        </button>
        <button
          className={styles.bottomButton}
          onClick={() => handleFeatureClick('노래처음으로')}
          aria-label="노래처음으로"
        >
          노래처음으로
        </button>
        <button className={styles.bottomButton} onClick={() => handleFeatureClick('싱크셋')} aria-label="싱크셋">
          싱크셋
        </button>
      </div>
    </div>
  );
};
