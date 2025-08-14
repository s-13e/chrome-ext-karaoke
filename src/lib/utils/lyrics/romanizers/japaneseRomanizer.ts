import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

let kuroshiro: InstanceType<typeof Kuroshiro> | null = null;

export async function japaneseRomanizer(text: string): Promise<string> {
  if (!kuroshiro) {
    kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());
  }
  return kuroshiro.convert(text, { to: 'romaji', romajiSystem: 'hepburn' });
}
