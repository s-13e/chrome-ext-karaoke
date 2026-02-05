/**
 * fallbackParser.ts - YouTube 메타데이터 기반 아티스트/타이틀 추출
 *
 * [역할]
 * - YouTube 영상 메타데이터(채널명, description 등)에서 아티스트 정보 추출
 * - 타이틀 패턴 파싱 실패 시 fallback으로 사용
 *
 * [파싱 흐름]
 * titleParser.ts → parseTitle(titlePatterns.ts) → (실패 시) fallbackArtistAndTitle(이 파일)
 *
 * [우선순위]
 * 1. YouTube 제공 artist 필드 (YouTube Music 자동 생성 영상)
 * 2. Topic 채널 (예: "IU - Topic")
 * 3. Description의 "Artist: ..." 패턴
 * 4. 일반 채널명
 */

/**
 * YouTube 메타데이터에서 아티스트/타이틀 추출 (fallback용)
 * 타이틀 파싱 실패 시 채널명 등을 활용
 */
export function fallbackArtistAndTitle(meta: {
  title: string;
  channelTitle?: string;
  description?: string;
  artist?: string;
}): { artist: string; title: string } | null {
  // 1. 곡명만 title로 일단 설정
  const title = meta.title?.trim();
  if (!title) return null;

  // 2. 아티스트 추정 우선순위:
  //    (1) YouTube 제공 artist 필드 > (2) Topic 채널 > (3) 설명문에서 탐색 > (4) 일반 채널명

  // (1) meta.artist가 있으면(YouTube Music/자동 생성 영상)
  if (meta.artist && meta.artist.trim() && meta.artist.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.artist.trim(), title };
  }

  // (2) Topic 채널인 경우 채널명을 아티스트로 신뢰
  // YouTube Music의 자동 생성 아티스트 채널: "Artist Name - Topic" 형식
  if (meta.channelTitle) {
    const topicMatch = meta.channelTitle.match(/^(.+?)\s*-\s*Topic$/i);
    if (topicMatch && topicMatch[1]) {
      const artistName = topicMatch[1].trim();
      if (artistName.toLowerCase() !== title.toLowerCase()) {
        return { artist: artistName, title };
      }
    }
  }

  // (3) description에서 Artist/Song 패턴 찾기
  if (meta.description) {
    const artistMatch = meta.description.match(/^\s*•?\s*Artist\s*:\s*(.+)$/im);
    const songMatch = meta.description.match(/^\s*•?\s*Song\s*[♫:]?\s*(.+)$/im);

    if (artistMatch?.[1] && songMatch?.[1]) {
      return {
        artist: artistMatch[1].trim(),
        title: songMatch[1].trim(),
      };
    }
  }

  // (4) 일반 채널명 사용 (Topic 채널보다 우선순위 낮음)
  // 주의: 회사 계정이거나 타이틀에 아티스트가 중복될 수 있어서 마지막 우선순위
  if (meta.channelTitle && meta.channelTitle.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.channelTitle.trim(), title };
  }
  return null;
}
