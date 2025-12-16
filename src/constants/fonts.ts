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
    value: 'Arial, Helvetica, sans-serif',
  },
  // Google Fonts - 알파벳순 정렬
  {
    label: 'Cherry Bomb One',
    value: '"Cherry Bomb One", cursive',
    requiresLoad: true,
  },
  {
    label: 'Dancing Script',
    value: '"Dancing Script", cursive',
    requiresLoad: true,
  },
  {
    label: 'Dela Gothic One',
    value: '"Dela Gothic One", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Diphylleia',
    value: 'Diphylleia, serif',
    requiresLoad: true,
  },
  {
    label: 'Do Hyeon',
    value: '"Do Hyeon", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'DotGothic16',
    value: 'DotGothic16, sans-serif',
    requiresLoad: true,
  },
  {
    label: 'East Sea Dokdo',
    value: '"East Sea Dokdo", cursive',
    requiresLoad: true,
  },
  {
    label: 'Gasoek One',
    value: '"Gasoek One", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Hachi Maru Pop',
    value: '"Hachi Maru Pop", cursive',
    requiresLoad: true,
  },
  {
    label: 'Jolly Lodger',
    value: '"Jolly Lodger", cursive',
    requiresLoad: true,
  },
  {
    label: 'Kaisei Decol',
    value: '"Kaisei Decol", serif',
    requiresLoad: true,
  },
  {
    label: 'LXGW WenKai Mono TC',
    value: '"LXGW WenKai Mono TC", monospace',
    requiresLoad: true,
  },
  {
    label: 'Luckiest Guy',
    value: '"Luckiest Guy", cursive',
    requiresLoad: true,
  },
  {
    label: 'Ma Shan Zheng',
    value: '"Ma Shan Zheng", cursive',
    requiresLoad: true,
  },
  {
    label: 'Monoton',
    value: 'Monoton, cursive',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans JP',
    value: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans KR',
    value: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans SC',
    value: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Sans TC',
    value: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif JP',
    value: '"Noto Serif JP", "Hiragino Mincho ProN", serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif KR',
    value: '"Noto Serif KR", "Apple Myungjo", serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif SC',
    value: '"Noto Serif SC", "Songti SC", serif',
    requiresLoad: true,
  },
  {
    label: 'Noto Serif TC',
    value: '"Noto Serif TC", "Songti TC", serif',
    requiresLoad: true,
  },
  {
    label: 'Purple Purse',
    value: '"Purple Purse", cursive',
    requiresLoad: true,
  },
  {
    label: 'Rampart One',
    value: '"Rampart One", cursive',
    requiresLoad: true,
  },
  {
    label: 'Rubik Puddles',
    value: '"Rubik Puddles", display',
    requiresLoad: true,
  },
  {
    label: 'Shadows Into Light',
    value: '"Shadows Into Light", cursive',
    requiresLoad: true,
  },
  {
    label: 'Stick',
    value: 'Stick, sans-serif',
    requiresLoad: true,
  },
  {
    label: 'Zen Antique',
    value: '"Zen Antique", serif',
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
