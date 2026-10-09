import React, { useEffect, useId, useState } from 'react';
import { isHexColor } from '../../utils/color';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-muted">
        {label}
      </label>
      <div className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-2 pl-1.5 pr-2 focus-within:border-accent">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={isHexColor(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" />
        
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (isHexColor(e.target.value)) onChange(e.target.value);
          }}
          onBlur={() => setDraft(value)}
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-xs uppercase tabular-nums text-ink focus:outline-none" />
        
      </div>
    </div>);

}