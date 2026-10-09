import React from 'react';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from 'lucide-react';
import { fontOptions } from '../../data/options';
import type { HAlign, TextStyle, VAlign } from '../../types/slides';
import { ColorField } from '../ui/ColorField';
import { RangeField } from '../ui/RangeField';
import { Segmented } from '../ui/Segmented';
import { SelectField } from '../ui/SelectField';
import { Toggle } from '../ui/Toggle';

interface StyleControlsProps {
  value: TextStyle;
  onChange: (patch: Partial<TextStyle>) => void;
}

const fontSelectOptions = fontOptions.map((f) => ({ value: f.family, label: `${f.family} · ${f.category}` }));
const pct = (v: number) => `${Math.round(v * 100)}%`;

function Group({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <fieldset className="space-y-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-xs font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>);

}

export function StyleControls({ value, onChange }: StyleControlsProps) {
  return (
    <div className="space-y-4">
      <Group title="Typography">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField label="Headline font" value={value.headlineFont} options={fontSelectOptions} onChange={(v) => onChange({ headlineFont: v })} />
          <SelectField label="Body font" value={value.bodyFont} options={fontSelectOptions} onChange={(v) => onChange({ bodyFont: v })} />
        </div>
        <RangeField label="Headline size" value={value.headlineSize} min={40} max={160} onChange={(v) => onChange({ headlineSize: v })} format={(v) => `${v}px`} />
        <RangeField label="Body size" value={value.bodySize} min={20} max={72} onChange={(v) => onChange({ bodySize: v })} format={(v) => `${v}px`} />
        <Toggle label="Uppercase headlines" checked={value.uppercaseHeadline} onChange={(v) => onChange({ uppercaseHeadline: v })} />
      </Group>

      <Group title="Color">
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Text" value={value.textColor} onChange={(v) => onChange({ textColor: v })} />
          <ColorField label="Emphasis" value={value.accentColor} onChange={(v) => onChange({ accentColor: v })} />
          <ColorField label="Background" value={value.backgroundColor} onChange={(v) => onChange({ backgroundColor: v })} />
        </div>
        <RangeField label="Image overlay" value={value.overlay} min={0} max={0.85} step={0.05} onChange={(v) => onChange({ overlay: v })} format={pct} />
      </Group>

      <Group title="Placement">
        <Segmented<HAlign>
          label="Horizontal alignment"
          value={value.hAlign}
          onChange={(v) => onChange({ hAlign: v })}
          options={[
          { value: 'left', label: <AlignLeftIcon className="h-4 w-4" />, ariaLabel: 'Align left' },
          { value: 'center', label: <AlignCenterIcon className="h-4 w-4" />, ariaLabel: 'Align center' },
          { value: 'right', label: <AlignRightIcon className="h-4 w-4" />, ariaLabel: 'Align right' }]
          } />
        
        <Segmented<VAlign>
          label="Vertical position"
          value={value.vAlign}
          onChange={(v) => onChange({ vAlign: v })}
          options={[
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Middle' },
          { value: 'bottom', label: 'Bottom' }]
          } />
        
      </Group>

      <Group title="Text box">
        <Toggle label="Background behind text" checked={value.boxEnabled} onChange={(v) => onChange({ boxEnabled: v })} />
        {value.boxEnabled &&
        <>
            <ColorField label="Box color" value={value.boxColor} onChange={(v) => onChange({ boxColor: v })} />
            <RangeField label="Box opacity" value={value.boxOpacity} min={0.1} max={1} step={0.05} onChange={(v) => onChange({ boxOpacity: v })} format={pct} />
            <RangeField label="Corner radius" value={value.boxRadius} min={0} max={80} onChange={(v) => onChange({ boxRadius: v })} format={(v) => `${v}px`} />
            <RangeField label="Box padding" value={value.boxPadding} min={16} max={96} onChange={(v) => onChange({ boxPadding: v })} format={(v) => `${v}px`} />
          </>
        }
      </Group>

      <Group title="Spacing">
        <RangeField label="Safe margin" value={value.safeMargin} min={32} max={180} onChange={(v) => onChange({ safeMargin: v })} format={(v) => `${v}px`} />
        <RangeField label="Line height" value={value.lineHeight} min={0.9} max={1.6} step={0.02} onChange={(v) => onChange({ lineHeight: v })} format={(v) => v.toFixed(2)} />
        <RangeField label="Letter spacing" value={value.letterSpacing} min={-2} max={10} step={0.5} onChange={(v) => onChange({ letterSpacing: v })} format={(v) => `${v}px`} />
        <RangeField label="Paragraph gap" value={value.paragraphGap} min={0} max={80} onChange={(v) => onChange({ paragraphGap: v })} format={(v) => `${v}px`} />
      </Group>

      <Group title="Readability">
        <Toggle label="Text shadow" checked={value.shadow} onChange={(v) => onChange({ shadow: v })} />
        <Toggle
          label="Auto-fit text"
          description="Shrinks copy until it fits inside the safe margins."
          checked={value.autoFit}
          onChange={(v) => onChange({ autoFit: v })} />
        
      </Group>
    </div>);

}