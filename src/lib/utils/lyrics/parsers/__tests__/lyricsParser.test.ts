import { parseLyrics } from '../lyricsParser';

describe('parseLyrics', () => {
  it('정상적인 LRC 포맷을 파싱', () => {
    const lrc = '[00:12.34]Hello world\n[00:15.00]Second line';
    const result = parseLyrics(lrc);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ time: 12, text: 'Hello world' });
    expect(result[1]).toEqual({ time: 15, text: 'Second line' });
  });

  it('빈 문자열이면 빈 배열 반환', () => {
    expect(parseLyrics('')).toEqual([]);
  });

  it('공백만 있는 문자열이면 빈 배열 반환', () => {
    expect(parseLyrics('   ')).toEqual([]);
  });

  it('타임스탬프 없는 줄은 무시', () => {
    const lrc = 'No timestamp here\n[00:05.00]Valid line';
    const result = parseLyrics(lrc);

    expect(result).toHaveLength(1);
    expect(result[0]?.text).toBe('Valid line');
  });

  it('텍스트 없는 타임스탬프 줄은 무시', () => {
    const lrc = '[00:05.00]\n[00:10.00]Has text';
    const result = parseLyrics(lrc);

    expect(result).toHaveLength(1);
    expect(result[0]?.text).toBe('Has text');
  });

  it('여러 줄의 가사를 시간 순서대로 파싱', () => {
    const lrc = '[01:00.00]First\n[02:30.50]Second\n[03:45.00]Third';
    const result = parseLyrics(lrc);

    expect(result).toHaveLength(3);
    expect(result[0]?.time).toBe(60);
    expect(result[1]?.time).toBe(150);
    expect(result[2]?.time).toBe(225);
  });

  it('50KB 초과 가사는 보안 검증 실패로 빈 배열 반환', () => {
    const longLyrics = '[00:01.00]' + 'a'.repeat(51000);
    expect(parseLyrics(longLyrics)).toEqual([]);
  });

  it('스크립트 태그 포함된 가사는 보안 검증 실패', () => {
    const malicious = '[00:01.00]Hello<script>alert("xss")</script>';
    expect(parseLyrics(malicious)).toEqual([]);
  });

  it('가사 텍스트의 앞뒤 공백을 제거', () => {
    const lrc = '[00:05.00]  Trimmed text  ';
    const result = parseLyrics(lrc);

    expect(result).toHaveLength(1);
    expect(result[0]?.text).toBe('Trimmed text');
  });
});
