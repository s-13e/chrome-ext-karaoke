/**
 * 자동 비활성화 상태 타입 정의
 *
 * 연속으로 비음악 영상을 시청할 때 자동으로 가사 기능을 비활성화하는 기능
 */

/**
 * 자동 비활성화 사유
 * - consecutive_non_music: 시스템이 연속 비음악 영상 감지로 자동 비활성화
 * - manual: 사용자가 popup에서 직접 비활성화
 */
export type AutoDisableReason = 'consecutive_non_music' | 'manual';

/**
 * 자동 비활성화 상태
 */
export interface AutoDisableState {
  /** 연속 비음악 영상 카운트 */
  consecutiveNonMusicCount: number;

  /** 마지막 영상이 음악 영상이었는지 여부 */
  lastVideoWasMusic: boolean;

  /** 자동 비활성화 상태 */
  autoDisabled: boolean;

  /** 자동 비활성화된 시각 (timestamp) */
  autoDisabledAt?: number;

  /** 자동 비활성화 사유 */
  autoDisabledReason?: AutoDisableReason;

  /** 연속 비음악 영상 임계값 (기본값: 5) */
  threshold: number;
}

/**
 * 자동 비활성화 상태 초기값
 */
export const DEFAULT_AUTO_DISABLE_STATE: AutoDisableState = {
  consecutiveNonMusicCount: 0,
  lastVideoWasMusic: false,
  autoDisabled: false,
  threshold: 5,
};
