/**
 * Type definitions for transliteration package
 * https://www.npmjs.com/package/transliteration
 */

declare module 'transliteration' {
  export interface TransliterateOptions {
    /**
     * Ignore specific strings or patterns
     */
    ignore?: string[];

    /**
     * Replace specific strings with custom values
     */
    replace?: Record<string, string> | Array<[string, string]>;

    /**
     * Replace characters that are unknown (not in mapping table)
     * @default ''
     */
    unknown?: string;

    /**
     * Separator for words/characters
     * @default ' '
     */
    separator?: string;

    /**
     * Trim leading and trailing separators
     * @default true
     */
    trim?: boolean;

    /**
     * Lowercase the result
     * @default false
     */
    lowercase?: boolean;

    /**
     * Uppercase the result
     * @default false
     */
    uppercase?: boolean;
  }

  export interface SlugifyOptions extends TransliterateOptions {
    /**
     * Separator for slugs
     * @default '-'
     */
    separator?: string;

    /**
     * Allow characters in regex pattern
     * @default ''
     */
    allowedChars?: string;
  }

  /**
   * Transliterate Unicode text to ASCII
   * @param text - Text to transliterate
   * @param options - Transliteration options
   * @returns Transliterated text
   */
  export function transliterate(text: string, options?: TransliterateOptions): string;

  /**
   * Convert text to URL-friendly slug
   * @param text - Text to slugify
   * @param options - Slugify options
   * @returns Slugified text
   */
  export function slugify(text: string, options?: SlugifyOptions): string;
}
