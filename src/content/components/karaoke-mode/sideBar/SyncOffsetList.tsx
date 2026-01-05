// SyncOffsetList.tsx
// 싱크셋(오프셋) 목록 컴포넌트
import React, { useState, useEffect } from 'react';
import { MdEdit, MdDelete, MdArrowBackIosNew } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './SyncOffsetList.module.css';
import {
  getAllVideoOffsets,
  deleteVideoOffset,
  updateVideoOffset,
  type VideoOffsetData,
} from '@lib/utils/storage/videoOffsetStorage';
import { extractVideoIdFromUrl } from '@lib/utils/platform/videoDetection';

interface SyncOffsetListProps {
  onBack: () => void;
}

/**
 * 싱크셋(오프셋) 목록 컴포넌트
 * - Chrome Storage Sync에 저장된 영상별 오프셋 목록 표시
 * - 수정, 삭제 기능 제공
 */
export const SyncOffsetList: React.FC<SyncOffsetListProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [offsets, setOffsets] = useState<VideoOffsetData[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  /**
   * 오프셋 목록 불러오기
   */
  useEffect(() => {
    loadOffsets();
    // 현재 영상 ID 파악
    const videoId = extractVideoIdFromUrl(window.location.href);
    setCurrentVideoId(videoId);
  }, []);

  const loadOffsets = async () => {
    try {
      const allOffsets = await getAllVideoOffsets();
      // 최신순으로 정렬
      const offsetArray = Object.values(allOffsets).sort((a, b) => b.lastModified - a.lastModified);
      setOffsets(offsetArray);
    } catch (error) {
      console.error('[SyncOffsetList] 목록 불러오기 오류:', error);
    }
  };

  /**
   * 수정 시작
   */
  const handleEditStart = (offset: VideoOffsetData) => {
    setEditingId(offset.videoId);
    setEditValue(offset.offset.toString());
  };

  /**
   * 수정 취소
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  /**
   * 수정 저장
   */
  const handleEditSave = async (videoId: string) => {
    const newOffset = parseFloat(editValue);
    if (isNaN(newOffset)) {
      alert(t('extSyncOffsetInvalidValue') || '유효한 숫자를 입력하세요.');
      return;
    }

    try {
      await updateVideoOffset(videoId, newOffset);
      await loadOffsets();
      setEditingId(null);
      setEditValue('');
      console.log(`[SyncOffsetList] 오프셋 수정 완료 (videoId: ${videoId}, offset: ${newOffset}초)`);

      // 현재 영상이면 페이지를 새로고침하여 새로운 오프셋 적용
      if (currentVideoId === videoId) {
        console.log('[SyncOffsetList] 현재 영상의 오프셋 수정됨 - 페이지 새로고침');
        window.location.reload();
      }
    } catch (error) {
      console.error('[SyncOffsetList] 수정 오류:', error);
    }
  };

  /**
   * 삭제 - 하단바의 초기화 버튼과 동일하게 동작
   */
  const handleDelete = async (videoId: string, title: string) => {
    const confirmed = window.confirm(
      t('extSyncOffsetDeleteConfirm', { title }) || `"${title}"의 오프셋을 삭제하시겠습니까?`,
    );
    if (!confirmed) return;

    try {
      const isCurrentVideo = currentVideoId === videoId;

      // Storage에서 완전히 삭제
      await deleteVideoOffset(videoId);
      console.log(`[SyncOffsetList] 오프셋 삭제 완료 (videoId: ${videoId})`);

      await loadOffsets();

      // 현재 영상이면 페이지 새로고침하여 원본 가사 복원
      if (isCurrentVideo) {
        console.log('[SyncOffsetList] 현재 영상의 오프셋 삭제 - 페이지 새로고침');
        window.location.reload();
      }
    } catch (error) {
      console.error('[SyncOffsetList] 삭제 오류:', error);
    }
  };

  /**
   * 오프셋 포맷팅
   */
  const formatOffset = (offset: number): string => {
    return offset > 0 ? `+${offset}` : `${offset}`;
  };

  /**
   * 날짜 포맷팅
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

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={styles.title}>
          {t('extSyncOffsetListTitle')} ({offsets.length})
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
        {offsets.map((offset) => (
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

              {editingId === offset.videoId ? (
                // 수정 모드
                <div className={styles.editRow}>
                  <input
                    type="number"
                    step="0.1"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={styles.editInput}
                    autoFocus
                  />
                  <span className={styles.unit}>{t('extKaraokeSyncTimeUnit') || '초'}</span>
                  <button className={styles.saveButton} onClick={() => handleEditSave(offset.videoId)}>
                    {t('extSave')}
                  </button>
                  <button className={styles.cancelButton} onClick={handleEditCancel}>
                    {t('extCancel')}
                  </button>
                </div>
              ) : (
                // 일반 모드
                <>
                  <div className={styles.offsetRow}>
                    <span className={styles.offsetLabel}>{t('extSyncOffsetLabel')}:</span>
                    <span className={styles.offsetValue}>
                      {formatOffset(offset.offset)}
                      {t('extKaraokeSyncTimeUnit') || '초'}
                    </span>
                  </div>
                  <div className={styles.dateRow}>
                    <span className={styles.dateLabel}>{t('extSyncOffsetLastModified')}:</span>
                    <span className={styles.dateValue}>{formatDate(offset.lastModified)}</span>
                  </div>
                </>
              )}
            </div>

            {/* 액션 버튼 */}
            {editingId !== offset.videoId && (
              <div className={styles.actions}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEditStart(offset)}
                  aria-label={t('extEdit')}
                >
                  <MdEdit size={20} />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleDelete(offset.videoId, offset.title)}
                  aria-label={t('extDelete')}
                >
                  <MdDelete size={20} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
