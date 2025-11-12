import { arabicRomanizer } from '../arabicRomanizer';

describe('arabicRomanizer', () => {
  it('아랍어 기본 텍스트를 로마자로 변환', () => {
    const result = arabicRomanizer('مرحبا');
    expect(result).toBeTruthy();
    expect(result).toMatch(/[a-zA-Z]+/);
    expect(result).not.toContain('م');
  });

  it('아랍어 인사말 변환', () => {
    const result = arabicRomanizer('شكرا');
    expect(result).toBeTruthy();
    expect(result).toMatch(/[a-zA-Z]+/);
    expect(result).not.toContain('ش');
  });

  it('빈 문자열 처리', () => {
    const result = arabicRomanizer('');
    expect(result).toBe('');
  });

  it('알 수 없는 문자 처리 (구두점)', () => {
    const result = arabicRomanizer('مرحبا!');
    expect(result).toContain('!');
    expect(result).not.toContain('م');
  });

  it('아랍어 변환 확인', () => {
    const result = arabicRomanizer('مرحبا');
    expect(result).toBeTruthy();
    expect(result).not.toContain('م');
  });
});
