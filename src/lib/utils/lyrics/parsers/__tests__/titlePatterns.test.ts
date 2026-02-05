/**
 * titlePatterns.test.ts - Title 파싱 테스트
 *
 * 실행: npm test -- --testPathPattern=titlePatterns
 * 또는: npm test -- titlePatterns.test.ts
 */

import { parseTitle } from '../titlePatterns';
import { extractArtistAndTitleCustom } from '../stringUtils';

describe('parseTitle', () => {
  // ====================================
  // 1. 일본어 쌍따옴표 패턴
  // ====================================
  describe('japanese-quote pattern', () => {
    it('YOASOBI「アイドル」', () => {
      const result = parseTitle('YOASOBI「アイドル」 Official Music Video');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('YOASOBI');
      expect(result?.title).toBe('アイドル');
      expect(result?.patternUsed).toBe('japanese-quote');
      expect(result?.skipSwap).toBe(true);
    });

    it('Ado『踊』', () => {
      const result = parseTitle('Ado『踊』');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Ado');
      expect(result?.title).toBe('踊');
    });
  });

  // ====================================
  // 2. 범용 따옴표 패턴 (quoted-title)
  // ====================================
  describe('quoted-title pattern', () => {
    it('"Your Idol" | Sony Animation', () => {
      const result = parseTitle('"Your Idol" | Official Song Clip | Sony Animation');
      expect(result).not.toBeNull();
      expect(result?.artist).toBeNull();
      expect(result?.title).toBe('Your Idol');
      expect(result?.skipSwap).toBe(true);
    });

    it("'Song Name' | Official MV", () => {
      const result = parseTitle("'Song Name' | Official MV");
      expect(result).not.toBeNull();
      expect(result?.artist).toBeNull();
      expect(result?.title).toBe('Song Name');
    });
  });

  // ====================================
  // 3. 중첩 괄호 → null (fallback)
  // ====================================
  describe('nested-parentheses pattern (fallback)', () => {
    it('HEYA (해야 (HEYA)) → null', () => {
      const result = parseTitle('HEYA (해야 (HEYA))');
      expect(result).toBeNull();
    });
  });

  // ====================================
  // 3-1. OST From 패턴 제외 (quoted-title이 잘못 매칭하지 않도록)
  // ====================================
  describe('OST From pattern exclusion', () => {
    it('Shakira - Zoo (From "Zootopia 2") → artist: Shakira, title: Zoo', () => {
      const result = parseTitle('Shakira - Zoo (From "Zootopia 2") Official Music Video');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Shakira');
      expect(result?.title).toBe('Zoo');
      expect(result?.patternUsed).toBe('delimiter-dash');
    });

    it('Artist - Song (From "Movie") → delimiter-dash 패턴 사용', () => {
      const result = parseTitle('Elsa - Let It Go (From "Frozen")');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Elsa');
      expect(result?.title).toBe('Let It Go');
      expect(result?.patternUsed).toBe('delimiter-dash');
    });
  });

  // ====================================
  // 4. 따옴표 패턴 - 아티스트 있는 경우
  // ====================================
  describe('quoted-title pattern with artist', () => {
    it('Artist "Title"', () => {
      const result = parseTitle('Taylor Swift "Anti-Hero"');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Taylor Swift');
      expect(result?.title).toBe('Anti-Hero');
      expect(result?.patternUsed).toBe('quoted-title');
      expect(result?.skipSwap).toBe(true);
    });

    it("Artist 'Title'", () => {
      const result = parseTitle("Ed Sheeran 'Shape of You'");
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Ed Sheeran');
      expect(result?.title).toBe('Shape of You');
      expect(result?.patternUsed).toBe('quoted-title');
    });
  });

  // ====================================
  // 5. 구분자 패턴: 하이픈 (-)
  // ====================================
  describe('delimiter-dash pattern', () => {
    it('Artist - Title', () => {
      const result = parseTitle('IU - Blueming');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('IU');
      expect(result?.title).toBe('Blueming');
      expect(result?.patternUsed).toBe('delimiter-dash');
      expect(result?.skipSwap).toBe(false);
    });

    it('Artist - Title (Official MV)', () => {
      const result = parseTitle('BTS - Dynamite (Official MV)');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('BTS');
      expect(result?.title).toBe('Dynamite');
    });

    it('윤하(YOUNHA) - 사건의 지평선', () => {
      const result = parseTitle('윤하(YOUNHA) - 사건의 지평선');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('YOUNHA');
      expect(result?.title).toBe('사건의 지평선');
      expect(result?.artistVariants).toContain('윤하');
    });
  });

  // ====================================
  // 6. 구분자 패턴: 슬래시 (/)
  // ====================================
  describe('delimiter-slash pattern', () => {
    it('Artist / Title', () => {
      const result = parseTitle('Coldplay / Yellow');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Coldplay');
      expect(result?.title).toBe('Yellow');
      expect(result?.patternUsed).toBe('delimiter-slash');
    });
  });

  // ====================================
  // 7. 구분자 패턴: 파이프 (|)
  // ====================================
  describe('delimiter-pipe pattern', () => {
    it('Artist | Title', () => {
      const result = parseTitle('Adele | Hello');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Adele');
      expect(result?.title).toBe('Hello');
      expect(result?.patternUsed).toBe('delimiter-pipe');
    });

    it('Artist | Title | Extra info', () => {
      const result = parseTitle('Adele | Rolling in the Deep | Official Video');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Adele');
      expect(result?.title).toBe('Rolling in the Deep');
    });
  });

  // ====================================
  // 8. 괄호 패턴
  // ====================================
  describe('parentheses pattern', () => {
    it('Artist (Title)', () => {
      const result = parseTitle('NewJeans (Hype Boy)');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('NewJeans');
      expect(result?.title).toBe('Hype Boy');
      expect(result?.patternUsed).toBe('parentheses');
    });
  });

  // ====================================
  // 9. 트랙 번호 패턴
  // ====================================
  describe('track-number pattern', () => {
    it('01. Title', () => {
      const result = parseTitle('01. REBEL HEART');
      expect(result).not.toBeNull();
      expect(result?.artist).toBeNull();
      expect(result?.title).toBe('REBEL HEART');
      expect(result?.patternUsed).toBe('track-number');
    });

    it('Track 5. Title', () => {
      const result = parseTitle('Track 5. Love Story');
      expect(result).not.toBeNull();
      expect(result?.artist).toBeNull();
      expect(result?.title).toBe('Love Story');
    });

    it('Artist - 01. Song (트랙 번호가 title에 있는 경우)', () => {
      // delimiter-dash 패턴으로 파싱 → title에 트랙 번호 포함 → removeExtraInfo에서 제거
      const result = parseTitle('Taylor Swift - 01. Anti-Hero');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Taylor Swift');
      expect(result?.title).toBe('Anti-Hero'); // 트랙 번호 제거됨
      expect(result?.patternUsed).toBe('delimiter-dash');
    });
  });

  // ====================================
  // 10. 부가정보 제거 테스트
  // ====================================
  describe('extra info removal', () => {
    it('Official MV 제거', () => {
      const result = parseTitle('IU - Palette Official MV');
      expect(result?.title).toBe('Palette');
    });

    it('MV 제거', () => {
      const result = parseTitle('IU - Celebrity MV');
      expect(result?.title).toBe('Celebrity');
    });

    it('Lyric Video 제거', () => {
      const result = parseTitle('Ed Sheeran - Perfect (Lyric Video)');
      expect(result?.title).toBe('Perfect');
    });
  });

  // ====================================
  // 11. 매칭 실패 케이스
  // ====================================
  describe('no match (fallback needed)', () => {
    it('단순 타이틀 (구분자 없음)', () => {
      const result = parseTitle('Just A Simple Title');
      expect(result).toBeNull();
    });

    it('빈 문자열', () => {
      const result = parseTitle('');
      expect(result).toBeNull();
    });
  });
});

