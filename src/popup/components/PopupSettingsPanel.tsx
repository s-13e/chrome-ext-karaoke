import React from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './styles.module.css';

interface PopupSettingsPanelProps {
  onBack: () => void;
}

export const PopupSettingsPanel: React.FC<PopupSettingsPanelProps> = ({ onBack }) => {
  return (
    <div className={styles.settingsPanel}>
      <div className={styles.settingsHeader}>
        <BackButton onClick={onBack} />
        <h2>설정</h2>
      </div>
      <hr className={styles.divider} />

      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>개인 설정</div>
        <button className={styles.settingsButton}>가사 표시</button>
        <button className={styles.settingsButton}>발음 표시</button>
        <button className={styles.settingsButton}>싱크 조절</button>
        <button className={styles.settingsButton}>스타일 변경</button>
      </div>

      <div className={styles.sectionGroup}>
        <div className={styles.sectionLabel}>일반</div>
        <button className={styles.settingsButton}>캐시 초기화</button>
        <button className={styles.settingsButton}>FAQ / 문의 / 라이선스</button>
        <button className={styles.settingsButton}>설정 페이지 전체 열기</button>
      </div>
    </div>
  );
};
