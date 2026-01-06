/**
 * 액션 가능한 토스트 알림 컴포넌트
 *
 * 클릭 가능하고 액션 버튼이 있는 토스트 알림을 표시합니다.
 * 가사 관련 문제(싱크 불일치, 가사 없음 등)를 사용자에게 알리고 해결 방법을 제시합니다.
 */

import React, { JSX, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface ActionableToastProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  duration?: number; // 밀리초 단위 (기본값: 8000ms)
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
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;

  background: rgba(0, 0, 0, 0.95);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  animation: ${({ isClosing }) => (isClosing ? fadeOut : fadeIn)} 0.3s ease-in-out;
  pointer-events: auto;
  cursor: default;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
`;

const Description = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 1);
  }
`;

export function ActionableToast({
  title,
  description,
  actionText,
  onAction,
  duration = 8000,
  onClose,
  icon,
}: ActionableToastProps): JSX.Element {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // 애니메이션 시간
  };

  const handleAction = () => {
    onAction();
    handleClose();
  };

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(closeTimer);
    };
  }, [duration]);

  return (
    <ToastContainer isClosing={isClosing}>
      <CloseButton onClick={handleClose} aria-label="Close">
        ×
      </CloseButton>
      <HeaderContainer>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <ContentContainer>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </ContentContainer>
      </HeaderContainer>
      <ActionButton onClick={handleAction}>{actionText}</ActionButton>
    </ToastContainer>
  );
}
