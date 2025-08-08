import React from 'react';

interface IconDisplayProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({
  width = 24,
  height = 24,
  color = '#000',
  className = '',
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Display Icon"
    className={className}
  >
    <rect x="8" y="12" width="32" height="24" stroke={color} strokeWidth="4" rx="2" ry="2" />
    <rect x="16" y="20" width="16" height="8" fill={color} />
    <line x1="24" y1="36" x2="24" y2="40" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);
