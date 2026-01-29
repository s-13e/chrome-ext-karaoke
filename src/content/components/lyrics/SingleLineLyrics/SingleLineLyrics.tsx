import React, { useMemo, useState, useEffect, memo } from 'react';
import { Line } from '@lib/types/lyrics';
import { useCurrentTime } from '@hooks/useCurrentTime';
import { usePronunciations } from '../common/usePronunciation';
import { LyricLine } from '../common/LyricLine';
import { CountdownOverlay } from '../common/CountdownOverlay';
import { shiftFirstLyricEarlier } from '@lib/utils/lyrics/display/lyricsOffset';
import { SingleLineLyricsStyleConfig, GeneralLyricsSettings } from '@lib/types/lyricsStyles';
import { mergeSingleLineStyles } from '@lib/utils/lyrics/styles/lyricsStyleMerger';
import { DEFAULT_COUNTDOWN_COLORS, DEFAULT_GENERAL_SETTINGS } from '@constants/lyricsStyles';
import { DEFAULT_FONT_WEIGHT, DEFAULT_PRONUNCIATION_FONT_WEIGHT } from '@constants/fontWeights';
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
  styleConfig?: Partial<SingleLineLyricsStyleConfig>;
  // General 설정
  generalSettings?: Partial<GeneralLyricsSettings>;
}

/**
 * 싱글 라인 가사 컴포넌트 - 현재 가사만 표시
 * - currentTime을 props로 받으면 해당 시간 사용 (싱크셋 미리보기)
 * - currentTime이 없으면 useCurrentTime 훅 사용 (일반 재생)
 */
const SingleLineLyricsComponent: React.FC<SingleLineLyricsProps> = ({
  lyrics,
  offset = 0,
  fontColor = '#fff',
  pronunciationColor,
  showRealtimeLyrics = true,
  showPronunciationLyrics = true,
  currentTime: externalCurrentTime,
  styleConfig,
  generalSettings,
}) => {
  // 스타일 병합 (single은 기본/하이라이트 구분 없음)
  const mergedStyles = useMemo(() => {
    return mergeSingleLineStyles(styleConfig);
  }, [styleConfig]);

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

  // 가사 색상 (single은 항상 lyrics 스타일 사용, pronunciationAsMain일 때도 동일)
  const getTextColor = () => {
    return mergedStyles.lyrics.color || fontColor;
  };

  // 발음 색상
  const getPronunciationColor = () => {
    if (pronunciationAsMain) {
      // 발음이 메인을 대체: lyrics 스타일 색상 사용
      return mergedStyles.lyrics.color || fontColor;
    }
    return mergedStyles.pronunciation.color || pronunciationColor;
  };

  // 인라인 스타일 생성 (CSS 모듈로 처리할 수 없는 동적 스타일)
  const getInlineStyle = (isForPronunciation: boolean) => {
    let style;
    if (isForPronunciation && pronunciationAsMain) {
      // 발음이 메인을 대체하는 경우: 발음 텍스트에 lyrics 스타일 적용
      style = mergedStyles.lyrics;
    } else if (isForPronunciation) {
      // 일반 발음 스타일
      style = mergedStyles.pronunciation;
    } else {
      // 가사 텍스트 스타일
      style = mergedStyles.lyrics;
    }
    if (!style) return {};

    const inlineStyle: React.CSSProperties = {};

    if (style.fontFamily) inlineStyle.fontFamily = style.fontFamily;
    inlineStyle.fontWeight =
      style.fontWeight ?? (isForPronunciation ? DEFAULT_PRONUNCIATION_FONT_WEIGHT : DEFAULT_FONT_WEIGHT);
    if (style.textShadow) inlineStyle.textShadow = style.textShadow;
    // fontSize: 전체화면에서 자동 배율 적용 (일반 모드 대비 2배: 1.5vw → 3vw)
    if (style.fontSize) {
      const isFullscreen = !!document.fullscreenElement;
      const baseFontSize = typeof style.fontSize === 'number' ? style.fontSize : parseInt(String(style.fontSize), 10);
      inlineStyle.fontSize = isFullscreen && !isNaN(baseFontSize) ? Math.round(baseFontSize * 2) : style.fontSize;
    }
    if (style.opacity !== undefined) inlineStyle.opacity = style.opacity;
    if (style.transition) inlineStyle.transition = style.transition;
    if (style.transform) inlineStyle.transform = style.transform;
    if (style.background) inlineStyle.background = style.background;
    if (style.backgroundImage) inlineStyle.backgroundImage = style.backgroundImage;
    if (style.backgroundClip) inlineStyle.backgroundClip = style.backgroundClip;
    if (style.webkitBackgroundClip) inlineStyle.WebkitBackgroundClip = style.webkitBackgroundClip;
    if (style.webkitTextFillColor) inlineStyle.WebkitTextFillColor = style.webkitTextFillColor;
    if (style.WebkitBackgroundClip) inlineStyle.WebkitBackgroundClip = style.WebkitBackgroundClip;
    if (style.WebkitTextFillColor) inlineStyle.WebkitTextFillColor = style.WebkitTextFillColor;

    // pronunciationAsMain일 때는 CSS의 기본 opacity 덮어쓰기
    if (isForPronunciation && pronunciationAsMain && style.opacity === undefined) {
      inlineStyle.opacity = 1;
    }

    return inlineStyle;
  };

  // General 설정에서 카운트다운 및 위치 추출
  const countdownEnabled = generalSettings?.countdown?.enabled ?? DEFAULT_GENERAL_SETTINGS.countdown.enabled;
  const countdownColor = generalSettings?.countdown?.color ?? DEFAULT_GENERAL_SETTINGS.countdown.color;
  const countdownFontSize = generalSettings?.countdown?.fontSize ?? DEFAULT_GENERAL_SETTINGS.countdown.fontSize;
  const positionBottom = generalSettings?.position?.single?.bottom ?? DEFAULT_GENERAL_SETTINGS.position.single.bottom;

  return (
    <div className={styles.singleLineSubtitle} style={{ color: fontColor, bottom: `${positionBottom}px` }}>
      {/* 카운트다운 오버레이 (첫 가사 또는 아카펠라 녹음) */}
      {countdownEnabled && firstLyricTime !== null && !acapellaCountdownStart && (
        <CountdownOverlay
          startTime={firstLyricTime}
          currentTime={adjustedTime}
          fontColor={countdownColor}
          fontSize={countdownFontSize}
        />
      )}
      {countdownEnabled && acapellaCountdownStart !== null && (
        <CountdownOverlay
          startTime={acapellaCountdownStart}
          currentTime={currentTime}
          fontColor={DEFAULT_COUNTDOWN_COLORS.acapella}
          fontSize={countdownFontSize}
        />
      )}

      <LyricLine
        text={currentText}
        pron={currentPron}
        showText={showRealtimeLyrics}
        showPron={showPronunciationLyrics}
        fontColor={getTextColor()}
        pronunciationColor={getPronunciationColor()}
        textStyle={getInlineStyle(false)}
        pronStyle={getInlineStyle(true)}
        pronunciationAsMain={pronunciationAsMain}
      />
    </div>
  );
};

export const SingleLineLyrics = memo(SingleLineLyricsComponent);
