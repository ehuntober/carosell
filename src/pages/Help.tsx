import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { featureStatus, type FeatureState } from '../data/featureStatus';

const stateMeta: Record<FeatureState, {label: string;className: string;}> = {
  working: { label: 'Working', className: 'bg-success/10 text-success' },
  'needs-setup': { label: 'Needs setup', className: 'bg-info/10 text-info' },
  preview: { label: 'Design preview', className: 'bg-warning/10 text-warning' },
  verify: { label: 'To verify', className: 'bg-surface-3 text-ink-muted' }
};

const pipeline = [
{ step: 'Idea', where: 'Your browser', text: 'Topic, niche, tone, audience, platform and style are collected.' },
{ step: 'Script', where: 'Netlify function → Gemini', text: 'Gemini returns slides as JSON. The studio validates every field before using it.' },
{ step: 'Images', where: 'ComfyUI or your endpoint', text: 'One background per slide from its prompt, with a shared style and seed for consistency.' },
{ step: 'Design', where: 'Your browser', text: 'The editor draws text over each image: wrapping, auto-fit, text boxes, contrast and safe margins.' },
{ step: 'Export', where: 'Your browser', text: 'Each slide is re-rendered at full size and saved as PNG/JPEG or a ZIP.' }];


export function Help() {
  return (
    <div className="mx-auto w-full max-w-[960px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <PageHeader title="Help & Documentation" description="How Carosell Studio works, what's live today, and what still needs to be connected." />

      <section aria-labelledby="how" className="mt-10">
        <h2 id="how" className="text-sm font-semibold text-ink">
          How a slideshow is made
        </h2>
        <ol className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {pipeline.map((p, i) =>
          <li key={p.step} className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_200px_minmax(0,1fr)] sm:gap-4">
              <span className="text-sm font-medium text-ink">
                <span className="mr-2 tabular-nums text-ink-subtle">{i + 1}</span>
                {p.step}
              </span>
              <span className="text-xs text-ink-muted sm:pt-0.5">{p.where}</span>
              <span className="text-sm text-ink-muted">{p.text}</span>
            </li>
          )}
        </ol>
      </section>

      <section aria-labelledby="status" className="mt-10">
        <h2 id="status" className="text-sm font-semibold text-ink">
          Feature status
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface-2 text-xs text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Feature
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {featureStatus.map((f) =>
              <tr key={f.feature} className="align-top">
                  <td className="px-4 py-3 text-ink">{f.feature}</td>
                  <td className="px-4 py-3">
                    <span className={`whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${stateMeta[f.state].className}`}>
                      {stateMeta[f.state].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{f.note}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="classic" className="mt-10 space-y-3">
        <h2 id="classic" className="text-sm font-semibold text-ink">
          Working alongside the classic Carosell editor
        </h2>
        <p className="text-sm text-ink-muted">
          The studio is a separate module, so the existing editor at thecarosell.netlify.app keeps working unchanged. Its source code wasn't
          available while this was built, so these points need checking against the repository before the two are merged:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
          <li>Whether the classic editor's canvas can render this project format, or whether one renderer should replace the other.</li>
          <li>How its upload, text and export code compares with this studio's, so shared pieces are reused instead of duplicated.</li>
          <li>Its routing and Netlify configuration, so the studio can live at a sub-route such as /studio.</li>
          <li>Its session saving, so both use the same storage and projects can move between them.</li>
        </ul>
      </section>

      <section aria-labelledby="limits" className="mt-10 space-y-3">
        <h2 id="limits" className="text-sm font-semibold text-ink">
          Good to know
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-muted">
          <li>Images from sites that block cross-origin access can be shown but not exported. Upload them from your device instead.</li>
          <li>Downloading separate files may trigger a "multiple downloads" prompt. The ZIP option avoids it.</li>
          <li>Local ComfyUI works from Chrome and Firefox. Safari blocks https pages from calling http://127.0.0.1.</li>
        </ul>
      </section>
    </div>);

}