// types/message.ts
import { MESSAGE_TYPES } from '@constants/messageTypes';

export interface ToggleContentMessage {
  type: typeof MESSAGE_TYPES.TOGGLE_CONTENT;
  enabled: boolean;
}

// 향후 메시지가 늘어날 경우 유니온 타입으로 관리 가능
export type ContentScriptMessage = ToggleContentMessage; // | OtherMessageType ...
