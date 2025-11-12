import { splitIntoLangGroups } from '../languageSpanSplitter';

describe('languageSpanSplitter', () => {
  describe('Existing languages (Korean, Japanese, Chinese)', () => {
    it('should detect Korean', () => {
      const spans = splitIntoLangGroups('안녕하세요');
      expect(spans).toEqual([{ lang: 'ko', text: '안녕하세요' }]);
    });

    it('should detect Japanese (Hiragana)', () => {
      const spans = splitIntoLangGroups('こんにちは');
      expect(spans).toEqual([{ lang: 'ja', text: 'こんにちは' }]);
    });

    it('should detect Japanese (Katakana)', () => {
      const spans = splitIntoLangGroups('カタカナ');
      expect(spans).toEqual([{ lang: 'ja', text: 'カタカナ' }]);
    });

    it('should detect Chinese (Mandarin)', () => {
      const spans = splitIntoLangGroups('你好');
      expect(spans).toEqual([{ lang: 'zh', text: '你好' }]);
    });

    it('should detect Japanese with Kanji (has Kana in line)', () => {
      const spans = splitIntoLangGroups('日本語です');
      expect(spans).toEqual([{ lang: 'ja', text: '日本語です' }]);
    });
  });

  describe('New languages (unique scripts)', () => {
    it('should detect Greek', () => {
      const spans = splitIntoLangGroups('Γειασου'); // No space to avoid split
      expect(spans).toEqual([{ lang: 'el', text: 'Γειασου' }]);
    });

    it('should detect Georgian', () => {
      const spans = splitIntoLangGroups('გამარჯობა');
      expect(spans).toEqual([{ lang: 'ka', text: 'გამარჯობა' }]);
    });

    it('should detect Armenian', () => {
      const spans = splitIntoLangGroups('Բարև');
      expect(spans).toEqual([{ lang: 'hy', text: 'Բարև' }]);
    });

    it('should detect Thai', () => {
      const spans = splitIntoLangGroups('สวัสดี');
      expect(spans).toEqual([{ lang: 'th', text: 'สวัสดี' }]);
    });

    it('should detect Arabic', () => {
      const spans = splitIntoLangGroups('مرحبا');
      expect(spans).toEqual([{ lang: 'ar', text: 'مرحبا' }]);
    });

    it('should detect Hebrew', () => {
      const spans = splitIntoLangGroups('שלום');
      expect(spans).toEqual([{ lang: 'he', text: 'שלום' }]);
    });

    it('should detect Hindi (Devanagari)', () => {
      const spans = splitIntoLangGroups('नमस्ते');
      expect(spans).toEqual([{ lang: 'hi', text: 'नमस्ते' }]);
    });
  });

  describe('Mixed scripts', () => {
    it('should split Korean and English', () => {
      const spans = splitIntoLangGroups('Hello 안녕');
      expect(spans).toHaveLength(2);
      expect(spans[0]).toEqual({ lang: 'other', text: 'Hello ' });
      expect(spans[1]).toEqual({ lang: 'ko', text: '안녕' });
    });

    it('should split Greek and English', () => {
      const spans = splitIntoLangGroups('Hello Γεια');
      expect(spans).toHaveLength(2);
      expect(spans[0]).toEqual({ lang: 'other', text: 'Hello ' });
      expect(spans[1]).toEqual({ lang: 'el', text: 'Γεια' });
    });

    it('should split multiple scripts', () => {
      const spans = splitIntoLangGroups('안녕 Hello Γεια مرحبا');
      expect(spans.length).toBeGreaterThan(1);
      expect(spans.some((s) => s.lang === 'ko')).toBe(true);
      expect(spans.some((s) => s.lang === 'el')).toBe(true);
      expect(spans.some((s) => s.lang === 'ar')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const spans = splitIntoLangGroups('');
      expect(spans).toEqual([]);
    });

    it('should handle Latin-only text', () => {
      const spans = splitIntoLangGroups('Hello World');
      expect(spans).toEqual([{ lang: 'other', text: 'Hello World' }]);
    });

    it('should handle numbers and punctuation', () => {
      const spans = splitIntoLangGroups('123!?@');
      expect(spans).toEqual([{ lang: 'other', text: '123!?@' }]);
    });
  });
});
