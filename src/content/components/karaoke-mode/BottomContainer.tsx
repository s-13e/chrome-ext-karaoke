// BottomContainer.tsx
// 가라오케 모드 하단 컨트롤 바
// 영상 바로 아래에 고정 배치, 사이드바와 자연스럽게 연결
// 재생/일시정지, 곡 처음으로, 녹음, 음량 조절

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MdReplay, MdPlayArrow, MdPause, MdMic, MdVolumeUp, MdVolumeOff } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Line } from '@lib/types/lyrics';

interface BottomContainerProps {
  lyrics: Line[];
  sidebarWidth: number;
}

/** YouTube 비디오 요소 가져오기 */
const getVideo = (): HTMLVideoElement | null => document.querySelector<HTMLVideoElement>('video.html5-main-video');

/**
 * 가라오케 모드 하단 컨트롤 바
 * - 영상 하단에 고정 (fixed), 사이드바 왼쪽까지
 * - 재생/일시정지, 곡 처음으로, 녹음, 음량 조절
 */
export const BottomContainer: React.FC<BottomContainerProps> = ({ sidebarWidth }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVolumeRef = useRef(100);

  // YouTube 비디오 재생 상태 동기화
  useEffect(() => {
    const video = getVideo();
    if (!video) return;

    setIsPlaying(!video.paused);
    setVolume(Math.round(video.volume * 100));
    setIsMuted(video.muted);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setVolume(Math.round(video.volume * 100));
      setIsMuted(video.muted);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    const video = getVideo();
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleRestart = useCallback(() => {
    const video = getVideo();
    if (video) {
      video.currentTime = 0;
    }
  }, []);

  const handleRecord = useCallback(() => {
    // TODO: 녹음 기능 구현
    console.log('[BottomContainer] 녹음 기능 (미구현)');
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    const video = getVideo();
    if (video) {
      video.volume = val / 100;
      if (val > 0 && video.muted) {
        video.muted = false;
      }
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    const video = getVideo();
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = prevVolumeRef.current / 100;
    } else {
      prevVolumeRef.current = volume;
      video.muted = true;
    }
  }, [isMuted, volume]);

  const handleVolumeEnter = useCallback(() => {
    if (volumeTimerRef.current) {
      clearTimeout(volumeTimerRef.current);
      volumeTimerRef.current = null;
    }
    setShowVolume(true);
  }, []);

  const handleVolumeLeave = useCallback(() => {
    volumeTimerRef.current = setTimeout(() => {
      setShowVolume(false);
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    };
  }, []);

  const volumePercent = isMuted ? 0 : volume;

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
  };

  return (
    <div
      className="ytk-bottom-container"
      style={{
        position: 'fixed',
        bottom: '30px',
        left: `calc((100vw - ${sidebarWidth}px) / 2)`,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 20px',
        borderRadius: '28px',
        background: 'rgba(18, 18, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 9999,
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {/* 곡 처음으로 */}
      <span
        role="button"
        tabIndex={0}
        style={{ ...btnBase, width: '40px', height: '40px', borderRadius: '50%' }}
        title={t('extKaraokeRestartSong')}
        onClick={handleRestart}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleRestart();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#00d4aa';
          e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <MdReplay size={22} />
      </span>

      {/* 재생/일시정지 */}
      <span
        role="button"
        tabIndex={0}
        style={{
          ...btnBase,
          width: '48px',
          height: '48px',
          background: '#00d4aa',
          color: '#000',
          borderRadius: '50%',
        }}
        title={isPlaying ? t('extPause') : t('extPlay')}
        onClick={handlePlayPause}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handlePlayPause();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#00eebb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#00d4aa';
        }}
      >
        {isPlaying ? <MdPause size={28} /> : <MdPlayArrow size={28} />}
      </span>

      {/* 녹음 */}
      <span
        role="button"
        tabIndex={0}
        style={{ ...btnBase, width: '40px', height: '40px', borderRadius: '50%' }}
        title={t('extRecord')}
        onClick={handleRecord}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleRecord();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ff6b6b';
          e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <MdMic size={22} />
      </span>

      {/* 구분선 */}
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)', margin: '0 8px' }} />

      {/* 음량 */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        onMouseEnter={handleVolumeEnter}
        onMouseLeave={handleVolumeLeave}
      >
        <span
          role="button"
          tabIndex={0}
          style={{ ...btnBase, width: '40px', height: '40px', borderRadius: '50%' }}
          title={isMuted ? t('extUnmute') : t('extMute')}
          onClick={handleMuteToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleMuteToggle();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#00d4aa';
            e.currentTarget.style.background = 'rgba(0, 212, 170, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isMuted || volume === 0 ? <MdVolumeOff size={22} /> : <MdVolumeUp size={22} />}
        </span>

        {/* 음량 슬라이더 (호버 시 확장) */}
        <div
          style={{
            overflow: 'hidden',
            width: showVolume ? '100px' : '0px',
            transition: 'width 0.2s ease',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            type="range"
            min={0}
            max={100}
            value={volumePercent}
            onChange={handleVolumeChange}
            style={{
              width: '100px',
              height: '4px',
              borderRadius: '2px',
              appearance: 'none',
              cursor: 'pointer',
              background: `linear-gradient(to right, #00d4aa ${volumePercent}%, rgba(255,255,255,0.12) ${volumePercent}%)`,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};
