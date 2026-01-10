/**
 * 토스트 알림 컴포넌트
 *
 * 자동 비활성화/재활성화 시 사용자에게 간단한 알림을 표시
 * 메모리 최적화: Emotion CSS-in-JS → CSS Modules
 */

import React, { JSX, useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  duration?: number; // 밀리초 단위 (기본값: 3000ms)
  onClose?: () => void;
  icon?: React.ReactNode;
}

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
    <div className={`${styles.toastContainer} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
      {icon && <span className={styles.iconWrapper}>{icon}</span>}
      <span>{message}</span>
    </div>
  );
}
