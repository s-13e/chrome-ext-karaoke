// src/components/icons/ArrowIcon.tsx
import React from 'react';

interface ArrowIconProps {
  direction?: 'right' | 'left' | 'up' | 'down';
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ArrowIcon: React.FC<ArrowIconProps> = ({
  direction = 'right',
  size = 16,
  color = '#fff',
  className = '',
  style = {},
}) => {
  let transform = '';
  switch (direction) {
    case 'left':
      transform = 'scaleX(-1)';
      break;
    case 'up':
      transform = 'rotate(-90deg)';
      break;
    case 'down':
      transform = 'rotate(90deg)';
      break;
    case 'right':
    default:
      transform = '';
      break;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ verticalAlign: 'middle', display: 'block', transform, ...style }}
      aria-hidden="true"
    >
      <path d="M8 4l8 8-8 8" />
    </svg>
  );
};
