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
    const dictPath = chrome.runtime.getURL('kuroshiro_dict/');
    console.log('dictPath for analyzer:', dictPath);

    try {
      const analyzer = new KuromojiAnalyzer({ dictPath });
      const instance = new Kuroshiro();
      await instance.init(analyzer);
      kuroshiroInstance = instance;
    } catch (e) {
      console.error('KuromojiAnalyzer/Kuroshiro init error:', e);
    }
  })();
  await initializationPromise;
  initializationPromise = null;
  return kuroshiroInstance!;
}

// 변환 함수는 항상 싱글톤을 await 받아서 사용
export async function japaneseRomanizer(text: string): Promise<string> {
  const kuroshiro = await ensureKuroshiroInitialized();
  try {
    const result = await kuroshiro.convert(text, {
      to: 'romaji',
      romajiSystem: 'hepburn',
      mode: 'spaced',
    });
    return result;
  } catch (err) {
    console.error('Kuroshiro convert error:', err);
    throw err; // 변환 실패 시 caller가 알 수 있게 예외를 던짐
  }
}
