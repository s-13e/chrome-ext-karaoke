import { isEnglishText } from '@lib/utils/lyrics/stringUtils';

// background/api/musicBrainz.ts
const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = process.env.MUSICBRAINZ_USER_AGENT!;

type Alias = {
  name: string;
  locale?: string;
  primary?: boolean;
  type?: string;
};

type Artist = {
  name: string;
  aliases?: Alias[];
};

type MusicBrainzResponse = {
  artists?: Artist[];
};

/**
 * MusicBrainz API 호출 시 반드시 User-Agent 헤더를 포함해야 함
 * 아티스트명에 대한 영문명(alias) 자동 추출 함수
 */
export async function fetchEnglishAliasForArtist(artistName: string): Promise<string | null> {
  if (!artistName) {
    console.warn('[MusicBrainz] artistName is empty or falsy');
    return null;
  }
  const query = encodeURIComponent(artistName);
  const url = `${BASE_URL}/artist?query=artist:${query}&fmt=json&limit=3`;

  try {
    if (!USER_AGENT) {
      throw new Error('MUSICBRAINZ_USER_AGENT 환경변수가 설정되어 있지 않습니다.');
    }

    console.log(`[MusicBrainz] Requesting artist alias for: "${artistName}"`);
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!res.ok) {
      console.error(`[MusicBrainz] API 응답 실패: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: MusicBrainzResponse = await res.json();
    console.log(`[MusicBrainz] API 응답 JSON 아티스트 수: ${data.artists?.length || 0}`);

    if (!data.artists || data.artists.length === 0) {
      console.warn('[MusicBrainz] artists 배열이 빈 배열이거나 없음');
      return null;
    }

    return extractEnglishAliasFromArtists(data.artists);
  } catch (error) {
    console.error('[MusicBrainz] API 호출 중 오류 발생:', error);
    return null;
  }
}

/**
 * 프리텍스트로 MusicBrainz에서 아티스트를 검색
 *
 * @param queryStr 검색어 (비영문, 오타, 별칭 등 포함 가능)
 * @returns Artist[] | null
 */
export async function searchArtistByFreeText(queryStr: string): Promise<Artist[] | null> {
  if (!queryStr) return null;

  const query = encodeURIComponent(queryStr);
  const url = `${BASE_URL}/artist?query=${query}&fmt=json&limit=5`;

  try {
    if (!USER_AGENT) {
      throw new Error('MUSICBRAINZ_USER_AGENT 환경변수가 설정되어 있지 않습니다.');
    }

    console.log(`[MusicBrainz] [FreeText] 프리텍스트 artist 검색: "${queryStr}"`);
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!res.ok) {
      console.error(`[MusicBrainz] [FreeText] API 응답 실패: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: MusicBrainzResponse = await res.json();
    console.log(`[MusicBrainz] [FreeText] 결과 artist 수: ${data.artists?.length || 0}`);

    if (!data.artists || data.artists.length === 0) {
      return null;
    }

    // 결과로 Artist[] 반환 (alias 추출은 호출부에서 담당)
    return data.artists;
  } catch (error) {
    console.error('[MusicBrainz] [FreeText] API 호출 중 오류 발생:', error);
    return null;
  }
}

// 기존 fetchEnglishAliasForArtist 내부에 있던 alias 파싱 로직을 따로 함수로
export function extractEnglishAliasFromArtists(artists: Artist[]): string | null {
  for (const artist of artists) {
    if (artist.aliases && artist.aliases.length > 0) {
      let englishAlias = artist.aliases.find(
        (alias) => typeof alias.locale === 'string' && alias.locale.toLowerCase() === 'en',
      );
      if (!englishAlias) {
        englishAlias = artist.aliases.find((alias) => alias.primary === true && isEnglishText(alias.name));
      }
      if (englishAlias?.name) {
        console.log(`[MusicBrainz] 영어 alias 발견: ${englishAlias.name}`);
        return englishAlias.name;
      }
    }

    if (isEnglishText(artist.name)) {
      console.log(`[MusicBrainz] 아티스트명이 이미 영어로 추정됨: ${artist.name}`);
      return artist.name;
    }
  }
  return null;
}
