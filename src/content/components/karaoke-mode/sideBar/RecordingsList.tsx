// RecordingsList.tsx
// 녹음 파일 목록 컴포넌트
import React, { useState, useEffect } from 'react';
import { MdPlayArrow, MdDownload, MdDelete, MdArrowBackIosNew } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './RecordingsList.module.css';
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

/**
 * 녹음 파일 목록 컴포넌트
 * - Chrome Storage에 저장된 녹음 파일 목록 표시
 * - 재생, 다운로드, 삭제 기능 제공
 */
export const RecordingsList: React.FC<RecordingsListProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  /**
   * 녹음 목록 불러오기
   */
  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST);
      const recordingsList = (result[STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST] as RecordingItem[]) || [];
      // 최신순으로 정렬
      const sortedRecordings = recordingsList.sort((a, b) => b.timestamp - a.timestamp);
      setRecordings(sortedRecordings);
    } catch (error) {
      console.error('[RecordingsList] 목록 불러오기 오류:', error);
    }
  };

  /**
   * 녹음 재생
   */
  const handlePlay = (recording: RecordingItem) => {
    // 이전 오디오 중지
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
  };

  /**
   * 재생 중지
   */
  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setPlayingId(null);
  };

  /**
   * 다운로드
   */
  const handleDownload = (recording: RecordingItem) => {
    const a = document.createElement('a');
    a.href = recording.audioData;
    a.download = recording.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  /**
   * 삭제
   */
  const handleDelete = async (recordingId: string) => {
    const confirmed = window.confirm(t('extAcapellaDeleteConfirm'));
    if (!confirmed) return;

    try {
      const updatedRecordings = recordings.filter((r) => r.id !== recordingId);
      await chrome.storage.local.set({ [STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST]: updatedRecordings });
      setRecordings(updatedRecordings);

      // 재생 중인 파일이면 중지
      if (playingId === recordingId) {
        handleStop();
      }
    } catch (error) {
      console.error('[RecordingsList] 삭제 오류:', error);
    }
  };

  /**
   * 시간 포맷팅
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 재생 시간 포맷팅
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={styles.title}>{t('extAcapellaRecordingsList')}</h2>
      </div>

      {/* 녹음 목록 */}
      <div className={styles.content}>
        {recordings.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>{t('extAcapellaNoRecordings')}</p>
          </div>
        ) : (
          <ul className={styles.recordingsList}>
            {recordings.map((recording) => (
              <li key={recording.id} className={styles.recordingItem}>
                <div className={styles.recordingInfo}>
                  <div className={styles.marqueeContainer}>
                    <p className={`${styles.recordingFilename} ${styles.marqueeText}`}>
                      {recording.filename} &nbsp;&nbsp;&nbsp; {recording.filename}
                    </p>
                  </div>
                  <p className={styles.recordingMeta}>
                    {formatDate(recording.timestamp)} • {formatDuration(recording.duration)}
                  </p>
                </div>
                <div className={styles.recordingActions}>
                  {playingId === recording.id ? (
                    <button
                      className={styles.actionButton}
                      onClick={handleStop}
                      aria-label={t('extAcapellaStopRecording')}
                    >
                      <MdPlayArrow size={20} color="#2196F3" />
                    </button>
                  ) : (
                    <button
                      className={styles.actionButton}
                      onClick={() => handlePlay(recording)}
                      aria-label={t('extPlay')}
                    >
                      <MdPlayArrow size={20} />
                    </button>
                  )}
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDownload(recording)}
                    aria-label={t('extSave')}
                  >
                    <MdDownload size={20} />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDelete(recording.id)}
                    aria-label={t('extDelete')}
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
