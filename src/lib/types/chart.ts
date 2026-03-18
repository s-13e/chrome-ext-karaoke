// chart.ts
// 차트 기능 관련 타입 정의

/**
 * 차트 카테고리 타입
 * NOTE: 검증된 에버그린 플레이리스트만 포함
 */
export type ChartCategory =
  | 'global-top-100' // 글로벌 TOP 100 (검증됨)
  | 'korea-top-100' // 한국 TOP 100 (검증됨)
  | 'japan-top-100' // 일본 TOP 100 (검증됨)
  | 'us-top-100' // 미국 TOP 100 (검증됨)
  | 'uk-top-100' // 영국 TOP 100 (검증됨)
  | 'brazil-top-100' // 브라질 TOP 100
  | 'india-top-100' // 인도 TOP 100
  | 'spain-top-100' // 스페인 TOP 100
  | 'mexico-top-100'; // 멕시코 TOP 100
// 추후 에버그린 플레이리스트 확인 후 추가 가능:
// | 'trending-now' // 트렌딩
// | 'steady-seller' // 스테디셀러
// | 'rock-classics' // 록 클래식

/**
 * 차트 카테고리 정보
 */
export interface ChartCategoryInfo {
  id: ChartCategory;
  labelKey: string; // i18n translation key (full label)
  shortLabelKey: string; // i18n translation key (short tab label)
  playlistId: string; // YouTube Music 플레이리스트 ID
}

/**
 * 차트 아이템 (곡 정보)
 */
export interface ChartItem {
  rank: number; // 순위
  videoId: string; // YouTube 비디오 ID (MV)
  title: string; // 곡 제목
  artist: string; // 아티스트명
  thumbnailUrl: string; // 썸네일 URL
  viewCount?: number; // 조회수 (옵션)
  publishedAt?: string; // 발행일 (옵션)
  mrVideoId?: string; // MR (반주) 비디오 ID (있으면 MR 버튼 활성화)
}

/**
 * 사용 가능한 차트 카테고리 목록
 * YouTube Music 공식 채널의 플레이리스트 ID 매핑
 *
 * NOTE: 현재는 검증된 에버그린 플레이리스트만 활성화
 * - 에버그린 플레이리스트 조건:
 *   1. YouTube Music 공식 채널 소유
 *   2. 제목에 연도 미포함 (예: "2025", "2024")
 *   3. 플레이리스트 ID가 PL... 형식 (RDCLAK5uy_... 형식은 API 접근 불가할 수 있음)
 *   4. 지속적으로 업데이트되는 큐레이션 플레이리스트
 */
export const CHART_CATEGORIES: ChartCategoryInfo[] = [
  {
    id: 'global-top-100',
    labelKey: 'extChartGlobalTop100',
    shortLabelKey: 'extChartGlobalShort',
    playlistId: 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i',
  },
  {
    id: 'korea-top-100',
    labelKey: 'extChartKoreaTop100',
    shortLabelKey: 'extChartKoreaShort',
    playlistId: 'PL4fGSI1pDJn6jXS_Tv_N9B8Z0HTRVJE0m',
  },
  {
    id: 'japan-top-100',
    labelKey: 'extChartJapanTop100',
    shortLabelKey: 'extChartJapanShort',
    playlistId: 'PL4fGSI1pDJn4-UIb6RKHdxam-oAUULIGB',
  },
  {
    id: 'us-top-100',
    labelKey: 'extChartUSTop100',
    shortLabelKey: 'extChartUSShort',
    playlistId: 'PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI',
  },
  {
    id: 'uk-top-100',
    labelKey: 'extChartUKTop100',
    shortLabelKey: 'extChartUKShort',
    playlistId: 'PL4fGSI1pDJn6_f5P3MnzXg9l3GDfnSlXa',
  },
  {
    id: 'brazil-top-100',
    labelKey: 'extChartBrazilTop100',
    shortLabelKey: 'extChartBrazilShort',
    playlistId: 'PL4fGSI1pDJn7rGBE8kEC0CqTa1nMh9AKB',
  },
  {
    id: 'india-top-100',
    labelKey: 'extChartIndiaTop100',
    shortLabelKey: 'extChartIndiaShort',
    playlistId: 'PL4fGSI1pDJn4pTWyM3t61lOyZ6_4jcNOw',
  },
  {
    id: 'spain-top-100',
    labelKey: 'extChartSpainTop100',
    shortLabelKey: 'extChartSpainShort',
    playlistId: 'PL4fGSI1pDJn6sMPCoD7PdSlEgyUylgxuT',
  },
  {
    id: 'mexico-top-100',
    labelKey: 'extChartMexicoTop100',
    shortLabelKey: 'extChartMexicoShort',
    playlistId: 'PL4fGSI1pDJn6fko1AmNa_pdGPZr5ROFvd',
  },
  // 아래 카테고리들은 에버그린 플레이리스트 확인 후 주석 해제:
  // - RDCLAK5uy_... 형식은 YouTube Music 자동 생성 플레이리스트로 API 접근이 제한될 수 있음
  // - 각 플레이리스트가 작동하는지, 에버그린인지 확인 필요
  // {
  //   id: 'trending-now',
  //   labelKey: 'extChartTrendingNow',
  //   playlistId: 'RDCLAK5uy_kset8DisdE7LSD4TNjEVvrKRTmG7a56sY', // ⚠️ 미검증
  // },
  // {
  //   id: 'steady-seller',
  //   labelKey: 'extChartSteadySeller',
  //   playlistId: 'RDCLAK5uy_lf8okgl2ygD075nhnJVjlfhwp8NsUgEbs', // ⚠️ 미검증
  // },
  // {
  //   id: 'kpop-hits',
  //   labelKey: 'extChartKPopHits',
  //   playlistId: 'RDCLAK5uy_njNnC6l8JNGZdJsrkS71LPSrqaLuq6Puo', // ⚠️ 미검증
  // },
  // {
  //   id: 'pop-hits',
  //   labelKey: 'extChartPopHits',
  //   playlistId: 'RDCLAK5uy_k1RB_JfL4iWBYmPPZ7EgBHZokdCmCKpSA', // ⚠️ 미검증
  // },
  // {
  //   id: 'rock-classics',
  //   labelKey: 'extChartRockClassics',
  //   playlistId: 'RDCLAK5uy_l7gp3mZIX8ynNXFEKqsQVhQ1WZXa5Vpq8', // ⚠️ 미검증
  // },
  // {
  //   id: 'hiphop-heat',
  //   labelKey: 'extChartHipHopHeat',
  //   playlistId: 'RDCLAK5uy_mF4Nb8xJgPPEYSvQJLPFqLKPrBqrqxDKA', // ⚠️ 미검증
  // },
];
