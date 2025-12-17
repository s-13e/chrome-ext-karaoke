/**
 * 폰트 패밀리 상수
 * Font family constants for lyrics display
 */

export interface FontOption {
  // 사용자에게 보여지는 이름
  label: string;
  // 실제 CSS font-family 값 (fallback 포함)
  value: string;
  // 폰트가 로드되어야 하는지 여부 (Google Fonts 등)
  requiresLoad?: boolean;
}

/**
 * 가사 표시에 사용 가능한 폰트 목록
 * 상업적 무료 사용 가능하며 인지도 있는 폰트들
 * 지원 언어: 한국어, 일본어, 중국어(간체/번체), 영어, 스페인어, 포르투갈어
 */
export const AVAILABLE_FONTS: FontOption[] = [
  // 시스템 기본 폰트
  {
    label: 'Arial',
    value: 'Arial, "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
  },
  // Google Fonts - 알파벳순 정렬
  {
    label: 'Cherry Bomb One',
    value: '"Cherry Bomb One", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Dancing Script',
    value: '"Dancing Script", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Dela Gothic One',
    value: '"Dela Gothic One", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Diphylleia',
    value: 'Diphylleia, "Noto Serif KR", "Noto Serif JP", "Noto Serif SC", serif',
    requiresLoad: true,
  },
  {
    label: 'Do Hyeon',
    value: '"Do Hyeon", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'DotGothic16',
    value: 'DotGothic16, "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'East Sea Dokdo',
    value: '"East Sea Dokdo", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Gasoek One',
    value: '"Gasoek One", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Hachi Maru Pop',
    value: '"Hachi Maru Pop", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Jolly Lodger',
    value: '"Jolly Lodger", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Kaisei Decol',
    value: '"Kaisei Decol", "Noto Serif KR", "Noto Serif JP", "Noto Serif SC", serif',
    requiresLoad: true,
  },
  {
    label: 'LXGW WenKai Mono TC',
    value: '"LXGW WenKai Mono TC", "Noto Sans TC", "Noto Sans KR", "Noto Sans JP", monospace',
    requiresLoad: true,
  },
  {
    label: 'Luckiest Guy',
    value: '"Luckiest Guy", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Ma Shan Zheng',
    value: '"Ma Shan Zheng", "Noto Sans SC", "Noto Sans TC", "Noto Sans KR", cursive',
    requiresLoad: true,
  },
  {
    label: 'Monoton',
    value: 'Monoton, "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans JP',
    value: '"Noto Sans JP", "Noto Sans KR", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans KR',
    value: '"Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans SC',
    value: '"Noto Sans SC", "Noto Sans TC", "Noto Sans KR", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans TC',
    value: '"Noto Sans TC", "Noto Sans SC", "Noto Sans KR", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif JP',
    value: '"Noto Serif JP", "Noto Serif KR", "Noto Serif SC", serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif KR',
    value: '"Noto Serif KR", "Noto Serif JP", "Noto Serif SC", serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif SC',
    value: '"Noto Serif SC", "Noto Serif TC", "Noto Serif KR", serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif TC',
    value: '"Noto Serif TC", "Noto Serif SC", "Noto Serif KR", serif',
    requiresLoad: true,
  },
  {
    label: 'Purple Purse',
    value: '"Purple Purse", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Rampart One',
    value: '"Rampart One", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Rubik Puddles',
    value: '"Rubik Puddles", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", display',
    requiresLoad: true,
  },
  {
    label: 'Shadows Into Light',
    value: '"Shadows Into Light", "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", cursive',
    requiresLoad: true,
  },
  {
    label: 'Stick',
    value: 'Stick, "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Zen Antique',
    value: '"Zen Antique", "Noto Serif KR", "Noto Serif JP", "Noto Serif SC", serif',
    requiresLoad: true,
  },
];

/**
 * 기본 폰트 패밀리
 */
export const DEFAULT_FONT_FAMILY = AVAILABLE_FONTS[0]?.value || 'Arial, Helvetica, sans-serif';

/**
 * 폰트 label로 실제 CSS value 찾기
 */
export function getFontValue(label: string): string {
  const FONT = AVAILABLE_FONTS.find((f) => f.label === label);
  return FONT?.value || DEFAULT_FONT_FAMILY;
}

/**
 * 폰트 value로 label 찾기 (역변환)
 */
export function getFontLabel(value: string): string {
  const FONT = AVAILABLE_FONTS.find((f) => f.value === value);
  return FONT?.label || AVAILABLE_FONTS[0]?.label || 'Arial';
}
