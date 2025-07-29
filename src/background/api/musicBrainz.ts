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

    // 1순위: aliases 배열에서 영어(primary 또는 locale='en') 별칭 찾기
    for (const artist of data.artists) {
      if (artist.aliases && artist.aliases.length > 0) {
        let englishAlias = artist.aliases.find(
          (alias) => typeof alias.locale === 'string' && alias.locale.toLowerCase() === 'en',
        );
        // 2. 영어 locale alias 없으면, primary이고 영어 이름인 별칭 찾기
        if (!englishAlias) {
          englishAlias = artist.aliases.find((alias) => alias.primary === true && /^[A-Za-z\s\-']+$/.test(alias.name));
        }
        if (englishAlias?.name) {
          console.log(`[MusicBrainz] 영어 alias 발견: ${englishAlias.name}`);
          return englishAlias.name;
        }
      }

      // 아티스트명이 이미 영어(알파벳, 공백, 하이픈, 작은따옴표)만 포함하면 바로 반환
      if (/^[A-Za-z\s\-']+$/.test(artist.name)) {
        console.log('[MusicBrainz] 아티스트명이 이미 영어로 추정됨:', artist.name);
        return artist.name;
      }
    }

    console.warn('[MusicBrainz] 영어 alias/이름을 찾지 못함');
    return null;
  } catch (error) {
    console.error('[MusicBrainz] API 호출 중 오류 발생:', error);
    return null;
  }
}

/**
 * 곡명에 대한 영문명 변환 함수 (work, recording 검색) - 필요시 구현 가능
 */
//export async function fetchEnglishAliasForTitle(title: string): Promise<string | null> {
// MusicBrainz는 곡명 검색이 아티스트 검색보다 약간 복잡
// ws/2/recording 또는 ws/2/work를 활용해야 함
// 구현 필요 시 알려주세요
// return null;
//}
