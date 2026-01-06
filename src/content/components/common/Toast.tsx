/**
 * 토스트 알림 컴포넌트
 *
 * 자동 비활성화/재활성화 시 사용자에게 간단한 알림을 표시
 */

import React, { JSX, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface ToastProps {
  message: string;
  duration?: number; // 밀리초 단위 (기본값: 3000ms)
  onClose?: () => void;
  icon?: React.ReactNode;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
`;

const ToastContainer = styled.div<{ isClosing: boolean }>`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;

  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 14px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  animation: ${({ isClosing }) => (isClosing ? fadeOut : fadeIn)} 0.3s ease-in-out;
  pointer-events: none;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 18px;
`;

export function Toast({ message, duration = 3000, onClose, icon }: ToastProps): JSX.Element {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setIsClosing(true);
    }, duration);

    const removeTimer = setTimeout(() => {
      onClose?.();
    }, duration + 300); // 애니메이션 시간 고려

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <ToastContainer isClosing={isClosing}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <span>{message}</span>
    </ToastContainer>
  );
}
