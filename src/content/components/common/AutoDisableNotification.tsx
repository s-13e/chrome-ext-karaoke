/**
 * 자동 비활성화 알림 컴포넌트
 *
 * 연속 비음악 영상 시청으로 인한 자동 비활성화 시 표시
 */

import { JSX, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface AutoDisableNotificationProps {
  title: string;
  message: string;
  onClose?: () => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const NotificationContainer = styled.div<{ isClosing: boolean }>`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 999999;

  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);

  max-width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  animation: ${({ isClosing }) => (isClosing ? fadeOut : fadeIn)} 0.4s ease-in-out;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Message = styled.div`
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.95;
`;

const Icon = styled.span`
  font-size: 20px;
`;

export function AutoDisableNotification({ title, message, onClose }: AutoDisableNotificationProps): JSX.Element {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => {
      setIsClosing(true);
    }, 5000); // 5초 후 닫기

    const removeTimer = setTimeout(() => {
      onClose?.();
    }, 5400); // 애니메이션 시간 고려

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <NotificationContainer isClosing={isClosing}>
      <Title>
        <Icon>💤</Icon>
        {title}
      </Title>
      <Message>{message}</Message>
    </NotificationContainer>
  );
}
