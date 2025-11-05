// HeaderContainer.tsx
// 가라오케 모드 상단 헤더 컨테이너
// Chrome 확장 로고와 설정 버튼 표시
import React from 'react';
import styles from './styles.module.css';
import { MdOutlineMoreHoriz } from 'react-icons/md';

/**
 * 가라오케 모드 헤더 컨테이너
 * - 동영상 플레이어 위에 위치
 * - 확장 프로그램 로고와 설정 버튼 포함
 */
export const HeaderContainer: React.FC = () => {
  const handleSettingsClick = () => {
    console.log('[HeaderContainer] 설정 버튼 클릭');
    // TODO: 설정 모달 또는 페이지 열기
  };

  return (
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <span className={styles.logoText}>youtube-karaoke</span>
        </div>
        <button className={styles.settingsButton} onClick={handleSettingsClick} aria-label="설정">
          <MdOutlineMoreHoriz size={16} />
        </button>
      </div>
    </div>
  );
};
