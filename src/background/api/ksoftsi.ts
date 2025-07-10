// src/lib/api/ksoftsi.ts
import axios from 'axios';

const KSOFT_API_KEY = process.env.KSOFT_API_KEY; // 환경변수로 관리 권장

const KSOFT_BASE_URL = 'https://api.ksoft.si/lyrics/search';

export interface KSoftLyricsResult {
  name: string;
  artist: string;
  lyrics: string;
  url: string;
  // 기타 필요한 필드 추가
}

export async function fetchKSoftLyrics(artist: string, title: string): Promise<KSoftLyricsResult | null> {
  try {
    const response = await axios.get(KSOFT_BASE_URL, {
      params: { q: `${artist} ${title}` },
      headers: { Authorization: `Bearer ${KSOFT_API_KEY}` },
    });

    if (response.data && response.data.data && response.data.data.length > 0) {
      const result = response.data.data[0];
      return {
        name: result.name,
        artist: result.artist,
        lyrics: result.lyrics,
        url: result.url,
      };
    }
    return null;
  } catch (error) {
    console.error('KSoft.Si API error:', error);
    return null;
  }
}