// ====================================
// extractArtistAndTitleCustom 래퍼 테스트
// ====================================
describe('extractArtistAndTitleCustom', () => {
  it('parseTitle 래퍼로 동작', () => {
    const result = extractArtistAndTitleCustom('IU - Blueming');
    expect(result).not.toBeNull();
    expect(result?.artist).toBe('IU');
    expect(result?.title).toBe('Blueming');
  });

  it('artist가 null이면 null 반환', () => {
    const result = extractArtistAndTitleCustom('01. REBEL HEART');
    // track-number 패턴은 artist가 null이므로 extractArtistAndTitleCustom은 null 반환
    expect(result).toBeNull();
  });
});

// ====================================
// 추가 테스트 케이스 (여기에 계속 추가)
// ====================================
describe('additional test cases', () => {
  it('"Golden" Official Lyric Video | KPop Demon Hunters | Sony Animation', () => {
    const result = parseTitle('"Golden" Official Lyric Video | KPop Demon Hunters | Sony Animation');
    expect(result).not.toBeNull();
    expect(result?.artist).toBeNull();
    expect(result?.title).toBe('Golden');
  });

  it('요네즈 켄시　- 아이리스 아웃    Kenshi Yonezu - IRIS OUT', () => {
    const result = parseTitle('요네즈 켄시　- 아이리스 아웃    Kenshi Yonezu - IRIS OUT');
    expect(result).not.toBeNull();
    expect(result?.artist).toBe('Kenshi Yonezu');
    expect(result?.title).toBe('IRIS OUT');
  });

  it('DJ Snake - Let Me Love You ft. Justin Bieber', () => {
    const result = parseTitle('DJ Snake - Let Me Love You ft. Justin Bieber');
    expect(result).not.toBeNull();
    expect(result?.artist).toBe('DJ Snake');
    expect(result?.title).toBe('Let Me Love You');
  });

  it('Mrs. GREEN APPLE「lulu.」Official Music Video', () => {
    const result = parseTitle('Mrs. GREEN APPLE「lulu.」Official Music Video');
    expect(result).not.toBeNull();
    expect(result?.artist).toBe('Mrs. GREEN APPLE');
    expect(result?.title).toBe('lulu.');
  });
});

