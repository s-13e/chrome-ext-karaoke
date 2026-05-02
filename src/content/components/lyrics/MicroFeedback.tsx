// MicroFeedback.tsx
// 가사 오버레이 하단의 👍👎 품질 피드백 위젯.
// - thumbs_up: 만족도 통계 + 5회 누적 시 Chrome Web Store 리뷰 유도
// - thumbs_down: sub-menu로 분기 (곡과 다른 가사 / 타이밍 어긋남 / 가사 안 나옴)
//   → "곡과 다른 가사" 선택 시 자동 가사 숨김 + 되돌리기 토스트 (5초)
// - 영상이 차단 상태(rejectedLrclibIds로 매칭 차단됨)면 위젯이 "숨긴 가사 다시 표시" UI로 변경
//   → 가라오케 모드 OFF 상태에서도 회복 진입점이 됨

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@constants/storageKeys';
import { extractVideoIdFromUrl } from '@lib/utils/platform/videoDetection';
import styles from './MicroFeedback.module.css';

const THUMBS_UP_THRESHOLD = 5;
const REVIEW_URL = 'https://chromewebstore.google.com/detail/bmjifgkkmadggkeoobcdaikkjionbakk/reviews';
const UNDO_TOAST_MS = 5000;

type FeedbackSubType = 'wrong_lyrics' | 'sync_mismatch' | 'no_lyrics';
type Status = 'idle' | 'sub_menu' | 'sent' | 'sent_with_undo' | 'review' | 'hidden';

