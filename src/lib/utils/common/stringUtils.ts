// src/lib/utils/stringUtils.ts
import { EXTRA_KEYWORDS } from '@constants/keywords';

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
export function removeExtraInfo(title: string): string {
  const extraKeywords = EXTRA_KEYWORDS.slice().sort((a, b) => b.length - a.length); // 긴 키워드 우선
  let result = title;

  // 1. 복합 키워드(공백/특수문자 포함) 전체 제거
  for (const kw of extraKeywords) {
    // 키워드가 특수문자 포함 가능하므로 escape 처리
    const regex = new RegExp(`(\\s*${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '').trim();
  }

  // 2. 기존 구분자 분할(남아있는 경우만)
  const parts = result.split(/\s*[-/|]\s*/);
  while (parts.length > 1 && extraKeywords.some((kw) => parts[parts.length - 1]?.toLowerCase().includes(kw))) {
    parts.pop();
  }
  result = parts.join(' - ');

  // 3. 끝에 남아있는 부가정보 반복 제거
  let found = true;
  while (found) {
    found = false;
    for (const kw of extraKeywords) {
      const regex = new RegExp(`(\\s*${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})$`, 'i');
      if (regex.test(result)) {
        result = result.replace(regex, '').trim();
        found = true;
      }
    }
  }

  result = parts.filter(Boolean).join(' - '); // 빈 값 제거 후 합치기
  result = result.replace(/[-/|]+$/, '').trim(); // 끝에 남은 구분자 제거

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
    const match = cleaned.match(/^([A-Za-z가-힣0-9]+)\s+(.+)$/);
    if (match) {
      artist = match[1]?.trim() ?? '';
      title = match[2]?.trim() ?? '';
    }
  }

  // 6. 곡명에서 부가정보 추가 제거
  title = removeExtraInfo(title);
  title = removeTrailingHashtags(title);
  title = removeDatePattern(title);
  title = title.replace(/[-/|]+$/, '').trim(); // 끝에 남은 구분자도 제거

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
  return s;
}
