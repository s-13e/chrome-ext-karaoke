import React from 'react';
import { ArrowIcon } from '@components/icons/ArrowIcon';

interface BackButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  flip?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  ariaLabel = '뒤로',
  className = '',
  flip = false,
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
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
      className={`backButton ${className}`.trim()}
    >
      <ArrowIcon direction="left" />
    </button>
  );
};
