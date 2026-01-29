/**
 * 가사 스타일 타입 정의
 * Lyrics style type definitions
 */

/**
 * Linear Gradient 옵션 (Phase 1)
 */
export interface LinearGradientOptions {
  enabled: boolean;
  color1: string;
  color2: string;
  direction: 'right' | 'left' | 'down' | 'up'; // 오른쪽, 왼쪽, 아래, 위
}

/**
 * 텍스트 스타일 옵션
 */
export interface TextStyleOptions {
  color?: string;
  fontWeight?: number | string;
  fontFamily?: string;
  textShadow?: string;
  fontSize?: string | number;
  opacity?: number;
  transition?: string;
  transform?: string;
  background?: string;
  backgroundImage?: string;
  backgroundClip?: string;
  webkitBackgroundClip?: string;
  webkitTextFillColor?: string;
  WebkitBackgroundClip?: string;
  WebkitTextFillColor?: string;
  WebkitTextStroke?: string;
  filter?: string;
  animation?: string;
  // Linear Gradient 효과
  linearGradient?: LinearGradientOptions;
}

/**
 * 가사/발음 스타일 상태
 */
export interface LyricsTextState {
  // 기본 상태 (dual: 아직 타임스탬프 전, full: 현재 재생 아님)
  default?: TextStyleOptions;
  // 하이라이트 상태 (현재 재생 중)
  highlight?: TextStyleOptions;
}

/**
 * 전역 스타일 설정 (모든 가사 타입에 공통 적용)
 */
export interface GlobalLyricsStyleConfig {
  // 전역 가사 스타일
  lyrics?: LyricsTextState;
  // 전역 발음 스타일
  pronunciation?: LyricsTextState;
  // 발음이 메인을 대체할 때 스타일
  pronunciationAsMain?: LyricsTextState;
}

/**
 * DualHighlightLyrics 개별 스타일 설정
 */
export interface DualHighlightLyricsStyleConfig {
  // 가사 스타일 (전역 스타일 오버라이드)
  lyrics?: LyricsTextState;
  // 발음 스타일 (전역 스타일 오버라이드)
  pronunciation?: LyricsTextState;
  // 발음이 메인을 대체할 때 하이라이트 활성화 여부
  pronunciationAsMainHighlight?: boolean;
}

/**
 * FullLyrics 개별 스타일 설정
 */
export interface FullLyricsStyleConfig {
  // 가사 스타일 (전역 스타일 오버라이드)
  lyrics?: LyricsTextState;
  // 발음 스타일 (전역 스타일 오버라이드)
  pronunciation?: LyricsTextState;
  // 발음이 메인을 대체할 때 하이라이트 활성화 여부
  pronunciationAsMainHighlight?: boolean;
}

/**
 * SingleLineLyrics 개별 스타일 설정
 * single은 기본/하이라이트 구분 없음
 */
export interface SingleLineLyricsStyleConfig {
  // 가사 스타일 (전역 스타일 오버라이드)
  lyrics?: TextStyleOptions;
  // 발음 스타일 (전역 스타일 오버라이드)
  pronunciation?: TextStyleOptions;
}

/**
 * 카운트다운 스타일 설정
 */
export interface CountdownStyleConfig {
  // 카운트다운 활성화 여부
  enabled: boolean;
  // 카운트다운 색상
  color: string;
  // 카운트다운 폰트 크기 (px)
  fontSize: number;
}

/**
 * 가사 위치 설정
 */
export interface LyricsPositionConfig {
  // 하단 여백 (px)
  bottom: number;
}

/**
 * General 설정 (모든 가사 타입에 공통 적용)
 */
export interface GeneralLyricsSettings {
  // 카운트다운 설정
  countdown: CountdownStyleConfig;
  // 가사 위치 설정
  position: {
    dual: LyricsPositionConfig;
    single: LyricsPositionConfig;
  };
  // Full 모드 배경 설정
  fullBackground: {
    // 배경 투명도 (0-1)
    opacity: number;
  };
}

/**
 * 가사 스타일 프리셋
 */
export interface LyricsPreset {
  // 프리셋 이름
  name: string;
  // Dual 스타일 설정
  dual: Partial<DualHighlightLyricsStyleConfig>;
  // Single 스타일 설정
  single: Partial<SingleLineLyricsStyleConfig>;
  // Full 스타일 설정
  full: Partial<FullLyricsStyleConfig>;
  // General 설정
  general: Partial<GeneralLyricsSettings>;
}
