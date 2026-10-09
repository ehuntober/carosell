import React from 'react';
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from 'lucide-react';
import type { SlideBusy } from '../../types/generation';
import type { Project, Slide } from '../../types/slides';
import { SlideCanvas } from '../SlideCanvas';
import { Button } from '../ui/Button';

interface CanvasStageProps {
  project: Project;
  slide: Slide | null;
  index: number;
  busy?: SlideBusy;
  overflow: boolean;
  emptyMessage: string;
  onPrev: () => void;
  onNext: () => void;
  onReposition: (fx: number, fy: number) => void;
  onShorten: () => void;
  onShrink: () => void;
}

export function CanvasStage({
  project,
  slide,
  index,
  busy,
  overflow,
  emptyMessage,
  onPrev,
  onNext,
  onReposition,
  onShorten,
  onShrink
}: CanvasStageProps) {
  const total = project.slides.length;
  const generatingImage = busy === 'image' || slide?.image.status === 'generating';
  const rewriting = busy === 'text' || busy === 'shorten';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative h-[56vh] min-h-[320px] p-4 lg:h-auto lg:min-h-0 lg:flex-1 lg:p-8">
        {slide ?
        <SlideCanvas
          project={project}
          slide={slide}
          interactive
          onReposition={onReposition}
          label={`Slide ${index + 1} of ${total}: ${slide.headline || 'no headline'}`}
          frameClassName="shadow-2xl shadow-black/50">
          
            {(generatingImage || rewriting) &&
          <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-black/70 px-3 py-2 text-xs text-white" role="status">
                <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {generatingImage ? 'Generating background…' : 'Rewriting text…'}
              </div>
          }
          </SlideCanvas> :

        <div className="flex h-full items-center justify-center">
            <div
            className="flex h-full max-h-full items-center justify-center rounded-md border border-dashed border-line-strong px-6 text-center"
            style={{ aspectRatio: `${project.canvas.width} / ${project.canvas.height}` }}>
            
              <p className="max-w-[200px] text-sm text-ink-muted">{emptyMessage}</p>
            </div>
          </div>
        }
      </div>

      {slide && overflow &&
      <div className="mx-4 mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 lg:mx-8" role="alert">
          <AlertTriangleIcon className="h-4 w-4 shrink-0 text-danger" aria-hidden />
          <p className="mr-auto text-xs text-ink">Text doesn't fit inside the safe area on this slide.</p>
          <Button size="sm" variant="secondary" onClick={onShorten} disabled={rewriting}>
            Shorten copy
          </Button>
          <Button size="sm" variant="ghost" onClick={onShrink}>
            Shrink text
          </Button>
        </div>
      }

      {total > 0 &&
      <div className="flex items-center justify-center gap-2 pb-3">
          <Button size="icon-sm" variant="ghost" aria-label="Previous slide" onClick={onPrev} disabled={index <= 0}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="min-w-[64px] text-center text-xs tabular-nums text-ink-muted">
            {index + 1} / {total}
          </span>
          <Button size="icon-sm" variant="ghost" aria-label="Next slide" onClick={onNext} disabled={index >= total - 1}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      }
    </div>);

}