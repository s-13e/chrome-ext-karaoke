// utils/lyricsDisplay.ts
import { Line } from '@lib/types/lyrics';

export interface DisplayIndices {
  top: string;
  bottom: string;
  highlightTop: boolean;
  highlightBottom: boolean;
  topIndex: number; // shiftedLyrics에서의 인덱스
  bottomIndex: number; // shiftedLyrics에서의 인덱스
}

export function getDisplayLines(lines: Line[], currentTime: number): DisplayIndices {
  if (lines.length === 0) {
    return { top: '', bottom: '', highlightTop: false, highlightBottom: false, topIndex: -1, bottomIndex: -1 };
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
      return { top: '', bottom: '', highlightTop: false, highlightBottom: false, topIndex: -1, bottomIndex: -1 };
    }
    activeIndex = lines.length - 1; // 곡이 끝난 뒤, 마지막 가사 유지
  }

  // ✨ 첫 가사는 항상 윗줄에 표시 (카운트다운 오버레이 위치를 위함)
  if (activeIndex === 0) {
    return {
      top: lines[0]?.text ?? '',
      bottom: '',
      highlightTop: true,
      highlightBottom: false,
      topIndex: 0,
      bottomIndex: -1,
    };
  }

  // 위치는 교대로: 1번째는 top, 2번째는 bottom, 3번째는 top, 4번째는 bottom ...
  // (0번째는 위에서 처리했으므로 1부터 시작)
  const isEven = activeIndex % 2 === 0;

  const topIdx = isEven ? activeIndex - 1 : activeIndex;
  const bottomIdx = isEven ? activeIndex : activeIndex - 1;

  return {
    top: topIdx >= 0 ? (lines[topIdx]?.text ?? '') : '',
    bottom: bottomIdx >= 0 ? (lines[bottomIdx]?.text ?? '') : '',
    highlightTop: !isEven, // 홀수 번째 줄이면 top 강조
    highlightBottom: isEven, // 짝수 번째 줄이면 bottom 강조
    topIndex: topIdx,
    bottomIndex: bottomIdx,
  };
}
