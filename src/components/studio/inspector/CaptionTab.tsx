import React, { useEffect, useId, useState } from 'react';
import { CopyIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useGeneration } from '../../../contexts/GenerationContext';
import { useSettings } from '../../../contexts/SettingsContext';
import { useStudio } from '../../../contexts/StudioContext';
import { SCRIPT_BUSY_KEY } from '../../../hooks/useGenerationPipeline';
import type { Project } from '../../../types/slides';
import { captionText } from '../../../utils/exportSlides';
import { inputClass, labelClass } from '../../../utils/ui';
import { Button } from '../../ui/Button';
import { TextAreaField } from '../../ui/TextAreaField';
import { Toggle } from '../../ui/Toggle';

interface CaptionTabProps {
  project: Project;
}

export function CaptionTab({ project }: CaptionTabProps) {
  const { update } = useStudio();
  const { geminiReady } = useSettings();
  const gen = useGeneration();
  const hashtagsId = useId();
  const topicId = useId();
  const [keepEdited, setKeepEdited] = useState(true);
  const tagsKey = project.hashtags.join(' ');
  const [tagsDraft, setTagsDraft] = useState(tagsKey);
  const scriptBusy = Boolean(gen.busy[SCRIPT_BUSY_KEY]);
  const editedCount = project.slides.filter((s) => s.textEdited).length;

  useEffect(() => setTagsDraft(tagsKey), [tagsKey]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(captionText(project));
      toast.success('Caption copied');
    } catch {
      toast.error('Clipboard is blocked in this browser.');
    }
  };

  return (
    <div className="space-y-5">
      <TextAreaField
        label="Caption"
        value={project.caption}
        onChange={(v) => update((p) => ({ ...p, caption: v }), { key: 'caption' })}
        rows={5}
        placeholder="Write the post caption that goes with this carousel." />
      
      <div>
        <label htmlFor={hashtagsId} className={labelClass}>
          Hashtags
        </label>
        <input
          id={hashtagsId}
          value={tagsDraft}
          onChange={(e) => setTagsDraft(e.target.value)}
          onBlur={() =>
          update(
            (p) => ({
              ...p,
              hashtags: tagsDraft.
              split(/[\s,]+/).
              map((t) => t.trim()).
              filter(Boolean).
              map((t) => t.startsWith('#') ? t : `#${t}`)
            }),
            { key: 'hashtags' }
          )
          }
          placeholder="#psychology #mindset"
          className={inputClass} />
        
      </div>
      <Button size="sm" className="w-full" onClick={copy} disabled={!captionText(project)}>
        <CopyIcon className="h-3.5 w-3.5" aria-hidden /> Copy caption and hashtags
      </Button>

      <div className="space-y-3 border-t border-line pt-4">
        <p className="text-xs font-semibold text-ink">Script</p>
        <div>
          <label htmlFor={topicId} className={labelClass}>
            Topic
          </label>
          <input
            id={topicId}
            value={project.content.topic}
            onChange={(e) => update((p) => ({ ...p, content: { ...p.content, topic: e.target.value } }), { key: 'topic' })}
            className={inputClass} />
          
        </div>
        <p className="text-xs text-ink-subtle">
          {project.content.niche === 'Custom' ? project.content.customNiche || 'Custom' : project.content.niche} · {project.content.tone} ·{' '}
          {project.content.language} · {project.content.slideCount} slides
        </p>
        <Toggle
          label="Keep slides I've edited"
          description={editedCount ? `${editedCount} slide${editedCount > 1 ? 's have' : ' has'} hand-edited text.` : 'No hand-edited slides yet.'}
          checked={keepEdited}
          onChange={setKeepEdited} />
        
        <Button size="sm" variant="secondary" className="w-full" disabled={!geminiReady || scriptBusy} onClick={() => void gen.regenerateScript(keepEdited)}>
          {scriptBusy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden />}
          Regenerate script
        </Button>
        <p className="text-[11px] text-ink-subtle">
          {geminiReady ? 'Images, styles and framing are kept. Only the text changes.' : 'Connect Gemini in Settings to regenerate the script.'}
        </p>
      </div>
    </div>);

}