import React from 'react';
import styles from './styles.module.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, className = '' }) => (
  <label className={`${styles.toggleWrap} ${className}`.trim()}>
    {label && <span className={styles.toggleLabel}>{label}</span>}
    <input type="checkbox" checked={checked} onChange={onChange} className={styles.toggleInput} />
    <span className={styles.toggleSlider}></span>
  </label>
);
