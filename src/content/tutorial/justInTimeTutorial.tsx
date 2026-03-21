// justInTimeTutorial.tsx
// Just-In-Time 튜토리얼 — 특정 기능을 처음 사용하는 순간 자동 1스텝 툴팁 표시
// Tutorial 5 (사이드바): 사이드바 첫 진입 시
// Tutorial 6 (점프): 가라오케 모드에서 간주 구간 감지 시

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { i18nInstance } from '@services/i18n';
import { STORAGE_KEYS } from '@constants/storageKeys';

const JIT_CONTAINER_ID = 'ytk-jit-tutorial-container';
const AUTO_HIDE_DELAY = 8000;

interface JitTutorialConfig {
  storageKey: string;
  titleKey: string;
  descKey: string;
  getPosition: () => string;
}

const jitConfigs: Record<string, JitTutorialConfig> = {
  sidebar: {
    storageKey: STORAGE_KEYS.TUTORIAL_SIDEBAR_COMPLETED,
    titleKey: 'extJitSidebarTitle',
    descKey: 'extJitSidebarDesc',
    getPosition: () => {
      const sidebar = document.querySelector('[class*="sidebarWrapper"]') as HTMLElement | null;
      if (sidebar) {
        const rect = sidebar.getBoundingClientRect();
        const top = rect.top + 80;
        const right = window.innerWidth - rect.left + 16;
        return `top: ${top}px; right: ${right}px;`;
      }
      return 'top: 200px; right: 380px;';
    },
  },
  jump: {
    storageKey: STORAGE_KEYS.TUTORIAL_JUMP_COMPLETED,
    titleKey: 'extJitJumpTitle',
    descKey: 'extJitJumpDesc',
    getPosition: () => {
      const bottomContainer = document.querySelector('.ytk-bottom-container') as HTMLElement | null;
      if (bottomContainer) {
        const rect = bottomContainer.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top + 20;
        return `bottom: ${bottom}px; left: 50%; transform: translateX(-50%);`;
      }
      return 'bottom: 150px; left: 50%; transform: translateX(-50%);';
    },
  },
};

/** JIT 툴팁 React 컴포넌트 */
interface JitTooltipProps {
  title: string;
  description: string;
  onDismiss: () => void;
}

const JitTooltip: React.FC<JitTooltipProps> = ({ title, description, onDismiss }) => (
  <div style={tooltipStyles.container}>
    <div style={tooltipStyles.header}>
      <span style={tooltipStyles.title}>{title}</span>
      <button type="button" onClick={onDismiss} style={tooltipStyles.closeBtn}>
        ✕
      </button>
    </div>
    <p style={tooltipStyles.desc}>{description}</p>
  </div>
);

const tooltipStyles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(20, 20, 35, 0.95)',
    border: '1px solid rgba(0, 212, 170, 0.3)',
    borderRadius: '10px',
    padding: '14px 16px',
    maxWidth: '280px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'fadeIn 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#00d4aa',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '2px',
    lineHeight: 1,
  },
  desc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
    lineHeight: '1.5',
  },
};

// 현재 활성화된 JIT 인스턴스 관리
let activeRoot: Root | null = null;
let activeContainer: HTMLElement | null = null;
let autoHideTimer: ReturnType<typeof setTimeout> | null = null;

function cleanup(): void {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
  if (activeRoot) {
    activeRoot.unmount();
    activeRoot = null;
  }
  if (activeContainer) {
    activeContainer.remove();
    activeContainer = null;
  }
}

/**
 * JIT 튜토리얼 표시 시도
 * 이미 완료된 경우 표시하지 않음
 */
export async function showJitTutorial(type: 'sidebar' | 'jump'): Promise<void> {
  const config = jitConfigs[type];

  // 이미 완료되었는지 확인
  const result = await chrome.storage.sync.get(config.storageKey);
  if (result[config.storageKey] === true) return;

  // 이미 다른 JIT가 표시 중이면 무시
  if (activeContainer) return;

  // 완료 표시 (한 번만 표시)
  chrome.storage.sync.set({ [config.storageKey]: true });

  // 컨테이너 생성
  const overlayContainer = document.querySelector('#full-bleed-container') ?? document.body;
  const container = document.createElement('div');
  container.id = JIT_CONTAINER_ID;
  container.style.cssText = `position: fixed; z-index: 99999; ${config.getPosition()}`;
  overlayContainer.appendChild(container);

  activeContainer = container;
  activeRoot = createRoot(container);
  activeRoot.render(
    <I18nextProvider i18n={i18nInstance}>
      <JitTooltipWrapper config={config} />
    </I18nextProvider>,
  );

  // 자동 숨김
  autoHideTimer = setTimeout(cleanup, AUTO_HIDE_DELAY);

  // 완료 이벤트 발행 (TutorialMenu 연동)
  window.dispatchEvent(
    new CustomEvent('tutorial-complete', { detail: { tutorialId: `tutorial${type === 'sidebar' ? '5' : '6'}` } }),
  );
}

/** i18n 컨텍스트 내에서 렌더링하기 위한 래퍼 */
const JitTooltipWrapper: React.FC<{ config: JitTutorialConfig }> = ({ config }) => {
  const { t } = useTranslation();
  return <JitTooltip title={t(config.titleKey)} description={t(config.descKey)} onDismiss={cleanup} />;
};
