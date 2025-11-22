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

  // (3) description에서 by/작곡/노래/歌/MUSIC BY/Performer/Produced by 등 패턴 찾기
  if (meta.description) {
    const artistMatch = meta.description.match(/^\s*•?\s*Artist\s*:\s*(.+)$/im);
    const songMatch = meta.description.match(/^\s*•?\s*Song\s*[♫:]?\s*(.+)$/im);

    if (artistMatch?.[1] && songMatch?.[1]) {
      return {
        artist: artistMatch[1].trim(),
        title: songMatch[1].trim(),
      };
    }
    // 가수가 아니라 소속 회사에 artist가 배정되는 경우가 생김
    // const patterns = [
    //   /by\s+([^\n\r,]+)/i,
    //   /Performed\s+by\s+([^\n\r,]+)/i,
    //   /歌[:：]\s*([^\n\r,]+)/,
    //   /アーティスト[:：]\s*([^\n\r,]+)/,
    //   /artist[:：]\s*([^\n\r,]+)/i,
    //   /作曲[:：]\s*([^\n\r,]+)/,
    //   /作詞[:：]\s*([^\n\r,]+)/,
    // ];
    // for (const regex of patterns) {
    //   const m = meta.description.match(regex);
    //   if (m && m[1]) {
    //     return { artist: m[1].trim(), title };
    //   }
    // }
  }

  // (4) 일반 채널명 사용 (Topic 채널보다 우선순위 낮음)
  // 주의: 회사 계정이거나 타이틀에 아티스트가 중복될 수 있어서 마지막 우선순위
  if (meta.channelTitle && meta.channelTitle.trim().toLowerCase() !== title.toLowerCase()) {
    return { artist: meta.channelTitle.trim(), title };
  }
  return null;
}
