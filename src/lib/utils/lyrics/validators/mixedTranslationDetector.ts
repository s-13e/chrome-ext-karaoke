/**
 * 원문+번역 혼합 가사 감지기
 * 한 줄에 원문과 영문 번역이 함께 있는 가사를 감지
 *
 * 예시:
 * - 혼합: "나를 그냥 짓밟고 가^Just trample over me"
 * - 혼합: "내가 아파봤자 너만 하겠니 / My pain is nothing compared to yours"
 * - 정상: "나를 그냥 짓밟고 가"
 */

/**
 * 혼합 가사에서 자주 사용되는 구분자 패턴
 * ^, /, |, // 등
 */
const TRANSLATION_SEPARATORS = ['^', ' / ', ' | ', ' // ', ' ~ '];

/**
 * 비ASCII 문자 (한글, 한자, 일본어 등) 포함 여부 체크
 * ASCII 범위: 0-127 (charCode)
 */
function hasNonAscii(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) return true;
  }
  return false;
}

/**
 * ASCII 문자만 있는지 체크 (영어)
 * ASCII 범위: 0-127 (charCode)
 */
function isAsciiOnly(text: string): boolean {
  if (text.length === 0) return false;
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) return false;
  }
  return true;
}

/**
 * 원문+번역 혼합 가사인지 감지
 *
 * @param lyrics - LRC 형식 가사 문자열
 * @returns true: 혼합 가사로 판단, false: 정상 가사
 *
 * 감지 로직:
 * 1. 구분자(^, /, | 등)로 분리
 * 2. 앞부분: 비ASCII (한글/일본어/중국어 등)
 * 3. 뒷부분: ASCII only (영어)
 * → 이 패턴이 여러 줄에서 반복되면 혼합 가사
 */
export function hasMixedTranslation(lyrics: string): boolean {
  if (!lyrics || typeof lyrics !== 'string') return false;

  try {
    // 처음 15줄 샘플링 (타임스탬프 제거 후)
    const lines = lyrics
      .split('\n')
      .slice(0, 15)
      .map((line) => line.replace(/^\[\d{1,2}:\d{2}\.\d{2,3}\]\s*/, '').trim())
      .filter((line) => line.length > 5); // 너무 짧은 줄 제외

    if (lines.length === 0) return false;

    let mixedLineCount = 0;

    for (const line of lines) {
      // 각 구분자로 테스트
      for (const separator of TRANSLATION_SEPARATORS) {
        if (line.includes(separator)) {
          const parts = line.split(separator);
          if (parts.length >= 2) {
            const firstPart = parts[0]?.trim() ?? '';
            const secondPart = parts.slice(1).join(separator).trim();

            // 첫 부분에 비ASCII, 두번째 부분이 ASCII only면 혼합
            if (firstPart.length > 0 && secondPart.length > 0 && hasNonAscii(firstPart) && isAsciiOnly(secondPart)) {
              mixedLineCount++;
              break; // 이 줄은 혼합으로 판정됨
            }
          }
        }
      }
    }

    // 샘플 중 30% 이상이 혼합 형식이면 혼합 가사로 판단
    const isMixed = mixedLineCount / lines.length > 0.3;

    if (isMixed) {
      console.log(`[Mixed Translation Check] ⚠️ 혼합 가사 감지 (${mixedLineCount}/${lines.length} 라인)`);
    }

    return isMixed;
  } catch (error) {
    console.warn('[Mixed Translation Check] ❌ 처리 실패:', error);
    return false;
  }
}

/**
 * 혼합 가사에서 번역 부분을 제거하여 원문만 추출
 *
 * @param lyrics - 혼합 가사 문자열
 * @returns 원문만 남은 가사 문자열
 *
 * 예시:
 * - 입력: "[00:05.31] 나를 그냥 짓밟고 가^Just trample over me"
 * - 출력: "[00:05.31] 나를 그냥 짓밟고 가"
 */
export function removeTranslation(lyrics: string): string {
  if (!lyrics || typeof lyrics !== 'string') return lyrics;

  try {
    return lyrics
      .split('\n')
      .map((line) => {
        // 타임스탬프 추출
        const timestampMatch = line.match(/^(\[\d{1,2}:\d{2}\.\d{2,3}\])\s*/);
        const timestamp = timestampMatch ? timestampMatch[1] : '';
        const content = timestampMatch ? line.slice(timestampMatch[0].length) : line;

        // 각 구분자로 분리 시도
        for (const separator of TRANSLATION_SEPARATORS) {
          if (content.includes(separator)) {
            const parts = content.split(separator);
            if (parts.length >= 2) {
              const firstPart = parts[0]?.trim() ?? '';
              const secondPart = parts.slice(1).join(separator).trim();

              // 첫 부분에 비ASCII, 두번째 부분이 ASCII only면 번역 제거
              if (hasNonAscii(firstPart) && isAsciiOnly(secondPart)) {
                return `${timestamp} ${firstPart}`.trim();
              }
            }
          }
        }

        return line; // 변경 없음
      })
      .join('\n');
  } catch (error) {
    console.warn('[Mixed Translation Clean] ❌ 처리 실패:', error);
    return lyrics;
  }
}
