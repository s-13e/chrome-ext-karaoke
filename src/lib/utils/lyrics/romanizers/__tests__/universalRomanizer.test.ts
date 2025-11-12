import {
  universalRomanizer,
  greekRomanizer,
  hebrewRomanizer,
  georgianRomanizer,
  armenianRomanizer,
} from '../universalRomanizer';

describe('universalRomanizer', () => {
  describe('Greek', () => {
    it('should romanize basic Greek text', () => {
      const result = greekRomanizer('Γεια σου');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z\s]+/);
      expect(result).not.toContain('Γ');
    });

    it('should romanize Greek greeting', () => {
      const result = greekRomanizer('Καλημέρα');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
      expect(result).not.toContain('Κ');
    });

    it('should handle lowercase Greek', () => {
      const result = greekRomanizer('αβγδε');
      expect(result).toBe('abgde');
    });

    it('should handle uppercase Greek', () => {
      const result = greekRomanizer('ΑΒΓΔΕ');
      expect(result).toBe('ABGDE');
    });

    it('should handle empty string', () => {
      const result = greekRomanizer('');
      expect(result).toBe('');
    });

    it('should handle unknown characters', () => {
      const result = greekRomanizer('Γεια123!');
      expect(result).toContain('123!');
    });
  });

  describe('Hebrew', () => {
    it('should romanize basic Hebrew text', () => {
      const result = hebrewRomanizer('שלום');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
      expect(result).not.toContain('ש');
    });

    it('should romanize Hebrew greeting', () => {
      const result = hebrewRomanizer('תודה');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
      expect(result).not.toContain('ת');
    });

    it('should handle final forms', () => {
      const result = hebrewRomanizer('ךםןףץ'); // Final forms
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
    });

    it('should handle empty string', () => {
      const result = hebrewRomanizer('');
      expect(result).toBe('');
    });

    it('should handle unknown characters', () => {
      const result = hebrewRomanizer('שלום123!');
      expect(result).toContain('123!');
    });
  });

  describe('Georgian', () => {
    it('should romanize Georgian text', () => {
      const result = georgianRomanizer('გამარჯობა');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z']+/);
      expect(result).not.toContain('გ');
    });

    it('should romanize Georgian greeting', () => {
      const result = georgianRomanizer('მადლობა');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
      expect(result).not.toContain('მ');
    });

    it('should handle empty string', () => {
      const result = georgianRomanizer('');
      expect(result).toBe('');
    });

    it('should handle unknown characters', () => {
      const result = georgianRomanizer('გამარჯობა123!');
      expect(result).toContain('123!');
    });
  });

  describe('Armenian', () => {
    it('should romanize Armenian text', () => {
      const result = armenianRomanizer('Բարև');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
      expect(result).not.toContain('Բ');
    });

    it('should romanize Armenian greeting', () => {
      const result = armenianRomanizer('Հայաստան');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
      expect(result).not.toContain('Հ');
    });

    it('should handle lowercase Armenian', () => {
      const result = armenianRomanizer('աբգդե');
      expect(result).toBeTruthy();
      expect(result).toMatch(/[a-zA-Z]+/);
    });

    it('should handle empty string', () => {
      const result = armenianRomanizer('');
      expect(result).toBe('');
    });

    it('should handle unknown characters', () => {
      const result = armenianRomanizer('Բարև123!');
      expect(result).toContain('123!');
    });
  });

  describe('Universal romanizer (auto-detect)', () => {
    it('should auto-detect and romanize Greek', () => {
      const result = universalRomanizer('Γεια');
      expect(result).not.toContain('Γ');
      expect(result).toMatch(/[a-zA-Z]+/);
    });

    it('should auto-detect and romanize Hebrew', () => {
      const result = universalRomanizer('שלום');
      expect(result).not.toContain('ש');
      expect(result).toMatch(/[a-zA-Z]+/);
    });

    it('should auto-detect and romanize Georgian', () => {
      const result = universalRomanizer('გამარჯობა');
      expect(result).not.toContain('გ');
      expect(result).toMatch(/[a-zA-Z']+/);
    });

    it('should auto-detect and romanize Armenian', () => {
      const result = universalRomanizer('Բարև');
      expect(result).not.toContain('Բ');
      expect(result).toMatch(/[a-zA-Z]+/);
    });

    it('should handle mixed Greek and English', () => {
      const result = universalRomanizer('Hello Γεια');
      expect(result).toContain('Hello');
      expect(result).not.toContain('Γ');
    });

    it('should handle mixed Hebrew and English', () => {
      const result = universalRomanizer('Hello שלום');
      expect(result).toContain('Hello');
      expect(result).not.toContain('ש');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      const result = universalRomanizer('');
      expect(result).toBe('');
    });

    it('should handle already Latin text', () => {
      const result = universalRomanizer('Hello World');
      expect(result).toBe('Hello World');
    });

    it('should preserve spacing', () => {
      const result = universalRomanizer('Hello   World');
      expect(result).toBe('Hello   World');
    });

    it('should preserve numbers', () => {
      const result = universalRomanizer('Test 123');
      expect(result).toBe('Test 123');
    });

    it('should preserve punctuation', () => {
      const result = universalRomanizer('Hello, World!');
      expect(result).toBe('Hello, World!');
    });

    it('should handle emojis (pass through)', () => {
      const result = universalRomanizer('Hello😊World');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });
});
