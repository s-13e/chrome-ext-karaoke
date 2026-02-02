/**
 * titleParser.ts - YouTube 타이틀 파싱 통합 진입점
 *
 * [역할]
 * - YouTube 타이틀에서 아티스트/곡명 추출의 전체 파이프라인 관리
 * - 전처리 → 패턴 파싱 → fallback → 후처리의 4단계 프로세스
 *
 * [처리 단계]
 * 0. 전처리: stripEmojiAndBeforeColon (이모지, 콜론 앞부분 제거)
 * 1. 패턴 파싱: parseTitle (titlePatterns.ts의 8개 패턴 매칭)
 * 2. Fallback: fallbackArtistAndTitle (채널명, description 등 메타데이터 활용)
 * 3. 후처리: cleanTopicName, removeExtraInfo, preprocessArtistOrTitle
 *
 * [사용 예시]
 * ```typescript
 * const result = parseTitleWithFallback(videoTitle, {
 *   channelTitle: 'HYBE LABELS',
 *   description: 'Artist: NewJeans\nSong: Ditto',
 *   artist: 'NewJeans'
 * });
 * // result: { artist: 'NewJeans', title: 'Ditto', skipSwap: false, source: 'pattern' }
 * ```
 */

import { parseTitle, type TitleParseResult as PatternParseResult } from './titlePatterns';
import { fallbackArtistAndTitle } from './fallbackParser';
import { stripEmojiAndBeforeColon, cleanTopicName, removeExtraInfo, preprocessArtistOrTitle } from './stringUtils';

/**
 * 타이틀 파싱 옵션 (fallback용 메타데이터)
 */
export interface TitleParseOptions {
  /** YouTube 채널 이름 */
  channelTitle?: string;
  /** 영상 설명 */
  description?: string;
  /** YouTube에서 제공한 아티스트 정보 */
  artist?: string;
}

/**
 * 타이틀 파싱 최종 결과 (artist는 반드시 존재)
 */
export interface ParsedTitleResult {
  /** 아티스트명 */
  artist: string;
  /** 곡명 */
  title: string;
  /** 아티스트 변형 (예: 한글명, 영문명) */
  artistVariants?: string[];
  /** LRCLib 검색 시 artist/title 순서 뒤집기 스킵 여부 */
  skipSwap: boolean;
  /** 파싱 소스 ('pattern': 패턴 매칭 성공, 'fallback': 메타데이터 사용) */
  source: 'pattern' | 'fallback';
}

/**
 * YouTube 타이틀 파싱 (전처리 → 패턴 → fallback → 후처리)
 *
 * @param rawTitle 원본 YouTube 영상 제목
 * @param options 메타데이터 (fallback용)
 * @returns 파싱 결과 또는 null (파싱 완전 실패 시)
 *
 * @example
 * ```typescript
 * // 패턴 파싱 성공
 * parseTitleWithFallback('IU - Blueming')
 * // → { artist: 'IU', title: 'Blueming', skipSwap: false, source: 'pattern' }
 *
 * // Fallback 사용
 * parseTitleWithFallback('Official MV', { channelTitle: 'IU - Topic' })
 * // → { artist: 'IU', title: 'Official MV', skipSwap: false, source: 'fallback' }
 * ```
 */
export function parseTitleWithFallback(rawTitle: string, options?: TitleParseOptions): ParsedTitleResult | null {
  if (!rawTitle || typeof rawTitle !== 'string') return null;

  // 0차: 전처리 (이모지, 콜론 앞부분 제거)
  const cleanedTitle = stripEmojiAndBeforeColon(rawTitle);

  // 1차: 패턴 기반 파싱 (titlePatterns.ts의 8개 패턴 매칭)
  let result:
    | PatternParseResult
    | { artist: string; title: string; artistVariants?: string[]; skipSwap: boolean; patternUsed: string }
    | null = parseTitle(cleanedTitle);
  let source: 'pattern' | 'fallback' = 'pattern';

  // 2차: Fallback (패턴 실패 시 메타데이터 사용)
  if (!result && options) {
    const fallback = fallbackArtistAndTitle({
      title: rawTitle,
      ...options,
    });

    if (fallback) {
      result = {
        ...fallback,
        patternUsed: 'fallback',
        skipSwap: false,
      };
      source = 'fallback';
    }
  }

  if (!result) return null;

  // artist가 null인 경우 (패턴 매칭은 성공했으나 artist가 없는 경우)
  if (!result.artist) return null;

  // 3차: 후처리 (Topic 제거, 키워드 정리, 공백 정규화)
  const processedTitle = preprocessArtistOrTitle(removeExtraInfo(cleanTopicName(result.title)));
  const processedArtist = preprocessArtistOrTitle(removeExtraInfo(cleanTopicName(result.artist)));

  return {
    artist: processedArtist,
    title: processedTitle,
    artistVariants: result.artistVariants,
    skipSwap: result.skipSwap ?? false,
    source,
  };
}
