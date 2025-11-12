/**
 * 아르메니아어 로마자 변환기
 * ISO 9985 표준 기반 (Hübschmann-Meillet 체계)
 */

// 아르메니아어 → 로마자 매핑 테이블 (39자)
const armenianToRomanMap: Record<string, string> = {
  // 소문자
  'ա': 'a',
  'բ': 'b',
  'գ': 'g',
  'դ': 'd',
  'ե': 'e',
  'զ': 'z',
  'է': 'e',
  'ը': 'y',
  'թ': 't',
  'ժ': 'zh',
  'ի': 'i',
  'լ': 'l',
  'խ': 'kh',
  'ծ': 'ts',
  'կ': 'k',
  'հ': 'h',
  'ձ': 'dz',
  'ղ': 'gh',
  'ճ': 'ch',
  'մ': 'm',
  'յ': 'y',
  'ն': 'n',
  'շ': 'sh',
  'ո': 'o',
  'չ': 'ch',
  'պ': 'p',
  'ջ': 'j',
  'ռ': 'r',
  'ս': 's',
  'վ': 'v',
  'տ': 't',
  'ր': 'r',
  'ց': 'ts',
  'ւ': 'w',
  'փ': 'p',
  'ք': 'k',
  'և': 'ev',
  'օ': 'o',
  'ֆ': 'f',

  // 대문자
  'Ա': 'A',
  'Բ': 'B',
  'Գ': 'G',
  'Դ': 'D',
  'Ե': 'E',
  'Զ': 'Z',
  'Է': 'E',
  'Ը': 'Y',
  'Թ': 'T',
  'Ժ': 'Zh',
  'Ի': 'I',
  'Լ': 'L',
  'Խ': 'Kh',
  'Ծ': 'Ts',
  'Կ': 'K',
  'Հ': 'H',
  'Ձ': 'Dz',
  'Ղ': 'Gh',
  'Ճ': 'Ch',
  'Մ': 'M',
  'Յ': 'Y',
  'Ն': 'N',
  'Շ': 'Sh',
  'Ո': 'O',
  'Չ': 'Ch',
  'Պ': 'P',
  'Ջ': 'J',
  'Ռ': 'R',
  'Ս': 'S',
  'Վ': 'V',
  'Տ': 'T',
  'Ր': 'R',
  'Ց': 'Ts',
  'Ւ': 'W',
  'Փ': 'P',
  'Ք': 'K',
  'Եւ': 'Ev',
  'Օ': 'O',
  'Ֆ': 'F',
};

/**
 * 아르메니아어 텍스트를 로마자로 변환
 *
 * @param text - 아르메니아어 텍스트
 * @returns 로마자 변환된 텍스트
 *
 * @example
 * armenianRomanizer('Բարև') // 'Barev'
 * armenianRomanizer('Հայաստան') // 'Hayastan'
 */
export function armenianRomanizer(text: string): string {
  if (!text) return '';

  let result = '';
  for (const char of text) {
    result += armenianToRomanMap[char] ?? char;
  }

  return result;
}
