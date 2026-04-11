/**
 * 자동 비활성화 상태 관리 유틸리티
 *
 * Chrome Storage에 자동 비활성화 상태를 저장/조회/업데이트하는 함수들
 */

import { AutoDisableState, DEFAULT_AUTO_DISABLE_STATE, AutoDisableReason } from '@lib/types/autoDisable';

const STORAGE_KEY = 'autoDisableState';

/**
 * 자동 비활성화 상태 조회
 */
export async function getAutoDisableState(): Promise<AutoDisableState> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return (result[STORAGE_KEY] as AutoDisableState | undefined) || DEFAULT_AUTO_DISABLE_STATE;
  } catch (error) {
    console.error('[AutoDisable] 상태 조회 실패:', error);
    return DEFAULT_AUTO_DISABLE_STATE;
  }
}

/**
 * 자동 비활성화 상태 저장
 */
export async function setAutoDisableState(state: AutoDisableState): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
    console.log('[AutoDisable] 상태 저장 완료:', state);
  } catch (error) {
    console.error('[AutoDisable] 상태 저장 실패:', error);
  }
}

/**
 * 자동 비활성화 상태 초기화
 */
export async function resetAutoDisableState(): Promise<void> {
  await setAutoDisableState(DEFAULT_AUTO_DISABLE_STATE);
}

/**
 * 연속 비음악 영상 카운트 증가
 */
export async function incrementNonMusicCount(): Promise<AutoDisableState> {
  const state = await getAutoDisableState();
  const newState: AutoDisableState = {
    ...state,
    consecutiveNonMusicCount: state.consecutiveNonMusicCount + 1,
    lastVideoWasMusic: false,
  };
  await setAutoDisableState(newState);
  return newState;
}

/**
 * 연속 비음악 영상 카운트 리셋 (음악 영상 감지 시)
 */
export async function resetNonMusicCount(): Promise<AutoDisableState> {
  const state = await getAutoDisableState();
  const newState: AutoDisableState = {
    ...state,
    consecutiveNonMusicCount: 0,
    lastVideoWasMusic: true,
  };
  await setAutoDisableState(newState);
  return newState;
}

/**
 * 자동 비활성화 활성화
 * @param reason 비활성화 사유
 */
export async function enableAutoDisable(reason: AutoDisableReason): Promise<AutoDisableState> {
  const state = await getAutoDisableState();
  const newState: AutoDisableState = {
    ...state,
    autoDisabled: true,
    autoDisabledAt: Date.now(),
    autoDisabledReason: reason,
  };
  await setAutoDisableState(newState);
  return newState;
}

/**
 * 자동 비활성화 해제
 */
export async function disableAutoDisable(): Promise<AutoDisableState> {
  const state = await getAutoDisableState();
  const newState: AutoDisableState = {
    ...state,
    autoDisabled: false,
    autoDisabledAt: undefined,
    autoDisabledReason: undefined,
    consecutiveNonMusicCount: 0,
  };
  await setAutoDisableState(newState);
  return newState;
}

/**
 * 임계값 업데이트
 * @param threshold 새로운 임계값
 */
export async function updateThreshold(threshold: number): Promise<AutoDisableState> {
  const state = await getAutoDisableState();
  const newState: AutoDisableState = {
    ...state,
    threshold: Math.max(1, Math.min(threshold, 20)), // 1~20 사이로 제한
  };
  await setAutoDisableState(newState);
  return newState;
}

/**
 * 임계값 도달 여부 확인
 */
export async function shouldAutoDisable(): Promise<boolean> {
  const state = await getAutoDisableState();
  return state.consecutiveNonMusicCount >= state.threshold;
}

/**
 * 음악/비음악 감지 결과를 한 번의 호출로 요약한 결과 타입.
 * 호출부는 이 결과만 보고 UI 반응(토스트·알림)을 결정하면 된다.
 *
 * - music_continue           : 음악 영상이 정상 감지됨 (별도 UI 없음)
 * - music_reactivated        : 자동 비활성화 상태에서 음악 영상 감지 → 재활성화됨
 * - non_music_counted        : 비음악 카운트 증가 중 (임계값 미만 또는 이미 자동 비활성화 상태)
 * - non_music_auto_disabled  : 비음악 카운트가 **처음으로** 임계값에 도달하여 자동 비활성화로 전이됨
 */
export type MusicDetectionOutcome =
  | { kind: 'music_continue' }
  | { kind: 'music_reactivated' }
  | { kind: 'non_music_counted'; count: number; threshold: number }
  | { kind: 'non_music_auto_disabled'; threshold: number };

/**
 * 음악 감지 결과를 받아 자동 비활성화 상태 머신을 진행시킨다.
 *
 * 핵심 불변식: `non_music_auto_disabled`는 **autoDisabled=false → true로 전이되는 순간에만**
 * 반환된다. 이미 자동 비활성화된 상태에서 비음악 비디오가 추가로 감지되면 `non_music_counted`로
 * 처리되어 임계값 도달 알림이 재노출되지 않는다.
 */
export async function processMusicDetectionResult(isMusic: boolean): Promise<MusicDetectionOutcome> {
  if (isMusic) {
    const stateBefore = await getAutoDisableState();
    await resetNonMusicCount();

    const wasAutoDisabledByNonMusic =
      stateBefore.autoDisabled && stateBefore.autoDisabledReason === 'consecutive_non_music';

    if (wasAutoDisabledByNonMusic) {
      await disableAutoDisable();
      return { kind: 'music_reactivated' };
    }
    return { kind: 'music_continue' };
  }

  const stateBefore = await getAutoDisableState();
  const state = await incrementNonMusicCount();

  const justCrossedThreshold = !stateBefore.autoDisabled && state.consecutiveNonMusicCount >= state.threshold;

  if (justCrossedThreshold) {
    await enableAutoDisable('consecutive_non_music');
    return { kind: 'non_music_auto_disabled', threshold: state.threshold };
  }

  return {
    kind: 'non_music_counted',
    count: state.consecutiveNonMusicCount,
    threshold: state.threshold,
  };
}
