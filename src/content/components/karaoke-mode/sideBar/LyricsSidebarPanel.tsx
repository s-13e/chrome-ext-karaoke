// LyricsSidebarPanel.tsx
// 사이드바 Lyrics 탭 — 전체 가사 뷰 + 자동 하이라이트 + 구간 반복 + 간주 점프
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IoRepeat } from 'react-icons/io5';
import { MdSkipNext, MdTune, MdClose } from 'react-icons/md';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { SIDEBAR_COLORS } from './sidebarStyles';
import styles from '../styles.module.css';

/** 구간 반복 횟수 모드 */
type LoopRepeatMode = '1x' | '3x' | 'infinite';

/** 구간 반복 상태 */
interface LoopConfig {
  /** A 지점 (시작 가사 인덱스, -1 = 미설정) */
  startIndex: number;
  /** B 지점 (끝 가사 인덱스, -1 = 미설정) */
  endIndex: number;
  /** 반복 횟수 모드 */
  repeatMode: LoopRepeatMode;
  /** 연속 반복: 구간 완료 후 다음 구간으로 자동 이동 */
  continuous: boolean;
}

/** 반복 실행 상태 */
interface LoopRunState {
  active: boolean;
  currentRepeat: number;
}

/** 끝 시간 계산 시 버퍼 — B 파트 가사가 끊기지 않도록 여유 확보 */
const LOOP_END_BUFFER = 1;
/** A 지점 시작 전 여유 시간 (사용자가 자연스럽게 준비할 수 있도록) */
const LOOP_START_LEAD_TIME = 1;

interface LyricsSidebarPanelProps {
  lyrics: Line[];
}

/**
 * 사이드바 Lyrics 탭 컴포넌트
 * - 전체 가사 목록 + 현재 재생 위치 자동 하이라이트
 * - 가사 줄 클릭으로 시점 이동 또는 A/B 구간 설정
 * - 구간 반복: A/B 가사 선택 → 횟수 설정 → 실행
 * - 간주 점프 기능
 */
