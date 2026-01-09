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
 * label은 i18n 키로 사용됨
 */
export const AVAILABLE_FONT_WEIGHTS: FontWeightOption[] = [
  { label: 'extFontWeightThin', value: 100 },
  { label: 'extFontWeightExtraLight', value: 200 },
  { label: 'extFontWeightLight', value: 300 },
  { label: 'extFontWeightRegular', value: 400 },
  { label: 'extFontWeightMedium', value: 500 },
  { label: 'extFontWeightSemiBold', value: 600 },
  { label: 'extFontWeightBold', value: 700 },
  { label: 'extFontWeightExtraBold', value: 800 },
  { label: 'extFontWeightBlack', value: 900 },
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
    WEIGHT?.label ||
    AVAILABLE_FONT_WEIGHTS.find((w) => w.value === DEFAULT_FONT_WEIGHT)?.label ||
    'extFontWeightRegular'
  );
}
