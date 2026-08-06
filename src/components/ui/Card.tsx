import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  as?: React.ElementType;
}

const Card: React.FC<CardProps> = ({
  children, className = '',
  padding = 'md', shadow = 'sm',
  border = true, hover = false,
  as: Tag = 'div',
}) => (
  <Tag className={[
    styles.card,
    styles[`card--pad-${padding}`],
    shadow !== 'none' ? styles[`card--shadow-${shadow}`] : '',
    border ? styles['card--border'] : '',
    hover ? styles['card--hover'] : '',
    className,
  ].filter(Boolean).join(' ')}>
    {children}
  </Tag>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${styles.cardHeader} ${className}`}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${styles.cardBody} ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${styles.cardFooter} ${className}`}>{children}</div>
);

export default Card;
