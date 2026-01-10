/**
 * FontWeightSelect - 폰트 두께 선택 컴포넌트
 * 모든 텍스트 효과 패널에서 공통으로 사용
 */
import React, { useEffect, useRef, memo } from 'react';
import { AVAILABLE_FONT_WEIGHTS, getFontWeightLabel } from '@constants/fontWeights';
import styles from './TextEffectsModal.module.css';
import { useTranslation } from 'react-i18next';

interface FontWeightSelectProps {
  value: number | undefined;
  onChange: (fontWeight: number | undefined) => void;
  className?: string;
}

export const FontWeightSelect: React.FC<FontWeightSelectProps> = memo(({ value, onChange, className }) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const { t } = useTranslation();

  // value가 숫자인 경우 label로 변환, undefined면 기본값(400) 사용
  const currentLabel = value !== undefined ? getFontWeightLabel(value) : getFontWeightLabel(400);

  // Select 열릴 때 option에 폰트 굵기 스타일 적용
  useEffect(() => {
    const select = selectRef.current;
    if (!select) return;

    const applyWeightToOptions = () => {
      const options = select.querySelectorAll('option');
      options.forEach((option) => {
        const label = option.value;
        if (label) {
          const weight = AVAILABLE_FONT_WEIGHTS.find((w) => w.label === label);
          if (weight) {
            option.style.fontWeight = weight.value.toString();
          }
        }
      });
    };

    // 초기 적용
    applyWeightToOptions();

    // Select가 열릴 때마다 적용 (focus 이벤트)
    select.addEventListener('focus', applyWeightToOptions);

    return () => {
      select.removeEventListener('focus', applyWeightToOptions);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    // label을 선택하면 해당하는 숫자 값을 반환
    const weight = AVAILABLE_FONT_WEIGHTS.find((w) => w.label === selectedLabel);
    onChange(weight?.value);
  };

  return (
    <select ref={selectRef} className={className || styles.selectInput} value={currentLabel} onChange={handleChange}>
      {AVAILABLE_FONT_WEIGHTS.map((weight) => (
        <option key={weight.value} value={weight.label}>
          {t(weight.label)}
        </option>
      ))}
    </select>
  );
});

FontWeightSelect.displayName = 'FontWeightSelect';
