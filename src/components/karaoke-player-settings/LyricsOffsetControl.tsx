import React, { useState, useRef, useEffect } from 'react';
import styles from './MainMenu.module.css';

interface LyricsOffsetControlProps {
  initialOffset?: number;
  min?: number;
  max?: number;
  step?: number;
  onCommit?: (value: number) => void;
  onChange?: (value: number) => void; // ✅ 추가: 드래그 중 값 변경 전달
}

export const LyricsOffsetControl: React.FC<LyricsOffsetControlProps> = ({
  initialOffset = 0,
  min = -15,
  max = 15,
  step = 1,
  onCommit,
  onChange,
}) => {
  const [offset, setOffset] = useState(initialOffset);
  const sliderRef = useRef<HTMLInputElement | null>(null);
  const [thumbPos, setThumbPos] = useState(0);

  useEffect(() => {
    // initialOffset이 내부 상태와 다를 때만 업데이트
    if (initialOffset !== offset) {
      setOffset(initialOffset);
    }
  }, [offset, initialOffset]);

  const updateOffset = (newOffset: number) => {
    const bounded = Math.max(min, Math.min(max, newOffset));
    setOffset(bounded);
    onChange?.(bounded);
  };

  const reset = () => updateOffset(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateOffset(Number(e.target.value));
  };

  // 마우스 업 및 터치 종료 시점에 onCommit 호출
  const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('[LyricsOffsetControl] 마우스 업 발생 - onCommit 호출, 값:', e.currentTarget.value);
    if (onCommit) onCommit(Number(e.currentTarget.value));
  };
  const handleTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    console.log('[LyricsOffsetControl] 터치 종료 발생 - onCommit 호출, 값:', e.currentTarget.value);
    if (onCommit) onCommit(Number(e.currentTarget.value));
  };

  // 썸 위치 계산
  useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const minVal = Number(slider.min);
      const maxVal = Number(slider.max);
      const ratio = (offset - minVal) / (maxVal - minVal);
      const width = slider.offsetWidth;
      setThumbPos(ratio * width);
    }
  }, [offset, min, max]);

  return (
    <div className={styles.lyricsOffsetContainer} style={{ padding: '12px 16px', position: 'relative' }}>
      <span>가사 싱크 조절</span>
      {/* 슬라이더 */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={offset}
        onChange={handleSliderChange}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        ref={sliderRef}
        className={styles.slider}
        style={{ width: '100%', marginTop: 35, marginBottom: 5 }}
        aria-label="가사 싱크 조절 슬라이더"
      />

      {/* 슬라이더 아래 눈금 및 값 표시 */}
      <div className={styles.sliderTicks} style={{ position: 'relative', width: '100%', height: 28 }}>
        {/* 왼쪽: -10 */}
        <span style={{ position: 'absolute', left: 0, top: 8, color: '#bbb', fontSize: 13 }}>{min}</span>
        {/* 중앙: 0 */}
        <span
          style={{
            position: 'absolute',
            left: '50%',
            top: 8,
            transform: 'translateX(-50%)',
            color: '#bbb',
            fontSize: 13,
            pointerEvents: 'none',
          }}
        >
          0
        </span>
        {/* 오른쪽: 15 */}
        <span style={{ position: 'absolute', right: 0, top: 8, color: '#bbb', fontSize: 13 }}>{max}</span>
        {/* 현재값 표시 (버튼, 썸 위치에 고정) */}
        <button
          type="button"
          onClick={reset}
          style={{
            position: 'absolute',
            left: thumbPos,
            top: -45,
            transform: 'translateX(-50%)',
            background: '#fff',
            color: '#666',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            border: 'none',
            borderRadius: 8,
            padding: '3px 8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 13,
            zIndex: 2,
            transition: 'background 0.1s',
          }}
          aria-label="가사 싱크 0초로 초기화"
        >
          {offset > 0 ? `+${offset}` : offset}
        </button>
      </div>
    </div>
  );
};
