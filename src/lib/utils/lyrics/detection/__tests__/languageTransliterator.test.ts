import { splitIntoLangGroups } from '../languageSpanSplitter';
import { transliterateAndMerge } from '../languageTransliterator';

// @dehoist/romanize-thai 모킹 (ESM 모듈 문제 회피)
jest.mock('@dehoist/romanize-thai', () => ({
  __esModule: true,
  default: jest.fn((text: string) => {
    // 간단한 태국어 → 로마자 변환 시뮬레이션
    return text
      .replace(/ส/g, 's')
      .replace(/วั/g, 'wa')
      .replace(/ดี/g, 'di')
      .replace(/ฉ/g, 'ch')
      .replace(/ัน/g, 'an')
      .replace(/รั/g, 'ra')
      .replace(/ก/g, 'k')
      .replace(/เธ/g, 'the')
      .replace(/อ/g, 'o');
  }),
}));

describe('languageTransliterator integration', () => {
  describe('Existing languages (dedicated libraries)', () => {
    it('should romanize Korean text', async () => {
      const spans = splitIntoLangGroups('안녕하세요');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
    });

    it('should romanize Japanese text', async () => {
      const spans = splitIntoLangGroups('こんにちは');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
    });

    it('should romanize Chinese text', async () => {
      const spans = splitIntoLangGroups('你好');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
    });
  });

  describe('New languages (universal library)', () => {
    it('should romanize Greek text', async () => {
      const spans = splitIntoLangGroups('Γεια σου');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z\s]/);
      expect(result).not.toContain('Γ');
    });

    it('should romanize Georgian text', async () => {
      const spans = splitIntoLangGroups('გამარჯობა');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
      expect(result).not.toContain('გ');
    });

    it('should romanize Armenian text', async () => {
      const spans = splitIntoLangGroups('Բարև');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
      expect(result).not.toContain('Բ');
    });

    it('should romanize Thai text', async () => {
      const spans = splitIntoLangGroups('สวัสดี');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
      expect(result).not.toContain('ส');
    });

    it('should romanize Arabic text', async () => {
      const spans = splitIntoLangGroups('مرحبا');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
      expect(result).not.toContain('م');
    });

    it('should romanize Hebrew text', async () => {
      const spans = splitIntoLangGroups('שלום');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
      expect(result).not.toContain('ש');
    });

    it('should romanize Hindi text', async () => {
      const spans = splitIntoLangGroups('नमस्ते');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
      expect(result).not.toContain('न');
    });
  });

  describe('Mixed language romanization', () => {
    it('should romanize Korean + Greek mix', async () => {
      const spans = splitIntoLangGroups('안녕 Γεια');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z\s]/);
      expect(result).not.toContain('안');
      expect(result).not.toContain('Γ');
    });

    it('should preserve Latin text while romanizing others', async () => {
      const spans = splitIntoLangGroups('Hello 안녕');
      const result = await transliterateAndMerge(spans);
      expect(result).toContain('Hello');
      expect(result).not.toContain('안');
    });

    it('should romanize multiple different scripts', async () => {
      const spans = splitIntoLangGroups('안녕 Γεια สวัสดี');
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z\s]/);
      // Should not contain any original non-Latin characters
      expect(result).not.toMatch(/[안녕Γειαสวัสดี]/);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty spans', async () => {
      const spans = splitIntoLangGroups('');
      const result = await transliterateAndMerge(spans);
      expect(result).toBe('');
    });

    it('should handle Latin-only text', async () => {
      const spans = splitIntoLangGroups('Hello World');
      const result = await transliterateAndMerge(spans);
      expect(result).toBe('Hello World');
    });

    it('should handle text with numbers and symbols', async () => {
      const spans = splitIntoLangGroups('Test 123 !@#');
      const result = await transliterateAndMerge(spans);
      expect(result).toContain('Test');
      expect(result).toContain('123');
    });
  });

  describe('Real-world lyrics examples', () => {
    it('should romanize Greek song lyrics', async () => {
      const lyrics = 'Σ\'αγαπώ';
      const spans = splitIntoLangGroups(lyrics);
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
    });

    it('should romanize Arabic song lyrics', async () => {
      const lyrics = 'أحبك';
      const spans = splitIntoLangGroups(lyrics);
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
    });

    it('should romanize Thai song lyrics', async () => {
      const lyrics = 'ฉันรักเธอ';
      const spans = splitIntoLangGroups(lyrics);
      const result = await transliterateAndMerge(spans);
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]/);
    });
  });
});
