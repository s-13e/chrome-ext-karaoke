declare module 'arabic-transliterate' {
  /**
   * 아랍어와 라틴 문자 간 변환
   * @param input - 입력 텍스트
   * @param direction - 변환 방향 ('arabic2latin' | 'latin2arabic')
   * @param language - 언어 ('Arabic' | 'Persian' | 'OttomanTurkish' | 'ModernTurkish')
   */
  function arabictransliterate(
    input: string,
    direction?: 'arabic2latin' | 'latin2arabic',
    language?: string,
  ): string;

  export default arabictransliterate;
}
