/**
 * titlePatterns.ts - Title 파싱 패턴 정의
 *
 * [역할]
 * - YouTube 영상 제목에서 artist/title을 추출하기 위한 패턴들을 정의
 * - 패턴 배열의 순서가 우선순위를 결정
 * - 각 패턴은 독립적인 정규식과 추출 로직을 가짐
 *
 * [stringUtils.ts와의 차이]
 * - titlePatterns.ts: 패턴 정의 + 패턴 매칭 로직 (parseTitle)
 * - stringUtils.ts: 범용 문자열 유틸리티 + extractArtistAndTitleCustom (parseTitle 래퍼)
 *
 * [주의]
 * - 이 파일은 stringUtils.ts를 import하지 않음 (순환 참조 방지)
 * - 필요한 유틸 함수는 이 파일 내부에 정의
 */

import { EXTRA_KEYWORDS } from '@constants/keywords';

// ================================
// Types
// ================================

/**
 * Title 파싱 결과
 */
export interface TitleParseResult {
  artist: string | null;
  title: string;
  artistVariants?: string[];
  patternUsed: string;
  skipSwap: boolean;
}

/**
 * Title 파싱 패턴 정의
 */
export interface TitlePattern {
  /** 패턴 식별자 (디버깅용) */
  name: string;
  /** 매칭 정규식 */
  regex: RegExp;
  /** 매칭 결과에서 artist/title 추출 */
  extract: (match: RegExpMatchArray, rawTitle: string, cleanedTitle: string) => TitleParseResult | null;
  /** true면 artist/title 순서 뒤집기 시도 스킵 */
  skipSwap: boolean;
  /** true면 cleanUp() 적용 후 매칭, false면 rawTitle에 매칭 */
  requiresCleanup: boolean;
  /** true면 null 반환하여 채널명 fallback 유도 */
  returnNull: boolean;
}

// ================================
// Internal Helper Functions (순환 참조 방지용)
// ================================

/**
 * 영어 여부 판단 (공백, 하이픈, 작은따옴표, 슬래시 포함)
 */
function isEnglishText(text: string): boolean {
  return /^[A-Za-z\s\-'/]+$/.test(text);
}

/**
 * 텍스트의 영어 비율 계산 (0~100)
 */
function getEnglishRatio(text: string): number {
  if (!text) return 0;
  const englishChars = (text.match(/[A-Za-z]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 ? (englishChars / totalChars) * 100 : 0;
}

/**
 * 중복 괄호 패턴 제거
 * 예: "Kitsch (Kitsch)" → "Kitsch"
 */
function removeDuplicateParentheses(str: string): string {
  const pattern = /^(.+?)\s*\(([^)]+)\)\s*$/;
  const match = str.match(pattern);

  if (match && match[1] && match[2]) {
    const outside = match[1].trim().toLowerCase();
    const inside = match[2].trim().toLowerCase();
    if (outside === inside) {
      return match[1].trim();
    }
  }
  return str;
}

/**
 * 문자열에서 부가정보(괄호, 대괄호 등)를 제거
 */
function cleanUp(str: string): string {
  let result = str
    .replace(/[「」『』]/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  result = removeDuplicateParentheses(result);
  return result;
}

/**
 * 피처링 정보 괄호 제거
 */
function removeFeaturingParentheses(str: string): string {
  const stack: number[] = [];
  let result = str;

  for (let i = 0; i < result.length; i++) {
    if (result[i] === '(') {
      stack.push(i);
    } else if (result[i] === ')') {
      if (stack.length > 0) {
        const start = stack.pop()!;
        const content = result.slice(start + 1, i);
        if (/(ft\.|feat\.?|featuring)/i.test(content)) {
          result = result.slice(0, start) + result.slice(i + 1);
          i = start - 1;
        }
      }
    }
  }
  return result.trim();
}

/**
 * 피처링 정보 제거 (괄호 밖 포함)
 * 예: "Let Me Love You ft. Justin Bieber" → "Let Me Love You"
 */
function removeFeaturingInfo(str: string): string {
  let result = str;

  // 괄호 안의 피처링 정보 제거
  result = removeFeaturingParentheses(result);

  // 괄호 밖의 피처링 정보 제거
  // ft., feat., featuring 등으로 시작하는 부분부터 끝까지 제거
  result = result.replace(/\s+(ft\.?|feat\.?|featuring|with)\s+.+$/i, '').trim();

  return result;
}

/**
 * 부가정보 키워드 제거 (Official MV, Lyric Video 등)
 */
function removeExtraInfo(str: string): string {
  const extraKeywords = EXTRA_KEYWORDS.slice().sort((a, b) => b.length - a.length);
  let result = str;

  // 트랙 번호 제거
  result = result.replace(/^\d{1,3}\.\s*/, '').trim();
  result = result.replace(/^Track\s+\d+\.\s*/i, '').trim();

  // 사운드트랙 참조 제거
  result = result.replace(/\s*\(From\s+["'"][^"'"]+["'"]\)/gi, '').trim();
  result = result.replace(/\s*\[From\s+["'"][^"'"]+["'"]\]/gi, '').trim();
  result = result.replace(/\s*\(From\s+[^)]+\)/gi, '').trim();
  result = result.replace(/\s*\[From\s+[^\]]+\]/gi, '').trim();

  // 프로듀서 크레딧 제거
  result = result.replace(/\s*Prod\.?\s*[@\u200b]?[\w\u0080-\uFFFF]+/gi, '').trim();
  result = result.replace(/\s*Produced\s+by\s+[@\u200b]?[\w\u0080-\uFFFF]+/gi, '').trim();

  // 괄호 안에 키워드만 있는 경우 제거
  for (const kw of extraKeywords) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parenRegex = new RegExp(`\\s*\\(\\s*${escapedKw}\\s*\\)`, 'gi');
    result = result.replace(parenRegex, '').trim();
  }

  // 피처링 정보 제거 (괄호 안팎 모두)
  result = removeFeaturingInfo(result);

  // 키워드 전체 제거
  for (const kw of extraKeywords) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(\\s*${escapedKw})`, 'gi');
    result = result.replace(regex, '').trim();
  }

  // 구분자 기준 끝부분 키워드 포함 파트 제거
  const parts = result.split(/\s[-/|]\s/);
  while (
    parts.length > 1 &&
    extraKeywords.some((kw) => parts[parts.length - 1]?.toLowerCase().includes(kw.toLowerCase()))
  ) {
    parts.pop();
  }
  result = parts.join(' - ');

  // 끝에 위치한 키워드 반복 제거
  let found = true;
  while (found) {
    found = false;
    for (const kw of extraKeywords) {
      const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(\\s*${escapedKw})$`, 'i');
      if (regex.test(result)) {
        result = result.replace(regex, '').trim();
        found = true;
      }
    }
  }

  // 빈 괄호 제거 (키워드 제거 후 남은 빈 괄호)
  result = result
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\{\s*\}/g, '')
    .trim();

  return result;
}

