export const inputClass =
'w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-subtle transition-colors duration-150 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

export const labelClass = 'mb-1.5 block text-xs font-medium text-ink-muted';

export const sectionTitleClass = 'text-sm font-semibold text-ink';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}