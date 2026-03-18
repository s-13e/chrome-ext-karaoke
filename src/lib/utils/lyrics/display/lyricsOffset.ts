import { Line } from '@lib/types/lyrics';

/**
 * 가사 배열에 offset 보정 적용
 * @param lyrics 원본 가사 배열 (time기준 정렬되어 있다고 가정)
 * @param offset 초 단위 오프셋 (음수 가능)
 * @param minOffsetLimit 첫 가사의 시간이 minOffsetLimit보다 작아지지 않도록 제한 (예: 0)
 * @returns offset이 적용된 새로운 가사 배열
 */
export function applyOffsetToLyrics(lyrics: Line[], offset: number, minOffsetLimit = 0): Line[] {
  if (!lyrics || lyrics.length === 0) return lyrics;

  const firstLine = lyrics[0];
  if (!firstLine || firstLine.time === undefined) {
    return lyrics; // 그냥 원본 배열 반환 또는 다른 처리
  }
  // 첫 가사의 시간, offset 적용 후 최소값 제한 (minOffsetLimit 이상)
  const firstTimeAfterOffset = firstLine.time + offset;
  const offsetLimited = firstTimeAfterOffset < minOffsetLimit ? minOffsetLimit - firstLine.time : offset;

  // 1차 적용
  const adjusted = lyrics.map((line) => ({
    ...line,
    time: line.time + offsetLimited,
  }));

  // 2차 전역 보정: 모든 time >= 0
  return adjusted.map((line) => ({
    ...line,
    time: line.time < 0 ? 0 : line.time,
  }));
}

/**
 * 줄별 추가 보정값 적용
 * @param lyrics 가사 배열 (전체 오프셋이 이미 적용된 상태)
 * @param lineAdjustments 줄 인덱스 → 추가 보정값(초) 맵
 * @returns 줄별 보정이 적용된 새로운 가사 배열
 */
export function applyLineAdjustments(lyrics: Line[], lineAdjustments: Record<number, number>): Line[] {
  if (!lyrics || lyrics.length === 0 || !lineAdjustments) return lyrics;

  return lyrics.map((line, idx) => {
    const delta = lineAdjustments[idx];
    if (delta === undefined || delta === 0) return line;
    return {
      ...line,
      time: Math.max(0, line.time + delta),
    };
  });
}

export function shiftFirstLyricEarlier(lyrics: Line[], advanceSec: number): Line[] {
  if (!lyrics || lyrics.length === 0) return lyrics;
  const [first, ...rest] = lyrics;
  if (!first) return lyrics;
  const newFirstLine: Line = {
    ...first,
    time: Math.max(0, first.time - advanceSec),
    text: first.text ?? '',
  };
  return [newFirstLine, ...rest];
}
