// MusicNoteButton.tsx
import React from 'react';
import { useEffect } from 'react';
import styles from './styles.module.css';

interface Props {
  iconPath: string;
  contentEnabled: boolean;
  onClick?: () => void;
}

export const MusicNoteButton: React.FC<Props> = ({ iconPath, contentEnabled, onClick }) => {
  useEffect(() => {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (!rightControls || !contentEnabled) return;

    if (document.querySelector(`.${styles.musicNoteButton}`)) return;

    const autonavBtn = rightControls.querySelector('button[data-tooltip-target-id="ytp-autonav-toggle-button"]');

    const btn = document.createElement('button');
    btn.className = `${styles.musicNoteButton} ytp-button ytp-music-note-button`;
    btn.title = '노트';
    btn.setAttribute('aria-label', '노트');
    btn.tabIndex = 0;

    const iconImg = document.createElement('img');
    iconImg.src = iconPath;
    iconImg.alt = 'music note';
    iconImg.width = 24;
    iconImg.height = 24;
    iconImg.style.pointerEvents = 'none';
    iconImg.className = styles.icon || '';

    btn.appendChild(iconImg);

    btn.setAttribute('data-title', '노트');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick?.();
    });

    if (autonavBtn) {
      rightControls.insertBefore(btn, autonavBtn);
    } else {
      rightControls.insertBefore(btn, rightControls.firstChild);
    }

    return () => {
      btn.remove();
    };
  }, [iconPath, contentEnabled, onClick]);

  return null;
};
