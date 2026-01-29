// PopularChart.tsx
// 선택된 차트 카테고리의 곡 목록 화면
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBackIosNew } from 'react-icons/md';
import { ChartCategory, ChartItem, CHART_CATEGORIES } from '@lib/types/chart';
import type { YouTubePlaylistItem } from '@background/api/youtube';
import acapellaStyles from './AcapellaRecording.module.css';
import { SIDEBAR_COLORS } from './sidebarStyles';

// Lazy loading 설정
const ITEMS_PER_PAGE = 10;

interface PopularChartProps {
  category: ChartCategory;
  onBackToCategoryMenu: () => void;
}

/**
 * 차트 곡 목록 화면
 * - 선택된 카테고리의 인기곡 리스트 표시
 * - 각 곡을 클릭하면 해당 YouTube 영상으로 이동
 */
export const PopularChart: React.FC<PopularChartProps> = ({ category, onBackToCategoryMenu }) => {
  const { t } = useTranslation();
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 카테고리 정보 가져오기
  const categoryInfo = CHART_CATEGORIES.find((c) => c.id === category);
  const categoryLabel = categoryInfo ? t(categoryInfo.labelKey) : category;

  // 더 많은 항목 로드 (Intersection Observer 콜백)
  const loadMore = useCallback(() => {
    if (visibleCount < chartData.length) {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, chartData.length));
    }
  }, [visibleCount, chartData.length]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore]);

  // 카테고리 변경 시 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [category]);

  useEffect(() => {
    // 플레이리스트 ID 가져오기
    const playlistId = categoryInfo?.playlistId;
    if (!playlistId) {
      console.error('[PopularChart] playlistId 없음:', category);
      setChartData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('[PopularChart] 차트 데이터 조회 시작:', category, playlistId);

    // Background script를 통해 YouTube API 호출
    chrome.runtime
      .sendMessage({
        type: 'FETCH_PLAYLIST_ITEMS',
        playlistId,
        maxResults: 100,
      })
      .then((response) => {
        if (response.success && Array.isArray(response.data)) {
          const items: ChartItem[] = response.data.map((item: YouTubePlaylistItem, index: number) => ({
            rank: index + 1,
            videoId: item.videoId,
            title: item.title,
            artist: item.artist,
            thumbnailUrl: item.thumbnailUrl,
          }));
          console.log('[PopularChart] 차트 데이터 조회 성공:', items.length, '개');
          setChartData(items);
        } else {
          console.error('[PopularChart] 차트 데이터 조회 실패:', response);
          setChartData([]);
        }
      })
      .catch((error) => {
        console.error('[PopularChart] API 호출 오류:', error);
        setChartData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, categoryInfo]);

  const handlePlayMV = (videoId: string) => {
    // MV (뮤직비디오) 재생 - YouTube 영상 페이지로 이동
    window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
  };

  const handlePlayMR = (mrVideoId: string) => {
    // MR (반주) 재생 - YouTube 영상 페이지로 이동
    window.location.href = `https://www.youtube.com/watch?v=${mrVideoId}`;
  };

  return (
    <>
      {/* 헤더: 뒤로가기 버튼 */}
      <div className={acapellaStyles.header}>
        <button className={acapellaStyles.backButton} onClick={onBackToCategoryMenu} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={acapellaStyles.title}>{categoryLabel}</h2>
      </div>

      {/* 차트 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px',
        }}
      >
        {loading ? (
          <p style={{ color: SIDEBAR_COLORS.textPrimary, textAlign: 'center', marginTop: '20px' }}>
            {t('extChartLoading')}
          </p>
        ) : chartData.length === 0 ? (
          <p style={{ color: SIDEBAR_COLORS.textPrimary, textAlign: 'center', marginTop: '20px' }}>
            {t('extChartNoData')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chartData.slice(0, visibleCount).map((item) => (
              <div
                key={item.videoId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: SIDEBAR_COLORS.overlay05,
                  border: `1px solid ${SIDEBAR_COLORS.border}`,
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.overlay10;
                  e.currentTarget.style.borderColor = SIDEBAR_COLORS.borderHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.overlay05;
                  e.currentTarget.style.borderColor = SIDEBAR_COLORS.border;
                }}
              >
                {/* 순위 */}
                <span
                  style={{
                    color: SIDEBAR_COLORS.textPrimary,
                    fontWeight: 'bold',
                    fontSize: '16px',
                    minWidth: '30px',
                    textAlign: 'center',
                    marginRight: '12px',
                  }}
                >
                  {item.rank}
                </span>

                {/* 곡 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={acapellaStyles.marqueeContainer}>
                    <p
                      className={acapellaStyles.marqueeText}
                      style={{
                        color: SIDEBAR_COLORS.textPrimary,
                        fontSize: '14px',
                        fontWeight: '500',
                        margin: 0,
                      }}
                    >
                      {item.title} &nbsp;&nbsp;&nbsp; {item.title}
                    </p>
                  </div>
                  <p
                    style={{
                      color: SIDEBAR_COLORS.textSecondary,
                      fontSize: '12px',
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.artist}
                  </p>
                </div>

                {/* MV/MR 버튼 그룹 - 수직 배치 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                  {/* MV 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayMV(item.videoId);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: SIDEBAR_COLORS.youtube,
                      color: SIDEBAR_COLORS.textPrimary,
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.youtubeHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.youtube;
                    }}
                  >
                    MV
                  </button>

                  {/* MR 버튼 - mrVideoId 있으면 활성화, 없으면 비활성화 */}
                  <button
                    onClick={
                      item.mrVideoId
                        ? (e) => {
                            e.stopPropagation();
                            handlePlayMR(item.mrVideoId!);
                          }
                        : undefined
                    }
                    disabled={!item.mrVideoId}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: item.mrVideoId ? SIDEBAR_COLORS.primary : '#666666',
                      color: item.mrVideoId ? SIDEBAR_COLORS.textPrimary : '#999999',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: item.mrVideoId ? 'pointer' : 'not-allowed',
                      opacity: item.mrVideoId ? 1 : 0.6,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={
                      item.mrVideoId
                        ? (e) => {
                            e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.primaryHover;
                          }
                        : undefined
                    }
                    onMouseLeave={
                      item.mrVideoId
                        ? (e) => {
                            e.currentTarget.style.backgroundColor = SIDEBAR_COLORS.primary;
                          }
                        : undefined
                    }
                  >
                    MR
                  </button>
                </div>
              </div>
            ))}
            {/* 더 로드하기 위한 트리거 요소 */}
            {visibleCount < chartData.length && (
              <div
                ref={loadMoreRef}
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: SIDEBAR_COLORS.textSecondary,
                  fontSize: '12px',
                }}
              >
                {t('extChartLoadingMore', { current: visibleCount, total: chartData.length })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