/**
 * 괄호 안팎의 내용을 모두 추출 (영어 우선)
 * 예: "윤하(YOUNHA)" → ["YOUNHA", "윤하"]
 */
function extractParenthesesVariants(str: string): string[] {
  const variants: string[] = [];
  const parenthesesPattern = /^(.+?)\s*\(([^)]+)\)\s*$/;
  const match = str.match(parenthesesPattern);

  if (match && match[1] && match[2]) {
    const outside = match[1].trim();
    const inside = match[2].trim();

    if (isEnglishText(outside)) {
      variants.push(outside);
      if (inside) variants.push(inside);
    } else if (isEnglishText(inside)) {
      variants.push(inside);
      if (outside) variants.push(outside);
    } else {
      if (outside) variants.push(outside);
      if (inside) variants.push(inside);
    }
  } else {
    variants.push(str);
  }

  return variants;
}

/**
 * 아티스트명 정제 (부가정보 제거)
 */
function cleanArtist(artist: string): string {
  let result = removeExtraInfo(artist);
  result = result
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\{\s*\}/g, '')
    .trim();
  return result;
}

/**
 * 타이틀명 정제 (부가정보, 해시태그, 날짜 제거)
 */
function cleanTitle(title: string): string {
  let result = removeExtraInfo(title);
  result = result.replace(/(\s*#[\p{L}\p{N}._-]+)+\s*$/gu, '').trim();
  result = result.replace(/\b\d{2}[01]\d(?:3[0-2]|[0-2][0-9])\b/g, '').trim();
  return result;
}

/**
 * OP, ED, OST, MV 키워드 제거
 * 주의: 이름(예: Ed Sheeran)과 혼동하지 않도록 끝 위치나 숫자 앞에서만 제거
 */
function cleanMusicKeyword(str: string): string {
  return (
    str
      // 끝 위치에서 키워드 제거: "Song Name ED" → "Song Name"
      .replace(/\s+(OP|ED|OST|MV)\s*$/gi, '')
      // 숫자와 함께 사용된 키워드 제거: "Song OP 1", "Song ED2" → "Song"
      .replace(/\s+(OP|ED|OST|MV)\s*\d+/gi, '')
      .trim()
  );
}

// ================================
// Pattern Definitions
// ================================

export const TITLE_PATTERNS: TitlePattern[] = [
  // ----------------------------------------
  // 1. 일본어 쌍따옴표 패턴 (최우선)
  // 예: YOASOBI「アイドル」 Official Music Video
  // ----------------------------------------
  {
    name: 'japanese-quote',
    regex: /^(.+?)[「『]([^」』]+)[」』]/,
    requiresCleanup: false,
    returnNull: false,
    skipSwap: true,
    extract: (match) => {
      const artist = match[1]?.trim();
      const title = match[2]?.trim();
      if (!artist || !title) return null;

      return {
        artist: cleanArtist(artist),
        title: cleanTitle(title),
        patternUsed: 'japanese-quote',
        skipSwap: true,
      };
    },
  },

  // ----------------------------------------
  // 2. 범용 따옴표 패턴 (모든 따옴표 케이스 처리)
  // 예: aespa 'Rich Man' MV, "Golden" | Song Clip, BLACKPINK - '뛰어(JUMP)' Live
  // ----------------------------------------
  {
    name: 'quoted-title',
    // 따옴표 안의 내용을 타이틀로 추출 (앞뒤 텍스트 무관)
    regex: /^(.*?)['"\u2018\u2019\u201C\u201D]([^'"\u2018\u2019\u201C\u201D]+)['"\u2018\u2019\u201C\u201D]/,
    requiresCleanup: true,
    returnNull: false,
    skipSwap: true,
    extract: (match) => {
      const beforeQuote = match[1]?.trim() ?? ''; // 따옴표 앞 텍스트
      const quotedText = match[2]?.trim() ?? ''; // 따옴표 안 텍스트 (title)

      if (!quotedText) return null;

      // 따옴표 앞 텍스트에서 구분자 제거하여 artist 추출
      let artist: string | null = beforeQuote
        .replace(/[-–—|/]\s*$/g, '') // 끝의 구분자 제거
        .trim();

      // artist가 없으면 null
      if (!artist) {
        artist = null;
      }

      const artistVariants = artist ? extractParenthesesVariants(artist) : undefined;
      const finalArtist = artistVariants?.[0] ?? artist;

      return {
        artist: finalArtist ? cleanMusicKeyword(cleanArtist(finalArtist)) : null,
        title: cleanMusicKeyword(cleanTitle(quotedText)),
        artistVariants: artistVariants && artistVariants.length > 1 ? artistVariants : undefined,
        patternUsed: 'quoted-title',
        skipSwap: true,
      };
    },
  },

  // ----------------------------------------
  // 3. 중첩 괄호 패턴 → null 반환 (채널명 fallback)
  // 예: HEYA (해야 (HEYA))
  // ----------------------------------------
  {
    name: 'nested-parentheses',
    regex: /\([^()]*\([^()]*\)[^()]*\)/,
    requiresCleanup: false,
    returnNull: true,
    skipSwap: true,
    extract: (_match, rawTitle) => {
      const hasDelimiter = / - | \/ | \| /.test(rawTitle);
      if (hasDelimiter) {
        return null; // 다음 패턴으로 넘김
      }
      return null; // 채널명 fallback
    },
  },

  // ----------------------------------------
  // 4. 구분자 패턴: 하이픈 (-)
  // 예: Artist - Title
  // ----------------------------------------
  {
    name: 'delimiter-dash',
    regex: /^(.+?)\s+-\s+(.+)$/,
    requiresCleanup: true,
    returnNull: false,
    skipSwap: false,
    extract: (match) => {
      const artist = match[1]?.trim() ?? '';
      const title = match[2]?.trim() ?? '';
      if (!artist || !title) return null;

      const artistVariants = extractParenthesesVariants(artist);
      const finalArtist = artistVariants[0] ?? artist;

      return {
        artist: cleanMusicKeyword(cleanArtist(finalArtist)),
        title: cleanMusicKeyword(cleanTitle(title)),
        artistVariants: artistVariants.length > 1 ? artistVariants : undefined,
        patternUsed: 'delimiter-dash',
        skipSwap: false,
      };
    },
  },

  // ----------------------------------------
  // 5. 구분자 패턴: 슬래시 (/)
  // 예: Artist / Title
  // ----------------------------------------
  {
    name: 'delimiter-slash',
    regex: /^(.+?)\s+\/\s+(.+)$/,
    requiresCleanup: true,
    returnNull: false,
    skipSwap: false,
    extract: (match) => {
      const artist = match[1]?.trim() ?? '';
      const title = match[2]?.trim() ?? '';
      if (!artist || !title) return null;

      const artistVariants = extractParenthesesVariants(artist);
      const finalArtist = artistVariants[0] ?? artist;

      return {
        artist: cleanMusicKeyword(cleanArtist(finalArtist)),
        title: cleanMusicKeyword(cleanTitle(title)),
        artistVariants: artistVariants.length > 1 ? artistVariants : undefined,
        patternUsed: 'delimiter-slash',
        skipSwap: false,
      };
    },
  },

  // ----------------------------------------
  // 6. 구분자 패턴: 파이프 (|)
  // 예: Artist | Title
  // ----------------------------------------
  {
    name: 'delimiter-pipe',
    regex: /^(.+?)\s+\|\s+(.+)$/,
    requiresCleanup: true,
    returnNull: false,
    skipSwap: false,
    extract: (match) => {
      const artist = match[1]?.trim() ?? '';
      const titlePart = match[2]?.trim() ?? '';
      const title = titlePart.split(/\s*\|\s*/)[0]?.trim() ?? '';
      if (!artist || !title) return null;

      const artistVariants = extractParenthesesVariants(artist);
      const finalArtist = artistVariants[0] ?? artist;

      return {
        artist: cleanMusicKeyword(cleanArtist(finalArtist)),
        title: cleanMusicKeyword(cleanTitle(title)),
        artistVariants: artistVariants.length > 1 ? artistVariants : undefined,
        patternUsed: 'delimiter-pipe',
        skipSwap: false,
      };
    },
  },

  // ----------------------------------------
  // 7. 괄호 패턴
  // 예: Artist (Title)
  // ----------------------------------------
  {
    name: 'parentheses',
    regex: /^(.+?)\s*\((.+?)\)\s*$/,
    requiresCleanup: true,
    returnNull: false,
    skipSwap: true,
    extract: (match) => {
      const artist = match[1]?.trim() ?? '';
      const title = match[2]?.trim() ?? '';
      if (!artist || !title) return null;

      return {
        artist: cleanMusicKeyword(cleanArtist(artist)),
        title: cleanMusicKeyword(cleanTitle(title)),
        patternUsed: 'parentheses',
        skipSwap: true,
      };
    },
  },

  // ----------------------------------------
  // 8. 트랙 번호 패턴
  // 예: 01. REBEL HEART, Track 5. Song Name
  // ----------------------------------------
  {
    name: 'track-number',
    regex: /^(?:Track\s+)?\d{1,3}\.\s*(.+)$/i,
    requiresCleanup: true,
    returnNull: false,
    skipSwap: true,
    extract: (match) => {
      const title = match[1]?.trim() ?? '';
      if (!title) return null;

      return {
        artist: null,
        title: cleanMusicKeyword(cleanTitle(title)),
        patternUsed: 'track-number',
        skipSwap: true,
      };
    },
  },
];

// ================================
// Main Parse Function
// ================================

/**
 * 여러 artist-title 쌍이 있는 경우 영어 버전 선호
 * 예: "요네즈 켄시 - 아이리스 아웃    Kenshi Yonezu - IRIS OUT"
 */
function preprocessMultiplePairs(rawTitle: string): string {
  // 구분자(-, /, |) 개수 확인
  const delimiterCount = (rawTitle.match(/\s+[-/|]\s+/g) || []).length;

  if (delimiterCount < 2) {
    return rawTitle; // 단일 쌍이면 그대로 반환
  }

  // 여러 구분자가 있으면 공백으로 분리 시도
  const segments = rawTitle.split(/\s{2,}/); // 2개 이상의 공백으로 분리

  if (segments.length < 2) {
    return rawTitle; // 분리 실패하면 그대로
  }

  // 각 세그먼트의 영어 비율 계산
  const segmentsWithRatio = segments.map((seg) => ({
    text: seg,
    englishRatio: getEnglishRatio(seg),
  }));

  // 가장 영어 비율이 높은 세그먼트 선택 (50% 이상인 것 중)
  const englishSegment = segmentsWithRatio.find((s) => s.englishRatio > 50);

  if (englishSegment) {
    return englishSegment.text;
  }

  return rawTitle; // 영어 세그먼트 없으면 원본
}

/**
 * 패턴 기반 title 파싱
 * @param rawTitle 원본 YouTube 영상 제목
 * @returns 파싱 결과 또는 null (채널명 fallback 필요)
 */
export function parseTitle(rawTitle: string): TitleParseResult | null {
  if (!rawTitle || typeof rawTitle !== 'string') return null;

  // 여러 artist-title 쌍이 있으면 영어 버전 선호
  const preprocessedTitle = preprocessMultiplePairs(rawTitle);
  const cleanedTitle = cleanUp(preprocessedTitle);

  for (const pattern of TITLE_PATTERNS) {
    const targetString = pattern.requiresCleanup ? cleanedTitle : preprocessedTitle;
    const match = targetString.match(pattern.regex);

    if (match) {
      if (pattern.returnNull) {
        return null;
      }

      const result = pattern.extract(match, preprocessedTitle, cleanedTitle);
      if (result) {
        return result;
      }
    }
  }

  return null;
}
