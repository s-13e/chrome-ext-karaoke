/**
 * LRCLib API 에러 핸들링 테스트
 * - LyricsError 클래스의 에러 분류 로직 검증
 * - 네트워크 에러 → LyricsErrorCode 매핑
 * - HTTP 상태 코드 → LyricsErrorCode 매핑
 */
import { LyricsError, LyricsErrorCode } from '@lib/types/lyricsError';

describe('LyricsError.fromNetworkError', () => {
  it('AbortError를 API_TIMEOUT으로 분류', () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const result = LyricsError.fromNetworkError(abortError);
    expect(result.code).toBe(LyricsErrorCode.API_TIMEOUT);
    expect(result.retryable).toBe(true);
  });

  it('timeout 메시지를 API_TIMEOUT으로 분류', () => {
    const error = new Error('Request timeout');
    const result = LyricsError.fromNetworkError(error);
    expect(result.code).toBe(LyricsErrorCode.API_TIMEOUT);
  });

  it('rate limit 메시지를 API_RATE_LIMITED로 분류', () => {
    const error = new Error('Too many requests, rate limit exceeded');
    const result = LyricsError.fromNetworkError(error);
    expect(result.code).toBe(LyricsErrorCode.API_RATE_LIMITED);
  });

  it('429 메시지를 API_RATE_LIMITED로 분류', () => {
    const error = new Error('HTTP 429');
    const result = LyricsError.fromNetworkError(error);
    expect(result.code).toBe(LyricsErrorCode.API_RATE_LIMITED);
  });

  it('일반 네트워크 에러는 NETWORK_ERROR로 분류', () => {
    const error = new Error('Failed to fetch');
    const result = LyricsError.fromNetworkError(error);
    expect(result.code).toBe(LyricsErrorCode.NETWORK_ERROR);
    expect(result.retryable).toBe(true);
  });

  it('context가 포함됨', () => {
    const error = new Error('network down');
    const context = { url: 'https://lrclib.net/api/search', attempt: 2 };
    const result = LyricsError.fromNetworkError(error, context);
    expect(result.context).toEqual(context);
  });
});

describe('LyricsError.fromHttpStatus', () => {
  it('404를 LRCLIB_NOT_FOUND로 분류', () => {
    const result = LyricsError.fromHttpStatus(404);
    expect(result.code).toBe(LyricsErrorCode.LRCLIB_NOT_FOUND);
    expect(result.retryable).toBe(false);
  });

  it('429를 API_RATE_LIMITED로 분류', () => {
    const result = LyricsError.fromHttpStatus(429);
    expect(result.code).toBe(LyricsErrorCode.API_RATE_LIMITED);
    expect(result.retryable).toBe(true);
  });

  it('408를 API_TIMEOUT으로 분류', () => {
    const result = LyricsError.fromHttpStatus(408);
    expect(result.code).toBe(LyricsErrorCode.API_TIMEOUT);
    expect(result.retryable).toBe(true);
  });

  it('500을 API_SERVER_ERROR로 분류', () => {
    const result = LyricsError.fromHttpStatus(500);
    expect(result.code).toBe(LyricsErrorCode.API_SERVER_ERROR);
    expect(result.retryable).toBe(true);
  });

  it('503을 API_SERVER_ERROR로 분류', () => {
    const result = LyricsError.fromHttpStatus(503);
    expect(result.code).toBe(LyricsErrorCode.API_SERVER_ERROR);
  });

  it('400을 INVALID_RESPONSE로 분류', () => {
    const result = LyricsError.fromHttpStatus(400);
    expect(result.code).toBe(LyricsErrorCode.INVALID_RESPONSE);
  });
});

describe('LyricsError 인스턴스', () => {
  it('retryable 에러 코드의 retryable이 true', () => {
    const error = new LyricsError(LyricsErrorCode.NETWORK_ERROR);
    expect(error.retryable).toBe(true);
  });

  it('non-retryable 에러 코드의 retryable이 false', () => {
    const error = new LyricsError(LyricsErrorCode.NOT_MUSIC_VIDEO);
    expect(error.retryable).toBe(false);
  });

  it('actions 배열이 올바르게 매핑됨', () => {
    const error = new LyricsError(LyricsErrorCode.LRCLIB_NOT_FOUND);
    expect(error.actions).toContainEqual({ type: 'manual_search' });
    expect(error.actions).toContainEqual({ type: 'ignore' });
  });

  it('name이 LyricsError로 설정됨', () => {
    const error = new LyricsError(LyricsErrorCode.UNKNOWN_ERROR);
    expect(error.name).toBe('LyricsError');
  });

  it('커스텀 메시지 지원', () => {
    const error = new LyricsError(LyricsErrorCode.NETWORK_ERROR, 'Custom message');
    expect(error.message).toBe('Custom message');
  });

  it('기본 메시지 포함', () => {
    const error = new LyricsError(LyricsErrorCode.NETWORK_ERROR);
    expect(error.message).toContain('2001');
  });
});
