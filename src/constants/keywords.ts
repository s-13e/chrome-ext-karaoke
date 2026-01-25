// 싱크가 밀릴 가능성이 높은 영상의 타이틀 키워드 (인트로/아웃트로가 있는 영상)
export const INTRO_OUTRO_KEYWORDS = ['mv', 'remix', 'stage', 'full cam', '직캠', 'fan cam', 'stage mix', '최초 공개'];

// 음악 영상 판별 키워드 (YouTube 영상이 음악 영상인지 판단)
export const MUSIC_KEYWORDS = [
  // 영어
  'official',
  'official video',
  'performance video',
  'Official Lyric Video',
  'mv',
  'm/v',
  'music video',
  'lyric',
  'lyrics',
  'cover',
  'remix',
  'instrumental',
  'karaoke',
  'tj karaoke',
  'ky karaoke',
  // 한국어
  '노래방',
  '가사',
  '커버',
  '노래',
  '뮤직비디오',
  '뮤비',
  // 일본어
  '歌ってみた',
];

// 아티스트, 타이틀 정제 작업 시 삭제할 키워드
export const EXTRA_KEYWORDS = [
  ...MUSIC_KEYWORDS,
  // 영어
  'official audio',
  'animation',
  'League of Legends',
  'kbs',
  'sbs',
  'mbc',
  'jtbc',
  'music bank',
  'inkigayo',
  'Color Coded Lyrics',
  // 'live',
  'full cam',
  'clean ver.',
  'Show! MusicCore',
  'inst.', // 점 포함 버전은 다른 단어와 겹칠 위험 없음
  'ver.', // 점 포함 버전은 안전
  'version', // version은 전체 단어 매칭이므로 안전
  // 한국어
  '뮤직뱅크',
  '음악중심',
  '인기가요',
  '쇼챔피언',
  '방송',
  '직캠',
  '원테이크',
  '교차편집',
  '풀캠',
  '안방1열',
  '직캠4k',
  'stage mix',
];

// 특별 취급 키워드: EXTRA_KEYWORDS에 포함하기에는 다른 단어의 일부로 잘못 삭제될 위험이 있는 키워드
// 예: 'inst' → 'instinct', 'instant', 'instrument' 등과 겹침
//     'ver' → 'very', 'vertical', 'version' 등과 겹침
export const SPECIAL_MUSIC_KEYWORDS = ['ed', 'op', 'mv', 'ost', 'inst'];
