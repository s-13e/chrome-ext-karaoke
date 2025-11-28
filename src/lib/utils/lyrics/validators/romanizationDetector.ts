/**
 * 로마자 표기 가사 감지기
 * 한국어/일본어를 영어 발음으로 표기한 가사를 감지하여 필터링
 *
 * 예시:
 * - 로마자 가사: "saranghae neoreul" (사랑해 너를)
 * - 원본 가사: "사랑해 너를"
 */

/**
 * 로마자 표기 가사인지 감지
 *
 * @param lyrics - LRC 형식 가사 문자열 (타임스탬프 포함)
 * @returns true: 로마자 표기 가사로 판단, false: 원본 언어 가사
 *
 * 감지 로직:
 * 1. 비ASCII 문자 비율 체크 (한글, 한자, 일본어 등)
 *    - 30% 이상이면 원본 언어 가사
 * 2. 알파벳 비율 체크
 *    - 90% 이상이면 로마자 의심
 * 3. 모음 패턴 체크
 *    - 45% 이상이면 로마자 확정 (영어는 일반적으로 35-42%)
 */
export function isRomanizedLyrics(lyrics: string): boolean {
  if (!lyrics || typeof lyrics !== 'string') return false;

  // 가사에서 처음 5줄만 샘플링 (성능 최적화)
  const lines = lyrics.split('\n').slice(0, 5);
  const sampleText = lines
    .map((line) => line.replace(/^\[\d+:\d+\.\d+\]/, '').trim()) // 타임스탬프 제거
    .filter((line) => line.length > 0)
    .join(' ');

  if (sampleText.length < 20) return false; // 너무 짧으면 판단 불가

  // 1. 비ASCII 문자 비율 체크 (한글, 한자, 일본어 등)
  const nonAsciiChars = sampleText.split('').filter((char) => char.charCodeAt(0) > 127);
  const nonAsciiRatio = nonAsciiChars.length / sampleText.length;

  // 비ASCII 문자가 30% 이상이면 원본 언어 가사로 판단
  if (nonAsciiRatio > 0.3) {
    console.log(`[Romanization Check] 원본 언어 가사 (비ASCII ${(nonAsciiRatio * 100).toFixed(1)}%)`);
    return false;
  }

  // 2. 알파벳만 사용하는지 체크 (공백, 숫자, 기본 구두점 제외)
  const alphaOnly = sampleText.replace(/[\s0-9.,!?'"()-]/g, '');
  if (alphaOnly.length === 0) return false; // 알파벳이 없으면 판단 불가

  const alphabetRatio = (alphaOnly.match(/[a-zA-Z]/g) || []).length / alphaOnly.length;

  // 알파벳 비율이 90% 미만이면 로마자 아님
  if (alphabetRatio < 0.9) {
    console.log(`[Romanization Check] 혼합 언어 가사 (알파벳 ${(alphabetRatio * 100).toFixed(1)}%)`);
    return false;
  }

  // 3. 모음 패턴 체크 (로마자 표기는 모음이 많음)
  const vowels = sampleText.match(/[aeiou]/gi) || [];
  const vowelRatio = vowels.length / alphaOnly.length;

  // 모음 비율이 45% 이상이면 로마자 표기로 판단
  // 영어: 일반적으로 35-42% (예: "I love you" → 40%)
  // 로마자: 일반적으로 45-55% (예: "saranghae neoreul" → 51%)
  const isRomanized = vowelRatio > 0.45;
  console.log(
    `[Romanization Check] ${isRomanized ? '⚠️ 로마자 표기' : '✅ 영어 가사'} (모음 ${(vowelRatio * 100).toFixed(1)}%)`,
  );

  return isRomanized;
}

/**
 * 테스트 함수 (개발용)
 * 브라우저 콘솔에서 실행: window.testRomanizationDetector()
 */
export function testRomanizationDetector(): void {
  console.log('=== Romanization Detector Test ===\n');

  const testCases = [
    {
      name: '순수 영어 가사',
      lyrics: `[00:15.00]I love you so much
[00:18.50]You make me feel alive
[00:22.00]Every moment with you`,
      expected: false, // 필터링 안 됨
    },
    {
      name: '한국어 로마자 표기',
      lyrics: `[00:15.00]saranghae neoreul
[00:18.50]neomu areumdawo
[00:22.00]neo eobsineun sal su eobseo`,
      expected: true, // 필터링됨
    },
    {
      name: '원본 한글 가사',
      lyrics: `[00:15.00]사랑해 너를
[00:18.50]너무 아름다워
[00:22.00]너 없이는 살 수 없어`,
      expected: false, // 필터링 안 됨
    },
    {
      name: '혼합 (영어 + 한글)',
      lyrics: `[00:15.00]I love you 사랑해
[00:18.50]You're so beautiful 아름다워
[00:22.00]Forever 영원히`,
      expected: false, // 필터링 안 됨
    },
    {
      name: '일본어 로마자 표기',
      lyrics: `[00:15.00]watashi wa anata wo aishiteru
[00:18.50]totemo kirei desu
[00:22.00]zutto soba ni ite`,
      expected: true, // 필터링됨
    },
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ name, lyrics, expected }, index) => {
    console.log(`\n📝 Test ${index + 1}: ${name}`);
    console.log(`가사 샘플:\n${lyrics.split('\n').slice(0, 2).join('\n')}`);
    const result = isRomanizedLyrics(lyrics);
    const success = result === expected;

    if (success) {
      passed++;
      console.log(`✅ PASS - Expected: ${expected}, Got: ${result}`);
    } else {
      failed++;
      console.log(`❌ FAIL - Expected: ${expected}, Got: ${result}`);
    }
  });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`테스트 결과: ${passed}/${testCases.length} 통과`);
  if (failed > 0) {
    console.log(`⚠️ ${failed}개 실패`);
  } else {
    console.log(`🎉 모든 테스트 통과!`);
  }
}

// 전역에 노출 (브라우저 콘솔에서 접근 가능)
// Service Worker 환경에서는 window가 없으므로 조건 체크
if (typeof window !== 'undefined') {
  (window as Window & { testRomanizationDetector?: () => void }).testRomanizationDetector = testRomanizationDetector;
}
