import React from 'react';
import { platformPresets } from '../../data/options';
import type { CanvasSettings } from '../../types/slides';
import { inputClass, labelClass } from '../../utils/ui';

interface PlatformPickerProps {
  canvas: CanvasSettings;
  onChange: (canvas: CanvasSettings) => void;
}

export function PlatformPicker({ canvas, onChange }: PlatformPickerProps) {
  return (
    <div>
      <div role="radiogroup" aria-label="Platform and size" className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {platformPresets.map((p) => {
          const active = canvas.platform === p.id;
          const w = p.id === 'custom' ? canvas.width : p.width;
          const h = p.id === 'custom' ? canvas.height : p.height;
          const box = 26;
          const shapeW = w >= h ? box : box * w / h;
          const shapeH = h >= w ? box : box * h / w;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() =>
              onChange(
                p.id === 'custom' ?
                { platform: 'custom', width: canvas.width, height: canvas.height } :
                { platform: p.id, width: p.width, height: p.height }
              )
              }
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors duration-150 ${
              active ? 'border-accent bg-accent/5' : 'border-line hover:border-line-strong'}`
              }>
              
              <span className="flex h-7 w-7 shrink-0 items-center justify-center" aria-hidden>
                <span
                  className={`rounded-[3px] border-2 ${active ? 'border-accent' : 'border-ink-subtle'}`}
                  style={{ width: shapeW, height: shapeH }} />
                
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink">{p.label}</span>
                <span className="block text-xs tabular-nums text-ink-subtle">
                  {p.ratio}
                  {p.id !== 'custom' && ` · ${p.width}×${p.height}`}
                </span>
              </span>
            </button>);

        })}
      </div>
      {canvas.platform === 'custom' &&
      <div className="mt-3 grid max-w-xs grid-cols-2 gap-3">
          {(['width', 'height'] as const).map((dim) =>
        <div key={dim}>
              <label htmlFor={`canvas-${dim}`} className={labelClass}>
                {dim === 'width' ? 'Width (px)' : 'Height (px)'}
              </label>
              <input
            id={`canvas-${dim}`}
            type="number"
            inputMode="numeric"
            min={320}
            max={4096}
            value={canvas[dim]}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) onChange({ ...canvas, [dim]: v });
            }}
            className={inputClass} />
          
            </div>
        )}
        </div>
      }
      <p className="mt-3 text-xs text-ink-subtle">The editor always shows the full slide, so nothing in your artwork is hidden or cropped.</p>
    </div>);

}