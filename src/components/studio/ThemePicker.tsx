import React from 'react';
import { themes } from '../../data/themes';
import type { ThemeId } from '../../types/slides';
import { headlineWeight } from '../../utils/fonts';

interface ThemePickerProps {
  value: ThemeId;
  onSelect: (id: ThemeId) => void;
  columns?: 'compact' | 'wide';
}

export function ThemePicker({ value, onSelect, columns = 'wide' }: ThemePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Visual style"
      className={`grid gap-2 ${columns === 'wide' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
      
      {themes.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(t.id)}
            className={`group overflow-hidden rounded-xl border text-left transition-colors duration-150 ${
            active ? 'border-accent' : 'border-line hover:border-line-strong'}`
            }>
            
            <span className="flex h-14 items-end px-3 pb-2" style={{ backgroundColor: t.style.backgroundColor }} aria-hidden>
              <span
                className="text-xl leading-none"
                style={{ fontFamily: `"${t.style.headlineFont}"`, fontWeight: headlineWeight(t.style.headlineFont), color: t.style.textColor }}>
                
                Aa
              </span>
              <span className="mb-0.5 ml-1.5 text-xs font-semibold" style={{ color: t.style.accentColor }}>
                emphasis
              </span>
            </span>
            <span className={`block px-3 py-2 text-xs font-medium ${active ? 'bg-accent/10 text-ink' : 'bg-surface-2 text-ink-muted group-hover:text-ink'}`}>
              {t.name}
            </span>
          </button>);

      })}
    </div>);

}