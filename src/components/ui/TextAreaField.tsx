import React, { useId } from 'react';
import { inputClass } from '../../utils/ui';

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
  softLimit?: number;
}

export function TextAreaField({ label, value, onChange, rows = 3, placeholder, hint, softLimit }: TextAreaFieldProps) {
  const id = useId();
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const over = softLimit !== undefined && words > softLimit;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
        {softLimit !== undefined &&
        <span className={`text-[11px] tabular-nums ${over ? 'text-warning' : 'text-ink-subtle'}`}>
            {words} / {softLimit} words
          </span>
        }
      </div>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-y leading-relaxed`} />
      
      {hint && <p className="mt-1 text-[11px] text-ink-subtle">{hint}</p>}
    </div>);

}