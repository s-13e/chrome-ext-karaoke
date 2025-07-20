// src/utils/typeGuards.ts
import { ToggleContentMessage } from '@lib/types/message';
import { MESSAGE_TYPES } from '@constants/messageTypes';

export const isToggleContentMessage = (request: { type: string }): request is ToggleContentMessage => {
  return request.type === MESSAGE_TYPES.TOGGLE_CONTENT;
};
// 배열 타입 검사
// 고급 버전 (타입 안전성 극대화)
export const isArrayOfType = <T>(arr: unknown, guard: (item: unknown) => item is T): arr is T[] => {
  if (!Array.isArray(arr)) return false;

  // 타입 가드가 모든 요소를 검사하도록 강제
  for (const item of arr) {
    if (!guard(item)) return false;
  }
  return true;
};
