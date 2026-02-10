/**
 * DOM 요소에 커스텀 툴팁을 부착하는 유틸리티
 * YouTube CSS 간섭을 피하기 위해 실제 DOM 요소를 document.body에 생성
 */
import styles from './tooltip.module.css';

/**
 * 지정된 DOM 요소에 hover 시 표시되는 커스텀 툴팁을 부착
 * @param element 툴팁을 부착할 대상 요소
 * @param text 툴팁에 표시할 텍스트
 * @returns cleanup 함수 (이벤트 리스너 해제 + 툴팁 제거)
 */
export function attachTooltip(element: HTMLElement, text: string): () => void {
  let tooltipEl: HTMLDivElement | null = null;

  const show = () => {
    if (tooltipEl) return;

    tooltipEl = document.createElement('div');
    tooltipEl.className = styles.tooltip ?? '';
    tooltipEl.textContent = text;
    document.body.appendChild(tooltipEl);

    // 위치 계산: 버튼 바로 위 중앙 정렬
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    const top = rect.top - tooltipRect.height - 22;

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    tooltipEl.classList.add(styles.visible ?? '');
  };

  const hide = () => {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  };

  element.addEventListener('mouseenter', show);
  element.addEventListener('mouseleave', hide);

  return () => {
    element.removeEventListener('mouseenter', show);
    element.removeEventListener('mouseleave', hide);
    hide();
  };
}
