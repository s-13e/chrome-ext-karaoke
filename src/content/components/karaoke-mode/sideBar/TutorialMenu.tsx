// TutorialMenu.tsx
// 튜토리얼 메뉴 컴포넌트 - 개별 튜토리얼 선택 및 진행 상태 표시
import React, { useState, useEffect } from 'react';
import { MdArrowBackIosNew, MdCheckCircle, MdPlayCircleOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './TutorialMenu.module.css';
import { STORAGE_KEYS } from '@constants/storageKeys';

interface TutorialMenuProps {
  onBack: () => void;
}

// 튜토리얼 항목 정의
interface TutorialItem {
  id: string;
  storageKey: string;
  titleKey: string;
  descKey: string;
  icon: string;
}

const TUTORIAL_ITEMS: TutorialItem[] = [
  {
    id: 'tutorial1',
    storageKey: STORAGE_KEYS.TUTORIAL_STEP1_COMPLETED,
    titleKey: 'extTutorial1Title',
    descKey: 'extTutorial1Desc',
    icon: '🎵',
  },
  {
    id: 'tutorial2',
    storageKey: 'tutorial_sync_completed',
    titleKey: 'extTutorial2Title',
    descKey: 'extTutorial2Desc',
    icon: '⏱️',
  },
  {
    id: 'tutorial3',
    storageKey: 'tutorial_loop_completed',
    titleKey: 'extTutorial3Title',
    descKey: 'extTutorial3Desc',
    icon: '🔁',
  },
  {
    id: 'tutorial4',
    storageKey: 'tutorial_custom_lyrics_completed',
    titleKey: 'extTutorial4Title',
    descKey: 'extTutorial4Desc',
    icon: '🎨',
  },
  {
    id: 'tutorial5',
    storageKey: 'tutorial_sidebar_completed',
    titleKey: 'extTutorial5Title',
    descKey: 'extTutorial5Desc',
    icon: '📂',
  },
  {
    id: 'tutorial6',
    storageKey: 'tutorial_jump_completed',
    titleKey: 'extTutorial6Title',
    descKey: 'extTutorial6Desc',
    icon: '⏭️',
  },
];

/**
 * 튜토리얼 메뉴 컴포넌트
 * - 개별 튜토리얼 선택
 * - 완료 상태 표시 (초록색)
 * - 진행 중 다른 버튼 비활성화
 */
export const TutorialMenu: React.FC<TutorialMenuProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [completedTutorials, setCompletedTutorials] = useState<Record<string, boolean>>({});
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);

  // 완료 상태 로드
  useEffect(() => {
    const loadCompletedStatus = async () => {
      const storageKeys = TUTORIAL_ITEMS.map((item) => item.storageKey);
      const result = await chrome.storage.sync.get(storageKeys);

      const completed: Record<string, boolean> = {};
      TUTORIAL_ITEMS.forEach((item) => {
        // tutorial1은 튜토리얼 메뉴에 접근했다는 것 자체가 목표 달성 (항상 완료 표시)
        if (item.id === 'tutorial1') {
          completed[item.id] = true;
        } else {
          completed[item.id] = result[item.storageKey] ?? false;
        }
      });
      setCompletedTutorials(completed);
    };

    loadCompletedStatus();
  }, []);

  // 튜토리얼 완료 이벤트 리스너
  useEffect(() => {
    const handleTutorialComplete = (e: Event) => {
      const customEvent = e as CustomEvent<{ tutorialId: string }>;
      const { tutorialId } = customEvent.detail;
      console.log('[TutorialMenu] 튜토리얼 완료:', tutorialId);

      setCompletedTutorials((prev) => ({
        ...prev,
        [tutorialId]: true,
      }));
      setActiveTutorialId(null);

      // 스토리지에 저장
      const item = TUTORIAL_ITEMS.find((t) => t.id === tutorialId);
      if (item) {
        chrome.storage.sync.set({ [item.storageKey]: true });
      }
    };

    const handleTutorialCancel = () => {
      console.log('[TutorialMenu] 튜토리얼 취소');
      setActiveTutorialId(null);
    };

    window.addEventListener('tutorial-complete', handleTutorialComplete);
    window.addEventListener('tutorial-cancel', handleTutorialCancel);

    return () => {
      window.removeEventListener('tutorial-complete', handleTutorialComplete);
      window.removeEventListener('tutorial-cancel', handleTutorialCancel);
    };
  }, []);

  const handleTutorialClick = (item: TutorialItem) => {
    if (activeTutorialId) return; // 이미 진행 중이면 무시

    console.log('[TutorialMenu] 튜토리얼 시작:', item.id);
    setActiveTutorialId(item.id);

    // 튜토리얼 시작 이벤트 발송
    window.dispatchEvent(
      new CustomEvent('start-tutorial', {
        detail: { tutorialId: item.id },
      }),
    );
  };

  // 뒤로가기 시 진행 중인 튜토리얼 취소
  const handleBack = () => {
    if (activeTutorialId) {
      console.log('[TutorialMenu] 뒤로가기 - 튜토리얼 취소');
      window.dispatchEvent(new CustomEvent('tutorial-cancel'));
    }
    onBack();
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack} aria-label="뒤로가기">
          <MdArrowBackIosNew size={20} />
        </button>
        <h2 className={styles.title}>{t('extTutorialTitle')}</h2>
      </div>

      {/* 튜토리얼 목록 */}
      <div className={styles.content}>
        <p className={styles.description}>{t('extTutorialMenuDesc')}</p>

        <div className={styles.tutorialList}>
          {TUTORIAL_ITEMS.map((item) => {
            const isCompleted = completedTutorials[item.id];
            const isActive = activeTutorialId === item.id;
            const isDisabled = activeTutorialId !== null && !isActive;

            return (
              <button
                key={item.id}
                className={`${styles.tutorialItem} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}
                onClick={() => handleTutorialClick(item)}
                disabled={isDisabled}
              >
                <span className={styles.itemIcon}>{item.icon}</span>
                <div className={styles.itemText}>
                  <span className={styles.itemTitle}>{t(item.titleKey)}</span>
                  <span className={styles.itemDesc}>{t(item.descKey)}</span>
                </div>
                <span className={styles.itemStatus}>
                  {isActive ? (
                    <MdPlayCircleOutline size={24} className={styles.playingIcon} />
                  ) : isCompleted ? (
                    <MdCheckCircle size={24} className={styles.checkIcon} />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
