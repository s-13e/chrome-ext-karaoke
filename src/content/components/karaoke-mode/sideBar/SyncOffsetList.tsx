// SyncOffsetList.tsx
// [DEV 전용] 싱크셋(오프셋) 목록 — 서버 캐시 확정/삭제 기능
import React, { useState, useEffect } from 'react';
import { MdCloudUpload, MdDelete, MdArrowBackIosNew } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './SyncOffsetList.module.css';
import { getAllVideoOffsets, deleteVideoOffset, type VideoOffsetData } from '@lib/utils/storage/videoOffsetStorage';
import { extractVideoIdFromUrl } from '@lib/utils/platform/videoDetection';

const API_SERVER_URL = process.env.API_SERVER_URL ?? '';
const DEBUG_API_KEY = process.env.DEBUG_API_KEY ?? '';

interface SyncOffsetListProps {
  onBack: () => void;
}

/**
 * [DEV 전용] 싱크셋 목록 컴포넌트
 * - Chrome Storage에 저장된 오프셋 목록 표시
 * - 서버 캐시 확정(업로드) 및 삭제 기능
 * - 오프셋 수정은 Lyrics 탭 싱크 패널에서 처리
 */
export const SyncOffsetList: React.FC<SyncOffsetListProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [offsets, setOffsets] = useState<VideoOffsetData[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    loadOffsets();
    const videoId = extractVideoIdFromUrl(window.location.href);
    setCurrentVideoId(videoId);
  }, []);

  const loadOffsets = async () => {
    try {
      const allOffsets = await getAllVideoOffsets();
      const offsetArray = Object.values(allOffsets).sort((a, b) => b.lastModified - a.lastModified);
      setOffsets(offsetArray);
    } catch (error) {
      console.error('[SyncOffsetList] 목록 불러오기 오류:', error);
    }
  };

  /**
   * [DEV] 서버 캐시로 확정 저장
   */
  const handleUploadToServer = async (offset: VideoOffsetData) => {
    if (!API_SERVER_URL || !DEBUG_API_KEY) {
      alert('API_SERVER_URL 또는 DEBUG_API_KEY가 설정되지 않았습니다.');
      return;
    }

    setUploadingId(offset.videoId);
    try {
      const response = await fetch(`${API_SERVER_URL}/api/v1/youtube/offset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': DEBUG_API_KEY,
        },
        body: JSON.stringify({ videoId: offset.videoId, offset: offset.offset }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      // 서버 저장 성공 → 로컬 오프셋 삭제
      await deleteVideoOffset(offset.videoId);
      await loadOffsets();

      console.log(`[SyncOffsetList] 서버 캐시 저장 완료 (videoId: ${offset.videoId}, offset: ${offset.offset}초)`);
      alert(`[DEV] 서버 캐시 저장 완료: ${offset.title}`);

      // 현재 영상이면 새로고침하여 서버 오프셋 적용
      if (currentVideoId === offset.videoId) {
        window.location.reload();
      }
    } catch (err) {
      console.error('[SyncOffsetList] 서버 캐시 저장 실패:', err);
      alert(`서버 저장 실패: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploadingId(null);
    }
  };

  /**
   * 로컬 오프셋 삭제
   */
  const handleDelete = async (videoId: string, title: string) => {
    const confirmed = window.confirm(
      t('extSyncOffsetDeleteConfirm', { title }) || `"${title}"의 오프셋을 삭제하시겠습니까?`,
    );
    if (!confirmed) return;

    try {
      const isCurrentVideo = currentVideoId === videoId;
      await deleteVideoOffset(videoId);
      await loadOffsets();
      console.log(`[SyncOffsetList] 오프셋 삭제 완료 (videoId: ${videoId})`);

      if (isCurrentVideo) {
        window.location.reload();
      }
    } catch (error) {
      console.error('[SyncOffsetList] 삭제 오류:', error);
    }
  };

  const formatOffset = (offset: number): string => {
    return offset > 0 ? `+${offset}` : `${offset}`;
  };

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

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={styles.title}>
          [DEV] {t('extSyncOffsetListTitle')} ({offsets.length})
        </h2>
      </div>

      {/* 빈 목록 */}
      {offsets.length === 0 && (
        <div className={styles.emptyState}>
          <p>{t('extSyncOffsetListEmpty')}</p>
        </div>
      )}

      {/* 목록 */}
      <div className={styles.list}>
        {offsets.map((offset) => {
          const hasLineAdj = offset.lineAdjustments && Object.keys(offset.lineAdjustments).length > 0;
          return (
            <div
              key={offset.videoId}
              className={`${styles.item} ${currentVideoId === offset.videoId ? styles.currentVideo : ''}`}
            >
              {/* 썸네일 */}
              <div className={styles.thumbnail}>
                {offset.thumbnail ? (
                  <img src={offset.thumbnail} alt={offset.title} />
                ) : (
                  <div className={styles.thumbnailPlaceholder}>🎵</div>
                )}
              </div>

              {/* 정보 */}
              <div className={styles.info}>
                <div className={styles.titleRow}>
                  <h3 className={styles.videoTitle}>{offset.title}</h3>
                  {currentVideoId === offset.videoId && <span className={styles.currentBadge}>⭐</span>}
                </div>
                <div className={styles.offsetRow}>
                  <span className={styles.offsetLabel}>{t('extSyncOffsetLabel')}:</span>
                  <span className={styles.offsetValue}>
                    {formatOffset(offset.offset)}
                    {t('extKaraokeSyncTimeUnit') || '초'}
                  </span>
                  {hasLineAdj && (
                    <span className={styles.offsetValue} style={{ fontSize: '10px', opacity: 0.7 }}>
                      +{Object.keys(offset.lineAdjustments!).length}줄 보정
                    </span>
                  )}
                </div>
                <div className={styles.dateRow}>
                  <span className={styles.dateLabel}>{t('extSyncOffsetLastModified')}:</span>
                  <span className={styles.dateValue}>{formatDate(offset.lastModified)}</span>
                </div>
              </div>

              {/* 액션 버튼: 서버 확정 + 삭제 */}
              <div className={styles.actions}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleUploadToServer(offset)}
                  disabled={uploadingId === offset.videoId}
                  aria-label="서버 캐시 저장"
                  title="서버 캐시 확정"
                >
                  <MdCloudUpload size={20} />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleDelete(offset.videoId, offset.title)}
                  aria-label={t('extDelete')}
                  title={t('extDelete')}
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
