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

  // 2차: Fallback (패턴 실패 또는 artist가 없는 경우 메타데이터 사용)
  if ((!result || !result.artist) && options) {
    // 패턴에서 추출한 title 보존 (artist만 없는 경우 title은 재사용)
    const patternTitle = result?.title;

    const fallback = fallbackArtistAndTitle({
      title: rawTitle,
      ...options,
    });

    if (fallback) {
      result = {
        // 패턴에서 title이 있으면 그걸 사용, 없으면 fallback title
        artist: fallback.artist,
        title: patternTitle ?? fallback.title,
        patternUsed: 'fallback',
        skipSwap: false,
      };
      source = 'fallback';
    }
  }

  // 최종 실패: 파싱 결과가 없거나 artist가 여전히 null인 경우
  if (!result || !result.artist) return null;

  // 3차: 후처리 (Topic 제거, 키워드 정리, 공백 정규화)
  // title: 항상 키워드 제거 적용 (Official MV, Lyric Video 등)
  // artist: fallback(채널명)에서 온 경우 키워드 제거 미적용 (Sony Pictures Animation → Animation 유지)
  //         패턴에서 온 경우 키워드 제거 적용 (swap 시 title에서 온 값일 수 있음)
  const processedTitle = preprocessArtistOrTitle(removeExtraInfo(cleanTopicName(result.title)));
  const processedArtist =
    source === 'fallback'
      ? preprocessArtistOrTitle(cleanTopicName(result.artist))
      : preprocessArtistOrTitle(removeExtraInfo(cleanTopicName(result.artist)));

  return {
    artist: processedArtist,
    title: processedTitle,
    artistVariants: result.artistVariants,
    skipSwap: result.skipSwap ?? false,
    source,
  };
}
