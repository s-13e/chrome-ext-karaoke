/**
 * sidebarStyles.ts
 * 사이드바 공통 스타일 상수
 */

export const SIDEBAR_COLORS = {
  // 배경색
  background: '#1a1a1a',

  // 텍스트 색상
  textPrimary: '#ffffff',
  textSecondary: '#e0e0e0',
  textTertiary: '#bdbdbd',
  textMuted: '#9e9e9e',
  textDisabled: '#757575',

  // 버튼 색상
  primary: '#2196f3',
  primaryHover: '#1976d2',
  primaryActive: '#1565c0',

  secondary: 'rgba(255, 255, 255, 0.1)',
  secondaryHover: 'rgba(255, 255, 255, 0.2)',
  secondaryBorder: 'rgba(255, 255, 255, 0.2)',
  secondaryBorderHover: 'rgba(255, 255, 255, 0.3)',

  // YouTube 빨간색
  youtube: '#ff0000',
  youtubeHover: '#cc0000',

  // 녹음 버튼
  record: '#f44336',
  recordHover: '#d32f2f',

  // 배경 오버레이
  overlay05: 'rgba(255, 255, 255, 0.05)',
  overlay08: 'rgba(255, 255, 255, 0.08)',
  overlay10: 'rgba(255, 255, 255, 0.1)',
  overlay15: 'rgba(255, 255, 255, 0.15)',

  // 테두리
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(255, 255, 255, 0.2)',

  // 경고/상태 색상
  warning: '#ff9800',
  success: '#4caf50',
  error: '#f44336',
} as const;
