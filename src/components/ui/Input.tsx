import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, variant = 'default', className = '', id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`;
    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {props.required && <span className={styles.required} aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={`${styles.inputWrap} ${error ? styles.hasError : ''}`}>
          {leftIcon && <span className={styles.iconLeft} aria-hidden="true">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={[styles.input, leftIcon ? styles.hasLeft : '', rightIcon ? styles.hasRight : '', className].filter(Boolean).join(' ')}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            aria-invalid={!!error}
            {...props}
          />
          {rightIcon && <span className={styles.iconRight} aria-hidden="true">{rightIcon}</span>}
        </div>
        {error && <p id={`${inputId}-error`} className={styles.error} role="alert">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
