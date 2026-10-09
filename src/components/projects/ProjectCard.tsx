import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CopyIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import type { Project } from '../../types/slides';
import { SlideCanvas } from '../SlideCanvas';
import { Button } from '../ui/Button';

interface ProjectCardProps {
  project: Project;
  isCurrent: boolean;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, isCurrent, onOpen, onRename, onDuplicate, onDelete }: ProjectCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const first = project.slides[0];

  const commit = () => {
    setRenaming(false);
    if (draft.trim() && draft.trim() !== project.name) onRename(draft.trim());else
    setDraft(project.name);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${project.name}`}
        className="block h-56 bg-canvas p-3 transition-colors duration-150 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/70">
        
        {first ?
        <SlideCanvas project={project} slide={first} label={`${project.name} cover`} /> :

        <span className="flex h-full items-center justify-center text-xs text-ink-subtle">No slides yet</span>
        }
      </button>
      <div className="flex flex-1 flex-col p-4">
        {renaming ?
        <input
          autoFocus
          aria-label="Project name"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(project.name);
              setRenaming(false);
            }
          }}
          className="w-full rounded-md border border-accent bg-surface-2 px-2 py-1 text-sm text-ink focus:outline-none" /> :


        <h2 className="truncate text-sm font-medium text-ink">{project.name}</h2>
        }
        <p className="mt-1 text-xs text-ink-subtle">
          {project.slides.length} slide{project.slides.length === 1 ? '' : 's'} · edited {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {isCurrent && <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[11px] text-ink-muted">Open now</span>}
          {project.isSample && <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[11px] text-warning">Sample</span>}
        </div>

        <div className="mt-auto flex items-center gap-1 pt-3">
          {confirmDelete ?
          <>
              <span className="mr-auto text-xs text-ink-muted">Delete for good?</span>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Keep
              </Button>
              <Button size="sm" variant="danger" onClick={onDelete}>
                Delete
              </Button>
            </> :

          <>
              <Button size="sm" variant="secondary" onClick={onOpen} className="mr-auto">
                Open
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label={`Rename ${project.name}`} title="Rename" onClick={() => setRenaming(true)}>
                <PencilIcon className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label={`Duplicate ${project.name}`} title="Duplicate" onClick={onDuplicate}>
                <CopyIcon className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon-sm" variant="ghost" aria-label={`Delete ${project.name}`} title="Delete" onClick={() => setConfirmDelete(true)}>
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </>
          }
        </div>
      </div>
    </article>);

}