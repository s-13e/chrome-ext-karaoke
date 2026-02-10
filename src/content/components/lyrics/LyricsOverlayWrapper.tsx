// LyricsOverlayWrapper.tsx
// 가사 오버레이의 최상위 래퍼 컴포넌트.
// CurrentTimeProvider를 한 번만 마운트하고, 설정 토글 시 props만 변경하여
// React 트리 unmount/remount 없이 성능을 최적화한다.

import React, { memo } from 'react';
import { CurrentTimeProvider } from '@hooks/CurrentTimeContext';
import { DualHighlightLyrics } from './SyncLyrics/DualHighlightLyrics';
import { SingleLineLyrics } from './SingleLineLyrics/SingleLineLyrics';
import { FullLyrics } from './FullLyrics/FullLyrics';
import { Line } from '@lib/types/lyrics';
import {
  DualHighlightLyricsStyleConfig,
  FullLyricsStyleConfig,
  SingleLineLyricsStyleConfig,
  GeneralLyricsSettings,
} from '@lib/types/lyricsStyles';

export interface LyricsOverlayWrapperProps {
  lyrics: Line[];
  offset: number;
  lyricsMode: 'sync' | 'single' | 'full';
  fontColor: string;
  pronunciationColor: string;
  showRealtimeLyrics: boolean;
  showPronunciationLyrics: boolean;
  styleConfigDual: Partial<DualHighlightLyricsStyleConfig>;
  styleConfigFull: Partial<FullLyricsStyleConfig>;
  styleConfigSingle: Partial<SingleLineLyricsStyleConfig>;
  generalSettings: Partial<GeneralLyricsSettings>;
}

const LyricsOverlayWrapperComponent: React.FC<LyricsOverlayWrapperProps> = ({
  lyrics,
  offset,
  lyricsMode,
  fontColor,
  pronunciationColor,
  showRealtimeLyrics,
  showPronunciationLyrics,
  styleConfigDual,
  styleConfigFull,
  styleConfigSingle,
  generalSettings,
}) => {
  return (
    <CurrentTimeProvider>
      {lyricsMode === 'full' && (
        <FullLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={fontColor}
          pronunciationColor={pronunciationColor}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
          styleConfig={styleConfigFull}
          generalSettings={generalSettings}
        />
      )}
      {lyricsMode === 'sync' && (
        <DualHighlightLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={fontColor}
          pronunciationColor={pronunciationColor}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
          styleConfig={styleConfigDual}
          generalSettings={generalSettings}
        />
      )}
      {lyricsMode === 'single' && (
        <SingleLineLyrics
          lyrics={lyrics}
          offset={offset}
          fontColor={fontColor}
          pronunciationColor={pronunciationColor}
          showRealtimeLyrics={showRealtimeLyrics}
          showPronunciationLyrics={showPronunciationLyrics}
          styleConfig={styleConfigSingle}
          generalSettings={generalSettings}
        />
      )}
    </CurrentTimeProvider>
  );
};

export const LyricsOverlayWrapper = memo(LyricsOverlayWrapperComponent);
