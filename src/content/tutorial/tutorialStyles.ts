// tutorialStyles.ts
// 튜토리얼 하이라이트 CSS 주입 및 정리 헬퍼

const STYLE_ELEMENT_ID = 'ytk-tutorial-highlight-styles';
const HIGHLIGHT_CLASS = 'ytk-tutorial-highlight';

/** 튜토리얼 하이라이트 CSS 스타일을 document.head에 주입 (중복 방지) */
export function injectTutorialHighlightStyles(): void {
  // 기존 스타일 제거 후 재주입 (업데이트 반영)
  const existing = document.getElementById(STYLE_ELEMENT_ID);
  if (existing) existing.remove();
  if (!document.head) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ELEMENT_ID;
  styleEl.textContent = `
    .${HIGHLIGHT_CLASS} {
      animation: ytk-highlight-pulse 1.5s ease-in-out infinite !important;
      outline: 2px solid rgba(0, 212, 170, 0.7) !important;
      outline-offset: 3px !important;
      border-radius: 8px !important;
      overflow: visible !important;
      transition: none !important;
    }
    /* iconNav 버튼 — active 배경색 제거하여 겹침 방지 */
    [class*="iconNav"] .${HIGHLIGHT_CLASS} {
      background: transparent !important;
    }
    @keyframes ytk-highlight-pulse {
      0%, 100% {
        outline-color: rgba(0, 212, 170, 0.7);
        box-shadow: 0 0 12px rgba(0, 212, 170, 0.4), 0 0 24px rgba(0, 212, 170, 0.15);
      }
      50% {
        outline-color: rgba(0, 212, 170, 0.9);
        box-shadow: 0 0 18px rgba(0, 212, 170, 0.6), 0 0 36px rgba(0, 212, 170, 0.25);
      }
    }
  `;
  document.head.appendChild(styleEl);
}

/** 모든 하이라이트 클래스를 DOM에서 제거 */
export function clearAllHighlights(): void {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });
}
