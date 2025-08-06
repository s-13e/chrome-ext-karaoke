// 기타 메뉴
// src/components/karaoke-player-settings/AdvancedSettingsMenu.tsx
import React from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './MainMenu.module.css';

interface AdvancedSettingsMenuProps {
  onBack: () => void;
}

export const AdvancedSettingsMenu: React.FC<AdvancedSettingsMenuProps> = ({ onBack }) => {
  return (
    <div>
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h3>기타 설정</h3>
      </div>
      <hr className={styles.divider} />
    </div>
  );
};
