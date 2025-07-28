// 1차 메뉴

import React, { useEffect, useRef, useState } from 'react';
import { LyricsDisplayMenu } from './LyricsDisplayMenu';
import { FontStyleMenu } from './FontStyleMenu';
import { AdvancedSettingsMenu } from './AdvancedSettingsMenu';
import styles from './MainMenu.module.css';

interface Position {
  top: number;
  left: number;
}

interface MainMenuProps {
  visible: boolean;
  position?: Position;
  onClose: () => void; // 외부 클릭시 호출하기 위해 onClose 필수
}

// MainMenu.tsx (메뉴 컨테이너 및 1차 메뉴 관리)
export const MainMenu: React.FC<MainMenuProps> = ({ visible, position, onClose }) => {
  const [currentSubMenu, setCurrentSubMenu] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // visible false 시 드릴다운 상태 초기화
  useEffect(() => {
    if (!visible) {
      setCurrentSubMenu(null);
    }
  }, [visible]);

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

  if (!visible) return null;

  // 드릴다운: 하위 메뉴가 있으면 그 컴포넌트로 전환
  if (currentSubMenu === 'lyrics') {
    return <LyricsDisplayMenu onBack={() => setCurrentSubMenu(null)} />;
  }
  if (currentSubMenu === 'font') {
    return <FontStyleMenu onBack={() => setCurrentSubMenu(null)} />;
  }
  if (currentSubMenu === 'advanced') {
    return <AdvancedSettingsMenu onBack={() => setCurrentSubMenu(null)} />;
  }

  return (
    <div
      ref={menuRef}
      className={styles.container}
      style={{
        position: 'absolute',
        left: position?.left ?? 100,
        top: position?.top ?? 100,
        transform: 'translate(-50%, 0)',
      }}
    >
      <h2 className={styles.title}>설정</h2>
      <ul className={styles.menuList}>
        <li className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyrics')}>
            가사 디스플레이
          </button>
        </li>
        <li className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => setCurrentSubMenu('font')}>
            글자(자막 스타일)
          </button>
        </li>
        <li className={styles.menuItem}>
          <button className={styles.menuButton} onClick={() => setCurrentSubMenu('advanced')}>
            기타
          </button>
        </li>
      </ul>
    </div>
  );
};
