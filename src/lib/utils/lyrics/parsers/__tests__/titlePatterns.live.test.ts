/**
 * titlePatterns.live.test.ts - YouTube 차트 실시간 테스트
 *
 * 실행: npm test -- titlePatterns.live
 *
 * YouTube Data API에서 실제 차트 100개를 가져와서 파싱 결과를 확인합니다.
 */

// .env 파일 로드
import * as dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import { parseTitle } from '../titlePatterns';
import { extractArtistAndTitleCustom } from '../stringUtils';

interface YouTubeChartVideo {
  id: string;
  title: string;
  channelTitle: string;
  region: string; // 국가 코드 추가
}

/**
 * YouTube Data API에서 인기 음악 차트 가져오기
 */
async function fetchYouTubeChart(regionCode: string, maxResults: number = 50): Promise<YouTubeChartVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY가 .env 파일에 설정되지 않았습니다.');
  }

  // 음악 카테고리 (categoryId=10)의 인기 동영상 가져오기
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&videoCategoryId=10&maxResults=${maxResults}&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('YouTube API 응답 형식이 올바르지 않습니다.');
    }

    return data.items.map((item: { id: string; snippet: { title: string; channelTitle: string } }) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      region: regionCode,
    }));
  } catch (error) {
    console.error(`[YouTube Chart ${regionCode}] API 호출 실패:`, error);
    throw error;
  }
}

/**
 * 여러 국가의 차트를 동시에 가져오기
 */
async function fetchMultiRegionCharts(regions: string[], maxPerRegion: number = 50) {
  console.log(`[YouTube Chart] ${regions.join(', ')} 차트 가져오는 중...\n`);

  const results = await Promise.allSettled(regions.map((region) => fetchYouTubeChart(region, maxPerRegion)));

  const allVideos: YouTubeChartVideo[] = [];

  results.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      allVideos.push(...result.value);
      console.log(`[${regions[idx]}] ${result.value.length}개 가져옴`);
    } else {
      console.error(`[${regions[idx]}] 실패:`, result.reason.message);
    }
  });

  return allVideos;
}

describe('YouTube Chart Live Test', () => {
  // 기본적으로 skip 처리 (수동으로 실행할 때만 활성화)
  // 활성화하려면: npm test -- titlePatterns.live --testNamePattern="차트"
  describe('YouTube 인기 차트 (한국, 미국, 일본) 테스트', () => {
    let chartVideos: YouTubeChartVideo[] = [];

    beforeAll(async () => {
      console.log('\n[YouTube Chart] 차트 데이터 가져오는 중...\n');

      // 한국(KR), 미국(US), 일본(JP) 차트 가져오기 (각 50개)
      chartVideos = await fetchMultiRegionCharts(['KR', 'US', 'JP'], 50);

      console.log(`\n[YouTube Chart] 총 ${chartVideos.length}개 가져옴\n`);
    }, 60000); // 60초 타임아웃 (3개국)

    it('차트 150개 파싱 결과 분석', () => {
      const results = chartVideos.map((video, idx) => {
        const parsed = parseTitle(video.title);

        return {
          순위: idx + 1,
          국가: video.region,
          제목: video.title.substring(0, 50), // 제목 길이 제한
          아티스트: parsed?.artist || '❌',
          타이틀: parsed?.title || '❌',
          패턴: parsed?.patternUsed || 'none',
          채널: video.channelTitle.substring(0, 20),
        };
      });

      // 전체 결과 출력
      console.log('\n========== 전체 파싱 결과 ==========\n');
      console.table(results);

      // 통계 계산
      const successCount = results.filter((r) => r.아티스트 !== '❌').length;
      const failureCount = results.filter((r) => r.아티스트 === '❌').length;
      const successRate = ((successCount / results.length) * 100).toFixed(1);

      console.log('\n========== 통계 ==========');
      console.log(`성공: ${successCount}개 (${successRate}%)`);
      console.log(`실패: ${failureCount}개 (${(100 - parseFloat(successRate)).toFixed(1)}%)`);

      // 실패한 케이스만 출력
      if (failureCount > 0) {
        const failures = results.filter((r) => r.아티스트 === '❌');
        console.log('\n========== 실패한 케이스 ==========\n');
        console.table(failures);

        console.log('\n실패 케이스를 테스트에 추가하려면:');
        failures.forEach((f) => {
          console.log(`it('${chartVideos[f.순위 - 1]?.title}', () => {`);
          console.log(`  const result = parseTitle('${chartVideos[f.순위 - 1]?.title}');`);
          console.log(`  expect(result).not.toBeNull();`);
          console.log(`  expect(result?.artist).toBe('???'); // 수동으로 설정`);
          console.log(`  expect(result?.title).toBe('???'); // 수동으로 설정`);
          console.log(`});\n`);
        });
      }

      // 패턴별 통계
      const patternStats: Record<string, number> = {};
      results.forEach((r) => {
        patternStats[r.패턴] = (patternStats[r.패턴] || 0) + 1;
      });

      console.log('\n========== 패턴별 사용 통계 ==========');
      console.table(
        Object.entries(patternStats)
          .map(([pattern, count]) => ({
            패턴: pattern,
            개수: count,
            비율: `${((count / results.length) * 100).toFixed(1)}%`,
          }))
          .sort((a, b) => b.개수 - a.개수),
      );

      // 국가별 성공률 통계
      const regionStats: Record<string, { total: number; success: number }> = {};
      results.forEach((r) => {
        if (!regionStats[r.국가]) {
          regionStats[r.국가] = { total: 0, success: 0 };
        }
        regionStats[r.국가].total++;
        if (r.아티스트 !== '❌') {
          regionStats[r.국가].success++;
        }
      });

      console.log('\n========== 국가별 성공률 ==========');
      console.table(
        Object.entries(regionStats).map(([region, stats]) => ({
          국가: region,
          성공: stats.success,
          실패: stats.total - stats.success,
          성공률: `${((stats.success / stats.total) * 100).toFixed(1)}%`,
        })),
      );

      // 성공률이 60% 이상이면 테스트 통과 (실제 YouTube 차트는 단순 제목도 많음)
      expect(parseFloat(successRate)).toBeGreaterThanOrEqual(60);
    });

    it('extractArtistAndTitleCustom으로 필터링 테스트', () => {
      const results = chartVideos.map((video, idx) => {
        const parsed = extractArtistAndTitleCustom(video.title);

        return {
          순위: idx + 1,
          국가: video.region,
          제목: video.title.substring(0, 50),
          아티스트: parsed?.artist || '❌ null',
          타이틀: parsed?.title || '❌ null',
          패턴: parsed?.patternUsed || 'none',
        };
      });

      // artist가 null인 케이스 (extractArtistAndTitleCustom이 필터링)
      const nullArtistCases = results.filter((r) => r.아티스트 === '❌ null');

      console.log('\n========== artist=null 케이스 (채널명 fallback 필요) ==========\n');
      console.table(nullArtistCases);

      console.log(`\n총 ${nullArtistCases.length}개가 채널명 fallback을 사용합니다.`);
    });
  });
});
