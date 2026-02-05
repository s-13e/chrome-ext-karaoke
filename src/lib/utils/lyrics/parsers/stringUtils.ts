/**
 * stringUtils.ts - 범용 문자열 유틸리티
 *
 * [역할]
 * - 문자열 전처리 및 정제 함수들 (cleanUp, removeExtraInfo 등)
 * - 영어 텍스트 판별 (isEnglishText)
 * - 아티스트/타이틀 전처리 (preprocessArtistOrTitle)
 * - extractArtistAndTitleCustom: parseTitle 래퍼 (하위 호환용)
 *
 * [titlePatterns.ts와의 차이]
 * - stringUtils.ts: 범용 문자열 유틸리티 (다른 모듈에서도 사용)
 * - titlePatterns.ts: Title 파싱 전용 패턴 정의 + parseTitle 함수
 *
 * [의존성]
 * - titlePatterns.ts를 import (parseTitle, TitleParseResult)
 * - titlePatterns.ts는 이 파일을 import하지 않음 (순환 참조 방지)
 */

import { EXTRA_KEYWORDS } from '@constants/keywords';
import { parseTitle } from './titlePatterns';

const TRAILING_DELIMITERS_REGEX = /[\s\-/|]+$/;
const emojiRegex = /\p{Extended_Pictographic}/u;

// Re-export for external use
export type { TitleParseResult } from './titlePatterns';
export { parseTitle } from './titlePatterns';

// -----------------------------
// Exported utility functions
// -----------------------------

