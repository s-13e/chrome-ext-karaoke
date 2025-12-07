import React, { useMemo, useState, useEffect } from 'react';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { usePronunciations } from '../common/usePronunciation';
import { LyricLine } from '../common/LyricLine';
import { CountdownOverlay } from '../common/CountdownOverlay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { GlobalLyricsStyleConfig, SingleLineLyricsStyleConfig } from '@lib/types/lyricsStyles';
import { mergeSingleLineStyles } from '@lib/utils/lyrics/styles/lyricsStyleMerger';
import { DEFAULT_COUNTDOWN_COLORS } from '@constants/lyricsStyles';
import styles from './styles.module.css';

interface SingleLineLyricsProps {
  lyrics: Line[];
  offset?: number;
  fontColor?: string;
  className?: string;
  pronunciationColor?: string;
  showRealtimeLyrics?: boolean;
  showPronunciationLyrics?: boolean;
  currentTime?: number; // 외부에서 시간을 주입할 수 있도록 (싱크셋 미리보기용)
  // 스타일 커스터마이징
  globalStyleConfig?: Partial<GlobalLyricsStyleConfig>;
  styleConfig?: Partial<SingleLineLyricsStyleConfig>;
}

/**
 * 싱글 라인 가사 컴포넌트 - 현재 가사만 표시
 * - currentTime을 props로 받으면 해당 시간 사용 (싱크셋 미리보기)
 * - currentTime이 없으면 useCurrentTime 훅 사용 (일반 재생)
 */
export const SingleLineLyrics: React.FC<SingleLineLyricsProps> = ({
  lyrics,
  offset = 0,
  fontColor = '#fff',
  pronunciationColor,
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
  currentTime: externalCurrentTime,
  globalStyleConfig,
  styleConfig,
}) => {
  // 스타일 병합 (single은 기본/하이라이트 구분 없음)
  const mergedStyles = useMemo(() => {
    return mergeSingleLineStyles(globalStyleConfig, styleConfig);
  }, [globalStyleConfig, styleConfig]);

  // 발음이 메인 가사를 대체하는지 여부
  const pronunciationAsMain = !showRealtimeLyrics && showPronunciationLyrics;

  // 오프셋 보정 적용
  const shiftedLyrics = useMemo(() => shiftFirstLyricEarlier(lyrics, 3), [lyrics]);
  const internalCurrentTime = useCurrentTime();
  // 외부에서 currentTime을 주입하면 사용, 없으면 훅 사용
  const currentTime = externalCurrentTime !== undefined ? externalCurrentTime : internalCurrentTime;
  const adjustedTime = currentTime - offset;

  // 아카펠라 녹음 카운트다운 상태
  const [acapellaCountdownStart, setAcapellaCountdownStart] = useState<number | null>(null);

  // 아카펠라 녹음 카운트다운 이벤트 수신
  useEffect(() => {
    const handleCountdownStart = (event: Event) => {
      const customEvent = event as CustomEvent<{ startTime: number; currentTime: number }>;
      console.log('[SingleLineLyrics] 아카펠라 카운트다운 시작:', customEvent.detail);
      setAcapellaCountdownStart(customEvent.detail.startTime);
    };

    const handleCountdownEnd = () => {
      console.log('[SingleLineLyrics] 아카펠라 카운트다운 종료');
      setAcapellaCountdownStart(null);
    };

    window.addEventListener('acapella-countdown-start', handleCountdownStart);
    window.addEventListener('acapella-countdown-end', handleCountdownEnd);

    return () => {
      window.removeEventListener('acapella-countdown-start', handleCountdownStart);
      window.removeEventListener('acapella-countdown-end', handleCountdownEnd);
    };
  }, []);

  // 현재 가사 인덱스 찾기
  const currentIndex = useMemo(() => {
    return shiftedLyrics.findLastIndex((line) => adjustedTime >= line.time);
  }, [shiftedLyrics, adjustedTime]);

  const currentLine = currentIndex >= 0 ? shiftedLyrics[currentIndex] : null;
  const currentText = currentLine ? currentLine.text : '';

  // 발음 변환
  const lyricTexts = useMemo(() => shiftedLyrics.map((line) => line.text), [shiftedLyrics]);
  const pronList = usePronunciations(lyricTexts);
  const currentPron = currentIndex >= 0 ? pronList[currentIndex] : '';

  // 첫 가사 시작 시간 (카운트다운 표시용)
  const firstLyricTime = useMemo(() => {
    return lyrics.length > 0 && lyrics[0] ? lyrics[0].time : null;
  }, [lyrics]);

  // 가사/발음 색상 계산 (single은 항상 하이라이트 스타일)
  const getTextColor = () => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체
      return mergedStyles.pronunciationAsMain.color || fontColor;
    }
    // 일반 메인 가사
    return mergedStyles.lyrics.color || fontColor;
  };

  const getPronunciationColor = () => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체
      return mergedStyles.pronunciationAsMain.color || pronunciationColor;
    }
    // 일반 발음
    return mergedStyles.pronunciation.color || pronunciationColor;
  };

  return (
    <div className={styles.singleLineSubtitle} style={{ color: fontColor }}>
      {/* 카운트다운 오버레이 (첫 가사 또는 아카펠라 녹음) */}
      {firstLyricTime !== null && !acapellaCountdownStart && (
        <CountdownOverlay
          startTime={firstLyricTime}
          currentTime={adjustedTime}
          fontColor={DEFAULT_COUNTDOWN_COLORS.firstLyric}
        />
      )}
      {acapellaCountdownStart !== null && (
        <CountdownOverlay
          startTime={acapellaCountdownStart}
          currentTime={currentTime}
          fontColor={DEFAULT_COUNTDOWN_COLORS.acapella}
        />
      )}

      <LyricLine
        text={currentText}
        pron={currentPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={getTextColor()}
        pronunciationColor={getPronunciationColor()}
      />
    </div>
  );
};
