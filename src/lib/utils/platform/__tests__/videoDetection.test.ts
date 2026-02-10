import { extractVideoIdFromUrl, shouldDetect } from '../videoDetection';

describe('extractVideoIdFromUrl', () => {
  it('일반적인 YouTube URL에서 videoId 추출', () => {
    expect(extractVideoIdFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('추가 쿼리 파라미터가 있는 URL', () => {
    expect(extractVideoIdFromUrl('https://www.youtube.com/watch?v=abc123&list=PLxyz')).toBe('abc123');
  });

  it('v가 첫 번째 파라미터가 아닌 경우', () => {
    expect(extractVideoIdFromUrl('https://www.youtube.com/watch?list=PLxyz&v=abc123')).toBe('abc123');
  });

  it('videoId가 없는 URL은 null 반환', () => {
    expect(extractVideoIdFromUrl('https://www.youtube.com/watch')).toBeNull();
  });

  it('빈 문자열은 null 반환', () => {
    expect(extractVideoIdFromUrl('')).toBeNull();
  });

  it('YouTube가 아닌 URL은 null 반환', () => {
    expect(extractVideoIdFromUrl('https://www.google.com')).toBeNull();
  });

  it('v 파라미터가 비어있는 경우 null 반환', () => {
    expect(extractVideoIdFromUrl('https://www.youtube.com/watch?v=&list=PLxyz')).toBeNull();
  });
});

describe('shouldDetect', () => {
  it('새로운 videoId면 true 반환', () => {
    expect(shouldDetect('newVideo_001', 0)).toBe(true);
  });

  it('같은 videoId를 쿨다운 내 재호출하면 false 반환', () => {
    shouldDetect('cooldownTest_001', 60000);
    expect(shouldDetect('cooldownTest_001', 60000)).toBe(false);
  });

  it('같은 videoId라도 쿨다운이 0이면 항상 true', () => {
    shouldDetect('zeroCooldown_001', 0);
    expect(shouldDetect('zeroCooldown_001', 0)).toBe(true);
  });

  it('다른 videoId면 쿨다운 무관하게 true', () => {
    shouldDetect('videoA_001', 60000);
    expect(shouldDetect('videoB_001', 60000)).toBe(true);
  });
});
