import React from 'react';
import styles from './Select.module.css';

interface SelectOption { value: string; label: string; disabled?: boolean; }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, hint, id, ...props }, ref) => {
    const selectId = id ?? `select-${Math.random().toString(36).slice(2)}`;
    return (
      <div className={styles.wrapper}>
        {label && <label htmlFor={selectId} className={styles.label}>{label}</label>}
        <div className={styles.selectWrap}>
          <select ref={ref} id={selectId} className={`${styles.select} ${error ? styles.hasError : ''}`} {...props}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
            ))}
          </select>
          <span className={styles.arrow} aria-hidden="true">▾</span>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {hint && !error && <p className={styles.hint}>{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
