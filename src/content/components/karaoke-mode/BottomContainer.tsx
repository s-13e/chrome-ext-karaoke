// BottomContainer.tsx
// 가라오케 모드 하단 컨테이너
// 구간 반복, 싱크셋 등 음악 영상 관련 기능 제공
import React from 'react';
import styles from './styles.module.css';
import { IoRepeat } from 'react-icons/io5';
import { MdReplay, MdTune, MdSkipNext, MdAutoMode, MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Line } from '@lib/types/lyrics';

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
}

/**
 * 가라오케 모드 하단 컨테이너
 * - 동영상 플레이어 하단에 위치
 * - 구간반복, 간주점프, 노래처음으로, 싱크셋 등 기능 제공
 */
export const BottomContainer: React.FC<BottomContainerProps> = ({ lyrics }) => {
  const { t } = useTranslation();
  const [loopMode, setLoopMode] = React.useState<LoopMode>('off');
  const [autoSkipEnabled, setAutoSkipEnabled] = React.useState<boolean>(false);
  const [loopState, setLoopState] = React.useState<LoopState>({
    mode: 'off',
    sectionStartIndex: -1,
    sectionEndIndex: -1,
    repeatCount: 0,
  });

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

  // chrome.storage에서 자동 점프 상태 불러오기
  React.useEffect(() => {
    chrome.storage.local.get(['karaokeAutoSkipEnabled'], (result) => {
      if (result.karaokeAutoSkipEnabled !== undefined) {
        setAutoSkipEnabled(result.karaokeAutoSkipEnabled);
      }
    });
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

  const handleSyncSettings = () => {
    // TODO: 싱크셋 구현
  };

  return (
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
          <button className={styles.bottomButton} onClick={handleSyncSettings} aria-label={t('extKaraokeSyncSettings')}>
            <MdTune size={ICON_SIZE} color={ICON_COLOR} />
            <span className={styles.buttonText}>{t('extKaraokeSyncSettings')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
