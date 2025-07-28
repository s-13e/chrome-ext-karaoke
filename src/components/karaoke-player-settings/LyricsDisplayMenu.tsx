// 가사 디스플레이 상세 메뉴
// src/components/karaoke-player-settings/LyricsDisplayMenu.tsx
import React from 'react';

interface LyricsDisplayMenuProps {
  onBack: () => void;
}

export const LyricsDisplayMenu: React.FC<LyricsDisplayMenuProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← 뒤로</button>
      <h3>가사 디스플레이 설정</h3>
      <ul>
        <li>
          {/* 여기서부터는 ToggleItem 등 재사용 UI 컴포넌트로 대체 가능 */}
          <label>
            <input type="checkbox" /> 실시간 가사 On/Off
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" /> 발음 가사 On/Off
          </label>
        </li>
        <li>
          가사 표시 방식
          <select defaultValue="adjacent">
            <option value="adjacent">인접 가사만 보기</option>
            <option value="full">전체 가사 보기</option>
          </select>
        </li>
        <li>
          <label>
            <input type="checkbox" /> 전주(첫 가사까지) 건너뛰기 On/Off
          </label>
        </li>
      </ul>
    </div>
  );
};
