import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// 싱글톤 인스턴스를 모듈 전역에 선언
let kuroshiroInstance: InstanceType<typeof Kuroshiro> | null = null;
let initializationPromise: Promise<void> | null = null;

// 단 하나의 초기화 함수만 제공 (동시에 여러 번 호출되어도 안전)
async function ensureKuroshiroInitialized(): Promise<InstanceType<typeof Kuroshiro>> {
  if (kuroshiroInstance) return kuroshiroInstance;
  if (initializationPromise) {
    await initializationPromise;
    return kuroshiroInstance!;
  }
  initializationPromise = (async () => {
    try {
      console.log('[japaneseRomanizer] Initializing Kuroshiro with local dictionary...');

      // 표준 사전 경로 사용 (kuromoji 공식 권장)
      const dictPath = chrome.runtime.getURL('dict/');
      console.log('Using standard dictPath for analyzer:', dictPath);

      const analyzer = new KuromojiAnalyzer({ dictPath });
      const instance = new Kuroshiro();
      await instance.init(analyzer);
      kuroshiroInstance = instance;
      console.log('[japaneseRomanizer] Kuroshiro initialized successfully with local dictionary');
    } catch (e) {
      console.error('KuromojiAnalyzer/Kuroshiro init error:', e);
      throw e;
    }
  })();
  await initializationPromise;
  initializationPromise = null;
  return kuroshiroInstance!;
}

// 일본어 로마자 변환 (이미 일본어로 확정된 텍스트만 처리)
export async function japaneseRomanizer(text: string): Promise<string> {
  try {
    const kuroshiro = await ensureKuroshiroInitialized();

    const result = await kuroshiro.convert(text, {
      to: 'romaji',
      romajiSystem: 'hepburn',
      mode: 'spaced',
    });

    console.log('[japaneseRomanizer] Conversion successful:', text, '->', result);
    return result;
  } catch (err) {
    console.error('Kuroshiro convert error:', err);
    // 변환 실패 시 원본 텍스트 반환 (fallback)
    return text;
  }
}
