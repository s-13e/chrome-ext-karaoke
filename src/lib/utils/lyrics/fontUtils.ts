// lib/utils/lyrics/fontUtils.ts
/**
 * 가사 전체 중 가장 긴 줄을 기준으로 폰트 크기를 자동 계산
 * @param lyricsLines 문자열 배열 (싱크/비싱크 상관 없이 한 줄씩)
 * @param containerWidth px 단위 컨테이너 가로폭
 * @param baseFontSize 기준 폰트(px)
 * @returns 계산된 폰트 px 값 (정수)
 */
export function calculateAutoFontSize(lyricsLines: string[], containerWidth: number, baseFontSize = 32): number {
  if (!lyricsLines.length || containerWidth <= 0) return baseFontSize;

  let maxLength = 0;
  const tempSpan = document.createElement('span');
  tempSpan.style.visibility = 'hidden';
  tempSpan.style.whiteSpace = 'nowrap';
  document.body.appendChild(tempSpan);

  for (const line of lyricsLines) {
    tempSpan.innerText = line;
    const lineWidth = tempSpan.offsetWidth;
    if (lineWidth > maxLength) {
      maxLength = lineWidth;
    }
  }

  tempSpan.remove();

  if (maxLength === 0) return baseFontSize;

  const scale = containerWidth / maxLength;
  return Math.floor(baseFontSize * scale);
}
