import React from 'react';

interface IconLyricsSyncProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const IconLyricsSync: React.FC<IconLyricsSyncProps> = ({
  width = 24,
  height = 24,
  color = '#222', // 기본 색상
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Lyrics Sync Icon"
    className={className}
  >
    {/* 바깥 원 테두리 */}
    <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="3" fill="none" />
    {/* 상단 슬라이더 */}
    <line x1="14" y1="18" x2="32" y2="18" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="18" r="4" stroke={color} strokeWidth="3" fill="none" />
    {/* 하단 슬라이더 */}
    <line x1="14" y1="30" x2="32" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <circle cx="14" cy="30" r="4" stroke={color} strokeWidth="3" fill="none" />
  </svg>
);
