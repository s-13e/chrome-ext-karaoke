// background/api/musicBrainz.ts
const BASE_URL = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'AppName/1.0 ( something@gmail.com )';

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
  if (!artistName) return null;

  const query = encodeURIComponent(artistName);
  const url = `${BASE_URL}/artist?query=artist:${query}&fmt=json&limit=3`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!res.ok) {
      // 필요시 로깅 또는 재시도 전략 추가 가능
      return null;
    }

    const data: MusicBrainzResponse = await res.json();

    if (!data.artists || data.artists.length === 0) return null;

    // 1순위: aliases 배열에서 영어(primary 또는 locale='en') 별칭 찾기
    for (const artist of data.artists) {
      if (artist.aliases) {
        const englishAlias = artist.aliases.find(
          (alias) => alias.primary === true || (alias.locale !== undefined && alias.locale.toLowerCase() === 'en'),
        );
        if (englishAlias?.name) {
          return englishAlias.name;
        }
      }

      // 아티스트명이 이미 영어(알파벳, 공백, 하이픈, 작은따옴표)만 포함하면 바로 반환
      if (/^[A-Za-z\s\-']+$/.test(artist.name)) {
        return artist.name;
      }
    }

    // 2순위: 아티스트 중 영어 이름 형태인 첫 번째 반환
    const englishName = data.artists.find((a) => /^[A-Za-z\s\-']+$/.test(a.name))?.name;

    return englishName || null;
  } catch {
    // 에러 처리 로직 (로그 출력 또는 무시)
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
