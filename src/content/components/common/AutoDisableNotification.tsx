/**
 * 자동 비활성화 알림 컴포넌트
 *
 * 연속 비음악 영상 시청으로 인한 자동 비활성화 시 표시
 * 메모리 최적화: Emotion CSS-in-JS → CSS Modules
 */

import { JSX, useEffect, useState } from 'react';
import styles from './AutoDisableNotification.module.css';

interface AutoDisableNotificationProps {
  title: string;
  message: string;
  onClose?: () => void;
}

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
    <div className={`${styles.notificationContainer} ${isClosing ? styles.fadeOut : styles.fadeIn}`}>
      <div className={styles.title}>
        <span className={styles.icon}>💤</span>
        {title}
      </div>
      <div className={styles.message}>{message}</div>
    </div>
  );
}
