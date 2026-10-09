import React, { useRef } from 'react';
import { Loader2Icon, RefreshCwIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGeneration } from '../../../contexts/GenerationContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useStudio } from '../../../contexts/StudioContext';
import type { Project, Slide, SlideImage } from '../../../types/slides';
import { getTheme } from '../../../utils/project';
import { Button } from '../../ui/Button';
import { RangeField } from '../../ui/RangeField';
import { TextAreaField } from '../../ui/TextAreaField';

interface ImageTabProps {
  project: Project;
  slide: Slide;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const sourceLabel: Record<string, string> = {
  generated: 'Generated',
  upload: 'Uploaded',
  sample: 'Sample image'
};

export function ImageTab({ project, slide, onUpload, onRemove }: ImageTabProps) {
  const { updateSlide } = useStudio();
  const { imageReady } = useSettings();
  const gen = useGeneration();
  const fileRef = useRef<HTMLInputElement>(null);
  const img = slide.image;
  const working = gen.busy[slide.id] === 'image' || img.status === 'generating';

  const setImage = (patch: Partial<SlideImage>, key: string) =>
  updateSlide(slide.id, (s) => ({ ...s, image: { ...s.image, ...patch } }), { key });

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink">Background</h3>
        <span className="text-xs text-ink-subtle">{img.src ? sourceLabel[img.source ?? 'upload'] : 'None yet'}</span>
      </div>

      {img.status === 'failed' &&
      <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs text-ink">
          <span className="font-medium text-danger">Generation failed.</span> {img.error}
        </div>
      }

      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={() => fileRef.current?.click()}>
          <UploadIcon className="h-3.5 w-3.5" aria-hidden />
          {img.src ? 'Replace' : 'Upload'}
        </Button>
        {img.src &&
        <Button size="sm" variant="ghost" onClick={onRemove}>
            <Trash2Icon className="h-3.5 w-3.5" aria-hidden /> Remove
          </Button>
        }
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
          }} />
        
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <TextAreaField
          label="Image prompt"
          value={img.prompt}
          onChange={(v) => setImage({ prompt: v }, `prompt-${slide.id}`)}
          rows={4}
          placeholder="Describe the background scene. No text — the app adds that."
          hint={`The ${getTheme(project.themeId).name} style is added so every slide matches.`} />
        
        <Button size="sm" variant="secondary" className="w-full" disabled={working || !imageReady} onClick={() => void gen.regenerateImage(slide.id)}>
          {working ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden />}
          {working ? 'Generating…' : img.src ? 'Regenerate image' : 'Generate image'}
        </Button>
        {!imageReady &&
        <p className="text-[11px] text-ink-subtle">
            No image engine connected.{' '}
            <Link to="/settings" className="text-ink-muted underline underline-offset-2 hover:text-ink">
              Connect ComfyUI
            </Link>{' '}
            or upload your own image.
          </p>
        }
      </div>

      {img.src &&
      <fieldset className="space-y-3 border-t border-line pt-4">
          <div className="flex items-center justify-between">
            <legend className="text-xs font-semibold text-ink">Framing</legend>
            <button
            type="button"
            onClick={() => setImage({ focusX: 0.5, focusY: 0.5, zoom: 1 }, `frame-reset-${slide.id}`)}
            className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
            
              Reset
            </button>
          </div>
          <RangeField label="Zoom" value={img.zoom} min={1} max={3} step={0.05} onChange={(v) => setImage({ zoom: v }, `zoom-${slide.id}`)} format={(v) => `${v.toFixed(2)}×`} />
          <RangeField label="Horizontal position" value={img.focusX} min={0} max={1} step={0.01} onChange={(v) => setImage({ focusX: v }, `fx-${slide.id}`)} format={(v) => `${Math.round(v * 100)}%`} />
          <RangeField label="Vertical position" value={img.focusY} min={0} max={1} step={0.01} onChange={(v) => setImage({ focusY: v }, `fy-${slide.id}`)} format={(v) => `${Math.round(v * 100)}%`} />
          <p className="hidden text-[11px] text-ink-subtle lg:block">Tip: drag the image on the canvas to reposition it.</p>
        </fieldset>
      }
    </div>);

}