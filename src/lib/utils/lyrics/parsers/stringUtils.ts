// src/lib/utils/stringUtils.ts
// 문자열 전처리
import { EXTRA_KEYWORDS } from '@constants/keywords';

const TRAILING_DELIMITERS_REGEX = /[\s\-/|]+$/;
const emojiRegex = /\p{Extended_Pictographic}/u;

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
 * 문자열에서 부가정보(괄호, 대괄호, 파이프 등)를 제거합니다.
 */
export function cleanUp(str: string): string {
  return str
    .replace(/[「」『』]/g, ' ') // 일본어 쌍따옴표를 공백으로 변환
    .replace(/\[.*?\]/g, '') // 대괄호 제거
    .replace(/\\s{2,}/g, ' ') // 이중 공백 정리
    .trim();
}

/**
 * 괄호 안팎의 내용을 모두 추출 (영어 우선)
 * 예: "윤하(YOUNHA)" → ["YOUNHA", "윤하"]
 * 예: "YOUNHA(윤하)" → ["YOUNHA", "윤하"]
 * @returns 배열의 0번은 항상 영어 (영어가 없으면 원본)
 */
function extractParenthesesVariants(str: string): string[] {
  const variants: string[] = [];
  const parenthesesPattern = /^(.+?)\s*\(([^)]+)\)\s*$/;
  const match = str.match(parenthesesPattern);

  if (match && match[1] && match[2]) {
    const outside = match[1].trim();
    const inside = match[2].trim();

    // 영어를 0번 인덱스에 배치
    if (isEnglishText(outside)) {
      variants.push(outside);
      if (inside) variants.push(inside);
    } else if (isEnglishText(inside)) {
      variants.push(inside);
      if (outside) variants.push(outside);
    } else {
      // 둘 다 비영어면 순서대로
      if (outside) variants.push(outside);
      if (inside) variants.push(inside);
    }
  } else {
    // 괄호가 없으면 원본만 반환
    variants.push(str);
  }

  return variants;
}

// 실질적 실행
export function extractArtistAndTitleCustom(
  rawTitle: string,
): { artist: string; title: string; artistVariants?: string[] } | null {
  if (!rawTitle || typeof rawTitle !== 'string') return null;

  // 0. 일본어 쌍따옴표 패턴 우선 처리 (cleanUp 전에)
  // 예: "YOASOBI「アイドル」 Official Music Video" → artist: "YOASOBI", title: "アイドル"
  const japaneseQuotePattern = /^(.+?)[「『]([^」』]+)[」』]/;
  const japaneseQuoteMatch = rawTitle.match(japaneseQuotePattern);
  if (japaneseQuoteMatch && japaneseQuoteMatch[1] && japaneseQuoteMatch[2]) {
    return {
      artist: japaneseQuoteMatch[1].trim(),
      title: japaneseQuoteMatch[2].trim(),
    };
  }

  // 1. 기본 정돈 (괄호/대괄호 제거, 중복 공백 정리 등)
  const cleaned = cleanUp(rawTitle);

  // 2. 쌍따옴표 등으로 감싼 부분 우선 파싱 예: Artist "Title"
  const quotePattern = /^(.+?)\s+(?:'|"|"|'|'|")([^'""''"]+)(?:'|"|"|'|')?(?:\s|$)/;
  const quoteMatch = cleaned.match(quotePattern);

  let artist = '';
  let title = '';

  if (
    quoteMatch &&
    quoteMatch[1] !== undefined &&
    quoteMatch[2] !== undefined &&
    !/\w'$/.test(quoteMatch[1].trim()) && // 아티스트 단어 끝 ' 소유격 제외
    quoteMatch[2].trim().length > 0
  ) {
    artist = quoteMatch[1]?.trim() ?? '';
    title = quoteMatch[2]?.trim() ?? '';
  } else {
    // 3. 구분자 기준 추출 (하이픈, 슬래시, 파이프)
    const delimiters = [' - ', ' / ', ' | '];
    for (const delim of delimiters) {
      if (cleaned.includes(delim)) {
        const parts = cleaned.split(delim);
        if (parts.length >= 2) {
          artist = parts[0]?.trim() ?? '';
          title = parts.slice(1).join(delim).trim();
          break;
        }
      }
    }
  }

  // 2. remove extra info
  title = removeExtraInfo(title);
  artist = cleanMusicKeyword(artist);
  title = cleanMusicKeyword(title);

  // 4. 추가 패턴: 괄호
  if (!artist || !title) {
    const match = cleaned.match(/^(.+?)\s*\((.+?)\)/);
    if (match) {
      artist = match[1]?.trim() ?? '';
      title = match[2]?.trim() ?? '';
    }
  }

  // 6. 곡명에서 부가정보 추가 제거
  title = removeExtraInfo(title);
  title = removeTrailingHashtags(title);
  title = removeDatePattern(title);

  if (!artist || !title) return null;

  // 7. 아티스트명 정제 전에 괄호 variants 추출
  const rawArtist = artist; // 정제 전 원본 저장

  // 8. 괄호가 있었다면 variants 추출 (정제 전 원본에서)
  const artistVariants = extractParenthesesVariants(rawArtist);

  // variants의 0번(영어)을 최종 artist로 사용하고, 나머지를 variants로 반환
  if (artistVariants.length > 0 && artistVariants[0]) {
    artist = preprocessArtistOrTitle(artistVariants[0]); // 0번(영어)을 정제
    return {
      artist,
      title,
      artistVariants: artistVariants.length > 1 ? artistVariants : undefined,
    };
  }

  artist = removeEmptyBrackets(removeExtraInfo(artist));
  return { artist, title };
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
// op, ed, ost, mv는 해당 단어만 삭제해 예를 들어 open the door -> en the door이 되지 않게끔
function cleanMusicKeyword(str: string): string {
  return str
    .replace(/([^A-Za-z]|^)(OP|ED|OST|MV)([^A-Za-z]|$)/gi, (_match, p1, _p2, p3) => {
      return `${p1}${p3}`.replace(/\s{2,}/g, ' ');
    })
    .trim();
}
// 곡명 끝에 연속된 해시태그만 제거
function removeTrailingHashtags(title: string): string {
  return title.replace(/(\s*#[\p{L}\p{N}._-]+)+\s*$/gu, '').trim();
}
// 방송 날짜 기재된 경우 제거 (YYMMDD 형식)
function removeDatePattern(str: string): string {
  return str.replace(/\b\d{2}[01]\d(?:3[0-2]|[0-2][0-9])\b/g, '').trim();
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
  return extractEnglishOnly(noDiacritics);
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
