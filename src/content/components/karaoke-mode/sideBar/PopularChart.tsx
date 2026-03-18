// PopularChart.tsx
// 차트 탭 — 수평 카테고리 탭 + 곡 목록을 단일 뷰로 표시
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartCategory, ChartItem, CHART_CATEGORIES } from '@lib/types/chart';
import type { YouTubePlaylistItem } from '@background/api/youtube';
import acapellaStyles from './AcapellaRecording.module.css';
import { SIDEBAR_COLORS } from './sidebarStyles';
import styles from '../styles.module.css';

// Lazy loading 설정
const ITEMS_PER_PAGE = 10;

/**
 * 차트 탭 컴포넌트
 * - 상단: 수평 스크롤 가능한 카테고리 탭 (기본값: Global)
 * - 하단: 선택된 카테고리의 인기곡 리스트
 */
export const PopularChart: React.FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<ChartCategory>('global-top-100');
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

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

  // 카테고리 변경 시 visibleCount 초기화 + 활성 탭 스크롤
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);

    // 활성 탭을 뷰포트 중앙으로 스크롤
    const container = tabsRef.current;
    if (!container) return;
    const activeButton = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [category]);

  // 마우스 드래그 스크롤 구현
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeftStart = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeftStart = container.scrollLeft;
      container.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
      isDown = false;
      container.style.cursor = 'grab';
    };

    const onMouseUp = () => {
      isDown = false;
      container.style.cursor = 'grab';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeftStart - walk;
    };

    // 마우스 휠로도 수평 스크롤 가능하게
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.style.cursor = 'grab';
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // 차트 데이터 가져오기
  useEffect(() => {
    const categoryInfo = CHART_CATEGORIES.find((c) => c.id === category);
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
  }, [category]);

  const handlePlayMV = (videoId: string) => {
    // MV (뮤직비디오) 재생 - YouTube 영상 페이지로 이동
    window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
  };

  const handlePlayMR = (mrVideoId: string) => {
    // MR (반주) 재생 - YouTube 영상 페이지로 이동
    window.location.href = `https://www.youtube.com/watch?v=${mrVideoId}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minWidth: 0 }}>
      {/* 수평 스크롤 카테고리 탭 */}
      <div ref={tabsRef} className={styles.chartCategoryTabs}>
        {CHART_CATEGORIES.map((cat) => {
          const isActive = cat.id === category;
          return (
            <button
              key={cat.id}
              data-active={isActive ? 'true' : undefined}
              className={`${styles.chartCategoryTab} ${isActive ? styles.chartCategoryTabActive : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {t(cat.shortLabelKey)}
            </button>
          );
        })}
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
    </div>
  );
};
