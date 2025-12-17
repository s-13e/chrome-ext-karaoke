/**
 * useFontPreview - 폰트 미리보기 hook
 * TextEffectsModal의 폰트 선택 시 실시간 미리보기를 가사에 적용
 */
import { useState, useEffect } from 'react';
import { FONT_PREVIEW_EVENT, FontPreviewDetail } from '@lib/utils/preview/fontPreviewEvent';

export function useFontPreview(): string | undefined {
  const [previewFont, setPreviewFont] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handlePreview = (event: Event) => {
      const customEvent = event as CustomEvent<FontPreviewDetail>;
      setPreviewFont(customEvent.detail.fontFamily);
    };

    window.addEventListener(FONT_PREVIEW_EVENT, handlePreview);

    return () => {
      window.removeEventListener(FONT_PREVIEW_EVENT, handlePreview);
    };
  }, []);

  return previewFont;
}
