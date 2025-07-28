// 글꼴 스타일 메뉴 2차// src/components/karaoke-player-settings/FontStyleMenu.tsx
import React from 'react';

interface FontStyleMenuProps {
  onBack: () => void;
}

export const FontStyleMenu: React.FC<FontStyleMenuProps> = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack}>← 뒤로</button>
      <h3>글자(자막 스타일) 설정</h3>
      <ul>
        <li>
          <label>
            폰트 종류
            <select defaultValue="default">
              <option value="default">기본</option>
              <option value="serif">세리프</option>
              <option value="monospace">모노스페이스</option>
            </select>
          </label>
        </li>
        <li>
          <label>
            글자 크기
            <input type="range" min="10" max="40" defaultValue="16" />
          </label>
        </li>
        <li>
          <label>
            글자 색상
            <input type="color" defaultValue="#ffffff" />
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" /> 테두리 효과
          </label>
        </li>
      </ul>
    </div>
  );
};
