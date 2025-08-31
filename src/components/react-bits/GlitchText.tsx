import { CSSProperties, FC, ReactNode } from 'react';
import styles from './styles.module.css';

interface GlitchTextProps {
  children: ReactNode;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

export const GlitchText: FC<GlitchTextProps> = ({
  children,
  speed = 1,
  enableShadows = true,
  //enableOnHover = false,
  className = '',
}) => {
  const inlineStyles: CSSProperties & { [key: string]: string } = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-5px 0 red' : 'none',
    '--before-shadow': enableShadows ? '5px 0 cyan' : 'none',
  };

  //const hoverClass = enableOnHover ? 'enable-on-hover' : '';

  return (
    <div
      className={`${styles.glitch} ${className}`}
      style={inlineStyles}
      data-text={typeof children === 'string' ? children : undefined}
    >
      {children}
    </div>
  );
};
