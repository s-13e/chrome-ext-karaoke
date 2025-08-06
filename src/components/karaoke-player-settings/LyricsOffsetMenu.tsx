// 가사 싱크
// src/components/karaoke-player-settings/LyricsOffsetMenuMenu.tsx
import { BackButton } from '@components/common/BackButton';
import React from 'react';
import styles from './MainMenu.module.css';
import { LyricsOffsetControl } from './LyricsOffsetControl';

interface LyricsOffsetMenuProps {
  onBack: () => void;
}
export const LyricsOffsetMenu: React.FC<LyricsOffsetMenuProps> = ({ onBack }) => (
  <div className="submenuContainer">
    <div className={styles.horizontalHeader}>
      <BackButton onClick={onBack} />
      <h2 className={styles.menuTitle}>가사 오프셋 설정</h2>
    </div>
    <hr className={styles.divider} />
    <LyricsOffsetControl
      initialOffset={0}
      min={-30}
      max={30}
      step={1}
      onChange={(val) => {
        console.log('싱크 조절 값:', val);
        // 여기에 실제 싱크 조절 로직 연결
      }}
    />
    <hr className={styles.divider} />
    <p style={{ padding: '12px 16px', color: '#ccc', fontSize: 14 }}>
      가사 자막의 타이밍이 맞지 않을 때, 여기서 미세 조절하세요.
    </p>
  </div>
);
