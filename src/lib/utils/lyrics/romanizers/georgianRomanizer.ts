/**
 * 조지아어 로마자 변환기
 * 국립 표준 기반 (National System)
 */

// 조지아어 → 로마자 매핑 테이블 (33자)
const georgianToRomanMap: Record<string, string> = {
  'ა': 'a',
  'ბ': 'b',
  'გ': 'g',
  'დ': 'd',
  'ე': 'e',
  'ვ': 'v',
  'ზ': 'z',
  'თ': 't',
  'ი': 'i',
  'კ': "k'",
  'ლ': 'l',
  'მ': 'm',
  'ნ': 'n',
  'ო': 'o',
  'პ': "p'",
  'ჟ': 'zh',
  'რ': 'r',
  'ს': 's',
  'ტ': "t'",
  'უ': 'u',
  'ფ': 'p',
  'ქ': 'k',
  'ღ': 'gh',
  'ყ': 'q',
  'შ': 'sh',
  'ჩ': 'ch',
  'ც': 'ts',
  'ძ': 'dz',
  'წ': "ts'",
  'ჭ': "ch'",
  'ხ': 'kh',
  'ჯ': 'j',
  'ჰ': 'h',
};

/**
 * 조지아어 텍스트를 로마자로 변환
 *
 * @param text - 조지아어 텍스트
 * @returns 로마자 변환된 텍스트
 *
 * @example
 * georgianRomanizer('გამარჯობა') // "gamarjoba"
 * georgianRomanizer('საქართველო') // "sak'art'velo"
 */
export function georgianRomanizer(text: string): string {
  if (!text) return '';

  let result = '';
  for (const char of text) {
    result += georgianToRomanMap[char] ?? char;
  }

  return result;
}
