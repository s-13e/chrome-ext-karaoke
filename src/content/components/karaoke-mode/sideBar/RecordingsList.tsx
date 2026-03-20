// RecordingsList.tsx
// 녹음 파일 목록 — Library 탭에서 표시
// 테마 통일, 파일명 정리, 날짜/시간 분리

import React, { useState, useEffect, useCallback } from 'react';
import { MdPlayArrow, MdPause, MdDownload, MdDelete, MdArrowBackIosNew, MdMic } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '@constants/storageKeys';

interface RecordingsListProps {
  onBack: () => void;
}

interface RecordingItem {
  id: string;
  filename: string;
  timestamp: number;
  duration: number;
  audioData: string;
}

/** 파일명에서 확장자 제거 + 표시용 정리 */
function displayName(filename: string): string {
  // 확장자 제거
  let name = filename.replace(/\.\w+$/, '');
  // 타임스탬프 부분 (YYYYMMDD_HHMMSS) 제거
  name = name.replace(/_\d{8}_\d{6}$/, '');
  // 기본 접두사 제거
  name = name.replace(/^acapella-recording-/, '');
  return name || 'Recording';
}

/** 브라우저 locale 기반 날짜 포맷 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** 시:분 포맷 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 녹음 길이 포맷 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const RecordingsList: React.FC<RecordingsListProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST);
      const list = (result[STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST] as RecordingItem[]) ?? [];
      setRecordings(list.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('[RecordingsList] 목록 불러오기 오류:', error);
    }
  };

  const handlePlay = useCallback(
    (recording: RecordingItem) => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      const audio = new Audio(recording.audioData);
      setCurrentAudio(audio);
      setPlayingId(recording.id);
      audio.onended = () => {
        setPlayingId(null);
        setCurrentAudio(null);
      };
      audio.play();
    },
    [currentAudio],
  );

  const handleStop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setPlayingId(null);
  }, [currentAudio]);

  const handleDownload = useCallback((recording: RecordingItem) => {
    const a = document.createElement('a');
    a.href = recording.audioData;
    a.download = recording.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleDelete = useCallback(
    async (recordingId: string) => {
      const confirmed = window.confirm(t('extAcapellaDeleteConfirm'));
      if (!confirmed) return;
      try {
        const updated = recordings.filter((r) => r.id !== recordingId);
        await chrome.storage.local.set({ [STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST]: updated });
        setRecordings(updated);
        if (playingId === recordingId) handleStop();
      } catch (error) {
        console.error('[RecordingsList] 삭제 오류:', error);
      }
    },
    [recordings, playingId, handleStop, t],
  );

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <span
          role="button"
          tabIndex={0}
          onClick={onBack}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onBack();
          }}
          style={{ ...btnStyle, width: '28px', height: '28px' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          <MdArrowBackIosNew size={14} />
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
          {t('extAcapellaRecordingsList')} ({recordings.length})
        </span>
      </div>

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {recordings.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '32px 0',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <MdMic size={32} />
            <span style={{ fontSize: '12px' }}>{t('extAcapellaNoRecordings')}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recordings.map((rec) => {
              const isActive = playingId === rec.id;
              return (
                <div
                  key={rec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(0, 212, 170, 0.08)' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '1px solid rgba(0, 212, 170, 0.2)' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* 재생/정지 */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => (isActive ? handleStop() : handlePlay(rec))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (isActive) handleStop();
                        else handlePlay(rec);
                      }
                    }}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isActive ? '#00d4aa' : 'rgba(255,255,255,0.08)',
                      color: isActive ? '#000' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isActive ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
                  </span>

                  {/* 곡 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: isActive ? '#00d4aa' : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayName(rec.filename)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                      {formatDuration(rec.duration)}
                    </div>
                    <div
                      style={{
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.25)',
                        marginTop: '1px',
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      <span>{formatDate(rec.timestamp)}</span>
                      <span>{formatTime(rec.timestamp)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => handleDownload(rec)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDownload(rec);
                      }}
                      style={btnStyle}
                      title={t('extSave')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#00d4aa';
                        e.currentTarget.style.background = 'rgba(0,212,170,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <MdDownload size={16} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => handleDelete(rec.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDelete(rec.id);
                      }}
                      style={btnStyle}
                      title={t('extDelete')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ff6b6b';
                        e.currentTarget.style.background = 'rgba(255,107,107,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <MdDelete size={16} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
