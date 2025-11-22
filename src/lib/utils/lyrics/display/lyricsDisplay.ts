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

  // ✨ 가사 위치 패턴: a-b-a-b-a-b (첫 가사는 윗줄에서 시작)
  // activeIndex: 0=a줄, 1=b줄, 2=a줄, 3=b줄, ...
  const isEven = activeIndex % 2 === 0;

  if (isEven) {
    // 짝수 인덱스 (0, 2, 4, ...): 윗줄(a)에 표시
    return {
      top: lines[activeIndex]?.text ?? '',
      bottom: activeIndex > 0 ? (lines[activeIndex - 1]?.text ?? '') : '',
      highlightTop: true,
      highlightBottom: false,
      topIndex: activeIndex,
      bottomIndex: activeIndex > 0 ? activeIndex - 1 : -1,
    };
  } else {
    // 홀수 인덱스 (1, 3, 5, ...): 아랫줄(b)에 표시
    return {
      top: lines[activeIndex - 1]?.text ?? '',
      bottom: lines[activeIndex]?.text ?? '',
      highlightTop: false,
      highlightBottom: true,
      topIndex: activeIndex - 1,
      bottomIndex: activeIndex,
    };
  }
}
