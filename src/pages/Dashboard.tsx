import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon, CheckCircle2Icon, CircleIcon, SparklesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { SlideCanvas } from '../components/SlideCanvas';
import { Button } from '../components/ui/Button';
import { useSettings } from '../contexts/SettingsContext';
import { useStudio } from '../contexts/StudioContext';
import { useOpenProject } from '../hooks/useOpenProject';

export function Dashboard() {
  const { projects, loading } = useStudio();
  const { geminiReady, imageReady, brandKit } = useSettings();
  const nav = useOpenProject();
  const [topic, setTopic] = useState('');

  const checklist = [
  { label: 'Connect Gemini for scripts', done: geminiReady, to: '/settings', note: 'Secure Netlify function' },
  { label: 'Connect an image engine', done: imageReady, to: '/settings', note: 'ComfyUI on your computer' },
  { label: 'Set up your brand kit', done: Boolean(brandKit.brandName || brandKit.applyToNewProjects), to: '/brand-kit', note: 'Fonts and colors' }];

  const doneCount = checklist.filter((c) => c.done).length;
  const recent = projects.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader title="Dashboard" description="Start a new slideshow or pick up where you left off." />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nav.startNew({ topic });
            }}
            className="rounded-2xl border border-line bg-surface p-5">
            
            <label htmlFor="dash-topic" className="text-sm font-medium text-ink">
              What's your next slideshow about?
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="dash-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 7 psychological tricks that make people respect you"
                className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-3 text-sm text-ink placeholder:text-ink-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" />
              
              <Button type="submit" variant="primary" size="lg">
                <SparklesIcon className="h-4 w-4" aria-hidden /> Open in Studio
              </Button>
            </div>
            <p className="mt-3 text-xs text-ink-subtle">You'll choose the niche, platform and style on the next screen.</p>
          </form>

          <section aria-labelledby="recent-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-heading" className="text-sm font-semibold text-ink">
                Recent projects
              </h2>
              {projects.length > 0 &&
              <Link to="/projects" className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
                  View all <ArrowRightIcon className="h-3 w-3" aria-hidden />
                </Link>
              }
            </div>
            {loading ?
            <p className="text-sm text-ink-muted">Loading…</p> :
            recent.length === 0 ?
            <div className="rounded-2xl border border-dashed border-line-strong px-5 py-10 text-center">
                <p className="text-sm text-ink">Nothing here yet</p>
                <p className="mt-1 text-sm text-ink-muted">Your slideshows will show up here, saved in this browser.</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={nav.openSample}>
                  Explore the sample slideshow
                </Button>
              </div> :

            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                {recent.map((p) =>
              <li key={p.id}>
                    <button
                  type="button"
                  onClick={() => void nav.open(p.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-2">
                  
                      <span className="h-14 w-14 shrink-0">
                        {p.slides[0] ?
                    <SlideCanvas project={p} slide={p.slides[0]} label="" frameClassName="rounded" /> :

                    <span className="block h-full w-full rounded bg-surface-2" />
                    }
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{p.name}</span>
                        <span className="block text-xs text-ink-subtle">
                          {p.slides.length} slides · {formatDistanceToNow(p.updatedAt, { addSuffix: true })}
                        </span>
                      </span>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
                    </button>
                  </li>
              )}
              </ul>
            }
          </section>
        </div>

        <aside aria-labelledby="setup-heading" className="lg:pt-0">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <h2 id="setup-heading" className="text-sm font-semibold text-ink">
                Automation setup
              </h2>
              <span className="text-xs tabular-nums text-ink-subtle">
                {doneCount} of {checklist.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">The editor works without these. They unlock one-click generation.</p>
            <ul className="mt-4 space-y-1">
              {checklist.map((c) =>
              <li key={c.label}>
                  <Link to={c.to} className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-surface-2">
                    {c.done ?
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> :

                  <CircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
                  }
                    <span>
                      <span className={`block text-sm ${c.done ? 'text-ink-muted line-through' : 'text-ink'}`}>{c.label}</span>
                      <span className="block text-xs text-ink-subtle">{c.note}</span>
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>);

}