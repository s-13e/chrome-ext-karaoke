// ToolbarKaraokeButton.tsx
// YouTube 상단 툴바(masthead)에 카라오케 모드 진입 버튼을 삽입하는 컴포넌트
// 기존 MusicNoteButton(플레이어 컨트롤 바)과 별도로 항상 노출되는 진입점 역할

import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';

/** YouTube 툴바 우측 버튼 영역 셀렉터 */
const TOOLBAR_END_SELECTOR = 'ytd-masthead #end';

const TOOLBAR_BTN_CLASS = 'ytk-toolbar-karaoke-btn';

interface ToolbarKaraokeButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

/**
 * YouTube 상단 툴바에 카라오케 토글 버튼을 삽입
 * - 알림 버튼 왼쪽에 배치
 * - 카라오케 모드 ON/OFF 상태에 따라 스타일 변경
 */
export const ToolbarKaraokeButton: React.FC<ToolbarKaraokeButtonProps> = ({ icon, isActive, onClick }) => {
  const { t } = useTranslation();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRootRef = useRef<ReactDOM.Root | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const insertButton = useCallback(() => {
    // 이미 DOM에 존재하면 스킵
    if (btnRef.current && document.contains(btnRef.current)) return;

    // YouTube 툴바 우측 영역 찾기
    const targetContainer = document.querySelector(TOOLBAR_END_SELECTOR);
    if (!targetContainer) return;

    // 기존 버튼 중복 방지
    document.querySelector(`.${TOOLBAR_BTN_CLASS}`)?.remove();

    const btn = document.createElement('button');
    btnRef.current = btn;
    btn.className = TOOLBAR_BTN_CLASS;
    btn.setAttribute('aria-label', t('extTooltipMusicNote'));
    btn.tabIndex = 0;

    // 스타일 적용 — YouTube 툴바에 어울리면서 눈에 띄는 틸 원형 버튼
    btn.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.25s ease;
      padding: 0;
      margin: 0 4px;
      background: #00d4aa;
      border: none;
      box-shadow: none;
    `;

    // 아이콘 렌더링
    if (iconRootRef.current) {
      const oldRoot = iconRootRef.current;
      iconRootRef.current = null;
      setTimeout(() => oldRoot.unmount(), 0);
    }
    iconRootRef.current = ReactDOM.createRoot(btn);
    iconRootRef.current.render(icon);

    // 클릭 이벤트
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });

    // hover 효과
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#00eebb';
      btn.style.boxShadow = '0 0 10px rgba(0, 212, 170, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#00d4aa';
      btn.style.boxShadow = 'none';
    });

    // + 만들기 버튼과 🔔 사이에 삽입
    const endContainer = document.querySelector('ytd-masthead #end');
    if (!endContainer) return;

    const notificationBtn = endContainer.querySelector('ytd-notification-topbar-button-renderer');
    if (notificationBtn) {
      notificationBtn.parentElement?.insertBefore(btn, notificationBtn);
    } else {
      // fallback: #end의 첫 번째 자식 앞에 삽입
      endContainer.insertBefore(btn, endContainer.firstChild);
    }
  }, [icon, onClick, t]);

  // 버튼 활성 상태 스타일 업데이트
  useEffect(() => {
    if (!btnRef.current) return;
    if (isActive) {
      btnRef.current.style.background = '#00d4aa';
      btnRef.current.style.boxShadow = '0 0 10px rgba(0, 212, 170, 0.5)';
    } else {
      btnRef.current.style.background = '#00d4aa';
      btnRef.current.style.boxShadow = 'none';
    }
  }, [isActive]);

  // 아이콘 업데이트
  useEffect(() => {
    if (iconRootRef.current && btnRef.current && document.contains(btnRef.current)) {
      iconRootRef.current.render(icon);
    }
  }, [icon]);

  // DOM 삽입 + MutationObserver
  useEffect(() => {
    insertButton();

    // YouTube SPA 네비게이션 시 툴바가 재생성될 수 있으므로 관찰
    const observer = new MutationObserver(() => {
      if (!btnRef.current || !document.contains(btnRef.current)) {
        insertButton();
      }
    });

    const masthead = document.querySelector('ytd-masthead');
    if (masthead) {
      observer.observe(masthead, { childList: true, subtree: true });
      observerRef.current = observer;
    }

    return () => {
      observer.disconnect();
      if (btnRef.current) {
        btnRef.current.remove();
        btnRef.current = null;
      }
      if (iconRootRef.current) {
        const oldRoot = iconRootRef.current;
        iconRootRef.current = null;
        setTimeout(() => oldRoot.unmount(), 0);
      }
    };
  }, [insertButton]);

  return null;
};
