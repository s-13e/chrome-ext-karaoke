// BottomContainer.tsx
// 가라오케 모드 하단 플로팅 필 컨트롤러
// 녹음 중에는 하단바가 녹음 전용 UI로 변신
// 볼륨은 세로 슬라이더 팝업

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  MdReplay,
  MdPlayArrow,
  MdPause,
  MdMic,
  MdStop,
  MdVolumeUp,
  MdVolumeOff,
  MdVideocam,
  MdClose,
  MdSave,
} from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Line } from '@lib/types/lyrics';
import { STORAGE_KEYS } from '@constants/storageKeys';
import {
  getRecordingState,
  subscribeRecording,
  checkMicrophonePermission,
  selectMicrophone,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  saveRecording,
  discardRecording,
  type RecordingState,
} from './sideBar/recordingManager';

/** 녹음 미니 인디케이터용 CSS 애니메이션 주입 */
const INDICATOR_STYLE_ID = 'ytk-indicator-animations';
const injectIndicatorStyles = () => {
  if (document.getElementById(INDICATOR_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = INDICATOR_STYLE_ID;
  style.textContent = `
    @keyframes ytk-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    @keyframes ytk-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
};

interface BottomContainerProps {
  lyrics: Line[];
  sidebarWidth: number;
}

const getVideo = (): HTMLVideoElement | null => document.querySelector<HTMLVideoElement>('video.html5-main-video');

type RecPopupPhase = 'closed' | 'legal' | 'ready' | 'countdown' | 'preview';

/** auto-hide 지연 시간 (ms) */
const AUTO_HIDE_DELAY = 3000;
/** 하단 hover 감지 영역 높이 (px) */
const HOVER_ZONE_HEIGHT = 80;

export const BottomContainer: React.FC<BottomContainerProps> = ({ sidebarWidth }) => {
  const { t } = useTranslation();

  // auto-hide 상태
  const [isBarVisible, setIsBarVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setIsBarVisible(false), AUTO_HIDE_DELAY);
  }, []);

  const showBar = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setIsBarVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  // 마운트 시 CSS 애니메이션 주입 + 초기 auto-hide
  useEffect(() => {
    injectIndicatorStyles();
    const timer = setTimeout(() => setIsBarVisible(false), AUTO_HIDE_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // 하단 영역 마우스 감지 (viewport 하단 HOVER_ZONE_HEIGHT px)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isInBottomZone = e.clientY >= window.innerHeight - HOVER_ZONE_HEIGHT;
      if (isInBottomZone) {
        showBar();
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [showBar]);

  // 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevVolumeRef = useRef(100);

  // 녹음 상태
  const [recState, setRecState] = useState<RecordingState>('idle');
  const [recTime, setRecTime] = useState(0);
  const [recLevel, setRecLevel] = useState(0);
  const [recPopup, setRecPopup] = useState<RecPopupPhase>('closed');
  const [countdown, setCountdown] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // 마이크
  const [micDevices, setMicDevices] = useState<Array<{ deviceId: string; label: string }>>([]);
  const [selectedMic, setSelectedMic] = useState('');

  // 미리듣기
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);

  // 저장
  const [saved, setSaved] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);

  // 녹음 매니저 구독
  useEffect(() => {
    return subscribeRecording(() => {
      const s = getRecordingState();
      setRecState(s.state);
      setRecTime(s.recordingTime);
      setRecLevel(s.audioLevel);
      setRecordedUrl(s.recordedAudioUrl);
      if (s.state === 'recorded' && s.recordedAudioUrl) {
        setRecPopup('preview');
        setSaved(false);
      }
    });
  }, []);

  // YouTube 상태 동기화
  useEffect(() => {
    const video = getVideo();
    if (!video) return;
    setIsPlaying(!video.paused);
    setVolume(Math.round(video.volume * 100));
    setIsMuted(video.muted);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVol = () => {
      setVolume(Math.round(video.volume * 100));
      setIsMuted(video.muted);
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('volumechange', onVol);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('volumechange', onVol);
    };
  }, []);

  // 팝업 외부 클릭
  useEffect(() => {
    if (recPopup === 'closed' || recPopup === 'countdown') return;
    const handle = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setRecPopup('closed');
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handle), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handle);
    };
  }, [recPopup]);

  // 미리듣기 오디오
  useEffect(() => {
    if (recPopup !== 'preview' || !recordedUrl) return;
    const audio = new Audio(recordedUrl);
    audioRef.current = audio;
    audio.addEventListener('timeupdate', () => setPreviewTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setPreviewDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setPreviewPlaying(false);
      setPreviewTime(0);
    });
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [recPopup, recordedUrl]);

  useEffect(() => {
    return () => {
      if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // ===== 핸들러 =====

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
    if (video) video.currentTime = 0;
  }, []);

  const handleMicClick = useCallback(async () => {
    if (recState === 'recording') {
      stopRecording();
      return;
    }
    if (recPopup !== 'closed') {
      setRecPopup('closed');
      return;
    }

    // 법적 고지 동의 확인 (DEV 모드에서는 항상 표시)
    const isDev = process.env.DEV_MODE === 'true';
    const storageResult = isDev
      ? false
      : await new Promise<boolean>((resolve) => {
          chrome.storage.sync.get(STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED, (res) => {
            resolve(!!res[STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED]);
          });
        });

    if (!storageResult) {
      setRecPopup('legal');
      return;
    }

    // 마이크 권한 + 기기 목록
    const result = await checkMicrophonePermission();
    if (!result.granted) {
      alert(t('extRecordingPermissionDenied'));
      return;
    }
    setMicDevices(result.devices);
    if (result.devices.length > 0 && result.devices[0]) {
      setSelectedMic(result.devices[0].deviceId);
      selectMicrophone(result.devices[0].deviceId);
    }
    setRecPopup('ready');
  }, [recState, recPopup, t]);

  /** 법적 고지 동의 */
  const handleLegalAgree = useCallback(async () => {
    await chrome.storage.sync.set({ [STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED]: true });
    // 동의 후 마이크 권한 확인으로 진행
    const result = await checkMicrophonePermission();
    if (!result.granted) {
      alert(t('extRecordingPermissionDenied'));
      setRecPopup('closed');
      return;
    }
    setMicDevices(result.devices);
    if (result.devices.length > 0 && result.devices[0]) {
      setSelectedMic(result.devices[0].deviceId);
      selectMicrophone(result.devices[0].deviceId);
    }
    setRecPopup('ready');
  }, [t]);

  const handleRecordWithVideo = useCallback(() => {
    const video = getVideo();
    if (video) {
      video.currentTime = 0;
      video.pause();
    }
    setRecPopup('countdown');
    setCountdown(3);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        const v = getVideo();
        if (v) v.play();
        startRecording();
        setRecPopup('closed');
      }
    }, 1000);
  }, []);

  const handleRecordNow = useCallback(async () => {
    await startRecording();
    setRecPopup('closed');
  }, []);

  const handleStopRec = useCallback(() => {
    stopRecording();
  }, []);

  const handlePreviewToggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
    } else {
      audio.play();
      setPreviewPlaying(true);
    }
  }, [previewPlaying]);

  /** 녹음 중 재생/멈춤 — 영상 + 녹음 동시 제어 */
  const handlePlayPauseWhileRecording = useCallback(() => {
    const video = getVideo();
    if (recState === 'recording') {
      pauseRecording();
      if (video) video.pause();
    } else if (recState === 'paused') {
      resumeRecording();
      if (video) video.play();
    }
  }, [recState]);

  const handleSave = useCallback(async () => {
    const success = await saveRecording();
    if (success) setSaved(true);
  }, []);

  const handleRetry = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setPreviewPlaying(false);
    discardRecording();
    setRecPopup('ready');
    setSaved(false);
  }, []);

  const handleClosePopup = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    if (recState === 'recorded') discardRecording();
    setRecPopup('closed');
    setSaved(false);
  }, [recState]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    const video = getVideo();
    if (video) {
      video.volume = val / 100;
      if (val > 0 && video.muted) video.muted = false;
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
    if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
    setShowVolume(true);
  }, []);

  const handleVolumeLeave = useCallback(() => {
    volumeTimerRef.current = setTimeout(() => setShowVolume(false), 800);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const volPct = isMuted ? 0 : volume;
  const isRecordingMode = recState === 'recording' || recState === 'paused';

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

  const pillBase: React.CSSProperties = {
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
    pointerEvents: isBarVisible ? 'auto' : 'none',
    userSelect: 'none',
    opacity: isBarVisible ? 1 : 0,
    transition: 'opacity 0.3s ease',
  };

  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: '12px',
    padding: '16px',
    borderRadius: '16px',
    background: 'rgba(18, 18, 30, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
    minWidth: '260px',
    zIndex: 10000,
    pointerEvents: 'auto',
  };

  /** pill 공통 마우스 이벤트 핸들러 — pill 위에서는 auto-hide 일시 중지 */
  const pillMouseHandlers = {
    onMouseEnter: () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setIsBarVisible(true);
    },
    onMouseLeave: scheduleHide,
  };

  // ===== 녹음 중/일시정지 하단바 =====
  if (isRecordingMode) {
    const levelPct = Math.min(100, Math.round(recLevel * 100));
    const isPaused = recState === 'paused';
    return (
      <>
        {/* 녹음 미니 인디케이터 — 컨트롤 바가 숨겨져 있을 때 표시 */}
        {!isBarVisible && (
          <div
            role="button"
            tabIndex={0}
            onClick={showBar}
            onKeyDown={(e) => {
              if (e.key === 'Enter') showBar();
            }}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: `${sidebarWidth + 20}px`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '16px',
              background: 'rgba(18, 18, 30, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 68, 68, 0.25)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 9999,
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'ytk-fade-in 0.3s ease',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isPaused ? 'rgba(255,68,68,0.4)' : '#ff4444',
                flexShrink: 0,
                animation: isPaused ? 'none' : 'ytk-pulse 1.5s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: isPaused ? 'rgba(255,68,68,0.6)' : '#ff4444',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fmt(recTime)}
            </span>
          </div>
        )}

        <div
          className="ytk-bottom-container"
          style={{ ...pillBase, border: '1px solid rgba(255, 68, 68, 0.25)' }}
          {...pillMouseHandlers}
        >
          {/* 영상 컨트롤: 처음으로 + 재생/멈춤 */}
          <span
            role="button"
            tabIndex={0}
            style={{ ...btnBase, width: '36px', height: '36px', borderRadius: '50%' }}
            title={t('extKaraokeRestartSong')}
            onClick={handleRestart}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRestart();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00d4aa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
          >
            <MdReplay size={18} />
          </span>
          <span
            role="button"
            tabIndex={0}
            style={{
              ...btnBase,
              width: '40px',
              height: '40px',
              background: '#00d4aa',
              color: '#000',
              borderRadius: '50%',
            }}
            title={isPaused ? t('extPlay') : t('extPause')}
            onClick={handlePlayPauseWhileRecording}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePlayPauseWhileRecording();
            }}
          >
            {isPaused ? <MdPlayArrow size={22} /> : <MdPause size={22} />}
          </span>

          {/* 구분선 */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* 녹음 상태: 빨간점 + 타이머 + 레벨바 */}
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isPaused ? 'rgba(255,68,68,0.4)' : '#ff4444',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: isPaused ? 'rgba(255,68,68,0.6)' : '#ff4444',
              fontVariantNumeric: 'tabular-nums',
              minWidth: '38px',
            }}
          >
            {fmt(recTime)}
          </span>
          <div
            style={{
              width: '60px',
              height: '4px',
              borderRadius: '2px',
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: `${levelPct}%`,
                height: '100%',
                background: levelPct > 80 ? '#ff4444' : '#00d4aa',
                transition: 'width 0.05s',
              }}
            />
          </div>

          {/* 구분선 */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* 녹음 컨트롤: 완료 + 다시녹음 */}
          <span
            role="button"
            tabIndex={0}
            onClick={handleStopRec}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStopRec();
            }}
            style={{
              ...btnBase,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              color: '#ff4444',
            }}
            title={t('extRecordingFinish')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MdStop size={20} />
          </span>

          {/* 구분선 */}
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* 볼륨 — 세로 팝업 */}
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={handleVolumeEnter}
            onMouseLeave={handleVolumeLeave}
          >
            <span
              role="button"
              tabIndex={0}
              style={{ ...btnBase, width: '36px', height: '36px', borderRadius: '50%' }}
              title={isMuted ? t('extUnmute') : t('extMute')}
              onClick={handleMuteToggle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleMuteToggle();
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00d4aa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              {isMuted || volume === 0 ? <MdVolumeOff size={18} /> : <MdVolumeUp size={18} />}
            </span>
            {showVolume && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '8px',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  background: 'rgba(18, 18, 30, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.4)',
                    fontFamily: 'monospace',
                    width: '20px',
                    textAlign: 'center',
                  }}
                >
                  {volPct}
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volPct}
                  onChange={handleVolumeChange}
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                    width: '4px',
                    height: '80px',
                    appearance: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to top, #00d4aa ${volPct}%, rgba(255,255,255,0.12) ${volPct}%)`,
                    outline: 'none',
                    borderRadius: '2px',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ===== 기본 하단바 =====
  return (
    <div className="ytk-bottom-container" style={pillBase} {...pillMouseHandlers}>
      {/* ===== 팝업 (ready / countdown / preview) ===== */}
      {recPopup !== 'closed' && (
        <div ref={popupRef} style={popupStyle}>
          {recPopup !== 'countdown' && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClosePopup}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleClosePopup();
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              <MdClose size={16} />
            </span>
          )}

          {/* LEGAL: 법적 고지 동의 */}
          {recPopup === 'legal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                {t('extAcapellaLegalNoticeTitle')}
              </span>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                {t('extAcapellaLegalNoticeContent', {
                  notAllowed: t('extAcapellaLegalNotAllowed'),
                  allowed: t('extAcapellaLegalAllowed'),
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setRecPopup('closed')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setRecPopup('closed');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {t('extCancel')}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleLegalAgree}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLegalAgree();
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(0, 212, 170, 0.15)',
                    border: '1px solid rgba(0, 212, 170, 0.3)',
                    color: '#00d4aa',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {t('extAgree')}
                </span>
              </div>
            </div>
          )}

          {/* READY */}
          {recPopup === 'ready' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{t('extRecordingTitle')}</span>
              {micDevices.length > 1 && (
                <select
                  value={selectedMic}
                  onChange={(e) => {
                    setSelectedMic(e.target.value);
                    selectMicrophone(e.target.value);
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                >
                  {micDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId} style={{ background: '#1a1a2e' }}>
                      {d.label}
                    </option>
                  ))}
                </select>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleRecordWithVideo}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRecordWithVideo();
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(0, 212, 170, 0.12)',
                    border: '1px solid rgba(0, 212, 170, 0.25)',
                    color: '#00d4aa',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <MdVideocam size={16} />
                  {t('extRecordingWithVideo')}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleRecordNow}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRecordNow();
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'rgba(255, 68, 68, 0.12)',
                    border: '1px solid rgba(255, 68, 68, 0.25)',
                    color: '#ff4444',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <MdMic size={16} />
                  {t('extRecordingNow')}
                </span>
              </div>
            </div>
          )}

          {/* COUNTDOWN */}
          {recPopup === 'countdown' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: '#00d4aa', fontFamily: 'monospace' }}>
                {countdown}
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{t('extRecordingCountdown')}</span>
            </div>
          )}

          {/* PREVIEW */}
          {recPopup === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{t('extRecordingComplete')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handlePreviewToggle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePreviewToggle();
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#00d4aa',
                    color: '#000',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {previewPlaying ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
                </span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      style={{
                        width: previewDuration > 0 ? `${(previewTime / previewDuration) * 100}%` : '0%',
                        height: '100%',
                        background: '#00d4aa',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                      {fmt(previewTime)}
                    </span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                      {fmt(previewDuration)}
                    </span>
                  </div>
                </div>
              </div>
              {saved ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(0, 212, 170, 0.1)',
                    color: '#00d4aa',
                    fontSize: '12px',
                  }}
                >
                  ✓ {t('extRecordingSaved')}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleRetry}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRetry();
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {t('extRecordingRetry')}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(0, 212, 170, 0.15)',
                      border: '1px solid rgba(0, 212, 170, 0.3)',
                      color: '#00d4aa',
                      fontSize: '12px',
                      fontWeight: 600,
                      textAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <MdSave size={14} />
                    {t('extRecordingSave')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== 하단바 버튼들 ===== */}

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
        style={{ ...btnBase, width: '48px', height: '48px', background: '#00d4aa', color: '#000', borderRadius: '50%' }}
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
        onClick={handleMicClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleMicClick();
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
      <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)', margin: '0 4px' }} />

      {/* 음량 — 세로 슬라이더 팝업 */}
      <div
        style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
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

        {/* 세로 볼륨 슬라이더 */}
        {showVolume && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              padding: '12px 8px',
              borderRadius: '12px',
              background: 'rgba(18, 18, 30, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                fontSize: '9px',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace',
                width: '20px',
                textAlign: 'center',
              }}
            >
              {volPct}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={volPct}
              onChange={handleVolumeChange}
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
                width: '4px',
                height: '80px',
                appearance: 'none',
                cursor: 'pointer',
                background: `linear-gradient(to top, #00d4aa ${volPct}%, rgba(255,255,255,0.12) ${volPct}%)`,
                outline: 'none',
                borderRadius: '2px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
