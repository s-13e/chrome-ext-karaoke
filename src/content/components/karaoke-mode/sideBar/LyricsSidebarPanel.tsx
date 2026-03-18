// LyricsSidebarPanel.tsx
// 사이드바 Lyrics 탭 — 전체 가사 뷰 + 타임스탬프 기반 자동 하이라이트 + 하단 컨트롤 바
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IoRepeat } from 'react-icons/io5';
import { MdSkipNext, MdTune } from 'react-icons/md';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { SIDEBAR_COLORS } from './sidebarStyles';
import styles from '../styles.module.css';

interface LyricsSidebarPanelProps {
  lyrics: Line[];
}

/**
 * 사이드바 Lyrics 탭 컴포넌트
 * - 전체 가사 목록 표시, 현재 재생 위치 자동 하이라이트
 * - 가사 줄 클릭 시 해당 시점으로 이동
 * - 하단 고정 컨트롤 바: 구간반복(UI only), 간주점프(기능), 싱크(UI only)
 */
export const LyricsSidebarPanel: React.FC<LyricsSidebarPanelProps> = ({ lyrics }) => {
  const { t } = useTranslation();
  const currentTime = useCurrentTime();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLButtonElement>(null);

  // 현재 재생 중인 가사 인덱스 계산
  const activeLineIndex = useMemo(() => {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      const lyric = lyrics[i];
      if (lyric && lyric.time <= currentTime) {
        return i;
      }
    }
    return -1;
  }, [lyrics, currentTime]);

  // 현재 줄 자동 스크롤
  useEffect(() => {
    if (activeLineIndex < 0 || !activeLineRef.current) return;
    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeLineIndex]);

  // 가사 줄 클릭 → 해당 시점으로 이동
  const handleLineClick = useCallback((time: number) => {
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (video) {
      video.currentTime = time;
    }
  }, []);

  // 간주 점프 (BottomContainer 로직과 동일)
  const handleSkipIntro = useCallback(() => {
    const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (!video || lyrics.length === 0) return;

    const time = video.currentTime;
    let currentIndex = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      const lyric = lyrics[i];
      if (lyric && lyric.time <= time) {
        currentIndex = i;
        break;
      }
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= lyrics.length) return;

    const nextLyric = lyrics[nextIndex];
    if (!nextLyric) return;

    const gap = nextLyric.time - time;
    const MIN_GAP = 7;

    if (gap >= MIN_GAP) {
      video.currentTime = Math.max(0, nextLyric.time - 3);
    } else {
      video.currentTime = nextLyric.time;
    }
  }, [lyrics]);

  // 타임스탬프 포맷 (mm:ss)
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 가사 없을 때
  if (lyrics.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className={styles.lyricsEmptyState}>
          <p>{t('extChartNoData')}</p>
          <button
            className={styles.lyricsGoSearchButton}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-manual-search'));
            }}
          >
            {t('extSidebarTabSearch')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 가사 스크롤 영역 */}
      <div ref={lyricsContainerRef} className={styles.lyricsSidebarList}>
        {/* Intro — 첫 가사 시작 전 구간 */}
        {lyrics.length > 0 && (
          <button
            className={`${styles.lyricsSidebarLine} ${activeLineIndex < 0 ? styles.lyricsSidebarLineActive : styles.lyricsSidebarLinePast}`}
            onClick={() => handleLineClick(0)}
          >
            <span className={styles.lyricsSidebarTimestamp}>0:00</span>
            <span className={styles.lyricsSidebarText}>♪ Intro</span>
          </button>
        )}

        {lyrics.map((line, idx) => {
          const isActive = idx === activeLineIndex;
          const isPast = activeLineIndex >= 0 && idx < activeLineIndex;

          return (
            <button
              key={idx}
              ref={isActive ? activeLineRef : undefined}
              className={`${styles.lyricsSidebarLine} ${isActive ? styles.lyricsSidebarLineActive : ''} ${isPast ? styles.lyricsSidebarLinePast : ''}`}
              onClick={() => handleLineClick(line.time)}
            >
              <span className={styles.lyricsSidebarTimestamp}>{formatTime(line.time)}</span>
              <span className={styles.lyricsSidebarText}>{line.text}</span>
            </button>
          );
        })}
      </div>

      {/* 하단 고정 컨트롤 바 */}
      <div className={styles.lyricsSidebarControls}>
        {/* 구간반복 — UI only */}
        <button className={styles.lyricsSidebarControlButton} disabled title={t('extKaraokeLoopSection')}>
          <IoRepeat size={18} color={SIDEBAR_COLORS.textMuted} />
          <span>{t('extKaraokeLoopSection')}</span>
        </button>

        {/* 간주 점프 — 기능 동작 */}
        <button
          className={styles.lyricsSidebarControlButton}
          onClick={handleSkipIntro}
          title={t('extKaraokeSkipIntro')}
        >
          <MdSkipNext size={18} color={SIDEBAR_COLORS.textPrimary} />
          <span>{t('extKaraokeSkipIntro')}</span>
        </button>

        {/* 싱크 — UI only */}
        <button className={styles.lyricsSidebarControlButton} disabled title={t('extSidebarTabTune')}>
          <MdTune size={18} color={SIDEBAR_COLORS.textMuted} />
          <span>{t('extSidebarTabTune')}</span>
        </button>
      </div>
    </div>
  );
};
