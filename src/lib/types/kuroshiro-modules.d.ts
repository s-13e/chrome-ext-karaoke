// src/lib/types/kuroshiro-modules.d.ts

declare module 'kuroshiro' {
  import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

  export interface KuroshiroOptions {
    to?: 'hiragana' | 'katakana' | 'romaji';
    romajiSystem?: 'hepburn' | 'kunrei' | 'nippon';
    delimiter?: string;
    mode?: 'normal' | 'spaced' | 'okurigana' | 'furigana';
  }

  export interface KuroshiroInstance {
    init(analyzer: KuromojiAnalyzer): Promise<void>;
    convert(input: string, options?: KuroshiroOptions): Promise<string>;
    // 기타 필요한 메서드/옵션이 있으면 추가 가능
  }

  const Kuroshiro: {
    new (): KuroshiroInstance;
  };

  export default Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
  export interface KuromojiAnalyzerOptions {
    dictPath?: string;
  }

  export default class KuromojiAnalyzer {
    constructor(options?: KuromojiAnalyzerOptions);
    init(): Promise<void>; // 일부 버전에서는 init 함수 있음
    // 기타 필요한 메서드가 있다면 추가 가능
  }
}
