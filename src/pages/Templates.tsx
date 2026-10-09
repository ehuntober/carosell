import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { SlideCanvas } from '../components/SlideCanvas';
import { Button } from '../components/ui/Button';
import { useStudio } from '../contexts/StudioContext';
import { sampleSlides } from '../data/sampleProject';
import { themes } from '../data/themes';
import type { Project, Slide, ThemeId } from '../types/slides';
import { isDarkColor } from '../utils/color';
import { createImage, createProject, createSlide, getTheme } from '../utils/project';

export function Templates() {
  const { project, update } = useStudio();
  const navigate = useNavigate();

  const previews = useMemo(() => {
    const base = createProject(null);
    const text = sampleSlides[0];
    return themes.map((t) => {
      const dark = isDarkColor(t.style.backgroundColor);
      const previewProject: Project = {
        ...base,
        canvas: { platform: 'ig-portrait', width: 1080, height: 1350 },
        themeId: t.id,
        style: t.style
      };
      const slide: Slide = createSlide({
        id: `tpl-${t.id}`,
        headline: text.headline,
        body: text.body,
        emphasis: text.emphasis,
        image: dark ? createImage('', { src: sampleSlides[1].imageUrl, status: 'ready', source: 'sample' }) : createImage()
      });
      return { theme: t, project: previewProject, slide };
    });
  }, []);

  const apply = (id: ThemeId) => {
    if (!project) return;
    update((p) => ({ ...p, themeId: id, style: { ...getTheme(id).style } }), { key: 'theme' });
    toast.success(`${getTheme(id).name} applied`, { description: 'Slides with their own settings keep them.' });
    navigate('/studio');
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="Templates"
        description="Each template sets typography, color, text placement and the image style used for generated backgrounds." />
      
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {previews.map(({ theme, project: preview, slide }) => {
          const active = project?.themeId === theme.id;
          return (
            <li key={theme.id} className="flex">
              <article className={`flex w-full flex-col overflow-hidden rounded-2xl border bg-surface ${active ? 'border-accent' : 'border-line'}`}>
                <div className="h-72 bg-canvas p-3">
                  <SlideCanvas project={preview} slide={slide} label={`${theme.name} template preview`} />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-sm font-medium text-ink">{theme.name}</h2>
                  <p className="mt-1 text-xs text-ink-muted">{theme.description}</p>
                  <div className="mt-auto pt-4">
                    <Button size="sm" variant={active ? 'secondary' : 'primary'} className="w-full" onClick={() => apply(theme.id)} disabled={!project}>
                      {active ? 'Current template' : 'Use template'}
                    </Button>
                  </div>
                </div>
              </article>
            </li>);

        })}
      </ul>
    </div>);

}