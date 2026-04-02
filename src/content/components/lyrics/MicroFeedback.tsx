// MicroFeedback.tsx
// 가사 오버레이 하단에 표시되는 👍👎 품질 피드백 버튼
// 한 영상당 한 번만 표시, 👍 5회 이상 시 Chrome Web Store 리뷰 유도

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { extractVideoIdFromUrl } from '@lib/utils/platform/videoDetection';
import styles from './MicroFeedback.module.css';

const THUMBS_UP_THRESHOLD = 5;
const REVIEW_URL = 'https://chromewebstore.google.com/detail/bmjifgkkmadggkeoobcdaikkjionbakk/reviews';

export const MicroFeedback: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'sent' | 'review' | 'hidden'>('idle');
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isMusicDetected, setIsMusicDetected] = useState(false);

  // 음악 영상 감지 이벤트 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ isMusic: boolean }>).detail;
      setIsMusicDetected(detail.isMusic);
    };
    window.addEventListener('yt-karaoke-music-detection', handler);
    return () => window.removeEventListener('yt-karaoke-music-detection', handler);
  }, []);

  // URL에서 videoId 추출 + 변경 감지
  useEffect(() => {
    const updateVideoId = () => {
      const id = extractVideoIdFromUrl(window.location.href);
      setVideoId(id);
      setStatus('idle');
      setAlreadyVoted(false);
    };
    updateVideoId();

    // YouTube SPA 전환 감지
    const observer = new MutationObserver(() => {
      const newId = extractVideoIdFromUrl(window.location.href);
      if (newId !== videoId) {
        updateVideoId();
      }
    });
    const titleEl = document.querySelector('title');
    if (titleEl) observer.observe(titleEl, { childList: true });

    return () => observer.disconnect();
  }, []);

  // 이미 투표했는지 확인
  useEffect(() => {
    if (!videoId) return;
    const key = `micro_feedback_${videoId}`;
    chrome.storage.local.get([key], (result) => {
      if (result[key]) {
        setAlreadyVoted(true);
      }
    });
  }, [videoId]);

  const sendFeedback = useCallback(
    (type: 'thumbs_up' | 'thumbs_down') => {
      if (!videoId) return;

      // 백그라운드에 피드백 전송
      chrome.runtime.sendMessage(
        {
          type: 'SEND_FEEDBACK',
          payload: { videoId, type, artist: 'unknown', title: 'unknown' },
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('[MicroFeedback] 전송 실패:', chrome.runtime.lastError.message);
          }
        },
      );

      // 이 영상에 투표했음을 기록
      chrome.storage.local.set({ [`micro_feedback_${videoId}`]: type });

      // 👍인 경우 카운트 증가 + 리뷰 유도 체크
      if (type === 'thumbs_up') {
        chrome.storage.sync.get([STORAGE_KEYS.THUMBS_UP_COUNT, STORAGE_KEYS.REVIEW_PROMPT_DISMISSED], (result) => {
          const count = ((result[STORAGE_KEYS.THUMBS_UP_COUNT] as number) ?? 0) + 1;
          const dismissed = (result[STORAGE_KEYS.REVIEW_PROMPT_DISMISSED] as boolean) ?? false;

          chrome.storage.sync.set({ [STORAGE_KEYS.THUMBS_UP_COUNT]: count });

          if (count >= THUMBS_UP_THRESHOLD && !dismissed) {
            setStatus('review');
          } else {
            setStatus('sent');
            setTimeout(() => setStatus('hidden'), 2000);
          }
        });
      } else {
        setStatus('sent');
        setTimeout(() => setStatus('hidden'), 2000);
      }
    },
    [videoId],
  );

  const handleReviewClick = () => {
    window.open(REVIEW_URL, '_blank');
    chrome.storage.sync.set({ [STORAGE_KEYS.REVIEW_PROMPT_DISMISSED]: true });
    setStatus('hidden');
  };

  const handleReviewDismiss = () => {
    chrome.storage.sync.set({ [STORAGE_KEYS.REVIEW_PROMPT_DISMISSED]: true });
    setStatus('hidden');
  };

  if (!videoId || alreadyVoted || status === 'hidden' || !isMusicDetected) return null;

  return (
    <div className={styles.container}>
      {status === 'idle' && (
        <div className={styles.buttonRow}>
          <span className={styles.label}>{t('extMicroFeedbackLabel')}</span>
          <button
            type="button"
            className={styles.thumbBtn}
            onClick={() => sendFeedback('thumbs_up')}
            aria-label={t('extMicroFeedbackThumbsUp')}
          >
            👍
          </button>
          <button
            type="button"
            className={styles.thumbBtn}
            onClick={() => sendFeedback('thumbs_down')}
            aria-label={t('extMicroFeedbackThumbsDown')}
          >
            👎
          </button>
        </div>
      )}

      {status === 'sent' && <span className={styles.thanks}>{t('extMicroFeedbackThanks')}</span>}

      {status === 'review' && (
        <div className={styles.reviewPrompt}>
          <span className={styles.reviewText}>{t('extMicroFeedbackReview')}</span>
          <div className={styles.reviewActions}>
            <button type="button" className={styles.reviewBtn} onClick={handleReviewClick}>
              ⭐ {t('extMicroFeedbackReviewBtn')}
            </button>
            <button type="button" className={styles.dismissBtn} onClick={handleReviewDismiss}>
              {t('extMicroFeedbackDismiss')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
