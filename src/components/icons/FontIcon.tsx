import React from 'react';

interface IconFontProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const IconFont: React.FC<IconFontProps> = ({ width = 24, height = 24, color = '#000', className = '' }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Font Icon"
    className={className}
  >
    <rect width="48" height="48" fill="none" />
    <path d="M9 8h30M24 8v32M17 40h14" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
