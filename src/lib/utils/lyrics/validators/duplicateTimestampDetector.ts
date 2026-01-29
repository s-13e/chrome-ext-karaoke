/**
 * Enhanced LRC (단어별 타임스탬프) 감지기
 * 일반 LRC 타임스탬프 외에 단어별 타임스탬프가 포함된 가사를 감지
 *
 * 예시:
 * - Enhanced LRC: "[00:00.00] <00:00.00> E <00:00.54> -ela <00:01.06> desce"
 * - 일반 LRC: "[00:00.00] E-ela desce, ela sobe"
 */

/**
 * Enhanced LRC 타임스탬프 패턴
 * <MM:SS.ms> 또는 <M:SS.ms> 형식
 */
const ENHANCED_TIMESTAMP_REGEX = /<\d{1,2}:\d{2}\.\d{2,3}>/g;

/**
 * Enhanced LRC (단어별 타임스탬프) 가사인지 감지
 *
 * @param lyrics - LRC 형식 가사 문자열
 * @returns true: Enhanced LRC로 판단, false: 일반 LRC
 */
export function hasEnhancedTimestamps(lyrics: string): boolean {
  if (!lyrics || typeof lyrics !== 'string') return false;

  try {
    // 처음 10줄만 샘플링
    const lines = lyrics.split('\n').slice(0, 10);

    // 단어별 타임스탬프 <MM:SS.ms> 패턴이 있는 라인 수 카운트
    let enhancedLineCount = 0;

    for (const line of lines) {
      const matches = line.match(ENHANCED_TIMESTAMP_REGEX);
      if (matches && matches.length >= 2) {
        // 한 줄에 2개 이상의 <> 타임스탬프가 있으면 Enhanced LRC
        enhancedLineCount++;
      }
    }

    // 샘플 중 30% 이상이 Enhanced 형식이면 Enhanced LRC로 판단
    const isEnhanced = enhancedLineCount / lines.length > 0.3;

    if (isEnhanced) {
      console.log(`[Enhanced LRC Check] ⚠️ Enhanced LRC 감지 (${enhancedLineCount}/${lines.length} 라인)`);
    }

    return isEnhanced;
  } catch (error) {
    console.warn('[Enhanced LRC Check] ❌ 처리 실패:', error);
    return false;
  }
}

/**
 * Enhanced LRC에서 단어별 타임스탬프를 제거하여 일반 LRC로 변환
 *
 * @param lyrics - Enhanced LRC 형식 가사 문자열
 * @returns 일반 LRC 형식 가사 문자열
 *
 * 예시:
 * - 입력: "[00:00.00] <00:00.00> E <00:00.54> -ela <00:01.06> desce"
 * - 출력: "[00:00.00] E -ela desce"
 */
export function removeEnhancedTimestamps(lyrics: string): string {
  if (!lyrics || typeof lyrics !== 'string') return lyrics;

  try {
    return lyrics
      .split('\n')
      .map((line) => {
        // <MM:SS.ms> 패턴 제거
        let cleaned = line.replace(ENHANCED_TIMESTAMP_REGEX, '');
        // 연속 공백 정리
        cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
        // 라인 시작 타임스탬프 뒤 공백 정리
        cleaned = cleaned.replace(/^(\[\d{1,2}:\d{2}\.\d{2,3}\])\s*/, '$1 ');
        return cleaned;
      })
      .join('\n');
  } catch (error) {
    console.warn('[Enhanced LRC Clean] ❌ 처리 실패:', error);
    return lyrics;
  }
}