// ====================================
// parseTitleWithFallback 통합 테스트
// ====================================
import { parseTitleWithFallback } from '../titleParser';

describe('parseTitleWithFallback (통합 테스트)', () => {
  describe('패턴 매칭 성공 (source: pattern)', () => {
    it('IU - Blueming → 패턴 파싱', () => {
      const result = parseTitleWithFallback('IU - Blueming');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('IU');
      expect(result?.title).toBe('Blueming');
      expect(result?.source).toBe('pattern');
    });

    it('YOASOBI「アイドル」→ 일본어 쌍따옴표 패턴', () => {
      const result = parseTitleWithFallback('YOASOBI「アイドル」Official Music Video');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('YOASOBI');
      expect(result?.title).toBe('アイドル');
      expect(result?.source).toBe('pattern');
    });
  });

  describe('Fallback 사용 (source: fallback)', () => {
    it('"Golden" | Sony Animation + 채널명 fallback', () => {
      const result = parseTitleWithFallback('"Golden" Official Lyric Video | KPop Demon Hunters | Sony Animation', {
        channelTitle: 'Sony Pictures Animation',
      });
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Sony Pictures Animation'); // 채널명 전체 유지
      expect(result?.title).toBe('Golden'); // 패턴에서 추출한 title 보존
      expect(result?.source).toBe('fallback');
    });

    it('채널명에 Animation 포함 → removeExtraInfo 미적용', () => {
      const result = parseTitleWithFallback('Some Title Without Artist', {
        channelTitle: 'Sony Pictures Animation',
      });
      // Animation이 제거되지 않아야 함
      expect(result?.artist).toBe('Sony Pictures Animation');
    });

    it('Topic 채널에서 아티스트 추출', () => {
      const result = parseTitleWithFallback('Blueming', {
        channelTitle: 'IU - Topic',
      });
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('IU');
      expect(result?.title).toBe('Blueming');
      expect(result?.source).toBe('fallback');
    });
  });

  describe('OST From 패턴 처리', () => {
    it('Shakira - Zoo (From "Zootopia 2") → delimiter-dash 사용', () => {
      const result = parseTitleWithFallback('Shakira - Zoo (From "Zootopia 2") Official Music Video');
      expect(result).not.toBeNull();
      expect(result?.artist).toBe('Shakira');
      expect(result?.title).toBe('Zoo');
      expect(result?.source).toBe('pattern');
    });
  });

  describe('에러 케이스', () => {
    it('파싱 완전 실패 → null', () => {
      const result = parseTitleWithFallback('Just A Simple Title');
      // 옵션 없이 패턴 매칭 실패 → null
      expect(result).toBeNull();
    });

    it('빈 문자열 → null', () => {
      expect(parseTitleWithFallback('')).toBeNull();
    });
  });
});
