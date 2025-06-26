/**
 * 시간 문자열 파싱 (MM:SS.ms → 초 단위)
 * @param timeStr - [분:초.밀리초] 형식 문자열
 * @returns 초 단위 시간 (파싱 실패 시 0 반환)
 */
export const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':');

  // 파트 검증 및 기본값 설정
  const minutesStr = parts[0] || '0';
  const secondsStr = parts[1]?.split('.')[0] || '0'; // 밀리초 제거

  const minutes = parseFloat(minutesStr);
  const seconds = parseFloat(secondsStr);

  // 유효성 검사
  if (isNaN(minutes) || isNaN(seconds)) return 0;

  return minutes * 60 + seconds;
};

/**
 * 초 단위 시간을 [MM:SS] 형식으로 변환
 * @param seconds - 초 단위 시간
 * @returns 포맷된 문자열 (예: "03:45")
 */
export const formatSecondsToTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 싱크 오차 보정 (±500ms 이내 조정)
 * @param currentTime - 현재 시간
 * @param targetTime - 목표 시간
 * @returns 보정된 시간
 */
export const adjustSyncOffset = (currentTime: number, targetTime: number): number => {
  return Math.abs(targetTime - currentTime) <= 0.5 ? targetTime : currentTime;
};
