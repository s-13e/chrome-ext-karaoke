/**
 * FontFamilySelect - 폰트 패밀리 선택 컴포넌트
 * 모든 텍스트 효과 패널에서 공통으로 사용
 */
import React from 'react';
import { AVAILABLE_FONTS, getFontLabel } from '@constants/fonts';
import styles from './TextEffectsModal.module.css';

interface FontFamilySelectProps {
  value: string | undefined;
  onChange: (fontFamily: string | undefined) => void;
  className?: string;
}

export const FontFamilySelect: React.FC<FontFamilySelectProps> = ({ value, onChange, className }) => {
  // value가 전체 font-family 문자열인 경우 label로 변환
  const currentLabel = value ? getFontLabel(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    if (selectedLabel === '') {
      onChange(undefined);
    } else {
      // label을 선택하면 해당하는 전체 font-family 문자열을 반환
      const font = AVAILABLE_FONTS.find((f) => f.label === selectedLabel);
      onChange(font?.value);
    }
  };

  return (
    <select className={className || styles.selectInput} value={currentLabel} onChange={handleChange}>
      <option value="">기본값</option>
      {AVAILABLE_FONTS.map((font) => (
        <option key={font.label} value={font.label}>
          {font.label}
        </option>
      ))}
    </select>
  );
};
