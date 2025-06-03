// types/message.ts
export interface ToggleContentMessage {
  type: 'TOGGLE_CONTENT';
  enabled: boolean;
}

// 향후 메시지가 늘어날 경우 유니온 타입으로 관리 가능
export type ContentScriptMessage = ToggleContentMessage; // | OtherMessageType ...
