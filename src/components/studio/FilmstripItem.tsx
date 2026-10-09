import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { CopyPlusIcon, GripHorizontalIcon, ImageIcon, Loader2Icon, Trash2Icon, TypeIcon } from 'lucide-react';
import type { SlideBusy, SlideJobStatus } from '../../types/generation';
import type { IssueSeverity } from '../../types/quality';
import type { Project, Slide } from '../../types/slides';
import { SlideCanvas } from '../SlideCanvas';

interface FilmstripItemProps {
  project: Project;
  slide: Slide;
  index: number;
  selected: boolean;
  severity: IssueSeverity | null;
  busy?: SlideBusy;
  job?: SlideJobStatus;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRegenImage: () => void;
  onRegenText: () => void;
  onMove: (dir: -1 | 1) => void;
}

export function FilmstripItem({
  project,
  slide,
  index,
  selected,
  severity,
  busy,
  job,
  onSelect,
  onDuplicate,
  onDelete,
  onRegenImage,
  onRegenText,
  onMove
}: FilmstripItemProps) {
  const controls = useDragControls();
  const n = index + 1;
  const imageWorking = busy === 'image' || job === 'running' || slide.image.status === 'generating';
  const textWorking = busy === 'text' || busy === 'shorten';

  const actions = [
  { label: `Duplicate slide ${n}`, icon: CopyPlusIcon, run: onDuplicate, working: false },
  { label: `Regenerate image for slide ${n}`, icon: ImageIcon, run: onRegenImage, working: imageWorking },
  { label: `Regenerate text for slide ${n}`, icon: TypeIcon, run: onRegenText, working: textWorking },
  { label: `Delete slide ${n}`, icon: Trash2Icon, run: onDelete, working: false }];


  return (
    <Reorder.Item value={slide} dragListener={false} dragControls={controls} as="li" className="relative w-[112px] shrink-0 list-none">
      <div
        className={`rounded-xl border p-1.5 transition-colors duration-150 ${
        selected ? 'border-accent bg-accent/5' : 'border-line bg-surface-2 hover:border-line-strong'}`
        }>
        
        <div className="flex items-center justify-between px-0.5 pb-1">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tabular-nums text-ink-muted">
            {n}
            {severity &&
            <span className={`h-1.5 w-1.5 rounded-full ${severity === 'error' ? 'bg-danger' : 'bg-warning'}`}>
                <span className="sr-only">{severity === 'error' ? 'Has errors' : 'Has warnings'}</span>
              </span>
            }
          </span>
          <button
            type="button"
            aria-label={`Reorder slide ${n}. Use left and right arrow keys to move.`}
            title="Drag to reorder"
            onPointerDown={(e) => controls.start(e)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                onMove(-1);
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                onMove(1);
              }
            }}
            className="flex h-6 w-7 cursor-grab touch-none items-center justify-center rounded text-ink-subtle hover:bg-surface-3 hover:text-ink active:cursor-grabbing">
            
            <GripHorizontalIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSelect}
          aria-label={`Edit slide ${n}`}
          aria-current={selected ? 'true' : undefined}
          className="relative block h-[132px] w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70">
          
          <SlideCanvas project={project} slide={slide} label={`Slide ${n} thumbnail`} frameClassName="rounded" />
          {imageWorking &&
          <span className="absolute inset-0 flex items-center justify-center rounded bg-black/50" aria-hidden>
              <Loader2Icon className="h-5 w-5 animate-spin text-white" />
            </span>
          }
          {slide.image.status === 'failed' && !imageWorking &&
          <span className="absolute inset-x-1 bottom-1 rounded bg-danger px-1 py-0.5 text-center text-[10px] font-medium text-black">
              Image failed
            </span>
          }
        </button>

        <div className="mt-1 grid grid-cols-4">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                type="button"
                aria-label={a.label}
                title={a.label.replace(` for slide ${n}`, '').replace(` slide ${n}`, '')}
                onClick={a.run}
                disabled={a.working}
                className="flex h-7 items-center justify-center rounded text-ink-subtle transition-colors duration-150 hover:bg-surface-3 hover:text-ink disabled:opacity-60">
                
                {a.working ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
              </button>);

          })}
        </div>
      </div>
    </Reorder.Item>);

}