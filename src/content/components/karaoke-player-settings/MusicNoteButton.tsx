// MusicNoteButton.tsx
import React, { ReactNode, useRef } from 'react';
import { useEffect } from 'react';
import styles from './styles.module.css';
import ReactDOM from 'react-dom/client';

interface Props {
  icon: ReactNode;
  contentEnabled: boolean;
  menuVisible: boolean;
  onClick?: () => void;
}
export const MusicNoteButton: React.FC<Props> = ({ icon, contentEnabled, menuVisible, onClick }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRootRef = useRef<ReactDOM.Root | null>(null);

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
    btn.setAttribute('data-tooltip', '노트');
    btn.tabIndex = 0;

    iconRootRef.current = ReactDOM.createRoot(btn);
    iconRootRef.current.render(icon);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
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
      iconRootRef.current?.unmount();
      btn.remove();
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, [icon, contentEnabled, onClick]);

  // menuVisible 상태에 따라 클래스와 data 속성 조절
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.classList.toggle('clicked', menuVisible);
    btn.setAttribute('data-menu-visible', menuVisible ? 'true' : 'false');
  }, [menuVisible]);

  return null;
};
