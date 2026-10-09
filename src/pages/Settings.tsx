import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon, CopyIcon, Loader2Icon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/Button';
import { RangeField } from '../components/ui/RangeField';
import { Segmented } from '../components/ui/Segmented';
import { useSettings } from '../contexts/SettingsContext';
import { useStudio } from '../contexts/StudioContext';
import {
  comfySetupSteps,
  geminiFunctionCode,
  geminiFunctionPath,
  geminiSetupSteps,
  httpProviderContract } from
'../data/setupGuides';
import type { ImageProviderId } from '../types/settings';
import { pingGemini } from '../utils/gemini';
import { checkImageProvider } from '../utils/imageProviders';
import { inputClass, labelClass } from '../utils/ui';

type TestState = {state: 'idle' | 'testing' | 'ok' | 'fail';message?: string;};

function Section({ id, title, description, children }: {id: string;title: string;description: string;children: React.ReactNode;}) {
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-line py-8 first:border-t-0 first:pt-0 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 id={id} className="text-sm font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>);

}

function TestResult({ test }: {test: TestState;}) {
  if (test.state === 'idle') return null;
  if (test.state === 'testing')
  return (
    <p className="flex items-center gap-1.5 text-xs text-ink-muted" role="status">
        <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden /> Testing…
      </p>);

  const ok = test.state === 'ok';
  return (
    <p className={`flex items-start gap-1.5 text-xs ${ok ? 'text-success' : 'text-danger'}`} role="status">
      {ok ? <CheckCircle2Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> : <XCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />}
      {test.message}
    </p>);

}

function Steps({ steps }: {steps: string[];}) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) =>
      <li key={s} className="flex gap-3 text-sm text-ink-muted">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold tabular-nums text-ink">
            {i + 1}
          </span>
          <span className="min-w-0 break-words">{s}</span>
        </li>
      )}
    </ol>);

}

