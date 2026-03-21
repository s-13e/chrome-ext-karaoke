// BottomContainerPortal.tsx
// 하단 컨테이너를 #primary-inner의 첫 번째 자식으로 렌더링
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BottomContainer } from './BottomContainer';
import { Line } from '@lib/types/lyrics';

interface BottomContainerPortalProps {
  visible: boolean;
  lyrics: Line[];
  sidebarWidth: number;
}

/**
 * 하단 컨테이너를 #primary-inner의 첫 번째 자식으로 portal 렌더링
 */
export const BottomContainerPortal: React.FC<BottomContainerPortalProps> = ({ visible, lyrics, sidebarWidth }) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!visible) {
      setTargetElement(null);
      return;
    }

    // #primary-inner 요소 찾기
    const primaryInner = document.querySelector('#primary-inner') as HTMLElement;

    if (!primaryInner) {
      console.warn('[BottomContainerPortal] #primary-inner를 찾을 수 없음');
      return;
    }

    // #player 요소 찾기
    const playerElement = document.querySelector('#player') as HTMLElement;

    // 컨테이너 wrapper 생성
    const wrapper = document.createElement('div');
    wrapper.id = 'bottom-container-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';

    // #player 다음에 삽입 (#primary-inner의 두 번째 자식)
    if (playerElement && playerElement.nextSibling) {
      primaryInner.insertBefore(wrapper, playerElement.nextSibling);
    } else if (playerElement) {
      primaryInner.appendChild(wrapper);
    } else {
      // #player가 없으면 맨 마지막에 추가
      primaryInner.appendChild(wrapper);
    }

    setTargetElement(wrapper);

    console.log('[BottomContainerPortal] wrapper 생성 완료:', wrapper);

    // cleanup
    return () => {
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    };
  }, [visible]);

  if (!visible || !targetElement) {
    return null;
  }

  return createPortal(<BottomContainer lyrics={lyrics} sidebarWidth={sidebarWidth} />, targetElement);
};
