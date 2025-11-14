// SidebarContainer.tsx
// 가라오케 모드 오른쪽 사이드바 컨테이너
// 가라오케 확장의 다양한 서비스 제공
import React from 'react';
import styles from './styles.module.css';

/**
 * 가라오케 모드 사이드바 컨테이너
 * - 동영상 플레이어 오른쪽에 위치
 * - 가라오케 확장의 다양한 서비스 제공
 * - 버튼: 다음 곡 예약, 예약 전환, 인기 차트, 싱크차트2, 나의 노래 스타일 분석
 */
export const SidebarContainer: React.FC = () => {
  const handleMenuClick = (menuName: string) => {
    console.log(`[SidebarContainer] ${menuName} 메뉴 클릭`);
    // TODO: 각 메뉴 기능 구현
  };

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarContent}>
        <button className={styles.sidebarButton} onClick={() => handleMenuClick('다음 곡 예약')}>
          다음 곡 예약
        </button>
        <button className={styles.sidebarButton} onClick={() => handleMenuClick('예약 전환')}>
          예약 전환
        </button>
        <button className={styles.sidebarButton} onClick={() => handleMenuClick('인기 차트')}>
          인기 차트
        </button>
        <button className={styles.sidebarButton} onClick={() => handleMenuClick('인기 차트')}>
          무반주 녹음
        </button>
        <button className={styles.sidebarButton} onClick={() => handleMenuClick('나의 노래 스타일 분석')}>
          나의 노래
          <br />
          스타일 분석
        </button>
      </div>
    </div>
  );
};
