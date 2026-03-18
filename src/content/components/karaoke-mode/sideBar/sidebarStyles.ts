/**
 * sidebarStyles.ts
 * 사이드바 공통 스타일 상수 — 네온 틸 테마
 */

export const SIDEBAR_COLORS = {
  // 배경색
  background: '#141420',

  // 텍스트 색상
  textPrimary: '#ffffff',
  textSecondary: '#e0e0e0',
  textTertiary: '#bdbdbd',
  textMuted: '#9e9e9e',
  textDisabled: '#757575',

  // 버튼 색상 (틸/민트 네온)
  primary: '#00d4aa',
  primaryHover: '#00b894',
  primaryActive: '#009d7e',

  secondary: 'rgba(255, 255, 255, 0.1)',
  secondaryHover: 'rgba(255, 255, 255, 0.2)',
  secondaryBorder: 'rgba(255, 255, 255, 0.2)',
  secondaryBorderHover: 'rgba(255, 255, 255, 0.3)',

  // 네온 악센트
  neonGlow: '#00d4aa',
  neonPink: '#e879a0',
  neonYellow: '#d4c940',

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
