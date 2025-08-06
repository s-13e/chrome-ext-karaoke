import React from 'react';
import { BackButton } from '@components/common/BackButton';
import styles from './MainMenu.module.css';

interface FontStyleMenuProps {
  onBack: () => void;
}

export const FontStyleMenu: React.FC<FontStyleMenuProps> = ({ onBack }) => {
  return (
    <>
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h2 className={styles.menuTitle}>글꼴 스타일</h2>
      </div>
      <hr className={styles.divider} />

      <div className={styles.subSectionScrollable}>
        {/* 현재 가사 */}
        <div className={styles.subSection}>
          <h3 className={styles.subSectionTitle}>현재 가사</h3>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 종류</span>
            <select className={styles.settingSelect}>
              <option>기본</option>
              <option>세리프</option>
              <option>모노스페이스</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 크기</span>
            <select className={styles.settingSelect}>
              <option>작게</option>
              <option>보통</option>
              <option>크게</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 색상</span>
            <input type="color" className={styles.colorPicker} />
          </div>
        </div>
        {/* 발음 가사 */}
        <div className={styles.subSection}>
          <h3 className={styles.subSectionTitle}>발음 가사</h3>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 종류</span>
            <select className={styles.settingSelect}>
              <option>기본</option>
              <option>세리프</option>
              <option>모노스페이스</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 크기</span>
            <select className={styles.settingSelect}>
              <option>작게</option>
              <option>보통</option>
              <option>크게</option>
            </select>
          </div>
          <div className={styles.settingItem}>
            <span className={styles.settingLabel}>글꼴 색상</span>
            <input type="color" className={styles.colorPicker} />
          </div>
        </div>
      </div>
    </>
  );
};