export const MicroFeedback: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isMusicDetected, setIsMusicDetected] = useState(false);
  // 영상의 가사가 차단(거절 ID로 매칭 스킵)된 상태인지. content/index.tsx의 lyrics-hidden-state 이벤트로 동기화.
  const [isLyricsHidden, setIsLyricsHidden] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // MutationObserver 콜백에서 비교용 — 최신 videoId를 ref로 보관해 클로저 캡처 문제 회피.
  // (videoId state를 직접 비교하면 deps=[]인 useEffect가 초기값(null)을 캡처해 매번 다르다고 판정 → updateVideoId 반복 호출되며 isLyricsHidden이 reset되는 버그가 생김.)
  const videoIdRef = useRef<string | null>(null);

  // 음악 영상 감지 이벤트 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ isMusic: boolean }>).detail;
      setIsMusicDetected(detail.isMusic);
    };
    window.addEventListener('yt-karaoke-music-detection', handler);
    return () => window.removeEventListener('yt-karaoke-music-detection', handler);
  }, []);

  // 가사 차단 상태 동기화
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ videoId: string; hidden: boolean }>).detail;
      // 현재 영상에 대한 신호만 반영
      if (videoId && detail.videoId === videoId) {
        setIsLyricsHidden(detail.hidden);
      } else if (!videoId) {
        setIsLyricsHidden(detail.hidden);
      }
    };
    window.addEventListener('lyrics-hidden-state', handler);
    return () => window.removeEventListener('lyrics-hidden-state', handler);
  }, [videoId]);

  // unmount 시 토스트 타이머 정리
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  // URL에서 videoId 추출 + 변경 감지
  useEffect(() => {
    const updateVideoId = () => {
      const id = extractVideoIdFromUrl(window.location.href);
      setVideoId(id);
      videoIdRef.current = id;
      setStatus('idle');
      setAlreadyVoted(false);
      setIsLyricsHidden(false);
    };
    updateVideoId();

    // YouTube SPA 전환 감지 — 같은 영상의 title 잡음(알림 수, " - YouTube" 등) 변경에도
    // 콜백이 호출되므로 ref와 비교해 진짜 영상 변경일 때만 reset한다.
    const observer = new MutationObserver(() => {
      const newId = extractVideoIdFromUrl(window.location.href);
      if (newId !== videoIdRef.current) {
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

  const sendThumbsUp = useCallback(() => {
    if (!videoId) return;

    chrome.runtime.sendMessage(
      { type: 'SEND_FEEDBACK', payload: { videoId, type: 'thumbs_up', artist: 'unknown', title: 'unknown' } },
      () => {
        if (chrome.runtime.lastError) {
          console.error('[MicroFeedback] 전송 실패:', chrome.runtime.lastError.message);
        }
      },
    );
    chrome.storage.local.set({ [`micro_feedback_${videoId}`]: 'thumbs_up' });

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
  }, [videoId]);

  // thumbs_down 1차 클릭 — 만족도 통계만 보내고 sub-menu 노출. 정확한 의도(잘못된 가사 vs 싱크 vs 가사 없음)는
  // sub-menu에서 받아 별도로 처리한다.
  const sendThumbsDown = useCallback(() => {
    if (!videoId) return;
    chrome.runtime.sendMessage(
      { type: 'SEND_FEEDBACK', payload: { videoId, type: 'thumbs_down', artist: 'unknown', title: 'unknown' } },
      () => {
        if (chrome.runtime.lastError) {
          console.error('[MicroFeedback] 전송 실패:', chrome.runtime.lastError.message);
        }
      },
    );
    setStatus('sub_menu');
  }, [videoId]);

  // sub-menu에서 사용자가 정확한 의도 선택. 사이드바 깃발과 동일한 흐름.
  const handleSubChoice = useCallback(
    (subType: FeedbackSubType) => {
      if (!videoId) return;

      // content/index.tsx의 handleFeedback이 받아 SEND_FEEDBACK 전송 + wrong_lyrics면 자동 숨김 처리.
      window.dispatchEvent(new CustomEvent('send-lyrics-feedback', { detail: { type: subType } }));
      // alreadyVoted는 의도적으로 트리거하지 않는다 — LRCLib에 새 ID로 가사가 갱신되면 위젯이 다시
      // 떠서 사용자가 새 매칭의 정확성을 평가할 수 있어야 한다. thumbs_up만 alreadyVoted 트리거.

      if (subType === 'wrong_lyrics') {
        // 5초간 되돌리기 가능한 토스트 노출. 5초 지나도 차단 자체는 영구 — 이후엔 숨김 상태 UI로 회복.
        setStatus('sent_with_undo');
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        undoTimerRef.current = setTimeout(() => {
          setStatus('hidden');
          undoTimerRef.current = null;
        }, UNDO_TOAST_MS);
      } else {
        setStatus('sent');
        setTimeout(() => setStatus('hidden'), 2000);
      }
    },
    [videoId],
  );

  const handleUndo = useCallback(() => {
    // content/index.tsx의 handleUndoHide가 메모리 스냅샷에서 가사 즉시 복원.
    window.dispatchEvent(new CustomEvent('undo-lyrics-hide'));
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    // 이 영상의 투표 기록 자체도 회수해 위젯이 다시 일반 상태로 돌아가게 한다.
    if (videoId) chrome.storage.local.remove(`micro_feedback_${videoId}`);
    setStatus('hidden');
  }, [videoId]);

  // 숨김 상태에서 "숨긴 가사 다시 표시" 클릭 — 거절 목록을 비우고 페이지 새로고침으로 재매칭 트리거.
  const handleUnhide = useCallback(async () => {
    if (!videoId) return;
    const { unhideVideoLyrics } = await import('@lib/utils/storage/hiddenLyricsStorage');
    await unhideVideoLyrics(videoId);
    chrome.storage.local.remove(`micro_feedback_${videoId}`);
    window.location.reload();
  }, [videoId]);

  const handleReviewClick = () => {
    window.open(REVIEW_URL, '_blank');
    chrome.storage.sync.set({ [STORAGE_KEYS.REVIEW_PROMPT_DISMISSED]: true });
    setStatus('hidden');
  };

  const handleReviewDismiss = () => {
    chrome.storage.sync.set({ [STORAGE_KEYS.REVIEW_PROMPT_DISMISSED]: true });
    setStatus('hidden');
  };

  // 위젯 노출 조건:
  // - 일반: 음악 감지 + 미투표 + hidden 상태 아님
  // - 가사 차단 상태: 음악 감지만 충족하면 (alreadyVoted여도) 회복 진입점 노출
  if (!videoId || !isMusicDetected) return null;
  if (isLyricsHidden) {
    return (
      <div className={styles.container}>
        <div className={styles.hiddenStateRow}>
          <span className={styles.hiddenStateLabel}>{t('extLyricsHiddenStateLabel')}</span>
          <button type="button" className={styles.unhideBtn} onClick={handleUnhide}>
            {t('extLyricsUnhideAction')}
          </button>
        </div>
      </div>
    );
  }
  if (alreadyVoted || status === 'hidden') return null;

  return (
    <div className={styles.container}>
      {status === 'idle' && (
        <div className={styles.buttonRow}>
          <span className={styles.label}>{t('extMicroFeedbackLabel')}</span>
          <button
            type="button"
            className={styles.thumbBtn}
            onClick={sendThumbsUp}
            aria-label={t('extMicroFeedbackThumbsUp')}
          >
            👍
          </button>
          <button
            type="button"
            className={styles.thumbBtn}
            onClick={sendThumbsDown}
            aria-label={t('extMicroFeedbackThumbsDown')}
          >
            👎
          </button>
        </div>
      )}

      {status === 'sub_menu' && (
        <div className={styles.subMenu}>
          <span className={styles.subMenuLabel}>{t('extMicroFeedbackSubMenuPrompt')}</span>
          <div className={styles.subMenuOptions}>
            <button type="button" className={styles.subMenuBtn} onClick={() => handleSubChoice('wrong_lyrics')}>
              {t('extFeedbackWrongLyrics')}
            </button>
            <button type="button" className={styles.subMenuBtn} onClick={() => handleSubChoice('sync_mismatch')}>
              {t('extFeedbackSyncMismatch')}
            </button>
            <button type="button" className={styles.subMenuBtn} onClick={() => handleSubChoice('no_lyrics')}>
              {t('extFeedbackNoLyrics')}
            </button>
          </div>
        </div>
      )}

      {status === 'sent' && <span className={styles.thanks}>{t('extMicroFeedbackThanks')}</span>}

      {status === 'sent_with_undo' && (
        <div className={styles.undoRow}>
          <span className={styles.thanks}>{t('extLyricsHiddenToast')}</span>
          <button type="button" className={styles.undoBtn} onClick={handleUndo}>
            {t('extLyricsHiddenUndo')}
          </button>
        </div>
      )}

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
