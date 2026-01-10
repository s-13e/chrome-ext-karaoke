/**
 * FontFamilySelect - 폰트 패밀리 선택 컴포넌트
 * 모든 텍스트 효과 패널에서 공통으로 사용
 */
import React, { useEffect, useRef, memo } from 'react';
import { AVAILABLE_FONTS, getFontLabel } from '@constants/fonts';
import { loadGoogleFont } from '@lib/utils/fonts/googleFontsLoader';
import styles from './TextEffectsModal.module.css';

interface FontFamilySelectProps {
  value: string | undefined;
  onChange: (fontFamily: string | undefined) => void;
  onPreview?: (fontFamily: string | undefined) => void; // 미리보기 콜백
  className?: string;
}

export const FontFamilySelect: React.FC<FontFamilySelectProps> = memo(({ value, onChange, onPreview, className }) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  // value가 전체 font-family 문자열인 경우 label로 변환, undefined면 기본값(Arial) 사용
  const currentLabel = value ? getFontLabel(value) : AVAILABLE_FONTS[0]?.label || 'Arial';

  // 현재 선택된 폰트만 로드 (lazy loading)
  useEffect(() => {
    if (value) {
      const currentFont = AVAILABLE_FONTS.find((f) => f.value === value);
      if (currentFont?.requiresLoad) {
        loadGoogleFont(currentFont.label);
      }
    }
  }, [value]);

  // Select 열릴 때 option에 폰트 스타일 적용
  useEffect(() => {
    const select = selectRef.current;
    if (!select) return;

    const applyFontToOptions = () => {
      const options = select.querySelectorAll('option');
      options.forEach((option) => {
        const label = option.value;
        if (label) {
          const font = AVAILABLE_FONTS.find((f) => f.label === label);
          if (font) {
            option.style.fontFamily = font.value;
          }
        }
      });
    };

    // 초기 적용
    applyFontToOptions();

    // Select가 열릴 때마다 적용 (focus 이벤트)
    select.addEventListener('focus', applyFontToOptions);

    return () => {
      select.removeEventListener('focus', applyFontToOptions);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    // label을 선택하면 해당하는 전체 font-family 문자열을 반환
    const font = AVAILABLE_FONTS.find((f) => f.label === selectedLabel);
    if (font) {
      // Google Fonts인 경우 동적으로 로드
      if (font.requiresLoad) {
        loadGoogleFont(font.label);
      }
      onChange(font.value);
    }
  };

  // 마우스 호버 시 미리보기 (폰트 lazy load 포함)
  const handleMouseMove = (e: React.MouseEvent<HTMLSelectElement>) => {
    if (!onPreview) return;

    const select = e.currentTarget;
    const rect = select.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const optionHeight = 20; // 대략적인 option 높이
    const index = Math.floor(y / optionHeight);

    if (index >= 0 && index < AVAILABLE_FONTS.length) {
      const font = AVAILABLE_FONTS[index];
      if (font) {
        // Google Fonts인 경우 미리보기 전에 로드
        if (font.requiresLoad) {
          loadGoogleFont(font.label);
        }
        onPreview(font.value);
      }
    }
  };

  return (
    <select
      ref={selectRef}
      className={className || styles.selectInput}
      value={currentLabel}
      onChange={handleChange}
      onMouseMove={handleMouseMove}
    >
      {AVAILABLE_FONTS.map((font) => (
        <option key={font.label} value={font.label}>
          {font.label}
        </option>
      ))}
    </select>
  );
});

FontFamilySelect.displayName = 'FontFamilySelect';