export function Settings() {
  const { integrations, updateIntegrations } = useSettings();
  const { clearAll, projects } = useStudio();
  const [geminiTest, setGeminiTest] = useState<TestState>({ state: 'idle' });
  const [imageTest, setImageTest] = useState<TestState>({ state: 'idle' });
  const [storageInfo, setStorageInfo] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    navigator.storage?.
    estimate?.().
    then((e) => {
      if (e.usage !== undefined && e.quota) {
        setStorageInfo(`${(e.usage / 1e6).toFixed(1)} MB used of about ${(e.quota / 1e9).toFixed(1)} GB available to this site`);
      }
    }).
    catch(() => undefined);
  }, [projects.length]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(geminiFunctionCode);
      toast.success('Function code copied');
    } catch {
      toast.error('Clipboard is blocked in this browser.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader title="Settings" description="Connect the services that power one-click generation. Nothing here is sent anywhere except the URLs you enter." />

      <div className="mt-10">
        <Section id="gemini" title="Gemini script generation" description="Writes slide text, image prompts, captions and hashtags as validated JSON.">
          <div>
            <label htmlFor="gemini-endpoint" className={labelClass}>
              Secure function URL
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="gemini-endpoint"
                value={integrations.geminiEndpoint}
                onChange={(e) => {
                  updateIntegrations({ geminiEndpoint: e.target.value });
                  setGeminiTest({ state: 'idle' });
                }}
                placeholder={`https://your-site.netlify.app${geminiFunctionPath}`}
                className={inputClass}
                spellCheck={false} />
              
              <Button
                className="shrink-0"
                disabled={!integrations.geminiEndpoint.trim() || geminiTest.state === 'testing'}
                onClick={async () => {
                  setGeminiTest({ state: 'testing' });
                  const r = await pingGemini(integrations.geminiEndpoint);
                  setGeminiTest({ state: r.ok ? 'ok' : 'fail', message: r.message });
                }}>
                
                Test connection
              </Button>
            </div>
            <button
              type="button"
              onClick={() => updateIntegrations({ geminiEndpoint: geminiFunctionPath })}
              className="mt-2 text-xs text-ink-muted underline underline-offset-2 hover:text-ink">
              
              Use {geminiFunctionPath} on this site
            </button>
          </div>
          <TestResult test={geminiTest} />
          <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-ink-muted">
            Never paste your Gemini API key into this page. It belongs only in Netlify's environment variables, where the browser can't read it.
          </p>
          <Steps steps={geminiSetupSteps} />
          <details className="group rounded-lg border border-line">
            <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-ink">
              Function code · carosell-generate.mjs
              <span className="text-xs text-ink-subtle group-open:hidden">Show</span>
              <span className="hidden text-xs text-ink-subtle group-open:inline">Hide</span>
            </summary>
            <div className="border-t border-line">
              <div className="flex justify-end px-3 pt-2">
                <Button size="sm" variant="ghost" onClick={copyCode}>
                  <CopyIcon className="h-3.5 w-3.5" aria-hidden /> Copy
                </Button>
              </div>
              <pre className="scrollbar-thin max-h-[420px] overflow-auto px-3 pb-3 text-[11px] leading-relaxed text-ink-muted">
                <code>{geminiFunctionCode}</code>
              </pre>
            </div>
          </details>
        </Section>

        <Section
          id="images"
          title="Image engine"
          description="Creates backgrounds from the prompts. Text is never drawn by the image model — the editor adds it.">
          
          <Segmented<ImageProviderId>
            label="Image engine"
            value={integrations.imageProvider}
            onChange={(v) => {
              updateIntegrations({ imageProvider: v });
              setImageTest({ state: 'idle' });
            }}
            options={[
            { value: 'none', label: 'None' },
            { value: 'comfyui', label: 'ComfyUI (local)' },
            { value: 'http', label: 'Custom endpoint' }]
            } />
          

          {integrations.imageProvider === 'none' &&
          <p className="text-sm text-ink-muted">
              Without an engine, generation still writes every slide. You add backgrounds by uploading images.
            </p>
          }

          {integrations.imageProvider === 'comfyui' &&
          <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="comfy-url" className={labelClass}>
                    ComfyUI URL
                  </label>
                  <input
                  id="comfy-url"
                  value={integrations.comfyUrl}
                  onChange={(e) => updateIntegrations({ comfyUrl: e.target.value })}
                  className={inputClass}
                  spellCheck={false} />
                
                </div>
                <div>
                  <label htmlFor="comfy-ckpt" className={labelClass}>
                    Checkpoint filename
                  </label>
                  <input
                  id="comfy-ckpt"
                  value={integrations.comfyCheckpoint}
                  onChange={(e) => updateIntegrations({ comfyCheckpoint: e.target.value })}
                  className={inputClass}
                  spellCheck={false} />
                
                </div>
              </div>
              <RangeField
              label="Sampling steps"
              value={integrations.comfySteps}
              min={10}
              max={50}
              onChange={(v) => updateIntegrations({ comfySteps: v })} />
            
              <Steps steps={comfySetupSteps} />
            </>
          }

          {integrations.imageProvider === 'http' &&
          <>
              <div>
                <label htmlFor="http-endpoint" className={labelClass}>
                  Endpoint URL
                </label>
                <input
                id="http-endpoint"
                value={integrations.httpEndpoint}
                onChange={(e) => updateIntegrations({ httpEndpoint: e.target.value })}
                placeholder="https://your-image-service.example.com/generate"
                className={inputClass}
                spellCheck={false} />
              
              </div>
              <div>
                <p className={labelClass}>Expected request and response</p>
                <pre className="scrollbar-thin overflow-auto rounded-lg border border-line bg-surface-2 p-3 text-[11px] leading-relaxed text-ink-muted">
                  <code>{httpProviderContract}</code>
                </pre>
              </div>
            </>
          }

          {integrations.imageProvider !== 'none' &&
          <div className="space-y-2">
              <Button
              disabled={imageTest.state === 'testing'}
              onClick={async () => {
                setImageTest({ state: 'testing' });
                const r = await checkImageProvider(integrations);
                setImageTest({ state: r.ok ? 'ok' : 'fail', message: r.message });
              }}>
              
                Test connection
              </Button>
              <TestResult test={imageTest} />
            </div>
          }
        </Section>

        <Section
          id="quotas"
          title="Free-tier limits"
          description="Gemini's free tier has per-minute and per-day limits that change over time.">
          
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>When a limit is reached, generation stops at that stage with a clear message. Your slides are kept, and you can resume later.</li>
            <li>One slideshow uses one Gemini request. Rewriting or shortening a single slide uses one more.</li>
            <li>ComfyUI runs on your own computer, so it has no quota — only your GPU's speed.</li>
          </ul>
        </Section>

        <Section id="storage" title="Storage" description="Projects are saved in this browser's IndexedDB. There is no cloud sync.">
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>Survives refreshes and restarts on this device and browser.</li>
            <li>Does not appear on other devices or in other browsers.</li>
            <li>Clearing site data, or private browsing, removes saved projects.</li>
          </ul>
          {storageInfo && <p className="text-xs tabular-nums text-ink-subtle">{storageInfo}</p>}
          {confirmClear ?
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3">
              <p className="mr-auto text-sm text-ink">
                Delete all {projects.length} saved project{projects.length === 1 ? '' : 's'}? This can't be undone.
              </p>
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                Keep them
              </Button>
              <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                await clearAll();
                setConfirmClear(false);
                toast.success('All local projects deleted');
              }}>
              
                Delete all
              </Button>
            </div> :

          <Button variant="danger" onClick={() => setConfirmClear(true)} disabled={!projects.length}>
              Delete all local projects
            </Button>
          }
        </Section>
      </div>
    </div>);

}