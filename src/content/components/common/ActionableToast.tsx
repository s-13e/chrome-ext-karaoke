/**
 * 액션 가능한 토스트 알림 컴포넌트
 *
 * 클릭 가능하고 액션 버튼이 있는 토스트 알림을 표시합니다.
 * 가사 관련 문제(싱크 불일치, 가사 없음 등)를 사용자에게 알리고 해결 방법을 제시합니다.
 * 메모리 최적화: Emotion CSS-in-JS → CSS Modules
 */

import React, { JSX, useEffect, useState } from 'react';
import styles from './ActionableToast.module.css';

interface ActionableToastProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
  duration?: number; // 밀리초 단위 (기본값: 8000ms)
  onClose?: () => void;
  icon?: React.ReactNode;
}

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

  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // 애니메이션 시간
  }, [onClose]);

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
  }, [duration, handleClose]);

  return (
    <div className={`${styles.toastContainer} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
      <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
        ×
      </button>
      <div className={styles.headerContainer}>
        {icon && <span className={styles.iconWrapper}>{icon}</span>}
        <div className={styles.contentContainer}>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
        </div>
      </div>
      <button className={styles.actionButton} onClick={handleAction}>
        {actionText}
      </button>
    </div>
  );
}
