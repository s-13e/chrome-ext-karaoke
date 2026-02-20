// LyricsFeedbackButton.tsx
// 가사 오버레이 우측 하단에 상시 표시되는 피드백 아이콘.
// hover 시 pill 버튼(잘못된 가사 / 싱크 불일치)이 슬라이드 아웃됨.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LyricsFeedbackButton.module.css';

type FeedbackType = 'wrong_lyrics' | 'sync_mismatch';

interface LyricsFeedbackButtonProps {
  onFeedback: (type: FeedbackType) => void;
}

export const LyricsFeedbackButton: React.FC<LyricsFeedbackButtonProps> = ({ onFeedback }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const feedbackSentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (feedbackSentTimerRef.current) {
        clearTimeout(feedbackSentTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!feedbackSent) {
      setIsExpanded(true);
    }
  }, [feedbackSent]);

  const handleMouseLeave = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const handleFeedbackClick = useCallback(
    (type: FeedbackType) => {
      onFeedback(type);
      setIsExpanded(false);
      setFeedbackSent(true);

      if (feedbackSentTimerRef.current) {
        clearTimeout(feedbackSentTimerRef.current);
      }
      feedbackSentTimerRef.current = setTimeout(() => {
        setFeedbackSent(false);
        feedbackSentTimerRef.current = null;
      }, 2000);
    },
    [onFeedback],
  );

  return (
    <div className={styles.container} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={styles.iconButton} type="button" aria-label={t('extFeedbackReportIssue')}>
        ⚠
      </button>

      {feedbackSent ? (
        <span className={styles.successMessage}>{t('extFeedbackSentMessage')}</span>
      ) : (
        <div className={`${styles.panel} ${isExpanded ? styles.panelVisible : ''}`}>
          <button className={styles.pill} type="button" onClick={() => handleFeedbackClick('wrong_lyrics')}>
            {t('extFeedbackWrongLyrics')}
          </button>
          <button className={styles.pill} type="button" onClick={() => handleFeedbackClick('sync_mismatch')}>
            {t('extFeedbackSyncMismatch')}
          </button>
        </div>
      )}
    </div>
  );
};
