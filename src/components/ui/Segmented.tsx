import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
}

interface SegmentedProps<T extends string | number> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

export function Segmented<T extends string | number>({ value, options, onChange, label, className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={twMerge('flex rounded-lg border border-line bg-surface-2 p-0.5', className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.ariaLabel}
            title={o.ariaLabel}
            onClick={() => onChange(o.value)}
            className={twMerge(
              'flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
              active ? 'bg-surface-3 text-ink' : 'text-ink-muted hover:text-ink'
            )}>
            
            {o.label}
          </button>);

      })}
    </div>);

}