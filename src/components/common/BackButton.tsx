import React from 'react';
import { ArrowIcon } from '@components/icons/ArrowIcon';

interface BackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  flip?: boolean;
  arrowColor?: string;
  transparentBackground?: boolean;
  style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  ariaLabel = 'Back',
  className = '',
  flip = false,
  arrowColor = '#fff',
  transparentBackground = false,
  style,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: 16,
        height: 16,
        padding: 0,
        marginLeft: 10,
        marginRight: 10,
        border: 'none',
        background: transparentBackground ? 'transparent' : undefined,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: flip ? 'scaleX(-1)' : undefined,
        ...style,
      }}
      className={`backButton ${className}`.trim()}
    >
      <ArrowIcon color={arrowColor} direction="left" />
    </button>
  );
};
