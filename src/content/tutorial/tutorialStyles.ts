// tutorialStyles.ts
// 튜토리얼 하이라이트 CSS 주입 및 정리 헬퍼

const STYLE_ELEMENT_ID = 'ytk-tutorial-highlight-styles';
const HIGHLIGHT_CLASS = 'ytk-tutorial-highlight';

/** 튜토리얼 하이라이트 CSS 스타일을 document.head에 주입 (중복 방지) */
export function injectTutorialHighlightStyles(): void {
  if (document.getElementById(STYLE_ELEMENT_ID)) return;
  if (!document.head) return;

  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ELEMENT_ID;
  styleEl.textContent = `
    .${HIGHLIGHT_CLASS} {
      animation: ytk-highlight-pulse 1.5s ease-in-out infinite !important;
      outline: 3px solid #1db954 !important;
      outline-offset: 4px !important;
      box-shadow: 0 0 20px rgba(29, 185, 84, 0.6), 0 0 40px rgba(29, 185, 84, 0.3) !important;
      border-radius: 8px !important;
      position: relative !important;
      overflow: visible !important;
      z-index: 1 !important;
      transition: none !important;
    }
    @keyframes ytk-highlight-pulse {
      0%, 100% {
        outline-color: #1db954;
        box-shadow: 0 0 20px rgba(29, 185, 84, 0.6), 0 0 40px rgba(29, 185, 84, 0.3);
      }
      50% {
        outline-color: #1ed760;
        box-shadow: 0 0 30px rgba(29, 185, 84, 0.8), 0 0 60px rgba(29, 185, 84, 0.4);
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
