import React, { useMemo } from 'react';
import { CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { SlideCanvas } from '../components/SlideCanvas';
import { ThemePicker } from '../components/studio/ThemePicker';
import { Button } from '../components/ui/Button';
import { ColorField } from '../components/ui/ColorField';
import { SelectField } from '../components/ui/SelectField';
import { Toggle } from '../components/ui/Toggle';
import { useSettings } from '../contexts/SettingsContext';
import { useStudio } from '../contexts/StudioContext';
import { fontOptions } from '../data/options';
import type { Project } from '../types/slides';
import { brandStyle, createProject, createSlide, getTheme } from '../utils/project';
import { inputClass, labelClass } from '../utils/ui';

const fontSelect = fontOptions.map((f) => ({ value: f.family, label: f.family }));

export function BrandKitPage() {
  const { brandKit, updateBrandKit } = useSettings();
  const { project, update } = useStudio();

  const preview = useMemo(() => {
    const base = createProject(null);
    const p: Project = {
      ...base,
      canvas: { platform: 'ig-portrait', width: 1080, height: 1350 },
      themeId: brandKit.themeId,
      style: { ...getTheme(brandKit.themeId).style, ...brandStyle(brandKit) }
    };
    const slide = createSlide({
      id: 'brand-preview',
      headline: brandKit.brandName ? `${brandKit.brandName} makes it simple` : 'Your headline, in your brand',
      body: 'Body copy uses your body font. Key words use your emphasis color.',
      supporting: brandKit.handle,
      emphasis: ['emphasis', 'brand']
    });
    return { project: p, slide };
  }, [brandKit]);

  const applyToCurrent = () => {
    if (!project) return;
    update((p) => ({ ...p, themeId: brandKit.themeId, style: { ...getTheme(brandKit.themeId).style, ...brandStyle(brandKit) } }), { key: 'brand' });
    toast.success(`Brand kit applied to "${project.name}"`);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader
        title="Brand Kit"
        description="Your default fonts and colors. Changes save in this browser as you make them."
        actions={
        <Button variant="secondary" onClick={applyToCurrent} disabled={!project}>
            Apply to current project
          </Button>
        } />
      

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section aria-labelledby="identity" className="grid gap-4 sm:grid-cols-2">
            <h2 id="identity" className="text-sm font-semibold text-ink sm:col-span-2">
              Identity
            </h2>
            <div>
              <label htmlFor="brand-name" className={labelClass}>
                Brand name
              </label>
              <input
                id="brand-name"
                value={brandKit.brandName}
                onChange={(e) => updateBrandKit({ brandName: e.target.value })}
                placeholder="e.g. Carosell"
                className={inputClass} />
              
            </div>
            <div>
              <label htmlFor="brand-handle" className={labelClass}>
                Social handle
              </label>
              <input
                id="brand-handle"
                value={brandKit.handle}
                onChange={(e) => updateBrandKit({ handle: e.target.value })}
                placeholder="@yourhandle"
                className={inputClass} />
              
            </div>
          </section>

          <section aria-labelledby="base-template">
            <h2 id="base-template" className="mb-4 text-sm font-semibold text-ink">
              Base template
            </h2>
            <ThemePicker
              value={brandKit.themeId}
              onSelect={(id) => {
                const t = getTheme(id).style;
                updateBrandKit({
                  themeId: id,
                  headlineFont: t.headlineFont,
                  bodyFont: t.bodyFont,
                  textColor: t.textColor,
                  accentColor: t.accentColor,
                  backgroundColor: t.backgroundColor
                });
              }} />
            
          </section>

          <section aria-labelledby="type-color" className="grid gap-4 sm:grid-cols-2">
            <h2 id="type-color" className="text-sm font-semibold text-ink sm:col-span-2">
              Type and color
            </h2>
            <SelectField label="Headline font" value={brandKit.headlineFont} options={fontSelect} onChange={(v) => updateBrandKit({ headlineFont: v })} />
            <SelectField label="Body font" value={brandKit.bodyFont} options={fontSelect} onChange={(v) => updateBrandKit({ bodyFont: v })} />
            <ColorField label="Text" value={brandKit.textColor} onChange={(v) => updateBrandKit({ textColor: v })} />
            <ColorField label="Emphasis" value={brandKit.accentColor} onChange={(v) => updateBrandKit({ accentColor: v })} />
            <ColorField label="Background" value={brandKit.backgroundColor} onChange={(v) => updateBrandKit({ backgroundColor: v })} />
          </section>

          <section className="border-t border-line pt-6">
            <Toggle
              label="Use for new projects"
              description="New slideshows start with these fonts and colors instead of the template defaults."
              checked={brandKit.applyToNewProjects}
              onChange={(v) => updateBrandKit({ applyToNewProjects: v })} />
            
          </section>
        </div>

        <aside aria-label="Brand preview" className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="h-[420px]">
              <SlideCanvas project={preview.project} slide={preview.slide} label="Brand kit preview" />
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-subtle">
              <CheckIcon className="h-3.5 w-3.5" aria-hidden /> Saved in this browser
            </p>
          </div>
        </aside>
      </div>
    </div>);

}