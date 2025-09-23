// 1차 메뉴
import React, { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '@components/icons/ArrowIcon';
import styles from './MainMenu.module.css';
import { IconFont } from '@components/icons/FontIcon';
import { IconDisplay } from '@components/icons/DisplayIcon';
import { IconLyricsSync } from '@components/icons/IconLyricsSync';
import { Line } from '@lib/types/lyrics';
import { LyricsOffsetMenu } from './LyricsOffsetMenu';
import { LyricsDisplayMenu } from './LyricsDisplayMenu';
import { FontStyleMenu } from './FontStyleMenu';
import { AdvancedSettingsMenu } from './AdvancedSettingsMenu';

interface Position {
  top: number;
  left: number;
}

interface MainMenuProps {
  visible: boolean;
  position?: Position;
  onClose: () => void;
  offset: number;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
}

// MainMenu.tsx (메뉴 컨테이너 및 1차 메뉴 관리)
export const MainMenu: React.FC<MainMenuProps> = ({ visible, position, onClose, offset, setOffset }) => {
  const [baseLyrics, setBaseLyrics] = useState<Line[]>([]); // 원본 가사
  const [, setOriginalLyrics] = useState<Line[]>([]); // 현재 반영 중인 가사
  const [currentSubMenu, setCurrentSubMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastOffset = useRef<number | null>(null);

  // 메뉴 외부 클릭 감지해서 닫기
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, onClose]);

  // visible false 시 드릴다운 상태 초기화
  useEffect(() => {
    if (!visible) {
      setCurrentSubMenu(null);
    }
  }, [visible]);

  // 메시지 방식: visible 상태가 true 될 때 가사 최신 데이터 요청
  useEffect(() => {
    function handleLyricsReady(msg: { type?: string }) {
      if (msg.type === 'LYRICS_READY') {
        if (visible) {
          requestLatestLyrics();
        }
      }
    }
    chrome.runtime.onMessage.addListener(handleLyricsReady);
    return () => chrome.runtime.onMessage.removeListener(handleLyricsReady);
  }, [visible]);

  // 최신 가사 요청 함수
  const requestLatestLyrics = () => {
    chrome.runtime.sendMessage({ type: 'GET_LATEST_LYRICS' }, (res) => {
      if (chrome.runtime.lastError) {
        console.warn('[MainMenu] GET_LATEST_LYRICS 실패:', chrome.runtime.lastError.message);
        return;
      }
      const lyrics = res?.lyrics || [];
      setBaseLyrics(lyrics);
      setOriginalLyrics(lyrics);
    });
  };

  // 메뉴가 열릴 때 항상 최신 상태 확보
  useEffect(() => {
    if (visible) {
      requestLatestLyrics();
    }
  }, [visible]);

  return (
    <div
      ref={menuRef}
      className={styles.container}
      style={{
        position: 'absolute',
        top: position?.top,
        left: position?.left,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {currentSubMenu === null && (
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyricsOffset')}>
              <span className={styles.menuButtonLeft}>
                <IconLyricsSync className="menuIcon" width={20} height={20} color="white" />
                <span className={styles.menuButtonText}>가사 싱크</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('lyrics')}>
              <span className={styles.menuButtonLeft}>
                <IconDisplay className="menuIcon" width={20} height={20} color="white" />
                <span className={styles.menuButtonText}>가사 표시</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('font')}>
              <span className={styles.menuButtonLeft}>
                <IconFont className="menuIcon" width={20} height={20} color="white" />
                <span className={styles.menuButtonText}>글꼴</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
          <li className={styles.menuItem}>
            <button className={styles.menuButton} onClick={() => setCurrentSubMenu('advanced')}>
              <span className={styles.menuButtonLeft}>
                <span className={styles.menuButtonText}>기타</span>
              </span>
              <ArrowIcon size={14} className="arrowIcon" direction="right" style={{ marginRight: 12 }} />
            </button>
          </li>
        </ul>
      )}
      {currentSubMenu === 'lyricsOffset' && (
        <LyricsOffsetMenu
          originalLyrics={baseLyrics} // 항상 원본을 전달
          offset={offset} // 저장된 값 내려줌
          onBack={() => setCurrentSubMenu(null)}
          onOffsetChange={(newOffset, offsetLyrics) => {
            if (lastOffset.current === newOffset) return; // 같은 값이면 무시
            lastOffset.current = newOffset;

            setOffset(newOffset); // ✅ offset state 반영
            setOriginalLyrics(offsetLyrics); // dual/full 가사도 즉시 반영
          }}
        />
      )}
      {currentSubMenu === 'lyrics' && <LyricsDisplayMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'font' && <FontStyleMenu onBack={() => setCurrentSubMenu(null)} />}
      {currentSubMenu === 'advanced' && <AdvancedSettingsMenu onBack={() => setCurrentSubMenu(null)} />}
    </div>
  );
};
