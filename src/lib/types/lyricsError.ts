/**
 * 가사 가져오기 실패 시 오류 코드 및 처리 시스템
 */

export enum LyricsErrorCode {
  // 메타데이터 관련 (1xxx)
  VIDEO_INFO_MISSING = 1001, // 비디오 정보 없음
  ARTIST_TITLE_EXTRACT_FAILED = 1002, // 아티스트/제목 추출 실패
  INVALID_VIDEO_DURATION = 1003, // 잘못된 비디오 길이
  NOT_MUSIC_VIDEO = 1004, // 음악 비디오 아님 (정상적인 스킵 상황)

  // 네트워크 관련 (2xxx)
  NETWORK_ERROR = 2001, // 네트워크 연결 실패
  API_TIMEOUT = 2002, // API 타임아웃
  API_RATE_LIMITED = 2003, // API 요청 제한
  API_SERVER_ERROR = 2004, // API 서버 오류 (5xx)

  // API 응답 관련 (3xxx)
  LRCLIB_NOT_FOUND = 3001, // LRCLib에서 가사 없음
  MUSICBRAINZ_NOT_FOUND = 3002, // MusicBrainz에서 아티스트 없음
  INVALID_RESPONSE = 3003, // 잘못된 API 응답
  EMPTY_SEARCH_RESULTS = 3004, // 검색 결과 없음

  // 가사 처리 관련 (4xxx)
  LYRICS_PARSE_ERROR = 4001, // 가사 파싱 실패
  LYRICS_SYNC_INVALID = 4002, // 동기화 타임스탬프 오류
  LYRICS_EMPTY = 4003, // 빈 가사
  LYRICS_FORMAT_UNSUPPORTED = 4004, // 지원하지 않는 가사 형식

  // 캐시 관련 (5xxx)
  CACHE_READ_ERROR = 5001, // 캐시 읽기 실패
  CACHE_WRITE_ERROR = 5002, // 캐시 저장 실패

  // 기타 (9xxx)
  UNKNOWN_ERROR = 9001, // 알 수 없는 오류
}

export interface LyricsErrorAction {
  type: 'retry' | 'manual_search' | 'ignore';
}

export const LYRICS_ERROR_ACTIONS: Record<LyricsErrorCode, LyricsErrorAction[]> = {
  [LyricsErrorCode.VIDEO_INFO_MISSING]: [{ type: 'retry' }],
  [LyricsErrorCode.ARTIST_TITLE_EXTRACT_FAILED]: [{ type: 'manual_search' }],
  [LyricsErrorCode.INVALID_VIDEO_DURATION]: [{ type: 'retry' }],
  [LyricsErrorCode.NOT_MUSIC_VIDEO]: [{ type: 'ignore' }],
  [LyricsErrorCode.NETWORK_ERROR]: [{ type: 'retry' }],
  [LyricsErrorCode.API_TIMEOUT]: [{ type: 'retry' }],
  [LyricsErrorCode.API_RATE_LIMITED]: [{ type: 'retry' }],
  [LyricsErrorCode.API_SERVER_ERROR]: [{ type: 'retry' }],
  [LyricsErrorCode.LRCLIB_NOT_FOUND]: [{ type: 'manual_search' }, { type: 'ignore' }],
  [LyricsErrorCode.MUSICBRAINZ_NOT_FOUND]: [{ type: 'manual_search' }],
  [LyricsErrorCode.INVALID_RESPONSE]: [{ type: 'retry' }],
  [LyricsErrorCode.EMPTY_SEARCH_RESULTS]: [{ type: 'manual_search' }],
  [LyricsErrorCode.LYRICS_PARSE_ERROR]: [{ type: 'retry' }],
  [LyricsErrorCode.LYRICS_SYNC_INVALID]: [{ type: 'ignore' }],
  [LyricsErrorCode.LYRICS_EMPTY]: [{ type: 'manual_search' }],
  [LyricsErrorCode.LYRICS_FORMAT_UNSUPPORTED]: [{ type: 'manual_search' }],
  [LyricsErrorCode.CACHE_READ_ERROR]: [{ type: 'retry' }],
  [LyricsErrorCode.CACHE_WRITE_ERROR]: [{ type: 'ignore' }],
  [LyricsErrorCode.UNKNOWN_ERROR]: [{ type: 'retry' }],
};

export class LyricsError extends Error {
  public readonly code: LyricsErrorCode;
  public readonly retryable: boolean;
  public readonly actions: LyricsErrorAction[];
  public readonly context?: Record<string, unknown>;

  constructor(code: LyricsErrorCode, message?: string, context?: Record<string, unknown>) {
    const errorMessage = message || `Lyrics error: ${code}`;
    super(errorMessage);

    this.name = 'LyricsError';
    this.code = code;
    this.context = context;
    this.actions = LYRICS_ERROR_ACTIONS[code] || [];

    // 재시도 가능 여부 판단
    this.retryable = this.actions.some((action) => action.type === 'retry');
  }

  static fromNetworkError(error: Error, context?: Record<string, unknown>): LyricsError {
    // AbortController 타임아웃: name='AbortError', message='The operation was aborted'
    if (error.name === 'AbortError') {
      return new LyricsError(LyricsErrorCode.API_TIMEOUT, error.message, context);
    }
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return new LyricsError(LyricsErrorCode.API_TIMEOUT, error.message, context);
    }
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return new LyricsError(LyricsErrorCode.API_RATE_LIMITED, error.message, context);
    }
    return new LyricsError(LyricsErrorCode.NETWORK_ERROR, error.message, context);
  }

  static fromHttpStatus(status: number, context?: Record<string, unknown>): LyricsError {
    switch (status) {
      case 404:
        return new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND, undefined, context);
      case 429:
        return new LyricsError(LyricsErrorCode.API_RATE_LIMITED, undefined, context);
      case 408:
        return new LyricsError(LyricsErrorCode.API_TIMEOUT, undefined, context);
      default:
        if (status >= 500) {
          return new LyricsError(LyricsErrorCode.API_SERVER_ERROR, undefined, context);
        }
        return new LyricsError(LyricsErrorCode.INVALID_RESPONSE, undefined, context);
    }
  }
}
