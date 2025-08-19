// constants/youtubeSelectors.ts
export const YOUTUBE_HOST = 'youtube.com';

export const YOUTUBE_PLAYER_SELECTOR = '#movie_player';
export const YOUTUBE_PLAYER_CONTAINER = 'ytd-player';
export const YOUTUBE_VIDEO_SELECTOR = 'video.html5-main-video';
export const YOUTUBE_AD_SELECTOR = '.ad-showing, .ad-interrupting';

// 유튜브 미니플레이어 관련 클래스명 및 셀렉터
export const YOUTUBE_MINI_PLAYER_CONTAINER_SELECTOR = '.html5-video-player';
export const YOUTUBE_MINI_PLAYER_CLASSES = ['ytp-miniplayer', 'ytp-small-mode'];

// (선택적) 미니플레이어 UI 표시 여부 확인용 셀렉터
export const YOUTUBE_MINI_PLAYER_UI_SELECTOR = '.ytp-miniplayer-ui';

// 유튜브 URL 관련 상수
export const YOUTUBE_WATCH_PATH = '/watch';
export const YOUTUBE_VIDEO_ID_PARAM = 'v';

// DOM 선택자 관련 상수
export const YOUTUBE_TITLE_SELECTOR = 'h1.ytd-watch-metadata > yt-formatted-string';

export const YOUTUBE_REGEX = /youtube\.com\/watch\?v=[\w-]{11}/;
