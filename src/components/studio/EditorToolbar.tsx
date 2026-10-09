import React from 'react';
import {
  AlertTriangleIcon,
  CheckIcon,
  CloudOffIcon,
  DownloadIcon,
  ListChecksIcon,
  Loader2Icon,
  PlayIcon,
  PlusIcon,
  Redo2Icon,
  ShieldCheckIcon,
  Undo2Icon } from
'lucide-react';
import { toast } from 'sonner';
import { useGeneration } from '../../contexts/GenerationContext';
import { useStudio } from '../../contexts/StudioContext';
import type { QualityIssue } from '../../types/quality';
import { Button } from '../ui/Button';

interface EditorToolbarProps {
  issues: QualityIssue[];
  checking: boolean;
  onOpenChecks: () => void;
  onPreview: () => void;
  onExport: () => void;
}

export function EditorToolbar({ issues, checking, onOpenChecks, onPreview, onExport }: EditorToolbarProps) {
  const { project, update, saveStatus, undo, redo, canUndo, canRedo, createNewProject } = useStudio();
  const gen = useGeneration();
  if (!project) return null;

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.length - errors;
  const showProgressButton = gen.state.projectId === project.id && gen.state.status !== 'idle' && !gen.state.panelOpen;

  const startNew = () => {
    if (gen.isRunning) {
      toast.error('Finish or cancel the current generation first.');
      return;
    }
    gen.reset();
    createNewProject();
  };

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 sm:px-4">
      <input
        aria-label="Project name"
        value={project.name}
        onChange={(e) => update((p) => ({ ...p, name: e.target.value }), { key: 'rename' })}
        className="min-w-0 max-w-[260px] flex-1 truncate rounded-md bg-transparent px-2 py-1 text-sm font-medium text-ink transition-colors duration-150 hover:bg-surface-2 focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
      
      {project.isSample &&
      <span className="hidden shrink-0 rounded-md bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning sm:inline">
          Sample · design preview
        </span>
      }
      <span className="hidden shrink-0 items-center gap-1.5 text-xs text-ink-subtle md:flex" role="status" aria-live="polite">
        {saveStatus === 'saving' &&
        <>
            <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving…
          </>
        }
        {saveStatus === 'saved' &&
        <>
            <CheckIcon className="h-3.5 w-3.5" aria-hidden /> Saved in this browser
          </>
        }
        {saveStatus === 'error' &&
        <span className="flex items-center gap-1.5 text-danger">
            <CloudOffIcon className="h-3.5 w-3.5" aria-hidden /> Not saved — storage unavailable
          </span>
        }
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button size="icon" variant="ghost" aria-label="Undo" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          <Undo2Icon className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Redo" title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          <Redo2Icon className="h-4 w-4" />
        </Button>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" aria-hidden />
        {showProgressButton &&
        <Button size="sm" variant="ghost" onClick={gen.openPanel} className="hidden md:inline-flex">
            <ListChecksIcon className="h-4 w-4" aria-hidden /> Progress
          </Button>
        }
        <Button size="sm" variant="ghost" onClick={onOpenChecks} className="hidden sm:inline-flex" aria-label={`Quality checks: ${issues.length} issues`}>
          {checking ?
          <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> :
          errors ?
          <AlertTriangleIcon className="h-4 w-4 text-danger" aria-hidden /> :
          warnings ?
          <AlertTriangleIcon className="h-4 w-4 text-warning" aria-hidden /> :

          <ShieldCheckIcon className="h-4 w-4 text-success" aria-hidden />
          }
          <span className="tabular-nums">{issues.length ? `${issues.length} to review` : 'All clear'}</span>
        </Button>
        <Button size="sm" variant="secondary" onClick={onPreview}>
          <PlayIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Preview</span>
        </Button>
        <Button size="sm" variant="primary" onClick={onExport} disabled={!project.slides.length}>
          <DownloadIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only sm:not-sr-only">Export</span>
        </Button>
        <Button size="icon" variant="ghost" aria-label="New slideshow" title="New slideshow" onClick={startNew}>
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>);

}