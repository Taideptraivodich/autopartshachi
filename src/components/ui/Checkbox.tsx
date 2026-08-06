import React from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, className = '', ...props }, ref) => {
    const checkId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`;
    return (
      <div className={styles.wrapper}>
        <input ref={ref} type="checkbox" id={checkId} className={styles.input} {...props} />
        {label && (
          <label htmlFor={checkId} className={styles.label}>
            <span>{label}</span>
            {description && <span className={styles.description}>{description}</span>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
