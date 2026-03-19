// LyricsSidebarPanel.tsx
// 사이드바 Lyrics 탭 — 전체 가사 뷰 + 자동 하이라이트 + 구간 반복 + 간주 점프 + 싱크 조정
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IoRepeat } from 'react-icons/io5';
import { MdSkipNext, MdSync, MdClose, MdRemove, MdAdd, MdSave } from 'react-icons/md';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { applyOffsetToLyrics, applyLineAdjustments } from '@lib/utils/lyrics/display/lyricsOffset';
import { saveVideoOffset, getVideoOffset, type VideoOffsetData } from '@lib/utils/storage/videoOffsetStorage';
import { SIDEBAR_COLORS } from './sidebarStyles';
import styles from '../styles.module.css';

/** 구간 반복 횟수 모드 */
type LoopRepeatMode = '1x' | '3x' | 'infinite';

/** 구간 반복 상태 */
interface LoopConfig {
  startIndex: number;
  endIndex: number;
  repeatMode: LoopRepeatMode;
  continuous: boolean;
}

interface LoopRunState {
  active: boolean;
  currentRepeat: number;
}

const LOOP_END_BUFFER = 1;
const LOOP_START_LEAD_TIME = 1;
/** 싱크 조정 단위 선택지 (초) */
const SYNC_STEP_OPTIONS = [0.2, 0.5, 1, 5] as const;

interface LyricsSidebarPanelProps {
  lyrics: Line[];
}

/**
 * URL에서 YouTube 비디오 ID 추출
 */
function extractVideoId(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('v');
}

/**
 * 사이드바 Lyrics 탭 컴포넌트
 */
