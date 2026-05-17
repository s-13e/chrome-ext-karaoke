// LyricsFeedbackButton.tsx
// 가사 오버레이 우측 하단에 상시 표시되는 피드백 아이콘.
// hover 시 pill 버튼(잘못된 가사 / 싱크 불일치)이 슬라이드 아웃됨.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LyricsFeedbackButton.module.css';

type FeedbackType = 'wrong_lyrics' | 'sync_mismatch' | 'no_lyrics';

interface LyricsFeedbackButtonProps {
  onFeedback: (type: FeedbackType) => void;
}

export const LyricsFeedbackButton: React.FC<LyricsFeedbackButtonProps> = ({ onFeedback }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  // 어떤 신고 종류로 토스트가 떴는지 — wrong_lyrics/sync_mismatch는 자동 숨김 + "되돌리기" 분기 토스트를 노출한다.
  const [sentType, setSentType] = useState<FeedbackType | null>(null);
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
      setSentType(type);

      if (feedbackSentTimerRef.current) {
        clearTimeout(feedbackSentTimerRef.current);
      }
      // 자동 숨김 동반 신고(wrong_lyrics/sync_mismatch)는 되돌리기 시간 확보 위해 5초, 그 외(no_lyrics)는 2초.
      const duration = type === 'wrong_lyrics' || type === 'sync_mismatch' ? 5000 : 2000;
      feedbackSentTimerRef.current = setTimeout(() => {
        setFeedbackSent(false);
        setSentType(null);
        feedbackSentTimerRef.current = null;
      }, duration);
    },
    [onFeedback],
  );

  const handleUndo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // content/index.tsx의 handleUndoHide가 이 이벤트를 받아 가사를 메모리 스냅샷으로 즉시 복원한다.
    window.dispatchEvent(new CustomEvent('undo-lyrics-hide'));
    if (feedbackSentTimerRef.current) {
      clearTimeout(feedbackSentTimerRef.current);
      feedbackSentTimerRef.current = null;
    }
    setFeedbackSent(false);
    setSentType(null);
  }, []);

  const renderToast = () => {
    if (sentType === 'wrong_lyrics' || sentType === 'sync_mismatch') {
      return (
        <div className={styles.hideToast}>
          <span className={styles.hideToastMessage}>{t('extLyricsHiddenToast')}</span>
          <button className={styles.hideToastUndo} type="button" onClick={handleUndo}>
            {t('extLyricsHiddenUndo')}
          </button>
        </div>
      );
    }
    return <span className={styles.successMessage}>{t('extFeedbackSentMessage')}</span>;
  };

  return (
    <div className={styles.container} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={styles.iconButton} type="button" aria-label={t('extFeedbackReportIssue')}>
        ⚠
      </button>

      {feedbackSent ? (
        renderToast()
      ) : (
        <div className={`${styles.panel} ${isExpanded ? styles.panelVisible : ''}`}>
          <button className={styles.pill} type="button" onClick={() => handleFeedbackClick('wrong_lyrics')}>
            {t('extFeedbackWrongLyrics')}
          </button>
          <button className={styles.pill} type="button" onClick={() => handleFeedbackClick('sync_mismatch')}>
            {t('extFeedbackSyncMismatch')}
          </button>
          <button className={styles.pill} type="button" onClick={() => handleFeedbackClick('no_lyrics')}>
            {t('extFeedbackNoLyrics')}
          </button>
        </div>
      )}
    </div>
  );
};
