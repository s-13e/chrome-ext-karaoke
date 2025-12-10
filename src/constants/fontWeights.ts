/**
 * Font weight 상수
 * CSS font-weight values for lyrics display
 */

export interface FontWeightOption {
  label: string;
  value: number;
}

/**
 * 가사 표시에 사용 가능한 폰트 두께 목록
 */
export const AVAILABLE_FONT_WEIGHTS: FontWeightOption[] = [
  { label: '얇게 (Thin)', value: 100 },
  { label: '가늘게 (Extra Light)', value: 200 },
  { label: '라이트 (Light)', value: 300 },
  { label: '보통 (Regular)', value: 400 },
  { label: '중간 (Medium)', value: 500 },
  { label: '세미볼드 (Semi Bold)', value: 600 },
  { label: '볼드 (Bold)', value: 700 },
  { label: '엑스트라 볼드 (Extra Bold)', value: 800 },
  { label: '블랙 (Black)', value: 900 },
];

/**
 * 기본 폰트 두께
 */
export const DEFAULT_FONT_WEIGHT = 400;

/**
 * 폰트 weight label로 실제 CSS value 찾기
 */
export function getFontWeightValue(label: string): number {
  const WEIGHT = AVAILABLE_FONT_WEIGHTS.find((w) => w.label === label);
  return WEIGHT?.value || DEFAULT_FONT_WEIGHT;
}

/**
 * 폰트 weight value로 label 찾기 (역변환)
 */
export function getFontWeightLabel(value: number): string {
  const WEIGHT = AVAILABLE_FONT_WEIGHTS.find((w) => w.value === value);
  return (
    WEIGHT?.label || AVAILABLE_FONT_WEIGHTS.find((w) => w.value === DEFAULT_FONT_WEIGHT)?.label || '보통 (Regular)'
  );
}
