// TutorialMenu.tsx
// 튜토리얼 메뉴 컴포넌트 — 카테고리 + 서브 메뉴 구조
// Lyrics 카테고리는 서브 항목 (가사 보기, 구간 반복, 건너뛰기, 싱크)을 포함

import React, { useState, useEffect } from 'react';
import { MdCheckCircle, MdPlayCircleOutline, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './TutorialMenu.module.css';
import { STORAGE_KEYS } from '@constants/storageKeys';

interface TutorialMenuProps {
  onBack: () => void;
}

interface TutorialSubItem {
  id: string;
  storageKey: string;
  titleKey: string;
  descKey: string;
}

interface TutorialItem {
  id: string;
  storageKey: string;
  titleKey: string;
  descKey: string;
  icon: string;
  subItems?: TutorialSubItem[];
}

const TUTORIAL_ITEMS: TutorialItem[] = [
  {
    id: 'tutorialLyrics',
    storageKey: STORAGE_KEYS.TUTORIAL_LYRICS_COMPLETED,
    titleKey: 'extTutorialLyricsTitle',
    descKey: 'extTutorialLyricsDesc',
    icon: '🎵',
    subItems: [
      {
        id: 'tutorialLyricsView',
        storageKey: STORAGE_KEYS.TUTORIAL_LYRICS_COMPLETED,
        titleKey: 'extTutorialLyricsViewTitle',
        descKey: 'extTutorialLyricsViewDesc',
      },
      {
        id: 'tutorialLyricsLoop',
        storageKey: STORAGE_KEYS.TUTORIAL_LOOP_COMPLETED,
        titleKey: 'extTutorialLyricsLoopTitle',
        descKey: 'extTutorialLyricsLoopDesc',
      },
      {
        id: 'tutorialLyricsSkip',
        storageKey: STORAGE_KEYS.TUTORIAL_JUMP_COMPLETED,
        titleKey: 'extTutorialLyricsSkipTitle',
        descKey: 'extTutorialLyricsSkipDesc',
      },
      {
        id: 'tutorialLyricsSync',
        storageKey: STORAGE_KEYS.TUTORIAL_SYNC_COMPLETED,
        titleKey: 'extTutorialLyricsSyncTitle',
        descKey: 'extTutorialLyricsSyncDesc',
      },
    ],
  },
  {
    id: 'tutorialSearch',
    storageKey: STORAGE_KEYS.TUTORIAL_SEARCH_COMPLETED,
    titleKey: 'extTutorialSearchTitle',
    descKey: 'extTutorialSearchDesc',
    icon: '🔍',
  },
  {
    id: 'tutorialRecording',
    storageKey: STORAGE_KEYS.TUTORIAL_RECORDING_COMPLETED,
    titleKey: 'extTutorialRecordingTitle',
    descKey: 'extTutorialRecordingDesc',
    icon: '🎤',
  },
  {
    id: 'tutorialTune',
    storageKey: STORAGE_KEYS.TUTORIAL_TUNE_COMPLETED,
    titleKey: 'extTutorialTuneTitle',
    descKey: 'extTutorialTuneDesc',
    icon: '🎛️',
  },
  {
    id: 'tutorialSettings',
    storageKey: STORAGE_KEYS.TUTORIAL_SETTINGS_COMPLETED,
    titleKey: 'extTutorialSettingsTitle',
    descKey: 'extTutorialSettingsDesc',
    icon: '⚙️',
  },
];

/** 모든 storage key 수집 (서브 항목 포함) */
function getAllStorageKeys(): string[] {
  const keys: string[] = [];
  TUTORIAL_ITEMS.forEach((item) => {
    keys.push(item.storageKey);
    item.subItems?.forEach((sub) => {
      if (!keys.includes(sub.storageKey)) keys.push(sub.storageKey);
    });
  });
  return keys;
}

export const TutorialMenu: React.FC<TutorialMenuProps> = ({ onBack: _onBack }) => {
  const { t } = useTranslation();
  const [completedTutorials, setCompletedTutorials] = useState<Record<string, boolean>>({});
  const [activeTutorialId, setActiveTutorialId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // 완료 상태 로드
  useEffect(() => {
    const loadCompletedStatus = async () => {
      const storageKeys = getAllStorageKeys();
      const result = await chrome.storage.sync.get(storageKeys);

      const completed: Record<string, boolean> = {};
      TUTORIAL_ITEMS.forEach((item) => {
        if (item.subItems) {
          // 카테고리: 모든 서브 항목이 완료되면 카테고리도 완료
          item.subItems.forEach((sub) => {
            completed[sub.id] = (result[sub.storageKey] as boolean | undefined) ?? false;
          });
          completed[item.id] = item.subItems.every((sub) => (result[sub.storageKey] as boolean | undefined) ?? false);
        } else {
          completed[item.id] = (result[item.storageKey] as boolean | undefined) ?? false;
        }
      });
      setCompletedTutorials(completed);
    };

    loadCompletedStatus();
  }, []);

  // 튜토리얼 완료/취소 이벤트
  useEffect(() => {
    const handleTutorialComplete = (e: Event) => {
      const { tutorialId } = (e as CustomEvent<{ tutorialId: string }>).detail;
      setCompletedTutorials((prev) => ({ ...prev, [tutorialId]: true }));
      setActiveTutorialId(null);

      // 서브 항목 storage 저장
      TUTORIAL_ITEMS.forEach((item) => {
        item.subItems?.forEach((sub) => {
          if (sub.id === tutorialId) {
            chrome.storage.sync.set({ [sub.storageKey]: true });
          }
        });
        if (item.id === tutorialId) {
          chrome.storage.sync.set({ [item.storageKey]: true });
        }
      });
    };

    const handleTutorialCancel = () => setActiveTutorialId(null);

    window.addEventListener('tutorial-complete', handleTutorialComplete);
    window.addEventListener('tutorial-cancel', handleTutorialCancel);
    return () => {
      window.removeEventListener('tutorial-complete', handleTutorialComplete);
      window.removeEventListener('tutorial-cancel', handleTutorialCancel);
    };
  }, []);

  const startTutorial = (id: string) => {
    if (activeTutorialId) return;
    setActiveTutorialId(id);
    window.dispatchEvent(new CustomEvent('start-tutorial', { detail: { tutorialId: id } }));
  };

  const toggleCategory = (categoryId: string) => {
    if (activeTutorialId) return;
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.tutorialList}>
          {TUTORIAL_ITEMS.map((item) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedCategory === item.id;
            const isCompleted = completedTutorials[item.id];
            const isActive = activeTutorialId === item.id;
            const isDisabled = activeTutorialId !== null && !isActive;

            return (
              <div key={item.id}>
                {/* 메인 항목 */}
                <button
                  className={`${styles.tutorialItem} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''}`}
                  onClick={() => (hasSubItems ? toggleCategory(item.id) : startTutorial(item.id))}
                  disabled={isDisabled}
                >
                  <span className={styles.itemIcon}>{item.icon}</span>
                  <div className={styles.itemText}>
                    <span className={styles.itemTitle}>{t(item.titleKey)}</span>
                    <span className={styles.itemDesc}>{t(item.descKey)}</span>
                  </div>
                  <span className={styles.itemStatus}>
                    {isActive ? (
                      <MdPlayCircleOutline size={20} className={styles.playingIcon} />
                    ) : hasSubItems ? (
                      isExpanded ? (
                        <MdExpandLess size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      ) : (
                        <MdExpandMore size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      )
                    ) : isCompleted ? (
                      <MdCheckCircle size={20} className={styles.checkIcon} />
                    ) : null}
                  </span>
                </button>

                {/* 서브 항목 */}
                {hasSubItems && isExpanded && (
                  <div className={styles.subItemList}>
                    {item.subItems?.map((sub) => {
                      const subCompleted = completedTutorials[sub.id];
                      const subActive = activeTutorialId === sub.id;
                      const subDisabled = activeTutorialId !== null && !subActive;

                      return (
                        <button
                          key={sub.id}
                          className={`${styles.subItem} ${subCompleted ? styles.completed : ''} ${subActive ? styles.active : ''}`}
                          onClick={() => startTutorial(sub.id)}
                          disabled={subDisabled}
                        >
                          <div className={styles.subItemText}>
                            <span className={styles.subItemTitle}>{t(sub.titleKey)}</span>
                          </div>
                          <span className={styles.itemStatus}>
                            {subActive ? (
                              <MdPlayCircleOutline size={16} className={styles.playingIcon} />
                            ) : subCompleted ? (
                              <MdCheckCircle size={16} className={styles.checkIcon} />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
