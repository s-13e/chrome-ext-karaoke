// src/lib/utils/stringUtils.ts
import { EXTRA_KEYWORDS } from '@constants/keywords';

const TRAILING_DELIMITERS_REGEX = /[\s\-/|]+$/;

function trimTrailingDelimiters(str: string): string {
  return str.replace(TRAILING_DELIMITERS_REGEX, '').trim();
}
// 영어 여부 판단 함수 (공백, 하이픈, 작은따옴표 포함)
export function isEnglishText(text: string): boolean {
  return /^[A-Za-z\s\-']+$/.test(text);
}
/**
 * 문자열에서 부가정보(괄호, 대괄호, 파이프 등)를 제거합니다.
 */
export function cleanUp(str: string): string {
  return str
    .replace(/\[.*?\]/g, '') // 대괄호 제거
    .replace(/\\s{2,}/g, ' ') // 이중 공백 정리
    .trim();
}
// op, ed, ost, mv는 해당 단어만 삭제해 예를 들어 open the door -> en the door이 되지 않게끔
function cleanMusicKeyword(str: string): string {
  return str
    .replace(/([^A-Za-z]|^)(OP|ED|OST|MV)([^A-Za-z]|$)/gi, (_match, p1, _p2, p3) => {
      return `${p1}${p3}`.replace(/\s{2,}/g, ' ');
    })
    .trim();
}
// 키워드 정제
export function removeExtraInfo(str: string): string {
  const extraKeywords = EXTRA_KEYWORDS.slice().sort((a, b) => b.length - a.length); // 긴 키워드 우선
  let result = str;

  // 1. 복합 키워드(공백/특수문자 포함) 전체 제거
  for (const kw of extraKeywords) {
    const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 키워드가 특수문자 포함 가능하므로 escape 처리
    const regex = new RegExp(`(\\s*${escapedKw})`, 'gi');
    result = result.replace(regex, '').trim();
  }

  // 2. 구분자(-, /, |) 기준 분할 후, 끝부분 부가 키워드 포함 파트 제거
  const parts = result.split(/\s*[-/|]\s*/);
  while (
    parts.length > 1 &&
    extraKeywords.some((kw) => parts[parts.length - 1]?.toLowerCase().includes(kw.toLowerCase()))
  ) {
    parts.pop();
  }

  // 3. 조합한 결과 문자열로 재설정
  result = parts.join(' - ');

  // 4. 반복적으로 문자열 끝에 부가 키워드 남아있는지 검사해서 제거
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
// 해시태그 삭제
export function removeTrailingHashtags(title: string): string {
  // 곡명 끝에 연속된 해시태그만 제거
  return title.replace(/(\s*#[\p{L}\p{N}._-]+)+\s*$/gu, '').trim();
}
// 방송 날짜 기재된 경우
export function removeDatePattern(str: string): string {
  return str.replace(/\b\d{2}[01]\d(?:3[0-2]|[0-2][0-9])\b/g, '').trim();
}
//
export function extractArtistAndTitleCustom(rawTitle: string): { artist: string; title: string } | null {
  const cleaned = cleanUp(rawTitle);
  const quotePattern = /^(.+?)\s*['"'“”‘’](.+?)['"'“”‘’]/;

  // 1. 쌍따옴표(“ ” 또는 " ") 패턴 우선 적용
  const match = cleaned.match(quotePattern);
  let artist = '',
    title = '';
  if (match) {
    artist = match[1]?.trim() ?? '';
    title = match[2]?.trim() ?? '';
  } else {
    // 2. 구분자(split) 기반 추출
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

  // 5. 추가 패턴: 아티스트와 곡명이 모두 영문/숫자/공백으로만 구성된 경우
  if (!artist || !title) {
    // 대문자로 시작하는 두 단어 이상이면 첫 단어를 아티스트, 나머지를 곡명으로 추정
    const match = cleaned.match(/^([A-Za-z0-9]+|[^A-Za-z0-9\s]+)\s+(.+)$/);
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
  artist = removeEmptyBrackets(removeExtraInfo(artist));

  return { artist, title };
}
export function extractEnglishOnly(str: string): string {
  // 영문자가 포함되어 있는지
  const hasEnglish = /[A-Za-z]/.test(str);
  // 비영문자가 포함되어 있는지 (영어, 숫자, 공백, 특수문자 제외)
  const hasNonEnglish = /[^\sA-Za-z0-9'’&.-]/.test(str);

  // 둘 다(영어+비영어)가 있을 때만 "영어만 남기기"
  if (hasEnglish && hasNonEnglish) {
    const match = str.match(/([A-Za-z][A-Za-z\s'’&.-]*)/g);
    return match ? match.join(' ').trim() : '';
  }
  // 영어만 있거나, 비영어만 있으면 원본 반환
  return str;
}
// 유튜브 DATA API를 통해 나온 음악 타이틀에서 Topic을 제거함
export function cleanTopicName(name: string): string {
  let result = name;

  // 앞쪽 접두사 "Topic - "
  result = result.replace(/^topic\s*-\s*/i, '');

  // 뒤쪽 접미사 " - Topic"
  result = result.replace(/\s*-\s*topic$/i, '');

  return result.trim();
}
export function removeEmptyBrackets(str: string): string {
  return str
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\{\s*\}/g, '')
    .trim();
}
export function preprocessArtistOrTitle(str: string): string {
  let s = cleanUp(str);
  s = removeEmptyBrackets(s);
  s = extractEnglishOnly(s);
  s = trimTrailingDelimiters(s);
  return s;
}
