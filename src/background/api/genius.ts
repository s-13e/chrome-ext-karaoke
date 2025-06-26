import { GENIUS_API_URL } from '@constants/api';

export const fetchGeniusLyrics = async (title: string): Promise<string> => {
  console.log('[GENIUS] 가사 요청 시작', { title });
  const searchUrl = `${GENIUS_API_URL}/search?q=${encodeURIComponent(title)}`;
  const headers = {
    Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`,
  };

  // 1. 검색을 통해 트랙 ID 획득
  const searchRes = await fetch(searchUrl, { headers });
  const searchData = await searchRes.json();
  const trackId = searchData.response.hits[0]?.result.id;

  if (!trackId) throw new Error('No lyrics found');

  // 2. 트랙 ID로 가사 조회
  const lyricsUrl = `${GENIUS_API_URL}/songs/${trackId}`;
  const lyricsRes = await fetch(lyricsUrl, { headers });
  const lyricsData = await lyricsRes.json();

  return lyricsData.response.song.lyrics;
};
