import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { StudioComposer } from '../components/studio/StudioComposer';
import { StudioEditor } from '../components/studio/StudioEditor';
import { useGeneration } from '../contexts/GenerationContext';
import { useStudio } from '../contexts/StudioContext';

export function Studio() {
  const { project, loading } = useStudio();
  const gen = useGeneration();

  if (loading || !project) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center gap-2 text-sm text-ink-muted" role="status">
        <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />
        Opening your last project…
      </div>);

  }

  const generatingHere = gen.state.status !== 'idle' && gen.state.projectId === project.id;
  return project.slides.length > 0 || generatingHere ? <StudioEditor /> : <StudioComposer />;
}