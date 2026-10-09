import React, { useId } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-ink-subtle">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
        checked ? 'bg-accent' : 'bg-surface-3'}`
        }>
        
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-150 ease-out ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`
          } />
        
      </button>
    </div>);

}