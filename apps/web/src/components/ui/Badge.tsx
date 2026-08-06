import React from 'react';
import type { BadgeVariant, Size } from '../../types';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: Extract<Size, 'sm' | 'md' | 'lg'>;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', size = 'md', children, dot, className = '' }) => (
  <span className={[styles.badge, styles[`badge--${variant}`], styles[`badge--${size}`], className].filter(Boolean).join(' ')}>
    {dot && <span className={styles.dot} aria-hidden="true" />}
    {children}
  </span>
);

export default Badge;
