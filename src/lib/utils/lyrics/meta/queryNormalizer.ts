// lib/utils/lyrics/queryNormalizer.ts
export interface NormalizeLyricsQueryOptions {
  lang?: string;
  [key: string]: string | undefined;
}

/**
 * 가사 검색 쿼리를 유니크한 캐시 키로 정규화합니다.
 * artist, title, lang, 기타 옵션까지 모두 key에 포함.
 */
export function normalizeLyricsQuery(artist: string, title: string, options?: NormalizeLyricsQueryOptions): string {
  const normArtist = artist.trim().toLowerCase().replace(/\s+/g, ' ');
  const normTitle = title.trim().toLowerCase().replace(/\s+/g, ' ');
  let key = `${normArtist}::${normTitle}`;

  if (options?.lang) {
    key += `::${options.lang.toLowerCase()}`;
  }

  // 필요시 기타 옵션 정규화 추가
  // (예: 키워드, 정렬 순서 등)
  if (options) {
    Object.entries(options)
      .filter(([k]) => k !== 'lang')
      .sort()
      .forEach(([k, v]) => {
        key += `::${k}=${String(v).toLowerCase()}`;
      });
  }
  return key;
}
