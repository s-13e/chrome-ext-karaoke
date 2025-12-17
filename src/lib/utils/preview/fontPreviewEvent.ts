/**
 * 폰트 미리보기 이벤트 관리
 * TextEffectsModal에서 가사 컴포넌트로 임시 폰트 미리보기를 전달
 */

export interface FontPreviewDetail {
  fontFamily: string | undefined;
  temporary: boolean; // true: hover 미리보기, false: 선택 후 유지
}

export const FONT_PREVIEW_EVENT = 'font-preview-change';

/**
 * 폰트 미리보기 이벤트 발송
 */
export function dispatchFontPreview(fontFamily: string | undefined, temporary: boolean = true): void {
  const event = new CustomEvent<FontPreviewDetail>(FONT_PREVIEW_EVENT, {
    detail: { fontFamily, temporary },
  });
  window.dispatchEvent(event);
}

/**
 * 폰트 미리보기 취소 (원래대로 복구)
 */
export function clearFontPreview(): void {
  const event = new CustomEvent<FontPreviewDetail>(FONT_PREVIEW_EVENT, {
    detail: { fontFamily: undefined, temporary: false },
  });
  window.dispatchEvent(event);
}
