import React, { useEffect, useState } from 'react';
import { Loader2Icon, ScissorsIcon, WandSparklesIcon } from 'lucide-react';
import { useGeneration } from '../../../contexts/GenerationContext';
import { useStudio } from '../../../contexts/StudioContext';
import type { Project, Slide, TextStyle, VAlign, HAlign } from '../../../types/slides';
import { resolveStyle, roleLabel } from '../../../utils/project';
import { inputClass, labelClass } from '../../../utils/ui';
import { Button } from '../../ui/Button';
import { Segmented } from '../../ui/Segmented';
import { TextAreaField } from '../../ui/TextAreaField';

interface TextTabProps {
  project: Project;
  slide: Slide;
  index: number;
}

export function TextTab({ project, slide, index }: TextTabProps) {
  const { updateSlide } = useStudio();
  const gen = useGeneration();
  const busy = gen.busy[slide.id];
  const style = resolveStyle(project, slide);
  const emphasisKey = slide.emphasis.join(', ');
  const [emphasisDraft, setEmphasisDraft] = useState(emphasisKey);

  useEffect(() => setEmphasisDraft(emphasisKey), [emphasisKey, slide.id]);

  const setText = (field: 'headline' | 'body' | 'supporting', value: string) =>
  updateSlide(slide.id, { [field]: value, textEdited: true } as Partial<Slide>, { key: `text-${slide.id}-${field}` });

  const setOverride = (patch: Partial<TextStyle>) =>
  updateSlide(slide.id, (s) => ({ ...s, overrides: { ...s.overrides, ...patch } }), { key: `placement-${slide.id}` });

  const placementOverridden = 'vAlign' in slide.overrides || 'hAlign' in slide.overrides || 'textColor' in slide.overrides;
  const resetPlacement = () =>
  updateSlide(slide.id, (s) => {
    const overrides = { ...s.overrides };
    delete overrides.vAlign;
    delete overrides.hAlign;
    delete overrides.textColor;
    return { ...s, overrides };
  });

  const suggestion = slide.recommendedTextColor;
  const showSuggestion = suggestion && suggestion.toLowerCase() !== style.textColor.toLowerCase();

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink">Slide {index + 1}</h3>
        <span className="text-xs text-ink-subtle">{roleLabel(slide.role)}</span>
      </div>

      <TextAreaField label="Headline" value={slide.headline} onChange={(v) => setText('headline', v)} rows={2} softLimit={10} />
      <TextAreaField label="Body" value={slide.body} onChange={(v) => setText('body', v)} rows={4} softLimit={28} />
      <TextAreaField label="Supporting text" value={slide.supporting} onChange={(v) => setText('supporting', v)} rows={2} placeholder="Optional" />

      <div>
        <label htmlFor={`emphasis-${slide.id}`} className={labelClass}>
          Emphasis words
        </label>
        <input
          id={`emphasis-${slide.id}`}
          value={emphasisDraft}
          onChange={(e) => setEmphasisDraft(e.target.value)}
          onBlur={() =>
          updateSlide(
            slide.id,
            { emphasis: emphasisDraft.split(',').map((w) => w.trim()).filter(Boolean) },
            { key: `emphasis-${slide.id}` }
          )
          }
          placeholder="e.g. respect, quiet"
          className={inputClass} />
        
        <p className="mt-1 text-[11px] text-ink-subtle">Comma-separated. Drawn in the emphasis color.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => void gen.regenerateText(slide.id)} disabled={Boolean(busy)}>
          {busy === 'text' ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <WandSparklesIcon className="h-3.5 w-3.5" aria-hidden />}
          Rewrite
        </Button>
        <Button size="sm" onClick={() => void gen.shortenSlide(slide.id)} disabled={Boolean(busy)}>
          {busy === 'shorten' ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <ScissorsIcon className="h-3.5 w-3.5" aria-hidden />}
          Shorten
        </Button>
      </div>

      <div className="space-y-3 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-ink">Placement on this slide</p>
          {placementOverridden &&
          <button type="button" onClick={resetPlacement} className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
              Match other slides
            </button>
          }
        </div>
        <Segmented<VAlign>
          label="Vertical position"
          value={style.vAlign}
          onChange={(v) => setOverride({ vAlign: v })}
          options={[
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Middle' },
          { value: 'bottom', label: 'Bottom' }]
          } />
        
        <Segmented<HAlign>
          label="Horizontal alignment"
          value={style.hAlign}
          onChange={(v) => setOverride({ hAlign: v })}
          options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }]
          } />
        
        {showSuggestion && suggestion &&
        <div className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
            <span className="flex items-center gap-2 text-xs text-ink-muted">
              <span className="h-4 w-4 rounded border border-line-strong" style={{ backgroundColor: suggestion }} aria-hidden />
              Gemini suggests {suggestion.toUpperCase()} text
            </span>
            <Button size="sm" variant="ghost" onClick={() => setOverride({ textColor: suggestion })}>
              Apply
            </Button>
          </div>
        }
      </div>
    </div>);

}