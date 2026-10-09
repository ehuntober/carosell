import React, { useState } from 'react';
import { useStudio } from '../../../contexts/StudioContext';
import type { Project, Slide, TextStyle } from '../../../types/slides';
import { getTheme, resolveStyle } from '../../../utils/project';
import { Segmented } from '../../ui/Segmented';
import { StyleControls } from '../StyleControls';
import { ThemePicker } from '../ThemePicker';

interface StyleTabProps {
  project: Project;
  slide: Slide;
  index: number;
}

export function StyleTab({ project, slide, index }: StyleTabProps) {
  const { update, updateSlide } = useStudio();
  const [scope, setScope] = useState<'all' | 'slide'>('all');
  const overrideCount = Object.keys(slide.overrides).length;

  const value = scope === 'all' ? project.style : resolveStyle(project, slide);
  const onChange = (patch: Partial<TextStyle>) => {
    const key = Object.keys(patch).join();
    if (scope === 'all') {
      update((p) => ({ ...p, style: { ...p.style, ...patch } }), { key: `style-${key}` });
    } else {
      updateSlide(slide.id, (s) => ({ ...s, overrides: { ...s.overrides, ...patch } }), { key: `override-${slide.id}-${key}` });
    }
  };

  return (
    <div className="space-y-5">
      <Segmented<'all' | 'slide'>
        label="Apply changes to"
        value={scope}
        onChange={setScope}
        options={[
        { value: 'all', label: 'All slides' },
        { value: 'slide', label: `Slide ${index + 1} only` }]
        } />
      

      {scope === 'all' ?
      <div>
          <p className="mb-2 text-xs font-semibold text-ink">Template</p>
          <ThemePicker
          columns="compact"
          value={project.themeId}
          onSelect={(id) => update((p) => ({ ...p, themeId: id, style: { ...getTheme(id).style } }), { key: 'theme' })} />
        
          {project.slides.some((s) => Object.keys(s.overrides).length) &&
        <p className="mt-2 text-[11px] text-ink-subtle">Slides with their own settings keep them.</p>
        }
        </div> :

      overrideCount > 0 &&
      <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-xs">
            <span className="text-ink-muted">
              {overrideCount} custom setting{overrideCount > 1 ? 's' : ''} on this slide
            </span>
            <button
          type="button"
          onClick={() => updateSlide(slide.id, { overrides: {} })}
          className="text-ink-muted underline underline-offset-2 hover:text-ink">
          
              Reset
            </button>
          </div>

      }

      <StyleControls value={value} onChange={onChange} />
    </div>);

}