// 1차 메뉴

import React, { useEffect, useRef, useState } from 'react';
import { LyricsDisplayMenu } from './LyricsDisplayMenu';
import { FontStyleMenu } from './FontStyleMenu';
import { AdvancedSettingsMenu } from './AdvancedSettingsMenu';
import { LyricsOffsetMenu } from './LyricsOffsetMenu';
import { ArrowIcon } from '@components/icons/ArrowIcon';
import styles from './MainMenu.module.css';

interface Position {
  top: number;
  left: number;
}

interface MainMenuProps {
  visible: boolean;
  position?: Position;
  onClose: () => void;
}

// MainMenu.tsx (메뉴 컨테이너 및 1차 메뉴 관리)
export const MainMenu: React.FC<MainMenuProps> = ({ visible, position, onClose }) => {
  const [currentSubMenu, setCurrentSubMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 외부 클릭 감지해서 닫기
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // visible false 시 드릴다운 상태 초기화
  useEffect(() => {
    if (!visible) {
      setCurrentSubMenu(null);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className={styles.container} // MainMenu.module.css 내 container 클래스 적용
      style={{
        position: 'absolute',
        top: position?.top,
        left: position?.left,
      }}
    >
      {currentSubMenu === null && (
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyricsOffset')}>
              <span className={styles.menuButtonText}>가사 싱크 조절</span>
              <ArrowIcon direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyrics')}>
              <span className={styles.menuButtonText}>가사 디스플레이</span>
              <ArrowIcon direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('font')}>
              <span className={styles.menuButtonText}>글꼴</span>
              <ArrowIcon direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('advanced')}>
              <span className={styles.menuButtonText}>기타</span>
              <ArrowIcon direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
        </ul>
      )}
      {currentSubMenu === 'lyricsOffset' && <LyricsOffsetMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'lyrics' && <LyricsDisplayMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'font' && <FontStyleMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'advanced' && <AdvancedSettingsMenu onBack={() => setCurrentSubMenu(null)} />}
    </div>
  );
};
