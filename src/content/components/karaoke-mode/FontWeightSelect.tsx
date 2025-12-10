/**
 * FontWeightSelect - 폰트 두께 선택 컴포넌트
 * 모든 텍스트 효과 패널에서 공통으로 사용
 */
import React from 'react';
import { AVAILABLE_FONT_WEIGHTS, getFontWeightLabel } from '@constants/fontWeights';
import styles from './TextEffectsModal.module.css';

interface FontWeightSelectProps {
  value: number | undefined;
  onChange: (fontWeight: number | undefined) => void;
  className?: string;
}

export const FontWeightSelect: React.FC<FontWeightSelectProps> = ({ value, onChange, className }) => {
  // value가 숫자인 경우 label로 변환
  const currentLabel = value !== undefined ? getFontWeightLabel(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    if (selectedLabel === '') {
      onChange(undefined);
    } else {
      // label을 선택하면 해당하는 숫자 값을 반환
      const weight = AVAILABLE_FONT_WEIGHTS.find((w) => w.label === selectedLabel);
      onChange(weight?.value);
    }
  };

  return (
    <select className={className || styles.selectInput} value={currentLabel} onChange={handleChange}>
      <option value="">기본값</option>
      {AVAILABLE_FONT_WEIGHTS.map((weight) => (
        <option key={weight.value} value={weight.label}>
          {weight.label}
        </option>
      ))}
    </select>
  );
};
