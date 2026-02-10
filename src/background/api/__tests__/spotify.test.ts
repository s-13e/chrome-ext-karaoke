import { validateSpotifyResult, SpotifyTrackResult } from '../spotify';

const makeResult = (artist: string, name: string): SpotifyTrackResult => ({
  artist,
  name,
  album: '',
  spotifyId: '',
});

describe('validateSpotifyResult', () => {
  it('artist가 일치하면 통과', () => {
    expect(validateSpotifyResult('Post Malone', 'Circles', makeResult('Post Malone', 'Circles'))).toBe(true);
  });

  it('title만 일치해도 통과', () => {
    expect(validateSpotifyResult('HYBE LABELS', 'Dynamite', makeResult('BTS', 'Dynamite'))).toBe(true);
  });

  it('artist만 일치해도 통과', () => {
    expect(validateSpotifyResult('Taylor Swift', 'Love Story', makeResult('Taylor Swift', 'Bad Blood'))).toBe(true);
  });

  it('둘 다 불일치하면 거부', () => {
    expect(validateSpotifyResult('Taylor Swift', 'Love Story', makeResult('Ed Sheeran', 'Shape of You'))).toBe(false);
  });

  it('대소문자 무시', () => {
    expect(validateSpotifyResult('imagine dragons', 'Believer', makeResult('Imagine Dragons', 'believer'))).toBe(true);
  });

  it('하이픈으로 연결된 토큰도 분리', () => {
    expect(
      validateSpotifyResult('Twenty-One Pilots', 'Stressed Out', makeResult('twenty one pilots', 'Stressed Out')),
    ).toBe(true);
  });

  it('3글자 미만 토큰은 무시', () => {
    // "BT" (2글자)는 토큰 비교에서 제외됨
    expect(validateSpotifyResult('BT', 'Go', makeResult('BT', 'Go'))).toBe(false);
  });

  it('빈 문자열은 거부', () => {
    expect(validateSpotifyResult('', '', makeResult('BTS', 'Dynamite'))).toBe(false);
  });

  it('부분 artist 일치 (멀티 토큰)', () => {
    expect(validateSpotifyResult('Maroon 5', 'Sugar', makeResult('Maroon Five', 'Sugar'))).toBe(true);
  });
});
