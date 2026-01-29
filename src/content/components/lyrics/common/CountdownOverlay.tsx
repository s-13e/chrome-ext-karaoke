import React, { useEffect, useState } from 'react';
import styles from './CountdownOverlay.module.css';

interface CountdownOverlayProps {
  /** 카운트다운 시작 시간 (초 단위) */
  startTime: number;
  /** 현재 재생 시간 (초 단위) */
  currentTime: number;
  /** 폰트 색상 */
  fontColor?: string;
  /** 폰트 크기 (px) */
  fontSize?: number;
}

/**
 * 가라오케 스타일 카운트다운 오버레이 (4→3→2→1)
 *
 * 카운트 하나당 0.5초씩 표시 (총 2초 소요)
 * - 첫 가사 타임스탬프 2초 전부터 카운트다운 시작
 * - 첫 가사가 나타나면 카운트다운 사라짐
 */
export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  startTime,
  currentTime,
  fontColor = '#ffcc00',
  fontSize,
}) => {
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);

  useEffect(() => {
    // 카운트다운 시작 시간: 첫 가사 2초 전부터
    const countdownStartTime = startTime - 2.0;

    // 카운트다운 종료 시간: 첫 가사 시작 시간
    const countdownEndTime = startTime;

    // 현재 시간이 카운트다운 범위 내에 있는지 확인
    if (currentTime < countdownStartTime || currentTime >= countdownEndTime) {
      setCountdownNumber(null);
      return;
    }

    // 카운트다운 경과 시간 (0 ~ 2초)
    const elapsed = currentTime - countdownStartTime;

    // 각 카운트 지속 시간: 0.5초
    // elapsed: 0.0~0.5초 → 4
    // elapsed: 0.5~1.0초 → 3
    // elapsed: 1.0~1.5초 → 2
    // elapsed: 1.5~2.0초 → 1
    const countIndex = Math.floor(elapsed / 0.5);
    const number = 4 - countIndex;

    setCountdownNumber(number >= 1 && number <= 4 ? number : null);
  }, [currentTime, startTime]);

  // 카운트다운 숫자가 없으면 렌더링하지 않음
  if (countdownNumber === null) {
    return null;
  }

  return (
    <div
      className={styles.countdownOverlay}
      style={{ color: fontColor, ...(fontSize && { fontSize: `${fontSize}px` }) }}
      aria-live="polite"
    >
      {countdownNumber}
    </div>
  );
};
