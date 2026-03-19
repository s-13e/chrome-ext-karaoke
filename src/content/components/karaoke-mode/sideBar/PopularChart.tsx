// PopularChart.tsx
// 차트 탭 — 수평 카테고리 탭 + 곡 목록을 단일 뷰로 표시
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartCategory, ChartItem, CHART_CATEGORIES } from '@lib/types/chart';
import type { YouTubePlaylistItem } from '@background/api/youtube';
import { parseTitleWithFallback } from '@lib/utils/lyrics/parsers/titleParser';
import styles from '../styles.module.css';

// Lazy loading 설정
const ITEMS_PER_PAGE = 10;

/**
 * 차트 탭 컴포넌트
 * - 상단: 수평 스크롤 가능한 카테고리 탭 (기본값: Global)
 * - 하단: 선택된 카테고리의 인기곡 리스트 (순위 / 제목+아티스트 / MV+MR 버튼)
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

    chrome.runtime
      .sendMessage({
        type: 'FETCH_PLAYLIST_ITEMS',
        playlistId,
        maxResults: 100,
      })
      .then((response) => {
        if (response.success && Array.isArray(response.data)) {
          const items: ChartItem[] = response.data.map((item: YouTubePlaylistItem, index: number) => {
            // YouTube 타이틀에서 아티스트/곡명 파싱 (기존 파이프라인 활용)
            const parsed = parseTitleWithFallback(item.title, {
              channelTitle: item.artist,
            });
            return {
              rank: index + 1,
              videoId: item.videoId,
              title: parsed?.title ?? item.title,
              artist: parsed?.artist ?? item.artist,
              thumbnailUrl: item.thumbnailUrl,
            };
          });
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
    window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
  };

  const handlePlayMR = (mrVideoId: string) => {
    window.location.href = `https://www.youtube.com/watch?v=${mrVideoId}`;
  };

  // locale에 따라 MR(ko/ja) 또는 Inst(기타)
  const instLabel = t('extChartInstLabel');

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
      <div className={styles.chartList}>
        {loading ? (
          <p className={styles.chartStatus}>{t('extChartLoading')}</p>
        ) : chartData.length === 0 ? (
          <p className={styles.chartStatus}>{t('extChartNoData')}</p>
        ) : (
          <>
            {chartData.slice(0, visibleCount).map((item) => (
              <div key={item.videoId} className={styles.chartItem}>
                {/* 순위 */}
                <span className={`${styles.chartRank} ${item.rank <= 3 ? styles.chartRankTop : ''}`}>{item.rank}</span>

                {/* 곡 정보 (title + artist 수직) */}
                <div className={styles.chartSongInfo}>
                  <p className={styles.chartSongTitle}>{item.title}</p>
                  <p className={styles.chartArtist}>{item.artist}</p>
                </div>

                {/* MV / MR(Inst) 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                  <span
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'transparent',
                      color: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                      letterSpacing: '0.5px',
                      lineHeight: '1.4',
                      userSelect: 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayMV(item.videoId);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePlayMV(item.videoId);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                    }}
                  >
                    MV
                  </span>
                  <span
                    role="button"
                    tabIndex={item.mrVideoId ? 0 : -1}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: item.mrVideoId ? 'rgba(0, 212, 170, 0.8)' : 'rgba(255, 255, 255, 0.08)',
                      color: item.mrVideoId ? '#fff' : 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: item.mrVideoId ? 'pointer' : 'not-allowed',
                      textAlign: 'center',
                      letterSpacing: '0.5px',
                      lineHeight: '1.4',
                      userSelect: 'none',
                    }}
                    onClick={
                      item.mrVideoId
                        ? (e) => {
                            e.stopPropagation();
                            handlePlayMR(item.mrVideoId!);
                          }
                        : undefined
                    }
                    onKeyDown={
                      item.mrVideoId
                        ? (e) => {
                            if (e.key === 'Enter') handlePlayMR(item.mrVideoId!);
                          }
                        : undefined
                    }
                    aria-disabled={!item.mrVideoId}
                  >
                    {instLabel}
                  </span>
                </div>
              </div>
            ))}
            {/* 더 로드하기 위한 트리거 요소 */}
            {visibleCount < chartData.length && (
              <div ref={loadMoreRef} className={styles.chartLoadMore}>
                {t('extChartLoadingMore', { current: visibleCount, total: chartData.length })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
