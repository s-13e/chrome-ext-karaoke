// src/types/errors.ts
export class ResourceLoadError extends Error {
  constructor(public readonly language: string) {
    super(`리소스 로드 실패: ${language}`);
    this.name = 'ResourceLoadError';
  }
}

export class I18nError extends Error {
  constructor(
    public readonly code: 'TRANSIENT' | 'PERMANENT',
    message: string,
  ) {
    super(message);
    this.name = 'I18nError';
    Object.setPrototypeOf(this, I18nError.prototype);
  }
}

// 타입 가드 함수 추가
export function isI18nError(error: unknown): error is I18nError {
  return error instanceof I18nError;
}
