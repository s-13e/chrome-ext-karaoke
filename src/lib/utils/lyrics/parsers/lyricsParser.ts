// LRC 등 싱크 가사 포맷을 파싱해, [time, text] 배열로 변환합니다.
// 싱크 자막, 전체 가사, 하이라이트 등 다양한 곳에서 재사용할 수 있습니다.

import { Line } from '@lib/types/lyrics';
import { parseTimeToSeconds } from '@lib/utils/common/time';
import { validateLyricsText } from '@lib/utils/security/inputSanitizer';
import { contentLogger } from '@lib/utils/monitoring/logger';

/**
 * LRC 형식의 가사 문자열을 파싱하여 [{ time, text }] 배열로 반환
 */ export function parseLyrics(lyrics: string): Line[] {
  if (!lyrics || lyrics.trim() === '') {
    contentLogger.warn('[lyricsParser] 입력된 lyrics가 비어 있음');
    return [];
  }

  // 보안 검증: DoS 공격 방지 (50KB 제한) + XSS 패턴 감지
  if (!validateLyricsText(lyrics)) {
    contentLogger.error('[lyricsParser] 가사 보안 검증 실패 (악의적 패턴 또는 과도한 크기)', undefined, {
      lyricsLength: lyrics.length,
    });
    return [];
  }
  const result = lyrics.split('\n').reduce<Line[]>((acc, line) => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (!match) return acc;
    const [, min, sec, text] = match;
    const safeText = (text ?? '').trim();
    if (safeText === '') return acc;
    acc.push({ time: parseTimeToSeconds(`${min}:${sec}`), text: safeText });
    return acc;
  }, []);
  if (!result.length) {
    contentLogger.warn('[lyricsParser] LRC 파싱 결과가 없음');
  }
  return result;
}
