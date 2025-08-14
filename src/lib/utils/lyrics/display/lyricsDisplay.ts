// utils/lyricsDisplay.ts
import { Line } from '@lib/types/lyrics';

export interface DisplayIndices {
  top: string;
  bottom: string;
  highlightTop: boolean;
  highlightBottom: boolean;
}

export function getDisplayLines(lines: Line[], currentTime: number): DisplayIndices {
  if (lines.length === 0) {
    return { top: '', bottom: '', highlightTop: false, highlightBottom: false };
  }

  let activeIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next = lines[i + 1];
    if (!cur) continue;

    const endTime = next?.time ?? Infinity;
    const previewTime = cur.time + (endTime - cur.time) * 0.5;

    if (currentTime >= cur.time && currentTime < previewTime) {
      activeIndex = i;
      break;
    } else if (currentTime >= previewTime && currentTime < endTime) {
      activeIndex = i + 1;
      break;
    }
  }

  if (activeIndex === -1) {
    const firstLine = lines[0];
    if (firstLine && currentTime < firstLine.time) {
      // 첫 타임스탬프 전: 아무 자막도 출력하지 않음
      return { top: '', bottom: '', highlightTop: false, highlightBottom: false };
    }
    activeIndex = lines.length - 1; // 곡이 끝난 뒤, 마지막 가사 유지
  }

  // 위치는 교대로: 0번째는 bottom, 1번째는 top, 2번째는 bottom, 3번째는 top ...
  const isEven = activeIndex % 2 === 0;

  const topIdx = isEven ? activeIndex - 1 : activeIndex;
  const bottomIdx = isEven ? activeIndex : activeIndex - 1;

  return {
    top: topIdx >= 0 ? (lines[topIdx]?.text ?? '') : '',
    bottom: bottomIdx >= 0 ? (lines[bottomIdx]?.text ?? '') : '',
    highlightTop: !isEven, // 홀수 번째 줄이면 top 강조
    highlightBottom: isEven, // 짝수 번째 줄이면 bottom 강조
  };
}
