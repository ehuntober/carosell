import React, { useRef, useState } from 'react';
import { ChevronDownIcon, SlidersHorizontalIcon, SparklesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGeneration } from '../../contexts/GenerationContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useStudio } from '../../contexts/StudioContext';
import type { ContentSettings } from '../../types/slides';
import { providerLabel } from '../../utils/imageProviders';
import { getTheme } from '../../utils/project';
import { Button } from '../ui/Button';
import { ComposerPreview } from './ComposerPreview';
import { ConnectionDialog } from './ConnectionDialog';
import { ContentSettingsForm } from './ContentSettingsForm';
import { PlatformPicker } from './PlatformPicker';
import { StyleControls } from './StyleControls';
import { ThemePicker } from './ThemePicker';
import { WorkflowIndicator } from './WorkflowIndicator';

export function StudioComposer() {
  const { project, update } = useStudio();
  const { geminiReady, imageReady, integrations } = useSettings();
  const gen = useGeneration();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showStyle, setShowStyle] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);
  const topicRef = useRef<HTMLTextAreaElement>(null);

  if (!project) return null;

  const setContent = (patch: Partial<ContentSettings>) =>
  update((p) => ({ ...p, content: { ...p.content, ...patch } }), { key: 'content' });

  const generate = () => {
    if (project.content.topic.trim().split(/\s+/).filter(Boolean).length < 2) {
      setTopicError('Describe your idea in at least a few words.');
      topicRef.current?.focus();
      return;
    }
    setTopicError(null);
    if (!geminiReady) {
      setDialogOpen(true);
      return;
    }
    void gen.start();
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">Create Your Next Viral Slideshow</h1>
        <p className="mt-2 text-sm text-ink-muted sm:text-base">
          Turn any idea into a beautifully designed, ready-to-publish carousel with AI.
        </p>
      </header>

      <WorkflowIndicator current={0} className="mt-5" />

      <section aria-label="Topic" className="mt-6 rounded-2xl border border-line bg-surface p-4 focus-within:border-line-strong sm:p-5">
        <label htmlFor="topic" className="text-sm font-medium text-ink">
          Topic or idea
        </label>
        <textarea
          id="topic"
          ref={topicRef}
          rows={2}
          value={project.content.topic}
          onChange={(e) => {
            setContent({ topic: e.target.value });
            if (topicError) setTopicError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              generate();
            }
          }}
          placeholder="e.g. 7 psychological tricks that make people respect you"
          aria-invalid={Boolean(topicError)}
          aria-describedby={topicError ? 'topic-error' : undefined}
          className="mt-2 w-full resize-none bg-transparent text-lg leading-snug text-ink placeholder:text-ink-subtle focus:outline-none sm:text-xl" />
        
        {topicError &&
        <p id="topic-error" role="alert" className="mt-1 text-xs text-danger">
            {topicError}
          </p>
        }
        <div className="mt-4 flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <dt className="text-ink-subtle">Script</dt>
              <dd className="flex items-center gap-1.5 text-ink">
                <span className={`h-1.5 w-1.5 rounded-full ${geminiReady ? 'bg-success' : 'bg-ink-subtle'}`} aria-hidden />
                {geminiReady ? 'Gemini' : 'Not connected'}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-ink-subtle">Backgrounds</dt>
              <dd className="flex items-center gap-1.5 text-ink">
                <span className={`h-1.5 w-1.5 rounded-full ${imageReady ? 'bg-success' : 'bg-ink-subtle'}`} aria-hidden />
                {imageReady ? providerLabel(integrations) : 'You add images'}
              </dd>
            </div>
            {(!geminiReady || !imageReady) &&
            <Link to="/settings" className="text-ink-muted underline underline-offset-2 hover:text-ink">
                Connect services
              </Link>
            }
          </dl>
          <Button variant="primary" size="lg" onClick={generate} disabled={gen.isRunning} className="w-full sm:w-auto">
            <SparklesIcon className="h-4 w-4" aria-hidden />
            Generate Slideshow
          </Button>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-10">
          <section aria-labelledby="content-heading">
            <h2 id="content-heading" className="mb-4 text-sm font-semibold text-ink">
              Content
            </h2>
            <ContentSettingsForm content={project.content} onChange={setContent} />
          </section>

          <section aria-labelledby="platform-heading">
            <h2 id="platform-heading" className="mb-4 text-sm font-semibold text-ink">
              Platform and size
            </h2>
            <PlatformPicker canvas={project.canvas} onChange={(canvas) => update((p) => ({ ...p, canvas }), { key: 'canvas' })} />
          </section>

          <section aria-labelledby="style-heading">
            <h2 id="style-heading" className="mb-4 text-sm font-semibold text-ink">
              Visual style
            </h2>
            <ThemePicker
              value={project.themeId}
              onSelect={(id) => update((p) => ({ ...p, themeId: id, style: { ...getTheme(id).style } }), { key: 'theme' })} />
            
            <button
              type="button"
              aria-expanded={showStyle}
              aria-controls="style-controls"
              onClick={() => setShowStyle((v) => !v)}
              className="mt-4 inline-flex items-center gap-2 rounded-md text-sm text-ink-muted transition-colors duration-150 hover:text-ink">
              
              <SlidersHorizontalIcon className="h-4 w-4" aria-hidden />
              Fine-tune typography and layout
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-150 ${showStyle ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {showStyle &&
            <div id="style-controls" className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
                <StyleControls
                value={project.style}
                onChange={(patch) => update((p) => ({ ...p, style: { ...p.style, ...patch } }), { key: `style-${Object.keys(patch).join()}` })} />
              
              </div>
            }
          </section>
        </div>

        <aside aria-label="Layout preview" className="lg:sticky lg:top-8 lg:self-start">
          <ComposerPreview project={project} />
        </aside>
      </div>

      <ConnectionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>);

}