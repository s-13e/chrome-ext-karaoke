import { Line } from '@lib/types/lyrics';
export interface LrcLibLyricsResult {
  lyrics: string | Line[];
  duration?: number;
  artist?: string;
  title?: string;
  id?: string;
  etag?: string;
}

// background/api/lrclib.ts
export async function fetchLrclibLyrics(artist: string, title: string): Promise<string | null> {
  const endpoint = `https://lrclib.net/api/get?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}`;
  const res = await fetch(endpoint);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.syncedLyrics || data?.plainLyrics || null;
}

export async function fetchLyricsBySearchFirst(artist: string, title: string): Promise<LrcLibLyricsResult | undefined> {
  const query = `${artist} ${title}`;
  const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
  const searchData = await searchRes.json();

  for (const candidate of searchData) {
    const detailRes = await fetch(`https://lrclib.net/api/get/${candidate.id}`);
    const detail = await detailRes.json();
    const lyrics = detail.syncedLyrics || detail.plainLyrics;
    const duration = detail.duration; // LRCLIB에서 제공하는 초 단위 곡 길이(없을 수도 있으니 ?로)

    console.log('길이', duration, '가사:', lyrics);

    if (lyrics) {
      return {
        lyrics,
        duration,
        artist: detail.artist,
        title: detail.title,
        id: candidate.id,
      };
    }
  }
  return undefined;
}
