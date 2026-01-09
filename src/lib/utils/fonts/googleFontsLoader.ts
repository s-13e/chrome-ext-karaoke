/**
 * Google Fonts 동적 로더
 * Google Fonts API를 사용하여 필요한 폰트만 런타임에 로드
 *
 * 장점:
 * - 확장 프로그램 용량 증가 없음 (CDN에서 로드)
 * - 사용자가 선택한 폰트만 로드 (효율적)
 * - Google CDN 캐싱 활용
 */

// 이미 로드된 폰트를 추적
const loadedFonts = new Set<string>();

/**
 * Google Fonts를 동적으로 로드
 * @param fontFamily - 폰트 이름 (예: "Noto Sans KR", "Roboto")
 */
export function loadGoogleFont(fontFamily: string): void {
  // 이미 로드된 폰트는 스킵
  if (loadedFonts.has(fontFamily)) {
    return;
  }

  // 폰트 이름에서 따옴표 제거 및 공백을 +로 변환
  const cleanFontName = fontFamily.replace(/['"]/g, '').trim();
  const encodedFontName = cleanFontName.replace(/ /g, '+');

  // Google Fonts API URL 생성
  // display=swap: 폰트 로딩 중에도 텍스트가 보이도록 함 (FOIT 방지)
  // wght@100..900: 모든 weight 지원
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFontName}:wght@100;200;300;400;500;600;700;800;900&display=swap`;

  // link 태그 생성 및 추가
  const link = document.createElement('link');
  link.href = fontUrl;
  link.rel = 'stylesheet';
  link.crossOrigin = 'anonymous'; // CORS 이슈 방지

  // 로드 실패 이벤트
  link.onerror = () => {
    // eslint-disable-next-line no-console
    console.error(`[GoogleFontsLoader] Failed to load: ${cleanFontName}`);
    loadedFonts.delete(fontFamily); // 실패 시 재시도 가능하도록 제거
  };

  document.head.appendChild(link);
  loadedFonts.add(fontFamily);
}

/**
 * font-family 문자열에서 첫 번째 폰트를 추출하여 로드
 * @param fontFamilyValue - CSS font-family 값 (예: '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif')
 */
export function loadFontFromFamilyString(fontFamilyValue: string): void {
  // font-family 문자열에서 첫 번째 폰트 추출
  const firstFont = fontFamilyValue.split(',')[0]?.trim();

  if (!firstFont) {
    return;
  }

  // 시스템 폰트는 로드하지 않음
  const systemFonts = ['Arial', 'Helvetica', 'sans-serif', 'serif', 'monospace'];
  const cleanFont = firstFont.replace(/['"]/g, '');

  if (systemFonts.includes(cleanFont)) {
    return;
  }

  loadGoogleFont(cleanFont);
}

/**
 * 로드된 폰트 목록 확인 (디버깅용)
 */
export function getLoadedFonts(): string[] {
  return Array.from(loadedFonts);
}

/**
 * 특정 폰트가 로드되었는지 확인
 */
export function isFontLoaded(fontFamily: string): boolean {
  return loadedFonts.has(fontFamily);
}
