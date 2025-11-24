// BottomContainer.tsx
// 가라오케 모드 하단 컨테이너
// 구간 반복, 싱크셋 등 음악 영상 관련 기능 제공
import React from 'react';
import styles from './styles.module.css';
import { IoRepeat } from 'react-icons/io5';
import {
  MdReplay,
  MdTune,
  MdSkipNext,
  MdAutoMode,
  MdNavigateBefore,
  MdNavigateNext,
  MdOutlineDragHandle,
  MdRemove,
  MdSubtitles,
  MdRecordVoiceOver,
  MdReorder,
  MdClose,
} from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Line } from '@lib/types/lyrics';
import { applyOffsetToLyrics } from '@lib/utils/lyrics/display/lyricsOffset';
import { SingleLineLyrics } from '../lyrics/SingleLineLyrics/SingleLineLyrics';

// 아이콘 공통 스타일 상수
const ICON_SIZE = 28;
const ICON_COLOR = '#ffffff';
const ICON_COLOR_GOLD = '#FFEB3B';

// 구간 반복 끝 시간 버퍼 (초) - 가사 끝부분이 잘리지 않도록
const LOOP_END_BUFFER = 0.3;

/**
 * 구간 반복 모드
 * - off: 비활성화
 * - once: 1번 반복 (전역)
 * - triple: 3번 반복 (전역)
 * - infinite: 무한 반복 (지역)
 */
type LoopMode = 'off' | 'once' | 'triple' | 'infinite';

/**
 * 가사 방식 모드
 * - sync: 기본 (현재 가사 + 다음 가사) - LyricsDisplayMenu와 호환
 * - single: 싱글 (현재 가사만)
 * - full: 전체 가사
 */
type LyricsDisplayMode = 'sync' | 'single' | 'full';

/**
 * 구간 반복 상태
 */
interface LoopState {
  mode: LoopMode;
  sectionStartIndex: number; // 반복 구간 시작 인덱스
  sectionEndIndex: number; // 반복 구간 끝 인덱스
  repeatCount: number; // 현재 구간 반복 횟수
}

interface BottomContainerProps {
  lyrics: Line[];
  offset?: number;
  onOffsetChange?: (offset: number, offsetLyrics: Line[]) => void;
}

/**
 * 가라오케 모드 하단 컨테이너
 * - 동영상 플레이어 하단에 위치
 * - 구간반복, 간주점프, 노래처음으로, 싱크셋 등 기능 제공
 */
