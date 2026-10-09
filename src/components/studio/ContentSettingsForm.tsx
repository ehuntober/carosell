import React, { useId } from 'react';
import { languages, niches, slideCounts, tones } from '../../data/options';
import type { ContentSettings } from '../../types/slides';
import { inputClass, labelClass } from '../../utils/ui';
import { Segmented } from '../ui/Segmented';
import { SelectField } from '../ui/SelectField';
import { Toggle } from '../ui/Toggle';

interface ContentSettingsFormProps {
  content: ContentSettings;
  onChange: (patch: Partial<ContentSettings>) => void;
}

export function ContentSettingsForm({ content, onChange }: ContentSettingsFormProps) {
  const audienceId = useId();
  const customId = useId();
  const ctaId = useId();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SelectField label="Niche" value={content.niche} options={niches.map((n) => ({ value: n, label: n }))} onChange={(v) => onChange({ niche: v })} />
      {content.niche === 'Custom' &&
      <div>
          <label htmlFor={customId} className={labelClass}>
            Custom niche
          </label>
          <input
          id={customId}
          value={content.customNiche}
          onChange={(e) => onChange({ customNiche: e.target.value })}
          placeholder="e.g. Sustainable fashion"
          className={inputClass} />
        
        </div>
      }
      <div>
        <label htmlFor={audienceId} className={labelClass}>
          Target audience
        </label>
        <input
          id={audienceId}
          value={content.audience}
          onChange={(e) => onChange({ audience: e.target.value })}
          placeholder="e.g. Ambitious professionals in their 20s"
          className={inputClass} />
        
      </div>
      <SelectField label="Language" value={content.language} options={languages.map((l) => ({ value: l, label: l }))} onChange={(v) => onChange({ language: v })} />
      <div>
        <span className={labelClass}>Number of slides</span>
        <Segmented<number>
          label="Number of slides"
          value={content.slideCount}
          onChange={(v) => onChange({ slideCount: v })}
          options={slideCounts.map((n) => ({ value: n, label: n }))} />
        
      </div>

      <div className="md:col-span-2">
        <span className={labelClass}>Tone</span>
        <div role="radiogroup" aria-label="Tone" className="flex flex-wrap gap-2">
          {tones.map((t) => {
            const active = content.tone === t;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ tone: t })}
                className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors duration-150 ${
                active ? 'border-accent bg-accent/10 text-ink' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'}`
                }>
                
                {t}
              </button>);

          })}
        </div>
      </div>

      <div className="space-y-4 md:col-span-2">
        <Toggle
          label="End with a call to action"
          description="The last slide asks viewers to follow, save or visit."
          checked={content.includeCta}
          onChange={(v) => onChange({ includeCta: v })} />
        
        {content.includeCta &&
        <div>
            <label htmlFor={ctaId} className="sr-only">
              Call to action
            </label>
            <input
            id={ctaId}
            value={content.ctaText}
            onChange={(e) => onChange({ ctaText: e.target.value })}
            placeholder="e.g. Follow @carosell for more"
            className={inputClass} />
          
          </div>
        }
        <Toggle
          label="Write caption and hashtags"
          description="Included in the ZIP as caption.txt when you export."
          checked={content.captions}
          onChange={(v) => onChange({ captions: v })} />
        
      </div>
    </div>);

}