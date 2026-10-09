import React from 'react';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  MinusCircleIcon,
  PauseCircleIcon,
  XCircleIcon } from
'lucide-react';
import { Link } from 'react-router-dom';
import { useGeneration } from '../../contexts/GenerationContext';
import { useStudio } from '../../contexts/StudioContext';
import { stages } from '../../data/pipeline';
import type { SlideJobStatus, StageStatus } from '../../types/generation';
import { Button } from '../ui/Button';

const stageIcon: Record<StageStatus, {icon: typeof CircleIcon;className: string;label: string;}> = {
  pending: { icon: CircleIcon, className: 'text-ink-subtle', label: 'Waiting' },
  running: { icon: Loader2Icon, className: 'animate-spin text-accent', label: 'In progress' },
  done: { icon: CheckCircle2Icon, className: 'text-success', label: 'Complete' },
  partial: { icon: AlertCircleIcon, className: 'text-warning', label: 'Partly complete' },
  skipped: { icon: MinusCircleIcon, className: 'text-ink-subtle', label: 'Skipped' },
  failed: { icon: XCircleIcon, className: 'text-danger', label: 'Failed' },
  cancelled: { icon: PauseCircleIcon, className: 'text-ink-muted', label: 'Cancelled' }
};

const jobClass: Record<SlideJobStatus, string> = {
  pending: 'bg-surface-2 text-ink-subtle',
  running: 'bg-accent text-white',
  done: 'bg-success/15 text-success',
  failed: 'bg-danger/15 text-danger'
};

export function GenerationProgress() {
  const gen = useGeneration();
  const { project, selectSlide } = useStudio();
  const { state } = gen;
  if (!project) return null;

  const title =
  state.status === 'running' ?
  'Generating slideshow' :
  state.status === 'done' ?
  'Slideshow ready to edit' :
  state.status === 'cancelled' ?
  'Generation cancelled' :
  'Generation stopped';

  const notConfigured = state.error?.toLowerCase().includes("isn't connected");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-4 py-4">
        <p className="text-sm font-semibold text-ink" aria-live="polite">
          {title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{project.content.topic}</p>
      </div>

      <ol className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4" aria-label="Generation stages">
        {stages.map((stage, i) => {
          const s = state.stages[stage.id];
          const meta = stageIcon[s.status];
          const Icon = meta.icon;
          const last = i === stages.length - 1;
          return (
            <li key={stage.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!last && <span className="absolute left-[9px] top-6 h-[calc(100%-20px)] w-px bg-line" aria-hidden />}
              <Icon className={`relative mt-0.5 h-[18px] w-[18px] shrink-0 ${meta.className}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${s.status === 'pending' ? 'text-ink-subtle' : 'text-ink'}`}>
                  {stage.label}
                  <span className="sr-only"> — {meta.label}</span>
                </p>
                {s.detail &&
                <p className={`mt-0.5 text-xs ${s.status === 'failed' ? 'text-danger' : 'text-ink-muted'}`}>{s.detail}</p>
                }
                {stage.id === 'images' && project.slides.length > 0 && s.status !== 'pending' && s.status !== 'skipped' &&
                <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Per-slide image status">
                    {project.slides.map((slide, idx) => {
                    const job: SlideJobStatus =
                    state.slideJobs[slide.id] ?? (slide.image.status === 'ready' ? 'done' : slide.image.status === 'failed' ? 'failed' : 'pending');
                    return (
                      <li key={slide.id}>
                          <button
                          type="button"
                          onClick={() => selectSlide(slide.id)}
                          aria-label={`Slide ${idx + 1}: ${job}`}
                          className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-semibold tabular-nums ${jobClass[job]}`}>
                          
                            {idx + 1}
                          </button>
                        </li>);

                  })}
                  </ul>
                }
              </div>
            </li>);

        })}
      </ol>

      {state.error &&
      <div className="mx-4 mb-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-ink" role="alert">
          {state.error}
          {notConfigured &&
        <Link to="/settings" className="mt-1 block font-medium text-ink underline underline-offset-2">
              Open Settings
            </Link>
        }
        </div>
      }

      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
        {state.status === 'running' &&
        <Button variant="secondary" className="flex-1" onClick={gen.cancel}>
            Cancel
          </Button>
        }
        {(state.status === 'failed' || state.status === 'cancelled') &&
        <>
            <Button variant="primary" className="flex-1" onClick={() => void gen.resume()}>
              Resume
            </Button>
            {project.slides.length ?
          <Button variant="secondary" className="flex-1" onClick={gen.dismiss}>
                Edit slides
              </Button> :

          <Button variant="secondary" className="flex-1" onClick={gen.reset}>
                Back to setup
              </Button>
          }
          </>
        }
        {state.status === 'done' &&
        <Button variant="primary" className="flex-1" onClick={gen.dismiss}>
            Continue editing
          </Button>
        }
      </div>
    </div>);

}