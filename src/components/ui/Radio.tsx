import React from 'react';
import styles from './Radio.module.css';

interface RadioOption { value: string; label: string; description?: string; disabled?: boolean; }

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  direction?: 'vertical' | 'horizontal';
}

const RadioGroup: React.FC<RadioGroupProps> = ({ name, options, value, onChange, label, direction = 'vertical' }) => (
  <fieldset className={styles.fieldset}>
    {label && <legend className={styles.legend}>{label}</legend>}
    <div className={`${styles.group} ${styles[direction]}`}>
      {options.map((opt) => (
        <label key={opt.value} className={`${styles.option} ${opt.disabled ? styles.disabled : ''}`}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            disabled={opt.disabled}
            onChange={() => onChange?.(opt.value)}
            className={styles.input}
          />
          <span className={styles.labelText}>
            {opt.label}
            {opt.description && <span className={styles.description}>{opt.description}</span>}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);

export default RadioGroup;
