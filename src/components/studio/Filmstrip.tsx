import React from 'react';
import { Reorder } from 'framer-motion';
import { PlusIcon } from 'lucide-react';
import { useGeneration } from '../../contexts/GenerationContext';
import { useStudio } from '../../contexts/StudioContext';
import type { QualityIssue } from '../../types/quality';
import type { Project } from '../../types/slides';
import { FilmstripItem } from './FilmstripItem';

interface FilmstripProps {
  project: Project;
  selectedId: string | null;
  issues: QualityIssue[];
  actions: {
    addSlide: () => void;
    duplicateSlide: (id: string) => void;
    deleteSlide: (id: string) => void;
    moveSlide: (id: string, dir: -1 | 1) => void;
  };
}

export function Filmstrip({ project, selectedId, issues, actions }: FilmstripProps) {
  const { update, selectSlide } = useStudio();
  const gen = useGeneration();

  const severityFor = (id: string) => {
    const mine = issues.filter((i) => i.slideId === id);
    if (mine.some((i) => i.severity === 'error')) return 'error' as const;
    return mine.length ? 'warning' as const : null;
  };

  return (
    <section aria-label="Slides" className="shrink-0 border-t border-line bg-surface/60">
      <div className="flex items-center justify-between px-4 pt-3">
        <h2 className="text-xs font-medium text-ink-muted">
          Slides <span className="tabular-nums text-ink-subtle">· {project.slides.length}</span>
        </h2>
        <p className="hidden text-[11px] text-ink-subtle sm:block">Drag the handle to reorder</p>
      </div>
      <div className="scrollbar-thin overflow-x-auto px-4 pb-4 pt-2">
        <div className="flex gap-3">
          <Reorder.Group
            axis="x"
            values={project.slides}
            onReorder={(slides) => update((p) => ({ ...p, slides }), { key: 'reorder' })}
            className="flex gap-3">
            
            {project.slides.map((slide, i) =>
            <FilmstripItem
              key={slide.id}
              project={project}
              slide={slide}
              index={i}
              selected={slide.id === selectedId}
              severity={severityFor(slide.id)}
              busy={gen.busy[slide.id]}
              job={gen.state.projectId === project.id ? gen.state.slideJobs[slide.id] : undefined}
              onSelect={() => selectSlide(slide.id)}
              onDuplicate={() => actions.duplicateSlide(slide.id)}
              onDelete={() => actions.deleteSlide(slide.id)}
              onRegenImage={() => void gen.regenerateImage(slide.id)}
              onRegenText={() => void gen.regenerateText(slide.id)}
              onMove={(dir) => actions.moveSlide(slide.id, dir)} />

            )}
          </Reorder.Group>
          <button
            type="button"
            onClick={actions.addSlide}
            className="flex w-[112px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong text-xs text-ink-muted transition-colors duration-150 hover:border-ink-subtle hover:text-ink">
            
            <PlusIcon className="h-4 w-4" aria-hidden />
            Add slide
          </button>
        </div>
      </div>
    </section>);

}