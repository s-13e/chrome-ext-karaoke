// src/lib/utils/lyrics/romanizers/chineseRomanizer.ts
import pinyin from 'pinyin';

/**
 * 중국어 텍스트를 병음(로마자)으로 변환하는 함수
 * @param text 변환할 중국어 텍스트 (주로 한자 포함)
 * @returns 변환된 병음 문자열
 */
export async function chineseRomanizer(text: string): Promise<string> {
  try {
    // pinyin 옵션:
    // - STYLE_NORMAL : 성조 없는 순수 로마자
    // - segment true : 문맥 단어 분리하여 정확도 향상
    const result = pinyin(text, {
      style: pinyin.STYLE_NORMAL,
      segment: true,
    });

    // 이중 배열 형태를 평탄화하여 문자열로 결합 (공백 구분)
    return result.flat().join(' ');
  } catch (error) {
    console.error('Chinese romanizer error:', error);
    // 변환 실패 시 원본 텍스트 그대로 반환
    return text;
  }
}
