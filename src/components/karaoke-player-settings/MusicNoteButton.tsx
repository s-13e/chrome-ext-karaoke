// MusicNoteButton.tsx
import React, { useRef } from 'react';
import { useEffect } from 'react';
import styles from './styles.module.css';

interface Props {
  iconPath: string;
  contentEnabled: boolean;
  menuVisible: boolean; // 추가된 prop
  onClick?: () => void;
}
export const MusicNoteButton: React.FC<Props> = ({ iconPath, contentEnabled, menuVisible, onClick }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls || !contentEnabled) return;
    if (document.querySelector(`.${styles.musicNoteButton}`)) return;

    const captionsBtn = rightControls.querySelector('.ytp-subtitles-button');
    const settingsBtn = rightControls.querySelector('.ytp-settings-button');
    const btn = document.createElement('button');
    btnRef.current = btn;

    btn.className = `${styles.musicNoteButton} ytp-button ytp-music-note-button`;
    btn.setAttribute('aria-label', '노트');
    btn.tabIndex = 0;

    const iconImg = document.createElement('img');
    iconImg.src = iconPath;
    iconImg.alt = 'music note';
    iconImg.className = styles.icon || '';
    btn.appendChild(iconImg);

    btn.setAttribute('data-tooltip', '노트');

    // 클릭 이벤트: toggle clicked 클래스 + onClick 호출
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 클릭 시 클래스 토글은 지금 상태와 메뉴 상태 때문에 불필요, 아래 useEffect로 상태 반영 권장
      onClick?.();
    });

    // 외부 클릭 시 clicked 클래스 제거 (툴팁 숨김 해제용)
    const handleBodyClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && !btn.contains(target)) {
        btn.classList.remove('clicked');
      }
    };

    document.body.addEventListener('click', handleBodyClick);

    // 버튼 위치 지정
    if (captionsBtn) {
      captionsBtn.after(btn);
    } else if (settingsBtn) {
      settingsBtn.after(btn);
    } else {
      rightControls.appendChild(btn);
    }

    // Cleanup
    return () => {
      btn.remove();
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, [iconPath, contentEnabled, onClick]);

  // menuVisible 상태에 따라 클래스와 data 속성 조절
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.classList.toggle('clicked', menuVisible);
    btn.setAttribute('data-menu-visible', menuVisible ? 'true' : 'false');
  }, [menuVisible]);

  return null;
};
