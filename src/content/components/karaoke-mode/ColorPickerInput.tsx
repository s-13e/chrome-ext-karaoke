/**
 * ColorPickerInput - 컬러피커 입력 컴포넌트
 * IMPORTANT: 드래그 중(연속으로 onChange 발생 중)에는 적용하지 않고, 드래그가 멈춘 후에만 저장 및 미리보기 적용
 * 이유: 드래그 중 onChange가 계속 호출되면서 storage에 계속 저장되면 페이지가 멈추거나 튕길 수 있음
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './TextEffectsModal.module.css';

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onPreviewUpdate: () => void;
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ value, onChange, onPreviewUpdate }) => {
  const [tempValue, setTempValue] = useState(value);
  const changeTimeoutRef = useRef<number | null>(null);
  const pendingValueRef = useRef<string | null>(null);

  // value prop이 변경되면 tempValue도 업데이트
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const applyChange = useCallback(
    (newValue: string) => {
      onChange(newValue || undefined);
      onPreviewUpdate();
    },
    [onChange, onPreviewUpdate],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = (e.target as HTMLInputElement).value;
    setTempValue(newValue);
    pendingValueRef.current = newValue;

    // 기존 타이머 취소
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    // 200ms 동안 onChange가 발생하지 않으면 드래그가 끝난 것으로 간주하고 적용
    changeTimeoutRef.current = window.setTimeout(() => {
      if (pendingValueRef.current !== null) {
        applyChange(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    }, 200);
  };

  const handleBlur = () => {
    // 타이머 취소하고 즉시 적용
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    if (pendingValueRef.current !== null) {
      applyChange(pendingValueRef.current);
      pendingValueRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      type="color"
      className={styles.colorInput}
      value={tempValue}
      onChange={handleChange} // onChange 발생 후 200ms 동안 새로운 onChange가 없으면 적용
      onBlur={handleBlur} // 포커스를 잃을 때 즉시 적용
    />
  );
};
