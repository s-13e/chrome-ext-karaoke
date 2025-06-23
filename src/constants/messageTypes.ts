export const MESSAGE_TYPES = {
  TOGGLE_CONTENT: 'TOGGLE_CONTENT',
  LANGUAGE_CHANGED: 'LANGUAGE_CHANGED',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
