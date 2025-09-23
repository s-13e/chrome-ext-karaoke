import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// 일본어 문자 감지 함수 (히라가나, 가타카나, 한자)
export function hasJapaneseCharacters(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

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

      // 로컬 사전 경로 사용 (조건부 로딩은 유지)
      const dictPath = chrome.runtime.getURL('kuroshiro_dict/');
      console.log('Using local dictPath for analyzer:', dictPath);

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

// 조건부 로딩: 일본어 문자가 있을 때만 Kuroshiro 초기화 및 변환
export async function japaneseRomanizer(text: string): Promise<string> {
  // 1. 먼저 일본어 문자가 있는지 확인
  if (!hasJapaneseCharacters(text)) {
    console.log('[japaneseRomanizer] No Japanese characters detected, returning original text');
    return text; // 일본어가 아니면 원본 텍스트 반환
  }

  try {
    // 2. 일본어가 감지된 경우에만 Kuroshiro 로드
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
