import getArtistTitle from 'get-artist-title';

/**
 * 유튜브 영상 제목에서 [아티스트, 타이틀] 추출
 */
export function extractArtistAndTitle(title: string): { artist: string; title: string } | null {
  const [artist, songTitle] = getArtistTitle(title) || [];
  if (artist && songTitle) {
    return { artist, title: songTitle };
  }
  return null;
}

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
  //    (1) YouTube 제공 artist 필드 > (2) 채널명 > (3) 설명문에서 탐색 > (4) 기타

  // (1) meta.artist가 있으면(YouTube Music/자동 생성 영상)
  if (meta.artist && meta.artist.trim() && meta.artist.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.artist.trim(), title };
  }

  // (2) 채널명이 아티스트명일 확률이 높음. (ex, "aimyon" 등)
  if (meta.channelTitle && meta.channelTitle.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.channelTitle.trim(), title };
  }

  // (3) description에서 by/작곡/노래/歌/MUSIC BY/Performer/Produced by 등 패턴 찾기
  if (meta.description) {
    // 아주 간단한 예시: "by XXX", "performed by XXX", "作詞：", "歌：", "アーティスト："
    // 더 똑똑한 정규식으로 패턴 추가 필요
    const patterns = [
      /by\s+([^\n\r,]+)/i,
      /Performed\s+by\s+([^\n\r,]+)/i,
      /歌[:：]\s*([^\n\r,]+)/,
      /アーティスト[:：]\s*([^\n\r,]+)/,
      /artist[:：]\s*([^\n\r,]+)/i,
      /作曲[:：]\s*([^\n\r,]+)/,
      /作詞[:：]\s*([^\n\r,]+)/,
    ];
    for (const regex of patterns) {
      const m = meta.description.match(regex);
      if (m && m[1]) {
        return { artist: m[1].trim(), title };
      }
    }
  }
  return null;
}