// 영어 여부 판단 함수 (공백, 하이픈, 작은따옴표 포함)
export function isEnglishText(text: string): boolean {
  return /^[A-Za-z\s\-'/]+$/.test(text); // 슬래시(/)도 허용
}

/**
 * 문자열을 Title Case로 변환 (각 단어의 첫 글자를 대문자로)
 * 특수 케이스:
 * - 이미 모두 대문자인 단어는 그대로 유지 (예: "BTS", "ABBA")
 * - 소문자나 Mixed case는 Title Case로 변환 (예: "aimyon" → "Aimyon")
 *
 * @example
 * toTitleCase("aimyon") → "Aimyon"
 * toTitleCase("rick astley") → "Rick Astley"
 * toTitleCase("BTS") → "BTS" (유지)
 * toTitleCase("ABBA") → "ABBA" (유지)
 */
export function toTitleCase(str: string): string {
  if (!str) return str;

  return str
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;

      // 단어가 2글자 이상이고 모두 대문자인 경우 그대로 유지
      // 예: "BTS", "ABBA", "USA"
      if (word.length >= 2 && word === word.toUpperCase()) {
        return word;
      }

      // 그 외의 경우 Title Case로 변환
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// &를 and로 대체

// 유튜브 DATA API를 통해 나온 음악 타이틀에서 Topic을 제거함
export function cleanTopicName(name: string): string {
  let result = name;

  // 앞쪽 접두사 "Topic - "
  result = result.replace(/^topic\s*-\s*/i, '');

  // 뒤쪽 접미사 " - Topic"
  result = result.replace(/\s*-\s*topic$/i, '');

  return result.trim();
}
/**
 * 중복 괄호 패턴 제거
 * 괄호 안의 내용이 괄호 앞의 내용과 동일하거나 유사하면 괄호 부분 제거
 * 예: "Kitsch (Kitsch)" → "Kitsch"
 * 예: "HEYA (HEYA)" → "HEYA"
 * 예: "Love (Love Song)" → "Love (Love Song)" (유지 - 다른 내용)
 */
function removeDuplicateParentheses(str: string): string {
  // 패턴: "텍스트 (괄호내용)" 형태에서 괄호 앞 텍스트와 괄호 안 내용 비교
  const pattern = /^(.+?)\s*\(([^)]+)\)\s*$/;
  const match = str.match(pattern);

  if (match && match[1] && match[2]) {
    const outside = match[1].trim().toLowerCase();
    const inside = match[2].trim().toLowerCase();

    // 괄호 안 내용이 바깥 내용과 동일하면 괄호 제거
    if (outside === inside) {
      return match[1].trim();
    }
  }

  return str;
}

/**
 * 문자열에서 부가정보(괄호, 대괄호, 파이프 등)를 제거합니다.
 */
export function cleanUp(str: string): string {
  let result = str
    .replace(/[「」『』]/g, ' ') // 일본어 쌍따옴표를 공백으로 변환
    .replace(/\[.*?\]/g, '') // 대괄호 제거
    .replace(/\\s{2,}/g, ' ') // 이중 공백 정리
    .trim();

  // 중복 괄호 제거 (예: "Kitsch (Kitsch)" → "Kitsch")
  result = removeDuplicateParentheses(result);

  return result;
}

/**
 * 커스텀 title 파싱 (패턴 기반)
 *
 * 패턴 배열을 순회하며 YouTube 영상 제목에서 artist/title 추출
 * @param rawTitle 원본 YouTube 영상 제목
 * @returns 파싱 결과 또는 null (채널명 fallback 필요)
 */
export function extractArtistAndTitleCustom(
  rawTitle: string,
): { artist: string; title: string; artistVariants?: string[]; patternUsed?: string; skipSwap?: boolean } | null {
  const result = parseTitle(rawTitle);

  if (!result) return null;

  // artist가 null이면 채널명 fallback 필요
  if (result.artist === null) {
    return null;
  }

  return {
    artist: result.artist,
    title: result.title,
    artistVariants: result.artistVariants,
    patternUsed: result.patternUsed,
    skipSwap: result.skipSwap,
  };
}

// preprocessing for artist or title string: clean up + extract English only + trim trailing delimiters
export function preprocessArtistOrTitle(str: string): string {
  let s = cleanUp(str);
  s = removeEmptyBrackets(s);
  s = preprocessTitleOrArtist(s);
  s = trimTrailingDelimiters(s);
  s = replaceAmpersand(s, 'and');
  return s;
}

/**
 * 제목에서 이모지+콜론(:) 패턴 있으면
 * ":" 기준으로 앞부분 제거 후 뒷부분 반환
 * 이모지 없거나 ":" 없으면 원본 반환
 */
export function stripEmojiAndBeforeColon(title: string): string {
  if (!title) return '';

  if (!hasEmoji(title)) {
    return title.trim();
  }

  const colonIndex = title.indexOf(':');
  if (colonIndex === -1) {
    return title.trim();
  }

  // 콜론 기준 앞부분 제거, 뒷부분만 반환
  const sliced = title.slice(colonIndex + 1);
  return sliced.trim();
}

// -----------------------------
// Internal helper functions (non-exported)
// -----------------------------

// 괄호 안 내용 중에 피처링 키워드 포함시 괄호 포함 제거
// 예: (ft. Madison Beer), (feat Artist), (featuring Someone)
function removeFeaturingParentheses(str: string): string {
  const stack: number[] = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') {
      stack.push(i);
    } else if (str[i] === ')') {
      if (stack.length > 0) {
        const start = stack.pop()!;
        const content = str.slice(start + 1, i);
        // 피처링 키워드 여부 검사
        if (/(ft\.|feat\.?|featuring)/i.test(content)) {
          // 삭제: start부터 i까지를 빈 문자열로 replace 할 수 있게 큐에 기록
          // 삭제 처리는 후순위에서 수행하도록 함
          str = str.slice(0, start) + str.slice(i + 1);
          i = start - 1; // 인덱스 조정
        }
      }
    }
  }
  return str.trim();
}
// 키워드 정제, 부가정보 제거
export function removeExtraInfo(str: string): string {
  const extraKeywords = EXTRA_KEYWORDS.slice().sort((a, b) => b.length - a.length); // 긴 키워드 우선
  let result = str;

  // 0-1. 트랙 번호 제거 (구분자 . 만 사용)
  // 예: "01. REBEL HEART" → "REBEL HEART"
  // 예: "Track 5. Song Name" → "Song Name"
  // 정상 타이틀 보호: "24K Magic", "7 Rings", "3005" 등은 영향 없음
  result = result.replace(/^\d{1,3}\.\s*/, '').trim(); // 숫자 1~3자리 + . + 공백(선택)
  result = result.replace(/^Track\s+\d+\.\s*/i, '').trim(); // Track + 숫자 + . + 공백(선택)

  // 0-2. 사운드트랙 참조 제거: (From "Movie Name"), (From 'Movie Name'), (From Movie Name)
  // 예: "Zoo (From "Zootopia 2")" → "Zoo"
  // 예: "Zoo (From Zootopia 2)" → "Zoo"
  result = result.replace(/\s*\(From\s+["'"][^"'"]+["'"]\)/gi, '').trim(); // 따옴표 있는 경우
  result = result.replace(/\s*\[From\s+["'"][^"'"]+["'"]\]/gi, '').trim(); // 대괄호 + 따옴표
  result = result.replace(/\s*\(From\s+[^)]+\)/gi, '').trim(); // 따옴표 없는 경우
  result = result.replace(/\s*\[From\s+[^\]]+\]/gi, '').trim(); // 대괄호 + 따옴표 없음

  // 0-3. 프로듀서 크레딧 제거: Prod. @username, Prod. Name, Produced by Name
  // 예: "Pal Pal Prod. @AliSoomroMusic" → "Pal Pal"
  // 예: "Song Produced by Metro Boomin" → "Song"
  result = result.replace(/\s*Prod\.?\s*[@\u200b]?[\w\u0080-\uFFFF]+/gi, '').trim();
  result = result.replace(/\s*Produced\s+by\s+[@\u200b]?[\w\u0080-\uFFFF]+/gi, '').trim();

  // 0. 괄호 안에 EXTRA_KEYWORDS만 있는 경우 괄호 전체 제거
  // 예: "Blue Valentine (Inst.)" → "Blue Valentine"
  for (const kw of extraKeywords) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parenRegex = new RegExp(`\\s*\\(\\s*${escapedKw}\\s*\\)`, 'gi');
    result = result.replace(parenRegex, '').trim();
  }

  // 1. 괄호 안 피처링 정보(ft., feat, featuring)만 제거
  result = removeFeaturingParentheses(result);

  // 2. 복합 키워드(공백/특수문자 포함) 전체 제거
  for (const kw of extraKeywords) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 키워드가 특수문자 포함 가능하므로 escape 처리
    const regex = new RegExp(`(\\s*${escapedKw})`, 'gi');
    result = result.replace(regex, '').trim();
  }

  // 3. 구분자(-, /, |) 기준 분할 후, 끝부분 부가 키워드 포함 파트 제거
  const parts = result.split(/\s[-/|]\s/);
  while (
    parts.length > 1 &&
    extraKeywords.some((kw) => parts[parts.length - 1]?.toLowerCase().includes(kw.toLowerCase()))
  ) {
    parts.pop();
  }

  // 4. 조합한 결과 문자열로 재설정
  result = parts.join(' - ');

  // 5. 반복적으로 문자열 끝에 부가 키워드 남아있는지 검사해서 제거
  let found = true;
  while (found) {
    found = false;
    for (const kw of extraKeywords) {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(\\s*${escapedKw})$`, 'i'); // 끝에 위치한 키워드 제거
      if (regex.test(result)) {
        result = result.replace(regex, '').trim();
        found = true;
      }
    }
  }
  return result;
}
// 제목에서 아이콘(이모지) 존재 여부 확인
function hasEmoji(text: string): boolean {
  return emojiRegex.test(text);
}

// 빈 괄호 제거
function removeEmptyBrackets(str: string): string {
  return str
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\{\s*\}/g, '')
    .trim();
}
// 문자열 끝의 불필요한 구분자(공백, -, /, |) 제거
function trimTrailingDelimiters(str: string): string {
  return str.replace(TRAILING_DELIMITERS_REGEX, '').trim();
}

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function replaceAmpersand(str: string, replacement: string = 'and') {
  // 양쪽 공백을 유지하며 &를 " and "로 치환 (또는 필요시 ',')
  return str
    .replace(/\s*&\s*/g, ` ${replacement} `)
    .replace(/\s{2,}/g, ' ')
    .trim();
}
// 최상위 전처리 파이프라인 함수
function preprocessTitleOrArtist(str: string): string {
  // 1) 합성문자 NFC 통일
  const normalized = str.normalize('NFC');

  // 2) 악센트 제거
  const noDiacritics = removeDiacritics(normalized);

  // 3) 악센트 제거된 문자열 넘겨서 영어 추출 및 특수문자 정리
  const result = extractEnglishOnly(noDiacritics);

  // 4) 한글이 포함된 경우 NFC로 재정규화 (removeDiacritics가 NFD로 변환하므로)
  //    URL 인코딩 시 NFD는 자소 분리되어 API 검색 실패함
  return result.normalize('NFC');
}

function extractEnglishOnly(str: string): string {
  const LETTERS = 'A-Za-z'; // 악센트 제거 후라 기본 알파벳만 사용
  const hasEnglish = new RegExp(`[${LETTERS}]`).test(str);
  // 악센트 제거 후 비교를 위해 미리 처리
  const strNoDiacritics = removeDiacritics(str);

  // 비영문자 검사 - 악센트 제거 전 원본에서 처리
  const hasNonEnglish = new RegExp(`[^\\s${LETTERS}0-9'’&.,-]`).test(strNoDiacritics);

  if (hasEnglish && hasNonEnglish) {
    // 원본에서 악센트 제거한 문자를 토큰화 (공백, 특수문자 포함)
    const processedStr = removeDiacritics(str);
    const match = processedStr.match(new RegExp(`([${LETTERS}][${LETTERS}\\s'’./-]*|&|,)`, 'g'));
    let result = match ? match.join(' ').trim() : '';

    // 쉼표 앞뒤 공백 정리
    result = result.replace(/\s+,/g, ',');
    result = result.replace(/,\s+/g, ', ');

    return result;
  }
  return str;
}
