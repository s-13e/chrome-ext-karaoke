// ManualLyricsSearch.tsx
// 수동 가사 검색 컴포넌트
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBackIosNew, MdSearch, MdCheck } from 'react-icons/md';
import styles from './ManualLyricsSearch.module.css';
import { sanitizeInput, RateLimiter, validateLyricsText } from '@lib/utils/security/inputSanitizer';
import { extractVideoIdFromUrl } from '@lib/utils/platform/videoDetection';
import type { Line } from '@lib/types/lyrics';

const API_SERVER_URL = process.env.API_SERVER_URL!;
const IS_DEV_MODE = process.env.DEV_MODE === 'true';

interface ManualLyricsSearchProps {
  onBack: () => void;
  currentArtist?: string;
  currentTitle?: string;
  onLyricsSelected: (lyrics: Line[]) => void;
}

interface LyricsCandidate {
  id: string;
  lrclibId: number; // 실제 LRCLib ID (서버 캐시 저장용)
  trackName: string;
  artistName: string;
  duration: number;
  plainLyrics: string;
  syncedLyrics: string;
  preview: string; // 첫 2-3줄 미리보기
  firstTimestamp: string; // 첫 타임스탬프
  lastTimestamp: string; // 마지막 타임스탬프
}

// Rate Limiter 인스턴스 (1초 간격)
const rateLimiter = new RateLimiter(1000);

/**
 * 수동 가사 검색 컴포넌트
 * - 사용자가 직접 Artist, Title 입력
 * - LRCLib API 검색
 * - 가사 후보 목록 표시 및 선택
 */
