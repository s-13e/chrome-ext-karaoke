/**
 * ColorPickerInput - 컬러피커 입력 컴포넌트
 * IMPORTANT: 드래그 중(연속으로 onChange 발생 중)에는 적용하지 않고, 드래그가 멈춘 후에만 저장 및 미리보기 적용
 * 이유: 드래그 중 onChange가 계속 호출되면서 storage에 계속 저장되면 페이지가 멈추거나 튕길 수 있음
 */
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import styles from './TextEffectsModal.module.css';

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const ColorPickerInput: React.FC<ColorPickerInputProps> = memo(({ value, onChange }) => {
  const [tempValue, setTempValue] = useState(value);
  const changeTimeoutRef = useRef<number | null>(null);
  const pendingValueRef = useRef<string | null>(null);

  // value prop이 변경되면 tempValue도 업데이트
  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const applyChange = useCallback(
    (newValue: string) => {
      console.log('[ColorPickerInput] applyChange called with:', newValue);
      onChange(newValue || undefined);
      // onPreviewUpdate 제거: onChange에서 이미 storage에 저장하므로 중복 호출 불필요
    },
    [onChange],
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
      // eslint-disable-next-line no-console
      console.log('[ColorPickerInput] Drag stopped, applying change');
      if (pendingValueRef.current !== null) {
        applyChange(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    }, 200);
  };

  const handleBlur = () => {
    // eslint-disable-next-line no-console
    console.log(
      '[ColorPickerInput] handleBlur, pending:',
      pendingValueRef.current,
      'tempValue:',
      tempValue,
      'value:',
      value,
    );
    // 타이머 취소하고 즉시 적용
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    // pendingValueRef가 있으면 적용, 없으면 tempValue가 value와 다른지 확인
    if (pendingValueRef.current !== null) {
      applyChange(pendingValueRef.current);
      pendingValueRef.current = null;
    } else if (tempValue !== value) {
      // 단일 클릭의 경우 pending이 없을 수 있으므로 tempValue 확인
      // eslint-disable-next-line no-console
      console.log('[ColorPickerInput] Applying tempValue on blur');
      applyChange(tempValue);
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
});

ColorPickerInput.displayName = 'ColorPickerInput';