export const LyricsSidebarPanel: React.FC<LyricsSidebarPanelProps> = ({ lyrics }) => {
  const { t } = useTranslation();
  const currentTime = useCurrentTime();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLButtonElement>(null);

  // 구간 반복 설정 패널 열림 상태
  const [loopPanelOpen, setLoopPanelOpen] = useState(false);
  // A/B 설정 중 어느 포인트를 선택할 차례인지
  const [selectingPoint, setSelectingPoint] = useState<'A' | 'B' | null>(null);
  // 구간 반복 설정
  const [loopConfig, setLoopConfig] = useState<LoopConfig>({
    startIndex: -1,
    endIndex: -1,
    repeatMode: '3x',
  });
  // 반복 실행 상태
  const [loopRun, setLoopRun] = useState<LoopRunState>({ active: false, currentRepeat: 0 });

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

  // 현재 줄 자동 스크롤 (반복 실행 중이 아닐 때만)
  useEffect(() => {
    if (activeLineIndex < 0 || !activeLineRef.current) return;
    activeLineRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeLineIndex]);

  // YouTube 비디오 요소 가져오기
  const getVideo = useCallback((): HTMLVideoElement | null => {
    return document.querySelector<HTMLVideoElement>('video.html5-main-video');
  }, []);

  // 가사 줄 클릭 핸들러
  const handleLineClick = useCallback(
    (idx: number, time: number) => {
      // A/B 선택 모드일 때
      if (selectingPoint === 'A') {
        setLoopConfig((prev) => ({ ...prev, startIndex: idx }));
        // A 설정 후 자동으로 B 선택 모드로
        setSelectingPoint('B');
        return;
      }
      if (selectingPoint === 'B') {
        // B는 A보다 뒤여야 함
        const actualEnd = idx > loopConfig.startIndex ? idx : loopConfig.startIndex;
        const actualStart = idx > loopConfig.startIndex ? loopConfig.startIndex : idx;
        setLoopConfig((prev) => ({ ...prev, startIndex: actualStart, endIndex: actualEnd }));
        setSelectingPoint(null);
        return;
      }

      // 일반 모드: 해당 시점으로 이동
      const video = getVideo();
      if (video) {
        video.currentTime = time;
      }
    },
    [selectingPoint, loopConfig.startIndex, getVideo],
  );

  // 구간 반복 실행 — timeupdate 리스너
  useEffect(() => {
    if (!loopRun.active) return;
    const video = getVideo();
    if (!video) return;

    const { startIndex, endIndex, repeatMode, continuous } = loopConfig;
    const startLyric = lyrics[startIndex];
    const endLyric = lyrics[endIndex];
    if (!startLyric || !endLyric) return;

    const loopStartTime = Math.max(0, startLyric.time - LOOP_START_LEAD_TIME);
    // 끝 시간: 다음 가사가 있으면 그 시점 + 버퍼, 없으면 끝 가사 + 10초
    const nextAfterEnd = lyrics[endIndex + 1];
    const loopEndTime = nextAfterEnd ? nextAfterEnd.time + LOOP_END_BUFFER : endLyric.time + 10;

    // 1x = 되돌아가기 1회 (총 2회 재생), 3x = 3회 (총 4회), ∞ = 무한
    const maxRepeats = repeatMode === '1x' ? 1 : repeatMode === '3x' ? 3 : Infinity;

    const onTimeUpdate = () => {
      if (video.currentTime >= loopEndTime) {
        setLoopRun((prev) => {
          const nextCount = prev.currentRepeat + 1;
          if (nextCount > maxRepeats) {
            // 반복 완료
            if (continuous) {
              // 연속 반복: 다음 구간으로 자동 이동
              const sectionSize = endIndex - startIndex + 1;
              const newStart = endIndex + 1;
              const newEnd = Math.min(newStart + sectionSize - 1, lyrics.length - 1);
              if (newStart < lyrics.length) {
                const newStartLyric = lyrics[newStart];
                if (newStartLyric) {
                  video.currentTime = Math.max(0, newStartLyric.time - LOOP_START_LEAD_TIME);
                }
                setLoopConfig((prevConfig) => ({
                  ...prevConfig,
                  startIndex: newStart,
                  endIndex: newEnd,
                }));
                return { active: true, currentRepeat: 0 };
              }
            }
            // 연속 아니거나 가사 끝 → 해제
            return { active: false, currentRepeat: 0 };
          }
          // 되돌리기
          video.currentTime = loopStartTime;
          return { ...prev, currentRepeat: nextCount };
        });
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [loopRun.active, loopConfig, lyrics, getVideo]);

  // 반복 시작
  const handleLoopStart = useCallback(() => {
    if (loopConfig.startIndex < 0 || loopConfig.endIndex < 0) return;
    const video = getVideo();
    const startLyric = lyrics[loopConfig.startIndex];
    if (video && startLyric) {
      video.currentTime = Math.max(0, startLyric.time - LOOP_START_LEAD_TIME);
    }
    setLoopRun({ active: true, currentRepeat: 0 });
    setLoopPanelOpen(false);
    setSelectingPoint(null);
  }, [loopConfig, lyrics, getVideo]);

  // 반복 중지
  const handleLoopStop = useCallback(() => {
    setLoopRun({ active: false, currentRepeat: 0 });
  }, []);

  // 구간 반복 버튼 클릭
  const handleLoopButtonClick = useCallback(() => {
    if (loopRun.active) {
      // 실행 중이면 중지
      handleLoopStop();
      return;
    }
    // 패널 토글
    setLoopPanelOpen((prev) => {
      if (!prev) {
        // 패널 열 때 초기화
        setLoopConfig({ startIndex: -1, endIndex: -1, repeatMode: '3x', continuous: false });
        setSelectingPoint('A');
      } else {
        setSelectingPoint(null);
      }
      return !prev;
    });
  }, [loopRun.active, handleLoopStop]);

  // 패널 닫기
  const handleLoopPanelClose = useCallback(() => {
    setLoopPanelOpen(false);
    setSelectingPoint(null);
  }, []);

  // 간주 점프
  const handleSkipIntro = useCallback(() => {
    const video = getVideo();
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
  }, [lyrics, getVideo]);

  // 타임스탬프 포맷 (mm:ss)
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // A-B 구간 내에 있는 줄인지 판별
  const isInLoopRange = (idx: number): boolean => {
    if (loopConfig.startIndex < 0) return false;
    if (loopConfig.endIndex < 0) {
      // A만 설정된 경우 A 줄만 표시
      return idx === loopConfig.startIndex;
    }
    return idx >= loopConfig.startIndex && idx <= loopConfig.endIndex;
  };

  // A/B 설정 완료 여부
  const isLoopConfigComplete = loopConfig.startIndex >= 0 && loopConfig.endIndex >= 0;

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
            onClick={() => handleLineClick(-1, 0)}
          >
            <span className={styles.lyricsSidebarTimestamp}>0:00</span>
            <span className={styles.lyricsSidebarText}>♪ Intro</span>
          </button>
        )}

        {lyrics.map((line, idx) => {
          const isActive = idx === activeLineIndex;
          const isPast = activeLineIndex >= 0 && idx < activeLineIndex;
          const inRange = (loopPanelOpen || loopRun.active) && isInLoopRange(idx);
          const isPointA = idx === loopConfig.startIndex && (loopPanelOpen || loopRun.active);
          const isPointB = idx === loopConfig.endIndex && (loopPanelOpen || loopRun.active);

          return (
            <button
              key={idx}
              ref={isActive ? activeLineRef : undefined}
              className={[
                styles.lyricsSidebarLine,
                isActive ? styles.lyricsSidebarLineActive : '',
                isPast ? styles.lyricsSidebarLinePast : '',
                inRange ? styles.lyricsSidebarLineInRange : '',
                isPointA ? styles.lyricsSidebarLinePointA : '',
                isPointB ? styles.lyricsSidebarLinePointB : '',
                selectingPoint ? styles.lyricsSidebarLineSelectable : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleLineClick(idx, line.time)}
            >
              <span className={styles.lyricsSidebarTimestamp}>{formatTime(line.time)}</span>
              <span className={styles.lyricsSidebarText}>{line.text}</span>
              {isPointA && <span className={styles.loopPointBadge}>A</span>}
              {isPointB && <span className={styles.loopPointBadge}>B</span>}
            </button>
          );
        })}
      </div>

      {/* 구간 반복 설정 패널 (슬라이드업) */}
      {loopPanelOpen && (
        <div className={styles.loopSettingPanel}>
          {/* 패널 헤더 */}
          <div className={styles.loopSettingHeader}>
            <span className={styles.loopSettingTitle}>{t('extKaraokeLoopSection')}</span>
            <button className={styles.loopSettingCloseButton} onClick={handleLoopPanelClose}>
              <MdClose size={16} />
            </button>
          </div>

          {/* A/B 시간 표시 */}
          <div className={styles.loopPointsRow}>
            <button
              className={`${styles.loopPointButton} ${selectingPoint === 'A' ? styles.loopPointButtonActive : ''} ${loopConfig.startIndex >= 0 ? styles.loopPointButtonSet : ''}`}
              onClick={() => setSelectingPoint('A')}
            >
              <span className={styles.loopPointLabel}>A</span>
              <span className={styles.loopPointTime}>
                {loopConfig.startIndex >= 0 && lyrics[loopConfig.startIndex]
                  ? formatTime(lyrics[loopConfig.startIndex].time)
                  : '--:--'}
              </span>
            </button>
            <span className={styles.loopPointDivider}>―</span>
            <button
              className={`${styles.loopPointButton} ${selectingPoint === 'B' ? styles.loopPointButtonActive : ''} ${loopConfig.endIndex >= 0 ? styles.loopPointButtonSet : ''}`}
              onClick={() => setSelectingPoint('B')}
            >
              <span className={styles.loopPointLabel}>B</span>
              <span className={styles.loopPointTime}>
                {loopConfig.endIndex >= 0 && lyrics[loopConfig.endIndex]
                  ? formatTime(lyrics[loopConfig.endIndex].time)
                  : '--:--'}
              </span>
            </button>
          </div>

          {/* 가사 줄을 클릭하여 A/B 설정 안내 */}
          {selectingPoint && (
            <p className={styles.loopSelectHint}>
              {selectingPoint === 'A' ? '시작점(A)을 가사에서 선택하세요' : '끝점(B)을 가사에서 선택하세요'}
            </p>
          )}

          {/* 횟수 선택 */}
          <div className={styles.loopRepeatRow}>
            {(['1x', '3x', 'infinite'] as LoopRepeatMode[]).map((mode) => (
              <button
                key={mode}
                className={`${styles.loopRepeatButton} ${loopConfig.repeatMode === mode ? styles.loopRepeatButtonActive : ''}`}
                onClick={() => setLoopConfig((prev) => ({ ...prev, repeatMode: mode }))}
              >
                {mode === 'infinite' ? '∞' : mode}
              </button>
            ))}
          </div>

          {/* 연속 반복 토글 */}
          <button
            className={`${styles.loopContinuousToggle} ${loopConfig.continuous ? styles.loopContinuousToggleActive : ''}`}
            onClick={() => setLoopConfig((prev) => ({ ...prev, continuous: !prev.continuous }))}
          >
            <span>연속 반복</span>
            <span className={styles.loopContinuousDesc}>
              {loopConfig.continuous ? '구간 완료 후 다음 구간으로 자동 이동' : '선택한 구간만 반복'}
            </span>
          </button>

          {/* 반복 시작 버튼 */}
          <button className={styles.loopStartButton} disabled={!isLoopConfigComplete} onClick={handleLoopStart}>
            ▶ {t('extKaraokeLoopSection')}
          </button>
        </div>
      )}

      {/* 하단 고정 컨트롤 바 */}
      <div className={styles.lyricsSidebarControls}>
        {/* 구간반복 */}
        <button
          className={`${styles.lyricsSidebarControlButton} ${loopRun.active ? styles.lyricsSidebarControlButtonActive : ''}`}
          onClick={handleLoopButtonClick}
          title={t('extKaraokeLoopSection')}
        >
          <div style={{ position: 'relative' }}>
            <IoRepeat size={18} color={loopRun.active ? SIDEBAR_COLORS.primary : SIDEBAR_COLORS.textPrimary} />
            {loopRun.active && loopConfig.repeatMode !== 'infinite' && (
              <span className={styles.loopCountBadge}>
                {loopRun.currentRepeat}/{loopConfig.repeatMode === '1x' ? 1 : 3}
              </span>
            )}
            {loopRun.active && loopConfig.repeatMode === 'infinite' && <span className={styles.loopCountBadge}>∞</span>}
          </div>
          <span>{t('extKaraokeLoopSection')}</span>
        </button>

        {/* 간주 점프 */}
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
