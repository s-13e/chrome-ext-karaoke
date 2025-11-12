import { hindiRomanizer } from '../hindiRomanizer';

describe('hindiRomanizer', () => {
  it('힌디어 기본 텍스트를 로마자로 변환', () => {
    const result = hindiRomanizer('नमस्ते');
    expect(result).toBeTruthy();
    expect(result).toMatch(/[a-zA-Z]+/);
    expect(result).not.toContain('न');
  });

  it('힌디어 인사말 변환', () => {
    const result = hindiRomanizer('धन्यवाद');
    expect(result).toBeTruthy();
    expect(result).toMatch(/[a-zA-Z]+/);
    expect(result).not.toContain('ध');
  });

  it('빈 문자열 처리', () => {
    const result = hindiRomanizer('');
    expect(result).toBe('');
  });

  it('알 수 없는 문자 처리 (숫자, 구두점)', () => {
    const result = hindiRomanizer('नमस्ते123!');
    expect(result).toContain('123!');
  });

  it('영어와 힌디어 혼합 텍스트 처리', () => {
    const result = hindiRomanizer('Hello नमस्ते');
    expect(result).toContain('Hello');
    expect(result).not.toContain('न');
  });
});
