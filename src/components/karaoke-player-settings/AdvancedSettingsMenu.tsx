// 기타 메뉴
// src/components/karaoke-player-settings/AdvancedSettingsMenu.tsx
import React from 'react';

interface AdvancedSettingsMenuProps {
  onBack: () => void;
}

export const AdvancedSettingsMenu: React.FC<AdvancedSettingsMenuProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← 뒤로</button>
      <h3>기타 설정</h3>
      <ul>
        <li>
          <button onClick={() => alert('설정 초기화 완료!')}>설정 초기화</button>
        </li>
        <li>
          {/* 필요 시 추가 고급 옵션 */}
          {/* <button>고급 동기화</button> */}
        </li>
      </ul>
    </div>
  );
};
