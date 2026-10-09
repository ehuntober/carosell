import React, { useMemo } from 'react';
import type { Project } from '../../types/slides';
import { createSlide, getPlatform } from '../../utils/project';
import { SlideCanvas } from '../SlideCanvas';

interface ComposerPreviewProps {
  project: Project;
}

export function ComposerPreview({ project }: ComposerPreviewProps) {
  const topic = project.content.topic.trim();
  const slide = useMemo(
    () =>
    createSlide({
      id: 'composer-preview',
      role: 'hook',
      headline: topic || 'Your hook headline appears here',
      body: 'Each slide gets a short, punchy body line that is wrapped and sized automatically.',
      emphasis: []
    }),
    [topic]
  );
  const platform = getPlatform(project.canvas.platform);

  return (
    <figure className="rounded-2xl border border-line bg-surface p-4">
      <div className="h-[360px] sm:h-[440px] lg:h-[480px]">
        <SlideCanvas project={project} slide={slide} label="Layout preview of the first slide" />
      </div>
      <figcaption className="mt-3 space-y-1">
        <span className="block text-sm font-medium text-ink">
          {platform.label} · {project.canvas.width} × {project.canvas.height}
        </span>
        <span className="block text-xs text-ink-subtle">
          Layout and typography preview. Backgrounds are created after the script is written.
        </span>
      </figcaption>
    </figure>);

}