export const BottomContainer: React.FC<BottomContainerProps> = ({
  lyrics,
  offset: initialOffset = 0,
  onOffsetChange,
}) => {
  const { t } = useTranslation();
  const [loopMode, setLoopMode] = React.useState<LoopMode>('off');
  const [autoSkipEnabled, setAutoSkipEnabled] = React.useState<boolean>(false);
  const [loopState, setLoopState] = React.useState<LoopState>({
    mode: 'off',
    sectionStartIndex: -1,
    sectionEndIndex: -1,
    repeatCount: 0,
  });

  // 가사 디스플레이 상태
  const [lyricsDisplayMode, setLyricsDisplayMode] = React.useState<LyricsDisplayMode>('sync');
  const [showCurrentLyrics, setShowCurrentLyrics] = React.useState<boolean>(true);
  const [showPronunciation, setShowPronunciation] = React.useState<boolean>(true);

  // 오프셋 조정 모달 상태
  const [showOffsetModal, setShowOffsetModal] = React.useState<boolean>(false);
  const [offset, setOffset] = React.useState<number>(initialOffset);
  const [offsetLyrics, setOffsetLyrics] = React.useState<Line[]>(lyrics);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const sliderRef = React.useRef<HTMLInputElement | null>(null);
  const [thumbPos, setThumbPos] = React.useState(0);

  /**
   * YouTube 동영상 플레이어 제어
   */
  const getYouTubePlayer = (): HTMLVideoElement | null => {
    return document.querySelector<HTMLVideoElement>('video.html5-main-video');
  };

  /**
   * 현재 재생 중인 가사의 인덱스 찾기
   */
  const getCurrentLyricIndex = React.useCallback(
    (currentTime: number): number => {
      for (let i = lyrics.length - 1; i >= 0; i--) {
        const lyric = lyrics[i];
        if (lyric && lyric.time <= currentTime) {
          return i;
        }
      }
      return -1; // 첫 가사 시작 전
    },
    [lyrics],
  );

  // video element 참조 설정
  React.useEffect(() => {
    const vid = document.querySelector<HTMLVideoElement>('video.html5-main-video');
    if (vid) {
      videoRef.current = vid;
      console.log('[BottomContainer] video element 참조 성공');
    } else {
      console.warn('[BottomContainer] video element를 찾지 못했습니다.');
    }
  }, []);

  // initialOffset 변경 시 업데이트
  React.useEffect(() => {
    setOffset(initialOffset);
    setOffsetLyrics(applyOffsetToLyrics(lyrics, initialOffset, 0));
  }, [initialOffset, lyrics]);

  // 썸 위치 계산
  React.useEffect(() => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      const minVal = -15;
      const maxVal = 15;
      const ratio = (offset - minVal) / (maxVal - minVal);
      const width = slider.offsetWidth;
      setThumbPos(ratio * width);
    }
  }, [offset]);

  // chrome.storage에서 상태 불러오기
  React.useEffect(() => {
    chrome.storage.sync.get(['karaokeAutoSkipEnabled', 'lyricsMode', 'realtimeLyrics', 'announceLyrics'], (result) => {
      console.log('[BottomContainer] storage 불러오기:', result);
      if (result.karaokeAutoSkipEnabled !== undefined) {
        setAutoSkipEnabled(result.karaokeAutoSkipEnabled);
      }
      if (result.lyricsMode !== undefined) {
        console.log('[BottomContainer] lyricsMode 설정:', result.lyricsMode);
        setLyricsDisplayMode(result.lyricsMode);
      }
      if (result.realtimeLyrics !== undefined) {
        setShowCurrentLyrics(result.realtimeLyrics);
      }
      if (result.announceLyrics !== undefined) {
        setShowPronunciation(result.announceLyrics);
      }
    });

    // storage 변경 감지 리스너
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName === 'sync') {
        if (changes.lyricsMode) {
          console.log('[BottomContainer] lyricsMode 변경 감지:', changes.lyricsMode.newValue);
          setLyricsDisplayMode(changes.lyricsMode.newValue);
        }
        if (changes.realtimeLyrics) {
          setShowCurrentLyrics(changes.realtimeLyrics.newValue);
        }
        if (changes.announceLyrics) {
          setShowPronunciation(changes.announceLyrics.newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // 자동 점프 기능: 활성화 시 가사 로드 후 첫 가사 3초 전으로 이동
  React.useEffect(() => {
    if (!autoSkipEnabled || lyrics.length === 0) {
      return;
    }

    const videoElement = getYouTubePlayer();
    if (!videoElement) {
      return;
    }

    const firstLyric = lyrics[0];
    if (!firstLyric) {
      return;
    }

    // 첫 가사가 4초 이내면 자동 점프 작동하지 않음
    if (firstLyric.time <= 4) {
      console.log('[BottomContainer] 자동 점프: 첫 가사가 4초 이내여서 작동하지 않음');
      return;
    }

    // 3초 전 위치 계산 (음수가 되지 않도록)
    const targetTime = Math.max(0, firstLyric.time - 3);

    // 현재 시간이 0초이거나 첫 가사 이전일 때만 자동 점프 실행
    const currentTime = videoElement.currentTime;
    if (currentTime <= firstLyric.time) {
      // 0초로 초기화
      videoElement.currentTime = 0;

      // 잠시 후 목표 시간으로 이동 (0초 초기화 후 점프)
      setTimeout(() => {
        videoElement.currentTime = targetTime;
        console.log(
          `[BottomContainer] 자동 점프: 0초 → ${targetTime.toFixed(2)}초로 이동 (첫 가사: ${firstLyric.time}초)`,
        );
      }, 100);
    }
  }, [autoSkipEnabled, lyrics]);

  // 구간 반복 로직 - timeupdate 이벤트 리스너
  React.useEffect(() => {
    const videoElement = getYouTubePlayer();
    if (!videoElement || lyrics.length === 0) {
      console.log('[BottomContainer] useEffect - videoElement 또는 lyrics 없음');
      return;
    }

    console.log('[BottomContainer] useEffect 실행 - loopState.mode:', loopState.mode);

    const handleTimeUpdate = () => {
      if (loopState.mode === 'off') {
        return;
      }

      const currentTime = videoElement.currentTime;
      const currentIndex = getCurrentLyricIndex(currentTime);

      // 무한 반복 모드 (지역 반복)
      if (loopState.mode === 'infinite') {
        // 반복 구간이 설정되지 않았으면 현재 구간으로 설정
        if (loopState.sectionStartIndex === -1 && currentIndex >= 0) {
          const startIndex = currentIndex;
          const endIndex = Math.min(currentIndex + 1, lyrics.length - 1);
          setLoopState({
            mode: 'infinite',
            sectionStartIndex: startIndex,
            sectionEndIndex: endIndex,
            repeatCount: 0,
          });
          console.log(`[BottomContainer] 무한 반복 구간 설정: ${startIndex + 1}-${endIndex + 1}줄`);
          return;
        }

        // 구간 끝 지점을 넘어가면 구간 시작으로 이동
        const endLyric = lyrics[loopState.sectionEndIndex];
        const nextLyric = lyrics[loopState.sectionEndIndex + 1];
        // 다음 가사 시작 시간 + 버퍼 (가사 끝부분이 잘리지 않도록)
        const endTime = nextLyric ? nextLyric.time + LOOP_END_BUFFER : videoElement.duration;

        if (endLyric && currentTime >= endTime) {
          const startLyric = lyrics[loopState.sectionStartIndex];
          if (startLyric) {
            videoElement.currentTime = startLyric.time;
            console.log(
              `[BottomContainer] 무한 반복: ${loopState.sectionStartIndex + 1}-${loopState.sectionEndIndex + 1}줄 반복 중`,
            );
          }
        }
      }
      // 1번/3번 반복 모드 (전역 반복)
      else if (loopState.mode === 'once' || loopState.mode === 'triple') {
        const maxRepeats = loopState.mode === 'once' ? 1 : 3;

        // 반복 구간이 설정되지 않았으면 현재 구간으로 설정
        if (loopState.sectionStartIndex === -1 && currentIndex >= 0) {
          const startIndex = currentIndex;
          const endIndex = Math.min(currentIndex + 1, lyrics.length - 1);
          setLoopState({
            mode: loopState.mode,
            sectionStartIndex: startIndex,
            sectionEndIndex: endIndex,
            repeatCount: 0,
          });
          console.log(
            `[BottomContainer] 구간 설정: ${startIndex + 1}-${endIndex + 1}줄 (${loopState.mode === 'once' ? '1' : '3'}번 반복)`,
          );
          return;
        }

        // 현재 구간 끝 지점 체크
        const endLyric = lyrics[loopState.sectionEndIndex];
        const nextLyric = lyrics[loopState.sectionEndIndex + 1];
        // 다음 가사 시작 시간 + 버퍼 (가사 끝부분이 잘리지 않도록)
        const endTime = nextLyric ? nextLyric.time + LOOP_END_BUFFER : videoElement.duration;

        if (endLyric && currentTime >= endTime) {
          if (loopState.repeatCount < maxRepeats) {
            // 반복 횟수가 남았으면 구간 시작으로 이동
            const startLyric = lyrics[loopState.sectionStartIndex];
            if (startLyric) {
              videoElement.currentTime = startLyric.time;
              setLoopState({
                ...loopState,
                repeatCount: loopState.repeatCount + 1,
              });
              console.log(
                `[BottomContainer] 구간 반복: ${loopState.sectionStartIndex + 1}-${loopState.sectionEndIndex + 1}줄 ${loopState.repeatCount + 1}/${maxRepeats}번째`,
              );
            }
          } else {
            // 반복 완료 - 다음 구간으로 설정
            const newStartIndex = loopState.sectionEndIndex + 1;
            if (newStartIndex < lyrics.length) {
              const newEndIndex = Math.min(newStartIndex + 1, lyrics.length - 1);
              setLoopState({
                mode: loopState.mode,
                sectionStartIndex: newStartIndex,
                sectionEndIndex: newEndIndex,
                repeatCount: 0,
              });
              console.log(`[BottomContainer] 다음 구간: ${newStartIndex + 1}-${newEndIndex + 1}줄`);
            }
          }
        }
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [loopState, lyrics, getCurrentLyricIndex]);

  /**
   * 노래 처음으로 (0:00으로 이동)
   */
  const handleRestartSong = () => {
    const videoElement = getYouTubePlayer();
    if (videoElement) {
      videoElement.currentTime = 0;
      console.log('[BottomContainer] 노래 처음으로: 0:00으로 이동');
    } else {
      console.error('[BottomContainer] YouTube 비디오 요소를 찾을 수 없습니다');
    }
  };

  /**
   * 구간 반복 모드 토글
   * off → once(1번) → triple(3번) → infinite(무한) → off
   */
  const handleLoopToggle = () => {
    setLoopMode((prev: LoopMode): LoopMode => {
      const modes: LoopMode[] = ['off', 'once', 'triple', 'infinite'];
      const currentIndex = modes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex] as LoopMode;

      console.log(`[BottomContainer] 구간 반복 모드: ${prev} → ${nextMode}`);

      // loopState 초기화 (모드 변경 시 새로운 구간으로 설정)
      setLoopState({
        mode: nextMode,
        sectionStartIndex: -1,
        sectionEndIndex: -1,
        repeatCount: 0,
      });

      return nextMode;
    });
  };

  /**
   * 구간 반복 아이콘 색상
   */
  const getLoopIconColor = (): string => {
    return loopMode === 'infinite' ? ICON_COLOR_GOLD : ICON_COLOR;
  };

  /**
   * 구간 반복 배지 표시 (1, 3만 표시, 무한은 금색 아이콘으로 구분)
   */
  const getLoopBadgeText = (): string | null => {
    switch (loopMode) {
      case 'once':
        return '1';
      case 'triple':
        return '3';
      default:
        return null;
    }
  };

  /**
   * 자동 간주 점프 토글
   */
  const handleAutoSkipToggle = () => {
    setAutoSkipEnabled((prev) => {
      const newState = !prev;
      // chrome.storage에 상태 저장
      chrome.storage.local.set({ karaokeAutoSkipEnabled: newState });
      console.log(`[BottomContainer] 자동 간주 점프: ${newState ? '활성화' : '비활성화'}`);
      return newState;
    });
  };

  /**
   * 자동 간주 점프 아이콘 색상 (구간 반복 무한 모드와 같은 금색)
   */
  const getAutoSkipIconColor = (): string => {
    return autoSkipEnabled ? ICON_COLOR_GOLD : ICON_COLOR;
  };

  /**
   * 이전 가사 타임스탬프로 이동
   */
  const handlePrevLyric = () => {
    console.log('[BottomContainer] handlePrevLyric 호출');
    const videoElement = getYouTubePlayer();
    if (!videoElement || lyrics.length === 0) {
      console.log('[BottomContainer] videoElement 또는 lyrics 없음');
      return;
    }

    const currentTime = videoElement.currentTime;
    const currentIndex = getCurrentLyricIndex(currentTime);
    console.log('[BottomContainer] 이전 버튼 - currentTime:', currentTime, 'currentIndex:', currentIndex);

    // 이전 가사로 이동
    if (currentIndex > 0) {
      const prevLyric = lyrics[currentIndex - 1];
      if (prevLyric) {
        videoElement.currentTime = prevLyric.time;
        console.log('[BottomContainer] 이전 가사로 이동:', prevLyric.time);
      }
    } else {
      // 첫 가사거나 그 이전이면 0초로
      videoElement.currentTime = 0;
      console.log('[BottomContainer] 0초로 이동');
    }
  };

  /**
   * 다음 가사 타임스탬프로 이동
   */
  const handleNextLyric = () => {
    console.log('[BottomContainer] handleNextLyric 호출');
    const videoElement = getYouTubePlayer();
    if (!videoElement || lyrics.length === 0) {
      console.log('[BottomContainer] videoElement 또는 lyrics 없음');
      return;
    }

    const currentTime = videoElement.currentTime;
    const currentIndex = getCurrentLyricIndex(currentTime);
    console.log('[BottomContainer] 다음 버튼 - currentTime:', currentTime, 'currentIndex:', currentIndex);

    // 다음 가사로 이동
    if (currentIndex >= 0 && currentIndex < lyrics.length - 1) {
      const nextLyric = lyrics[currentIndex + 1];
      if (nextLyric) {
        videoElement.currentTime = nextLyric.time;
        console.log('[BottomContainer] 다음 가사로 이동:', nextLyric.time);
      }
    } else if (currentIndex === -1 && lyrics.length > 0) {
      // 첫 가사 시작 전이면 첫 가사로
      const firstLyric = lyrics[0];
      if (firstLyric) {
        videoElement.currentTime = firstLyric.time;
        console.log('[BottomContainer] 첫 가사로 이동:', firstLyric.time);
      }
    }
  };

  /**
   * 간주 점프
   * - 다음 가사까지 간주가 길면(7초 이상) 다음 가사 3초 전으로 이동
   * - 간주가 짧으면 다음 가사 정확한 시간으로 이동
   */
  const handleSkipIntro = () => {
    console.log('[BottomContainer] handleSkipIntro 호출');
    const videoElement = getYouTubePlayer();
    if (!videoElement || lyrics.length === 0) {
      console.log('[BottomContainer] videoElement 또는 lyrics 없음');
      return;
    }

    const currentTime = videoElement.currentTime;
    const currentIndex = getCurrentLyricIndex(currentTime);
    console.log('[BottomContainer] 간주 점프 - currentTime:', currentTime, 'currentIndex:', currentIndex);

    // 다음 가사 찾기
    const nextIndex = currentIndex + 1;
    if (nextIndex >= lyrics.length) {
      console.log('[BottomContainer] 다음 가사 없음 (마지막 가사)');
      return;
    }

    const nextLyric = lyrics[nextIndex];
    if (!nextLyric) {
      console.log('[BottomContainer] 다음 가사 데이터 없음');
      return;
    }

    // 간주 길이 체크
    const gap = nextLyric.time - currentTime;
    const MIN_GAP = 7; // 최소 간주 길이 (초)

    if (gap >= MIN_GAP) {
      // 간주가 길면 다음 가사 3초 전으로 이동
      const targetTime = Math.max(0, nextLyric.time - 3);
      videoElement.currentTime = targetTime;
      console.log(
        `[BottomContainer] 간주 점프 (긴 간주): ${currentTime.toFixed(2)}초 → ${targetTime.toFixed(2)}초 (간주 ${gap.toFixed(1)}초 건너뜀)`,
      );
    } else {
      // 간주가 짧으면 다음 가사 정확한 시간으로 이동
      videoElement.currentTime = nextLyric.time;
      console.log(
        `[BottomContainer] 간주 점프 (짧은 간주): ${currentTime.toFixed(2)}초 → ${nextLyric.time}초 (간주 ${gap.toFixed(1)}초)`,
      );
    }
  };

  /**
   * 싱크셋 버튼 - 오프셋 조정 모달 열기
   */
  const handleSyncSettings = () => {
    setShowOffsetModal(true);
  };

  /**
   * 오프셋 조정 모달 닫기
   */
  const handleCloseOffsetModal = () => {
    setShowOffsetModal(false);
  };

  /**
   * 슬라이더 값 변경 (드래그 중)
   */
  const handleOffsetSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOffset = Number(e.target.value);
    setOffset(newOffset);
  };

  /**
   * 오프셋 리셋 (0초로)
   */
  const handleOffsetReset = () => {
    setOffset(0);
  };

  /**
   * 오프셋 적용 버튼
   */
  const handleApplyOffset = () => {
    // 항상 원본(lyrics) 기준으로 적용
    const appliedLyrics = applyOffsetToLyrics(lyrics, offset, 0);
    setOffsetLyrics(appliedLyrics);

    // 부모에게 적용된 값 알림
    onOffsetChange?.(offset, appliedLyrics);

    // content script에 메시지 전송하여 즉시 반영
    chrome.runtime.sendMessage(
      {
        type: 'APPLY_OFFSET_LYRICS',
        payload: { offset, lyrics: appliedLyrics },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[BottomContainer] APPLY_OFFSET_LYRICS 전송 오류:', chrome.runtime.lastError.message);
        } else {
          console.log('[BottomContainer] APPLY_OFFSET_LYRICS 전송 완료');
        }
      },
    );

    // 모달 닫기
    setShowOffsetModal(false);
  };

  /**
   * 가사 방식 모드 순환 토글
   * sync(기본) → single(싱글) → full(전체) → sync
   */
  const handleLyricsDisplayModeToggle = () => {
    setLyricsDisplayMode((prev: LyricsDisplayMode): LyricsDisplayMode => {
      const modes: LyricsDisplayMode[] = ['sync', 'single', 'full'];
      const currentIndex = modes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex] as LyricsDisplayMode;

      // chrome.storage에 저장
      chrome.storage.sync.set({ lyricsMode: nextMode });
      console.log(`[BottomContainer] 가사 방식 모드: ${prev} → ${nextMode}`);

      return nextMode;
    });
  };

  /**
   * 현재 가사 On/Off 토글
   */
  const handleCurrentLyricsToggle = () => {
    setShowCurrentLyrics((prev) => {
      const newState = !prev;
      chrome.storage.sync.set({ realtimeLyrics: newState });
      console.log(`[BottomContainer] 현재 가사: ${newState ? 'On' : 'Off'}`);
      return newState;
    });
  };

  /**
   * 발음 가사 On/Off 토글
   */
  const handlePronunciationToggle = () => {
    setShowPronunciation((prev) => {
      const newState = !prev;
      chrome.storage.sync.set({ announceLyrics: newState });
      console.log(`[BottomContainer] 발음 가사: ${newState ? 'On' : 'Off'}`);
      return newState;
    });
  };

  /**
   * 가사 방식 모드에 따른 아이콘 반환
   */
  const getLyricsDisplayModeIcon = (): React.ReactElement => {
    switch (lyricsDisplayMode) {
      case 'sync':
        return <MdOutlineDragHandle size={ICON_SIZE} color={ICON_COLOR} />;
      case 'single':
        return <MdRemove size={ICON_SIZE} color={ICON_COLOR} />;
      case 'full':
        return <MdReorder size={ICON_SIZE} color={ICON_COLOR} />;
      default:
        return <MdOutlineDragHandle size={ICON_SIZE} color={ICON_COLOR} />;
    }
  };

  /**
   * 현재 가사 On/Off 아이콘 색상
   */
  const getCurrentLyricsIconColor = (): string => {
    return showCurrentLyrics ? ICON_COLOR : '#666666';
  };

  /**
   * 발음 가사 On/Off 아이콘 색상
   */
  const getPronunciationIconColor = (): string => {
    return showPronunciation ? ICON_COLOR : '#666666';
  };

  /**
   * 가사 방식 모드 텍스트 반환
   */
  const getLyricsDisplayModeText = (): string => {
    switch (lyricsDisplayMode) {
      case 'sync':
        return '기본';
      case 'single':
        return '싱글';
      case 'full':
        return '전체';
      default:
        return '기본';
    }
  };

  return (
    <>
      <div className={styles.bottomContainer}>
        <div className={styles.bottomContent}>
          {/* 왼쪽 그룹: 이전/다음 버튼 */}
          <div className={styles.buttonGroupLeft}>
            <button className={styles.bottomButton} onClick={handlePrevLyric} aria-label={t('extKaraokePrevLyric')}>
              <MdNavigateBefore size={ICON_SIZE} color={ICON_COLOR} />
              <span className={styles.buttonText}>{t('extKaraokePrevLyric')}</span>
            </button>
            <button className={styles.bottomButton} onClick={handleNextLyric} aria-label={t('extKaraokeNextLyric')}>
              <MdNavigateNext size={ICON_SIZE} color={ICON_COLOR} />
              <span className={styles.buttonText}>{t('extKaraokeNextLyric')}</span>
            </button>
          </div>

          {/* 중앙 그룹: 기존 기능 버튼들 */}
          <div className={styles.buttonGroupCenter}>
            <button className={styles.bottomButton} onClick={handleLoopToggle} aria-label={t('extKaraokeLoopSection')}>
              <div style={{ position: 'relative' }}>
                <div className={loopMode === 'infinite' ? styles.infiniteLoopIcon : ''}>
                  <IoRepeat size={ICON_SIZE} color={getLoopIconColor()} />
                </div>
                {getLoopBadgeText() && <span className={styles.loopBadge}>{getLoopBadgeText()}</span>}
              </div>
              <span className={styles.buttonText}>{t('extKaraokeLoopSection')}</span>
            </button>
            <button className={styles.bottomButton} onClick={handleSkipIntro} aria-label={t('extKaraokeSkipIntro')}>
              <MdSkipNext size={ICON_SIZE} color={ICON_COLOR} />
              <span className={styles.buttonText}>{t('extKaraokeSkipIntro')}</span>
            </button>
            <button className={styles.bottomButton} onClick={handleAutoSkipToggle} aria-label={t('extKaraokeAutoSkip')}>
              <div className={autoSkipEnabled ? styles.autoSkipIconActive : styles.autoSkipIcon}>
                <MdAutoMode size={ICON_SIZE} color={getAutoSkipIconColor()} />
              </div>
              <span className={styles.buttonText}>{t('extKaraokeAutoSkip')}</span>
            </button>
            <button className={styles.bottomButton} onClick={handleRestartSong} aria-label={t('extKaraokeRestartSong')}>
              <MdReplay size={ICON_SIZE} color={ICON_COLOR} />
              <span className={styles.buttonText}>{t('extKaraokeRestartSong')}</span>
            </button>
            <button
              className={styles.bottomButton}
              onClick={handleSyncSettings}
              aria-label={t('extKaraokeSyncSettings')}
            >
              <MdTune size={ICON_SIZE} color={ICON_COLOR} />
              <span className={styles.buttonText}>{t('extKaraokeSyncSettings')}</span>
            </button>
          </div>

          {/* 오른쪽 그룹: 가사 디스플레이 설정 */}
          <div className={styles.buttonGroupRight}>
            <button
              className={styles.bottomButton}
              onClick={handleLyricsDisplayModeToggle}
              aria-label="가사 방식"
              title={`가사 방식: ${getLyricsDisplayModeText()}`}
            >
              {getLyricsDisplayModeIcon()}
              <span className={styles.buttonText}>{getLyricsDisplayModeText()}</span>
            </button>
            <button
              className={styles.bottomButton}
              onClick={handleCurrentLyricsToggle}
              aria-label="현재 가사"
              title={`현재 가사: ${showCurrentLyrics ? 'On' : 'Off'}`}
            >
              <MdSubtitles size={ICON_SIZE} color={getCurrentLyricsIconColor()} />
              <span className={styles.buttonText} style={{ color: getCurrentLyricsIconColor() }}>
                현재 가사
              </span>
            </button>
            <button
              className={styles.bottomButton}
              onClick={handlePronunciationToggle}
              aria-label="발음 표시"
              title={`발음 표시: ${showPronunciation ? 'On' : 'Off'}`}
            >
              <MdRecordVoiceOver size={ICON_SIZE} color={getPronunciationIconColor()} />
              <span className={styles.buttonText} style={{ color: getPronunciationIconColor() }}>
                발음 표시
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 오프셋 조정 모달 */}
      {showOffsetModal && (
        <div className={styles.offsetModalOverlay}>
          <div className={styles.offsetModalContainer}>
            <div className={styles.offsetModalHeader}>
              <h2 className={styles.offsetModalTitle}>가사 오프셋 설정</h2>
              <button className={styles.closeButton} onClick={handleCloseOffsetModal} aria-label="닫기">
                <MdClose size={24} color="#ffffff" />
              </button>
            </div>

            <div className={styles.offsetModalContent}>
              <div className={styles.offsetControlSection}>
                <span className={styles.offsetLabel}>가사 싱크 조절</span>

                {/* 슬라이더 */}
                <input
                  type="range"
                  min={-15}
                  max={15}
                  step={1}
                  value={offset}
                  onChange={handleOffsetSliderChange}
                  ref={sliderRef}
                  className={styles.offsetSlider}
                  aria-label="가사 싱크 조절 슬라이더"
                />

                {/* 슬라이더 눈금 및 값 표시 */}
                <div className={styles.sliderTicks}>
                  <span className={styles.tickLabel} style={{ left: 0 }}>
                    -15
                  </span>
                  <span className={styles.tickLabel} style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    0
                  </span>
                  <span className={styles.tickLabel} style={{ right: 0 }}>
                    15
                  </span>

                  {/* 현재값 표시 버튼 (썸 위치에 고정) */}
                  <button
                    type="button"
                    onClick={handleOffsetReset}
                    className={styles.offsetValueButton}
                    style={{ left: thumbPos }}
                    aria-label="가사 싱크 0초로 초기화"
                  >
                    {offset > 0 ? `+${offset}` : offset}
                  </button>
                </div>

                {/* 적용 버튼 */}
                <button className={styles.applyButton} onClick={handleApplyOffset}>
                  적용
                </button>
              </div>

              {/* 가사 미리보기 */}
              {videoRef.current && (
                <div className={styles.offsetPreviewSection}>
                  <SingleLineLyrics
                    lyrics={offsetLyrics}
                    offset={0}
                    currentTime={videoRef.current.currentTime}
                    fontColor="#fff"
                    showRealtimeLyrics={showCurrentLyrics}
                    showPronunciationLyrics={showPronunciation}
                  />
                </div>
              )}

              {/* 설명 */}
              <p className={styles.offsetDescription}>가사 자막의 타이밍이 맞지 않을 때, 여기서 미세 조절하세요.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
