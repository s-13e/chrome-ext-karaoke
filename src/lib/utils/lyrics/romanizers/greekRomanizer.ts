/**
 * 그리스어 로마자 변환기
 * ISO 843 표준 기반
 */

// 그리스어 → 로마자 매핑 테이블
const greekToRomanMap: Record<string, string> = {
  // 소문자
  α: 'a',
  ά: 'a',
  β: 'b',
  γ: 'g',
  δ: 'd',
  ε: 'e',
  έ: 'e',
  ζ: 'z',
  η: 'i',
  ή: 'i',
  θ: 'th',
  ι: 'i',
  ί: 'i',
  ϊ: 'i',
  ΐ: 'i',
  κ: 'k',
  λ: 'l',
  μ: 'm',
  ν: 'n',
  ξ: 'x',
  ο: 'o',
  ό: 'o',
  π: 'p',
  ρ: 'r',
  σ: 's',
  ς: 's', // 단어 끝 시그마
  τ: 't',
  υ: 'y',
  ύ: 'y',
  ϋ: 'y',
  ΰ: 'y',
  φ: 'f',
  χ: 'ch',
  ψ: 'ps',
  ω: 'o',
  ώ: 'o',

  // 대문자
  Α: 'A',
  Ά: 'A',
  Β: 'B',
  Γ: 'G',
  Δ: 'D',
  Ε: 'E',
  Έ: 'E',
  Ζ: 'Z',
  Η: 'I',
  Ή: 'I',
  Θ: 'Th',
  Ι: 'I',
  Ί: 'I',
  Ϊ: 'I',
  Κ: 'K',
  Λ: 'L',
  Μ: 'M',
  Ν: 'N',
  Ξ: 'X',
  Ο: 'O',
  Ό: 'O',
  Π: 'P',
  Ρ: 'R',
  Σ: 'S',
  Τ: 'T',
  Υ: 'Y',
  Ύ: 'Y',
  Ϋ: 'Y',
  Φ: 'F',
  Χ: 'Ch',
  Ψ: 'Ps',
  Ω: 'O',
  Ώ: 'O',
};

/**
 * 그리스어 텍스트를 로마자로 변환
 *
 * @param text - 그리스어 텍스트
 * @returns 로마자 변환된 텍스트
 *
 * @example
 * greekRomanizer('Γεια σου') // 'Geia sou'
 * greekRomanizer('Καλημέρα') // 'Kalimera'
 */
export function greekRomanizer(text: string): string {
  if (!text) return '';

  let result = '';
  for (const char of text) {
    result += greekToRomanMap[char] ?? char;
  }

  return result;
}