export const ManualLyricsSearch: React.FC<ManualLyricsSearchProps> = ({
  onBack,
  currentArtist = '',
  currentTitle = '',
  onLyricsSelected,
}) => {
  const { t } = useTranslation();

  // 입력 상태
  const [artist, setArtist] = useState(currentArtist);
  const [title, setTitle] = useState(currentTitle);

  // 검색 상태
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<LyricsCandidate[]>([]);
  const [error, setError] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // DEV_MODE 전용: 확정 버튼 상태
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  /**
   * LRCLib API 가사 검색
   */
  const handleSearch = async () => {
    // Rate Limiting 체크
    if (!rateLimiter.canCall()) {
      const waitTime = Math.ceil(rateLimiter.getTimeUntilNextCall() / 1000);
      setError(t('extManualSearchRateLimitError', { seconds: waitTime }));
      return;
    }

    // Input Sanitization
    const cleanArtist = sanitizeInput(artist, 100);
    const cleanTitle = sanitizeInput(title, 100);

    if (!cleanArtist || !cleanTitle) {
      setError(t('extManualSearchInputError'));
      return;
    }

    setLoading(true);
    setError('');
    setCandidates([]);

    try {
      console.log('[ManualLyricsSearch] 가사 검색:', { artist: cleanArtist, title: cleanTitle });

      // LRCLib API 호출
      const response = await fetch(
        `https://lrclib.net/api/search?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`,
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setError(t('extManualSearchNoResults'));
        return;
      }

      // 결과 처리
      interface LRCLibItem {
        id: number;
        trackName?: string;
        artistName?: string;
        duration?: number;
        plainLyrics?: string;
        syncedLyrics?: string;
      }

      const results: LyricsCandidate[] = (data as LRCLibItem[])
        .filter((item) => item.syncedLyrics && validateLyricsText(item.syncedLyrics))
        .map((item) => {
          const syncedLyrics = item.syncedLyrics || '';
          const timestamps = getTimestamps(syncedLyrics);
          return {
            id: `${item.id}-${Date.now()}-${Math.random()}`, // React key용
            lrclibId: item.id, // 실제 LRCLib ID 보존
            trackName: item.trackName || cleanTitle,
            artistName: item.artistName || cleanArtist,
            duration: Math.round(item.duration || 0), // 정수로 반올림
            plainLyrics: item.plainLyrics || '',
            syncedLyrics,
            preview: getPreview(syncedLyrics), // syncedLyrics 사용 (타임스탬프 포함)
            firstTimestamp: timestamps.first,
            lastTimestamp: timestamps.last,
          };
        });

      if (results.length === 0) {
        setError(t('extManualSearchNoSyncedLyrics'));
        return;
      }

      console.log('[ManualLyricsSearch] 검색 결과:', results.length);
      setCandidates(results);
      setIsFormCollapsed(true); // 검색 결과가 있으면 폼 축약
    } catch (err) {
      console.error('[ManualLyricsSearch] 검색 오류:', err);
      setError(t('extManualSearchApiError'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 가사 미리보기 생성 (첫 2-3줄, 타임스탬프 포함)
   */
  const getPreview = (lyrics: string): string => {
    const lines = lyrics.split('\n').filter((line) => line.trim());
    const formattedLines: string[] = [];

    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (!line) continue;

      const match = line.match(/\[(\d{2}:\d{2}\.\d{2,3})\](.*)/);
      if (match) {
        const timestamp = match[1];
        const text = match[2];
        if (timestamp && text && text.trim()) {
          formattedLines.push(`[${timestamp}] ${text.trim()}`);
        }
      }
    }

    return formattedLines.join('\n') + (lines.length > 3 ? '\n...' : '');
  };

  /**
   * 전체 가사 포맷팅 (타임스탬프 포함)
   */
  const getFullLyrics = (lyrics: string): string => {
    const lines = lyrics.split('\n').filter((line) => line.trim());
    const formattedLines: string[] = [];

    for (const line of lines) {
      if (!line) continue;

      const match = line.match(/\[(\d{2}:\d{2}\.\d{2,3})\](.*)/);
      if (match && match[1] && match[2]) {
        const timestamp = match[1];
        const text = match[2];
        if (text.trim()) {
          formattedLines.push(`[${timestamp}] ${text.trim()}`);
        }
      }
    }

    return formattedLines.join('\n');
  };

  /**
   * 타임스탬프 추출 (첫 번째와 마지막)
   */
  const getTimestamps = (syncedLyrics: string): { first: string; last: string } => {
    const lines = syncedLyrics.split('\n').filter((line) => line.trim() && line.includes('['));
    if (lines.length === 0) return { first: '00:00.00', last: '00:00.00' };

    const firstLine = lines[0];
    const lastLine = lines[lines.length - 1];

    const firstMatch = firstLine ? firstLine.match(/\[(\d{2}:\d{2}\.\d{2,3})\]/) : null;
    const lastMatch = lastLine ? lastLine.match(/\[(\d{2}:\d{2}\.\d{2,3})\]/) : null;

    const first = firstMatch && firstMatch[1] ? firstMatch[1] : '00:00.00';
    const last = lastMatch && lastMatch[1] ? lastMatch[1] : '00:00.00';

    return { first, last };
  };

  /**
   * 가사 펼치기/접기 토글
   */
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  /**
   * 새 검색 시작 (폼 펼치기)
   */
  const handleNewSearch = () => {
    setIsFormCollapsed(false);
    setCandidates([]);
    setError('');
    setExpandedIds(new Set());
  };

  /**
   * 가사 선택 핸들러
   */
  const handleSelectLyrics = (candidate: LyricsCandidate) => {
    try {
      // Synced Lyrics 파싱
      const lines: Line[] = [];
      const lrcLines = candidate.syncedLyrics.split('\n');

      for (const line of lrcLines) {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
          const [, minutes, seconds, centiseconds, text] = match;
          if (!minutes || !seconds || !centiseconds || text === undefined) continue;

          const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(centiseconds.padEnd(3, '0')) / 1000;

          lines.push({
            time,
            text: text.trim(),
          });
        }
      }

      if (lines.length === 0) {
        setError(t('extManualSearchParseError'));
        return;
      }

      console.log('[ManualLyricsSearch] 가사 선택:', {
        track: candidate.trackName,
        lines: lines.length,
      });

      onLyricsSelected(lines);
      onBack();
    } catch (err) {
      console.error('[ManualLyricsSearch] 파싱 오류:', err);
      setError(t('extManualSearchParseError'));
    }
  };

  /**
   * [DEV_MODE 전용] videoId → lrclibId 매핑을 서버에 확정 저장
   */
  const handleConfirmMapping = async (candidate: LyricsCandidate) => {
    const videoId = extractVideoIdFromUrl(window.location.href);
    if (!videoId) {
      setError('현재 YouTube 영상 ID를 찾을 수 없습니다.');
      return;
    }

    setConfirmingId(candidate.id);

    try {
      console.log('[ManualLyricsSearch] 매핑 확정 시도:', {
        videoId,
        lrclibId: candidate.lrclibId,
        artist: candidate.artistName,
        title: candidate.trackName,
      });

      const response = await fetch(`${API_SERVER_URL}/api/v1/youtube/lrclib`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          lrclibId: candidate.lrclibId,
          artist: candidate.artistName,
          title: candidate.trackName,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const result = await response.json();
      console.log('[ManualLyricsSearch] 매핑 확정 성공:', result);

      // 확정 완료 표시
      setConfirmedIds((prev) => new Set(prev).add(candidate.id));
    } catch (err) {
      console.error('[ManualLyricsSearch] 매핑 확정 실패:', err);
      setError(`매핑 저장 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={styles.title}>{t('extManualSearchTitle')}</h2>
      </div>

      {/* 설명 */}
      {!isFormCollapsed && (
        <div className={styles.description}>
          <p>{t('extManualSearchDescription')}</p>
        </div>
      )}

      {/* 입력 폼 */}
      <div className={`${styles.form} ${isFormCollapsed ? styles.formCollapsed : ''}`}>
        {isFormCollapsed ? (
          // 축약된 폼 (한 줄로 표시)
          <div className={styles.collapsedForm}>
            <div className={styles.collapsedInfo}>
              <span className={styles.collapsedText}>
                {artist} - {title}
              </span>
            </div>
            <button className={styles.newSearchButton} onClick={handleNewSearch} aria-label="Expand search form">
              ▼
            </button>
          </div>
        ) : (
          // 전체 폼
          <>
            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('extManualSearchArtist')}</label>
              <input
                type="text"
                className={styles.input}
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder={t('extManualSearchArtistPlaceholder')}
                maxLength={100}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>{t('extManualSearchTitleLabel')}</label>
              <input
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('extManualSearchTitlePlaceholder')}
                maxLength={100}
              />
            </div>

            <button
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={loading || !artist.trim() || !title.trim()}
            >
              <MdSearch size={20} />
              {loading ? t('extSearching') : t('extSearch')}
            </button>
          </>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {/* 검색 결과 */}
      <div className={styles.results}>
        {candidates.length > 0 && (
          <>
            <h3 className={styles.resultsTitle}>
              {t('extManualSearchResults')} ({candidates.length})
            </h3>
            <div className={styles.candidatesList}>
              {candidates.map((candidate) => {
                const isExpanded = expandedIds.has(candidate.id);
                const displayText = isExpanded ? getFullLyrics(candidate.syncedLyrics) : candidate.preview;

                return (
                  <div key={candidate.id} className={styles.candidateItem}>
                    <div className={styles.candidateInfo}>
                      <div className={styles.candidateHeader}>
                        <h4 className={styles.candidateTitle}>{candidate.trackName}</h4>
                        {candidate.duration > 0 && (
                          <span className={styles.candidateDuration}>
                            {Math.floor(candidate.duration / 60)}:{String(candidate.duration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <p className={styles.candidateArtist}>{candidate.artistName}</p>

                      <div className={styles.previewContainer}>
                        <pre className={styles.candidatePreview}>{displayText}</pre>
                        <button
                          className={styles.expandButton}
                          onClick={() => toggleExpand(candidate.id)}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button className={styles.selectButton} onClick={() => handleSelectLyrics(candidate)}>
                        {t('extSelect')}
                      </button>
                      {/* DEV_MODE 전용: 확정 버튼 (videoId → lrclibId 서버 캐시 저장) */}
                      {IS_DEV_MODE && (
                        <button
                          className={`${styles.confirmButton} ${confirmedIds.has(candidate.id) ? styles.confirmed : ''}`}
                          onClick={() => handleConfirmMapping(candidate)}
                          disabled={confirmingId === candidate.id || confirmedIds.has(candidate.id)}
                          title={`LRCLib ID: ${candidate.lrclibId} 매핑 확정`}
                        >
                          <MdCheck size={16} />
                          {confirmingId === candidate.id
                            ? '저장 중...'
                            : confirmedIds.has(candidate.id)
                              ? '확정됨'
                              : '확정'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
