declare module '@dehoist/romanize-thai' {
  /**
   * 태국어를 RTGS 표준에 따라 로마자로 변환
   * @param text - 태국어 텍스트
   */
  function romanize(text: string): string;

  export default romanize;
}
