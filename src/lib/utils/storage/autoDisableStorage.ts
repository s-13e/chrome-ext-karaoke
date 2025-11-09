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
    return result[STORAGE_KEY] || DEFAULT_AUTO_DISABLE_STATE;
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
