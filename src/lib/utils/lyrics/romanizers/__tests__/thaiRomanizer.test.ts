import { thaiRomanizer } from '../thaiRomanizer';

// @dehoist/romanize-thai 모킹 (ESM 모듈 문제 회피)
jest.mock('@dehoist/romanize-thai', () => ({
  __esModule: true,
  default: jest.fn((text: string) => {
    // 간단한 태국어 → 로마자 변환 시뮬레이션
    return text
      .replace(/ส/g, 's')
      .replace(/วั/g, 'wa')
      .replace(/ดี/g, 'di')
      .replace(/ข/g, 'kh')
      .replace(/อบ/g, 'ob')
      .replace(/คุณ/g, 'khun');
  }),
}));

describe('thaiRomanizer', () => {
  it('태국어 기본 텍스트를 로마자로 변환', () => {
    const result = thaiRomanizer('สวัสดี');
    expect(result).toBeTruthy();
    expect(result).toMatch(/[a-zA-Z]+/);
    expect(result).not.toContain('ส');
  });

  it('태국어 인사말 변환', () => {
    const result = thaiRomanizer('ขอบคุณ');
    expect(result).toBeTruthy();
    expect(result).toMatch(/[a-zA-Z]+/);
    expect(result).not.toContain('ข');
  });

  it('빈 문자열 처리', () => {
    const result = thaiRomanizer('');
    expect(result).toBe('');
  });

  it('알 수 없는 문자 처리 (숫자, 구두점)', () => {
    const result = thaiRomanizer('สวัสดี123!');
    expect(result).toContain('123!');
  });

  it('영어와 태국어 혼합 텍스트 처리', () => {
    const result = thaiRomanizer('Hello สวัสดี');
    expect(result).toContain('Hello');
    expect(result).not.toContain('ส');
  });
});
