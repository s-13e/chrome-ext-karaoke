// ChartCategoryMenu.tsx
// 차트 카테고리 선택 화면
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBackIosNew } from 'react-icons/md';
import { ChartCategory, CHART_CATEGORIES } from '@lib/types/chart';
import styles from '../styles.module.css';
import acapellaStyles from './AcapellaRecording.module.css';

interface ChartCategoryMenuProps {
  onBackToMain: () => void;
  onSelectCategory: (category: ChartCategory) => void;
}

/**
 * 차트 카테고리 선택 메뉴
 * - 사용자가 보고 싶은 차트 카테고리를 선택
 * - 글로벌 TOP 100, 트렌딩, K-POP 등 다양한 카테고리 제공
 */
export const ChartCategoryMenu: React.FC<ChartCategoryMenuProps> = ({ onBackToMain, onSelectCategory }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* 헤더: 뒤로가기 버튼 */}
      <div className={acapellaStyles.header}>
        <button className={acapellaStyles.backButton} onClick={onBackToMain} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={acapellaStyles.title}>{t('extChartSelectCategory')}</h2>
      </div>

      {/* 차트 카테고리 버튼들 */}
      <div className={styles.sidebarContent}>
        {CHART_CATEGORIES.map((category) => (
          <button key={category.id} className={styles.sidebarButton} onClick={() => onSelectCategory(category.id)}>
            {t(category.labelKey)}
          </button>
        ))}
      </div>
    </>
  );
};
