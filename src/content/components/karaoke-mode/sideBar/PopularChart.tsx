// PopularChart.tsx
// 선택된 차트 카테고리의 곡 목록 화면
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBackIosNew } from 'react-icons/md';
import { ChartCategory, ChartItem, CHART_CATEGORIES } from '@lib/types/chart';
import styles from '../styles.module.css';
import acapellaStyles from './AcapellaRecording.module.css';

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

  // 카테고리 정보 가져오기
  const categoryInfo = CHART_CATEGORIES.find((c) => c.id === category);
  const categoryLabel = categoryInfo ? t(categoryInfo.labelKey) : category;

  useEffect(() => {
    // TODO: 실제 API 연동 시 구현
    // 현재는 더미 데이터로 대체
    setLoading(true);
    setTimeout(() => {
      const dummyData: ChartItem[] = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        videoId: `dummy-video-${i}`,
        title: `${categoryLabel} 인기곡 ${i + 1}`,
        artist: `아티스트 ${i + 1}`,
        thumbnailUrl: `https://i.ytimg.com/vi/dummy-video-${i}/mqdefault.jpg`,
        viewCount: Math.floor(Math.random() * 10000000),
      }));
      setChartData(dummyData);
      setLoading(false);
    }, 500);
  }, [category, categoryLabel]);

  const handlePlayMV = (videoId: string) => {
    // MV (뮤직비디오) 재생 - YouTube 영상 페이지로 이동
    window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
  };

  const handlePlayMR = (videoId: string) => {
    // MR (반주) 재생 - 추후 구현
    console.log(`[PopularChart] MR 재생 요청: ${videoId}`);
    // TODO: MR 링크 연결 로직 추가
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
      <div className={styles.sidebarContent}>
        {loading ? (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>{t('extChartLoading')}</p>
        ) : chartData.length === 0 ? (
          <p style={{ color: '#fff', textAlign: 'center', marginTop: '20px' }}>{t('extChartNoData')}</p>
        ) : (
          <div style={{ marginTop: '10px' }}>
            {chartData.map((item) => (
              <div
                key={item.videoId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                {/* 순위 */}
                <span
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    minWidth: '35px',
                    textAlign: 'center',
                    marginRight: '12px',
                  }}
                >
                  {item.rank}
                </span>

                {/* 곡 정보 */}
                <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                  <div className={acapellaStyles.marqueeContainer}>
                    <p
                      className={acapellaStyles.marqueeText}
                      style={{
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        margin: 0,
                      }}
                    >
                      {item.title} &nbsp;&nbsp;&nbsp; {item.title}
                    </p>
                  </div>
                  <p
                    style={{
                      color: '#ccc',
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

                {/* MV/MR 버튼 그룹 */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* MV 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayMV(item.videoId);
                    }}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#ff0000',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '50px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#cc0000';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff0000';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    MV
                  </button>

                  {/* MR 버튼 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayMR(item.videoId);
                    }}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '50px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1565c0';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1976d2';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    MR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