export const LyricsSidebarPanel: React.FC<LyricsSidebarPanelProps> = ({ lyrics }) => {
  const { t } = useTranslation();
  const currentTime = useCurrentTime();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLButtonElement>(null);

  // ===== 구간 반복 상태 =====
  const [loopPanelOpen, setLoopPanelOpen] = useState(false);
  const [selectingPoint, setSelectingPoint] = useState<'A' | 'B' | null>(null);
  const dragRef = useRef<{ dragging: boolean; startIdx: number; didDrag: boolean }>({
    dragging: false,
    startIdx: -1,
    didDrag: false,
  });
  const [loopConfig, setLoopConfig] = useState<LoopConfig>({
    startIndex: -1,
    endIndex: -1,
    repeatMode: '3x',
    continuous: false,
  });
  const [loopRun, setLoopRun] = useState<LoopRunState>({ active: false, currentRepeat: 0 });

  // ===== 싱크 조정 상태 =====
  const [syncPanelOpen, setSyncPanelOpen] = useState(false);
  const [syncTab, setSyncTab] = useState<'global' | 'section'>('global');
  const [globalOffset, setGlobalOffset] = useState(0);
  const [globalSyncStep, setGlobalSyncStep] = useState(0.5);
  // 구간 싱크: A-B 범위 (B 기본값 = 마지막 줄)
  const [lineAdjustments, setLineAdjustments] = useState<Record<number, number>>({});
  const [syncRange, setSyncRange] = useState<{ startIndex: number; endIndex: number }>({
    startIndex: -1,
    endIndex: -1,
  });
  const [syncSelectingPoint, setSyncSelectingPoint] = useState<'A' | 'B' | null>(null);
  const [sectionSyncStep, setSectionSyncStep] = useState(0.5);
  // 초기 가사 저장 (싱크 패널이 열린 시점의 가사를 원본으로 사용)
  const baseLyricsRef = useRef<Line[]>(lyrics);

  // 싱크 패널 열릴 때 원본 가사 복원 + 기존 오프셋 로드 (열리는 시점에만 1회 실행)
  const prevSyncPanelOpen = useRef(false);
  useEffect(() => {
    // 패널이 닫힘→열림으로 전환된 시점에만 실행
    if (!syncPanelOpen || prevSyncPanelOpen.current) {
      prevSyncPanelOpen.current = syncPanelOpen;
      return;
    }
    prevSyncPanelOpen.current = true;

    const currentLyrics = lyrics;
    const videoId = extractVideoId();
    if (!videoId) {
      baseLyricsRef.current = currentLyrics;
      return;
    }
    getVideoOffset(videoId).then((data) => {
      const savedOffset = data?.offset ?? 0;
      const savedAdj = data?.lineAdjustments ?? {};
      // 현재 lyrics는 이미 오프셋 적용된 상태 → 역적용하여 원본 복원
      let base = applyOffsetToLyrics(currentLyrics, -savedOffset, 0);
      base = applyLineAdjustments(
        base,
        Object.fromEntries(Object.entries(savedAdj).map(([k, v]) => [k, -(v as number)])),
      );
      baseLyricsRef.current = base;
      setGlobalOffset(savedOffset);
      setLineAdjustments(savedAdj);
      globalOffsetRef.current = savedOffset;
      lineAdjustmentsRef.current = savedAdj;
    });
  }, [syncPanelOpen, lyrics]);

  // 현재 재생 중인 가사 인덱스
  const activeLineIndex = useMemo(() => {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      const lyric = lyrics[i];
      if (lyric && lyric.time <= currentTime) return i;
    }
    return -1;
  }, [lyrics, currentTime]);

  // 현재 줄 자동 스크롤
  useEffect(() => {
    if (activeLineIndex < 0 || !activeLineRef.current) return;
    activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeLineIndex]);

  const getVideo = useCallback((): HTMLVideoElement | null => {
    return document.querySelector<HTMLVideoElement>('video.html5-main-video');
  }, []);

  // ===== 싱크 조정 — 오프셋 적용 및 전파 =====
  const applySyncToOverlay = useCallback((offset: number, adjustments: Record<number, number>) => {
    const base = baseLyricsRef.current;
    let adjusted = applyOffsetToLyrics(base, offset, 0);
    adjusted = applyLineAdjustments(adjusted, adjustments);

    // 오버레이에 즉시 반영
    chrome.runtime.sendMessage(
      {
        type: 'APPLY_OFFSET_LYRICS',
        payload: { offset, lyrics: adjusted },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[LyricsSidebarPanel] APPLY_OFFSET_LYRICS 오류:', chrome.runtime.lastError.message);
        }
      },
    );
  }, []);

  // 전체 오프셋 조정
  const globalOffsetRef = useRef(globalOffset);
  globalOffsetRef.current = globalOffset;
  const lineAdjustmentsRef = useRef(lineAdjustments);
  lineAdjustmentsRef.current = lineAdjustments;

  const handleGlobalOffsetChange = useCallback(
    (delta: number) => {
      const next = Number((globalOffsetRef.current + delta).toFixed(1));
      setGlobalOffset(next);
      applySyncToOverlay(next, lineAdjustmentsRef.current);
    },
    [applySyncToOverlay],
  );

  // 구간 오프셋 조정 — A부터 B까지 shift
  const handleSectionOffsetChange = useCallback(
    (delta: number) => {
      if (syncRange.startIndex < 0) return;
      const end = syncRange.endIndex >= 0 ? syncRange.endIndex : lyrics.length - 1;
      const prev = lineAdjustmentsRef.current;
      const next = { ...prev };
      for (let i = syncRange.startIndex; i <= end; i++) {
        next[i] = Number(((next[i] ?? 0) + delta).toFixed(1));
        if (next[i] === 0) delete next[i];
      }
      setLineAdjustments(next);
      lineAdjustmentsRef.current = next;
      applySyncToOverlay(globalOffsetRef.current, next);
    },
    [syncRange, lyrics.length, applySyncToOverlay],
  );

  // 싱크 저장
  const handleSyncSave = useCallback(async () => {
    const videoId = extractVideoId();
    if (!videoId) return;

    const videoTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 'Unknown';

    const hasLineAdj = Object.keys(lineAdjustments).length > 0;
    const data: VideoOffsetData = {
      videoId,
      title: videoTitle.trim(),
      offset: globalOffset,
      ...(hasLineAdj ? { lineAdjustments } : {}),
      thumbnail: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      lastModified: Date.now(),
    };

    await saveVideoOffset(data);
    console.log(
      `[LyricsSidebarPanel] 싱크 저장 완료 (offset: ${globalOffset}, lineAdj: ${Object.keys(lineAdjustments).length}개)`,
    );

    // 최종 가사를 오버레이에 반영
    applySyncToOverlay(globalOffset, lineAdjustments);
    setSyncPanelOpen(false);
  }, [globalOffset, lineAdjustments, applySyncToOverlay]);

  // 전체 초기화 (offset=0, lineAdjustments={}) → 원본으로
  const handleSyncResetAll = useCallback(() => {
    setGlobalOffset(0);
    setLineAdjustments({});
    globalOffsetRef.current = 0;
    lineAdjustmentsRef.current = {};
    setSyncRange({ startIndex: -1, endIndex: -1 });
    setSyncSelectingPoint(null);
    applySyncToOverlay(0, {});
  }, [applySyncToOverlay]);

  // 마지막 저장 상태로 복원 (Storage에서 다시 로드)
  const handleSyncRevert = useCallback(async () => {
    const videoId = extractVideoId();
    if (!videoId) return;
    const data = await getVideoOffset(videoId);
    const savedOffset = data?.offset ?? 0;
    const savedAdj = data?.lineAdjustments ?? {};
    setGlobalOffset(savedOffset);
    setLineAdjustments(savedAdj);
    globalOffsetRef.current = savedOffset;
    lineAdjustmentsRef.current = savedAdj;
    setSyncRange({ startIndex: -1, endIndex: -1 });
    setSyncSelectingPoint(null);
    applySyncToOverlay(savedOffset, savedAdj);
  }, [applySyncToOverlay]);

  // 싱크 버튼 클릭
  const handleSyncButtonClick = useCallback(() => {
    setSyncPanelOpen((prev) => {
      if (!prev) {
        setLoopPanelOpen(false);
        setSelectingPoint(null);
        setSyncRange({ startIndex: -1, endIndex: -1 });
        setSyncSelectingPoint(null);
      }
      return !prev;
    });
  }, []);

  // ===== 가사 줄 클릭 핸들러 (반복 / 싱크 / 일반 모드 분기) =====
  const handleLineClick = useCallback(
    (idx: number, time: number) => {
      if (dragRef.current.didDrag) {
        dragRef.current.didDrag = false;
        return;
      }

      // 싱크 구간 선택 모드
      if (syncSelectingPoint === 'A') {
        setSyncRange({ startIndex: idx, endIndex: -1 }); // B는 미설정 (별도 선택 필요)
        setSyncSelectingPoint(null);
        return;
      }
      if (syncSelectingPoint === 'B') {
        const actualEnd = idx > syncRange.startIndex ? idx : syncRange.startIndex;
        const actualStart = idx > syncRange.startIndex ? syncRange.startIndex : idx;
        setSyncRange({ startIndex: actualStart, endIndex: actualEnd });
        setSyncSelectingPoint(null);
        return;
      }

      // 구간 반복 A/B 선택 모드
      if (selectingPoint === 'A') {
        setLoopConfig((prev) => ({ ...prev, startIndex: idx }));
        setSelectingPoint('B');
        return;
      }
      if (selectingPoint === 'B') {
        const actualEnd = idx > loopConfig.startIndex ? idx : loopConfig.startIndex;
        const actualStart = idx > loopConfig.startIndex ? loopConfig.startIndex : idx;
        setLoopConfig((prev) => ({ ...prev, startIndex: actualStart, endIndex: actualEnd }));
        setSelectingPoint(null);
        return;
      }

      // 일반 모드: 해당 시점으로 이동
      const video = getVideo();
      if (video) video.currentTime = time;
    },
    [selectingPoint, loopConfig.startIndex, syncSelectingPoint, syncRange.startIndex, lyrics.length, getVideo],
  );

  // 드래그 A-B (반복 + 싱크 공용)
  // 드래그 모드 구분: 'loop' | 'sync'
  const dragModeRef = useRef<'loop' | 'sync'>('loop');

  const handleLineDragStart = useCallback(
    (idx: number) => {
      if (selectingPoint) {
        dragModeRef.current = 'loop';
        dragRef.current = { dragging: true, startIdx: idx, didDrag: false };
        setLoopConfig((prev) => ({ ...prev, startIndex: idx, endIndex: -1 }));
        setSelectingPoint('B');
      } else if (syncSelectingPoint) {
        dragModeRef.current = 'sync';
        dragRef.current = { dragging: true, startIdx: idx, didDrag: false };
        setSyncRange({ startIndex: idx, endIndex: -1 });
        setSyncSelectingPoint('B');
      }
    },
    [selectingPoint, syncSelectingPoint, lyrics.length],
  );

  const handleLineDragEnter = useCallback((idx: number) => {
    if (!dragRef.current.dragging) return;
    if (idx !== dragRef.current.startIdx) dragRef.current.didDrag = true;
    const start = dragRef.current.startIdx;
    const actualStart = Math.min(start, idx);
    const actualEnd = Math.max(start, idx);

    if (dragModeRef.current === 'loop') {
      setLoopConfig((prev) => ({ ...prev, startIndex: actualStart, endIndex: actualEnd }));
    } else {
      setSyncRange({ startIndex: actualStart, endIndex: actualEnd });
    }
  }, []);

  const handleLineDragEnd = useCallback(() => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    if (dragRef.current.didDrag) {
      setSelectingPoint(null);
      setSyncSelectingPoint(null);
    }
  }, []);

  useEffect(() => {
    const onMouseUp = () => handleLineDragEnd();
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [handleLineDragEnd]);

  // ===== 구간 반복 — timeupdate 리스너 =====
  useEffect(() => {
    if (!loopRun.active) return;
    const video = getVideo();
    if (!video) return;

    const { startIndex, endIndex, repeatMode, continuous } = loopConfig;
    const startLyric = lyrics[startIndex];
    const endLyric = lyrics[endIndex];
    if (!startLyric || !endLyric) return;

    const loopStartTime = Math.max(0, startLyric.time - LOOP_START_LEAD_TIME);
    const nextAfterEnd = lyrics[endIndex + 1];
    const loopEndTime = nextAfterEnd ? nextAfterEnd.time + LOOP_END_BUFFER : endLyric.time + 10;
    const maxRepeats = repeatMode === '1x' ? 1 : repeatMode === '3x' ? 3 : Infinity;

    const onTimeUpdate = () => {
      if (video.currentTime >= loopEndTime) {
        setLoopRun((prev) => {
          const nextCount = prev.currentRepeat + 1;
          if (nextCount > maxRepeats) {
            if (continuous) {
              const sectionSize = endIndex - startIndex + 1;
              const newStart = endIndex + 1;
              const newEnd = Math.min(newStart + sectionSize - 1, lyrics.length - 1);
              if (newStart < lyrics.length) {
                setLoopConfig((prevConfig) => ({ ...prevConfig, startIndex: newStart, endIndex: newEnd }));
                return { active: true, currentRepeat: 0 };
              }
            }
            return { active: false, currentRepeat: 0 };
          }
          video.currentTime = loopStartTime;
          return { ...prev, currentRepeat: nextCount };
        });
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [loopRun.active, loopConfig, lyrics, getVideo]);

  // 반복 시작/중지/토글
  const handleLoopStart = useCallback(() => {
    if (loopConfig.startIndex < 0 || loopConfig.endIndex < 0) return;
    const video = getVideo();
    const startLyric = lyrics[loopConfig.startIndex];
    if (video && startLyric) video.currentTime = Math.max(0, startLyric.time - LOOP_START_LEAD_TIME);
    setLoopRun({ active: true, currentRepeat: 0 });
    setLoopPanelOpen(false);
    setSelectingPoint(null);
  }, [loopConfig, lyrics, getVideo]);

  const handleLoopStop = useCallback(() => {
    setLoopRun({ active: false, currentRepeat: 0 });
  }, []);

  const handleLoopButtonClick = useCallback(() => {
    if (loopRun.active) {
      handleLoopStop();
      return;
    }
    // 싱크 패널 닫기
    setSyncPanelOpen(false);
    setLoopPanelOpen((prev) => {
      if (!prev) {
        setLoopConfig({ startIndex: -1, endIndex: -1, repeatMode: '3x', continuous: false });
        setSelectingPoint('A');
      } else {
        setSelectingPoint(null);
      }
      return !prev;
    });
  }, [loopRun.active, handleLoopStop]);

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
    if (gap >= 7) {
      video.currentTime = Math.max(0, nextLyric.time - 3);
    } else {
      video.currentTime = nextLyric.time;
    }
  }, [lyrics, getVideo]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // 구간 판별 (반복)
  const isInLoopRange = (idx: number): boolean => {
    if (loopConfig.startIndex < 0) return false;
    if (loopConfig.endIndex < 0) return idx === loopConfig.startIndex;
    return idx >= loopConfig.startIndex && idx <= loopConfig.endIndex;
  };

  const isLoopConfigComplete = loopConfig.startIndex >= 0 && loopConfig.endIndex >= 0;
  const isSelecting = !!selectingPoint || !!syncSelectingPoint;

  // 구간 싱크의 현재 보정값 (표시용 — A 지점 기준)
  const sectionAdjustmentDisplay = useMemo(() => {
    if (syncRange.startIndex < 0) return 0;
    return lineAdjustments[syncRange.startIndex] ?? 0;
  }, [syncRange.startIndex, lineAdjustments]);

  if (lyrics.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className={styles.lyricsEmptyState}>
          <p>{t('extChartNoData')}</p>
          <button
            className={styles.lyricsGoSearchButton}
            onClick={() => window.dispatchEvent(new CustomEvent('open-manual-search'))}
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
          const inLoopRange = (loopPanelOpen || loopRun.active) && isInLoopRange(idx);
          const syncEnd = syncRange.endIndex >= 0 ? syncRange.endIndex : lyrics.length - 1;
          const inSyncRange =
            syncPanelOpen && syncRange.startIndex >= 0 && idx >= syncRange.startIndex && idx <= syncEnd;
          const isPointA = idx === loopConfig.startIndex && (loopPanelOpen || loopRun.active);
          const isPointB = idx === loopConfig.endIndex && (loopPanelOpen || loopRun.active);
          const hasLineAdj = lineAdjustments[idx] !== undefined && lineAdjustments[idx] !== 0;

          return (
            <button
              key={idx}
              ref={isActive ? activeLineRef : undefined}
              className={[
                styles.lyricsSidebarLine,
                isActive ? styles.lyricsSidebarLineActive : '',
                isPast ? styles.lyricsSidebarLinePast : '',
                inLoopRange ? styles.lyricsSidebarLineInRange : '',
                inSyncRange ? styles.lyricsSidebarLineInRange : '',
                isPointA ? styles.lyricsSidebarLinePointA : '',
                isPointB ? styles.lyricsSidebarLinePointB : '',
                isSelecting ? styles.lyricsSidebarLineSelectable : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleLineClick(idx, line.time)}
              onMouseDown={() => handleLineDragStart(idx)}
              onMouseEnter={() => handleLineDragEnter(idx)}
            >
              <span className={styles.lyricsSidebarTimestamp}>{formatTime(line.time)}</span>
              <span className={styles.lyricsSidebarText}>{line.text}</span>
              {isPointA && <span className={styles.loopPointBadge}>A</span>}
              {isPointB && <span className={styles.loopPointBadge}>B</span>}
              {hasLineAdj && syncPanelOpen && (
                <span className={styles.syncAdjBadge}>
                  {(lineAdjustments[idx] ?? 0) > 0 ? '+' : ''}
                  {lineAdjustments[idx]}s
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 구간 반복 설정 패널 */}
      {loopPanelOpen && (
        <div className={styles.loopSettingPanel}>
          <div className={styles.loopSettingHeader}>
            <span className={styles.loopSettingTitle}>{t('extKaraokeLoopSection')}</span>
            <button className={styles.loopSettingCloseButton} onClick={handleLoopPanelClose}>
              <MdClose size={16} />
            </button>
          </div>
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
          {selectingPoint && (
            <p className={styles.loopSelectHint}>
              {selectingPoint === 'A' ? t('extLoopSelectA') : t('extLoopSelectB')}
            </p>
          )}
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
          <button
            className={`${styles.loopContinuousToggle} ${loopConfig.continuous ? styles.loopContinuousToggleActive : ''}`}
            onClick={() => setLoopConfig((prev) => ({ ...prev, continuous: !prev.continuous }))}
          >
            <span>{t('extLoopContinuous')}</span>
            <span className={styles.loopContinuousDesc}>
              {loopConfig.continuous ? t('extLoopContinuousOnDesc') : t('extLoopContinuousOffDesc')}
            </span>
          </button>
          <button className={styles.loopStartButton} disabled={!isLoopConfigComplete} onClick={handleLoopStart}>
            ▶ {t('extKaraokeLoopSection')}
          </button>
        </div>
      )}

      {/* 싱크 조정 패널 */}
      {syncPanelOpen && (
        <div className={styles.loopSettingPanel}>
          <div className={styles.loopSettingHeader}>
            <span className={styles.loopSettingTitle}>{t('extKaraokeSyncSettings')}</span>
            <button className={styles.loopSettingCloseButton} onClick={() => setSyncPanelOpen(false)}>
              <MdClose size={16} />
            </button>
          </div>

          {/* 탭 전환: 전체 | 구간 */}
          <div className={styles.syncTabRow}>
            <button
              className={`${styles.syncTabButton} ${syncTab === 'global' ? styles.syncTabButtonActive : ''}`}
              onClick={() => {
                setSyncTab('global');
                setSyncSelectingPoint(null);
              }}
            >
              {t('extSyncGlobal')}
            </button>
            <button
              className={`${styles.syncTabButton} ${syncTab === 'section' ? styles.syncTabButtonActive : ''}`}
              onClick={() => setSyncTab('section')}
            >
              {t('extSyncSection')}
            </button>
          </div>

          {/* 전체 싱크 탭 */}
          {syncTab === 'global' && (
            <div className={styles.syncGlobalRow}>
              <div className={styles.syncStepRow}>
                {SYNC_STEP_OPTIONS.map((step) => (
                  <button
                    key={step}
                    className={`${styles.loopRepeatButton} ${globalSyncStep === step ? styles.loopRepeatButtonActive : ''}`}
                    onClick={() => setGlobalSyncStep(step)}
                  >
                    {step}s
                  </button>
                ))}
              </div>
              <div className={styles.syncAdjustRow}>
                <button className={styles.syncAdjustButton} onClick={() => handleGlobalOffsetChange(-globalSyncStep)}>
                  <MdRemove size={14} />
                </button>
                <span className={styles.syncOffsetDisplay}>
                  {globalOffset >= 0 ? '+' : ''}
                  {globalOffset.toFixed(1)}s
                </span>
                <button className={styles.syncAdjustButton} onClick={() => handleGlobalOffsetChange(globalSyncStep)}>
                  <MdAdd size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 구간 싱크 탭 — A-B 범위 방식 */}
          {syncTab === 'section' && (
            <div className={styles.syncSectionBlock}>
              <div className={styles.loopPointsRow}>
                <button
                  className={`${styles.loopPointButton} ${syncSelectingPoint === 'A' ? styles.loopPointButtonActive : ''} ${syncRange.startIndex >= 0 ? styles.loopPointButtonSet : ''}`}
                  onClick={() => setSyncSelectingPoint('A')}
                >
                  <span className={styles.loopPointLabel}>A</span>
                  <span className={styles.loopPointTime}>
                    {syncRange.startIndex >= 0 && lyrics[syncRange.startIndex]
                      ? formatTime(lyrics[syncRange.startIndex].time)
                      : '--:--'}
                  </span>
                </button>
                <span className={styles.loopPointDivider}>―</span>
                <button
                  className={`${styles.loopPointButton} ${syncSelectingPoint === 'B' ? styles.loopPointButtonActive : ''} ${syncRange.endIndex >= 0 ? styles.loopPointButtonSet : ''}`}
                  onClick={() => setSyncSelectingPoint('B')}
                >
                  <span className={styles.loopPointLabel}>B</span>
                  <span className={styles.loopPointTime}>
                    {syncRange.endIndex >= 0 && lyrics[syncRange.endIndex]
                      ? syncRange.endIndex === lyrics.length - 1
                        ? 'end'
                        : formatTime(lyrics[syncRange.endIndex].time)
                      : syncRange.startIndex >= 0
                        ? 'end'
                        : '--:--'}
                  </span>
                </button>
                {syncRange.startIndex >= 0 && syncRange.endIndex >= 0 && syncRange.endIndex < lyrics.length - 1 && (
                  <button
                    className={styles.syncEndButton}
                    onClick={() => setSyncRange((prev) => ({ ...prev, endIndex: lyrics.length - 1 }))}
                  >
                    end
                  </button>
                )}
              </div>

              {syncSelectingPoint && (
                <p className={styles.loopSelectHint}>
                  {syncSelectingPoint === 'A' ? t('extLoopSelectA') : t('extLoopSelectB')}
                </p>
              )}

              {syncRange.startIndex >= 0 && syncRange.endIndex >= 0 && (
                <>
                  <div className={styles.syncStepRow}>
                    {SYNC_STEP_OPTIONS.map((step) => (
                      <button
                        key={step}
                        className={`${styles.loopRepeatButton} ${sectionSyncStep === step ? styles.loopRepeatButtonActive : ''}`}
                        onClick={() => setSectionSyncStep(step)}
                      >
                        {step}s
                      </button>
                    ))}
                  </div>
                  <div className={styles.syncAdjustRow}>
                    <button
                      className={styles.syncAdjustButton}
                      onClick={() => handleSectionOffsetChange(-sectionSyncStep)}
                    >
                      <MdRemove size={14} />
                    </button>
                    <span className={styles.syncOffsetDisplay}>
                      {sectionAdjustmentDisplay >= 0 ? '+' : ''}
                      {sectionAdjustmentDisplay.toFixed(1)}s
                    </span>
                    <button
                      className={styles.syncAdjustButton}
                      onClick={() => handleSectionOffsetChange(sectionSyncStep)}
                    >
                      <MdAdd size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 저장 / 초기화 */}
          <div className={styles.syncActionRow}>
            <button className={styles.syncResetAllButton} onClick={handleSyncResetAll} title={t('extSyncResetAll')}>
              {t('extSyncResetAll')}
            </button>
            <button className={styles.syncRevertButton} onClick={handleSyncRevert} title={t('extSyncRevert')}>
              {t('extSyncRevert')}
            </button>
            <div style={{ flex: 1 }} />
            <button className={styles.loopStartButton} onClick={handleSyncSave}>
              <MdSave size={14} /> {t('extSyncSave')}
            </button>
          </div>
        </div>
      )}

      {/* 하단 고정 컨트롤 바 */}
      <div className={styles.lyricsSidebarControls}>
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

        <button
          className={styles.lyricsSidebarControlButton}
          onClick={handleSkipIntro}
          title={t('extKaraokeSkipIntro')}
        >
          <MdSkipNext size={18} color={SIDEBAR_COLORS.textPrimary} />
          <span>{t('extKaraokeSkipIntro')}</span>
        </button>

        <button
          className={`${styles.lyricsSidebarControlButton} ${syncPanelOpen ? styles.lyricsSidebarControlButtonActive : ''}`}
          onClick={handleSyncButtonClick}
          title={t('extKaraokeSyncSettings')}
        >
          <MdSync size={18} color={syncPanelOpen ? SIDEBAR_COLORS.primary : SIDEBAR_COLORS.textPrimary} />
          <span>{t('extKaraokeSyncSettings')}</span>
        </button>
      </div>
    </div>
  );
};
