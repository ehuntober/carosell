import React, { useState } from 'react';
import { AlertTriangleIcon, DownloadIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import type { QualityIssue } from '../../types/quality';
import type { Project } from '../../types/slides';
import {
  buildZip,
  captionText,
  downloadBlob,
  renderSlideBlob,
  slideFilename,
  zipFilename,
  type ExportFormat } from
'../../utils/exportSlides';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RangeField } from '../ui/RangeField';
import { Segmented } from '../ui/Segmented';
import { Toggle } from '../ui/Toggle';

type Scope = 'zip' | 'each' | 'current';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  currentIndex: number;
  issues: QualityIssue[];
  onReview: () => void;
}

const scopes: {id: Scope;title: string;text: string;}[] = [
{ id: 'zip', title: 'All slides as a ZIP', text: 'One download with every slide in order.' },
{ id: 'each', title: 'All slides, separate files', text: 'Your browser may ask to allow multiple downloads.' },
{ id: 'current', title: 'Current slide only', text: 'Just the slide you are editing.' }];


function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function ExportDialog({ open, onClose, project, currentIndex, issues, onReview }: ExportDialogProps) {
  const [scope, setScope] = useState<Scope>('zip');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [includeCaption, setIncludeCaption] = useState(true);
  const [progress, setProgress] = useState<{done: number;total: number;} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const errors = issues.filter((i) => i.severity === 'error');
  const hasCaption = Boolean(captionText(project));
  const total = project.slides.length;
  const busy = progress !== null;

  const run = async () => {
    setError(null);
    try {
      if (scope === 'current') {
        setProgress({ done: 0, total: 1 });
        const slide = project.slides[currentIndex];
        const blob = await renderSlideBlob(project, slide, currentIndex, format, quality);
        downloadBlob(blob, slideFilename(currentIndex, format));
      } else if (scope === 'each') {
        for (let i = 0; i < total; i += 1) {
          setProgress({ done: i, total });
          const blob = await renderSlideBlob(project, project.slides[i], i, format, quality);
          downloadBlob(blob, slideFilename(i, format));
          await wait(300);
        }
      } else {
        setProgress({ done: 0, total });
        const blob = await buildZip(project, format, quality, includeCaption, (done, t) => setProgress({ done, total: t }));
        downloadBlob(blob, zipFilename(project));
      }
      toast.success('Export complete');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setProgress(null);
    }
  };

  const ext = format === 'png' ? 'png' : 'jpg';
  const fileSummary =
  scope === 'zip' ?
  `${zipFilename(project)} — ${total} × .${ext}${includeCaption && hasCaption ? ' + caption.txt' : ''}` :
  scope === 'each' ?
  `${slideFilename(0, format)} … ${slideFilename(total - 1, format)}` :
  slideFilename(currentIndex, format);

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      title="Export slides"
      description={`${project.canvas.width} × ${project.canvas.height} px · rendered from the slide artwork, not a screenshot.`}
      footer={
      <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={run} disabled={busy || total === 0}>
            {busy ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <DownloadIcon className="h-4 w-4" aria-hidden />}
            {busy ? 'Exporting…' : errors.length ? 'Export anyway' : 'Download'}
          </Button>
        </>
      }>
      
      <div className="space-y-5">
        {errors.length > 0 &&
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-3">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
            <div className="flex-1">
              <p className="text-sm text-ink">
                {errors.length} issue{errors.length > 1 ? 's' : ''} will affect these slides
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{errors[0].title}{errors.length > 1 ? ` and ${errors.length - 1} more` : ''}.</p>
            </div>
            <Button size="sm" variant="secondary" onClick={onReview}>
              Review
            </Button>
          </div>
        }

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-ink">What to export</legend>
          <div role="radiogroup" className="space-y-2">
            {scopes.map((s) => {
              const active = scope === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setScope(s.id)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-150 ${
                  active ? 'border-accent bg-accent/5' : 'border-line hover:border-line-strong'}`
                  }>
                  
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-accent' : 'border-line-strong'}`}>
                    {active && <span className="h-2 w-2 rounded-full bg-accent" />}
                  </span>
                  <span>
                    <span className="block text-sm text-ink">{s.title}</span>
                    <span className="block text-xs text-ink-muted">{s.text}</span>
                  </span>
                </button>);

            })}
          </div>
        </fieldset>

        <div className="space-y-3">
          <Segmented<ExportFormat>
            label="File format"
            value={format}
            onChange={setFormat}
            options={[
            { value: 'png', label: 'PNG · lossless' },
            { value: 'jpeg', label: 'JPEG · smaller' }]
            } />
          
          {format === 'jpeg' &&
          <RangeField label="JPEG quality" value={quality} min={0.6} max={1} step={0.02} onChange={setQuality} format={(v) => `${Math.round(v * 100)}%`} />
          }
          {scope === 'zip' && hasCaption &&
          <Toggle label="Include caption.txt" description="Caption and hashtags as a text file." checked={includeCaption} onChange={setIncludeCaption} />
          }
        </div>

        <p className="break-all rounded-lg bg-surface-2 px-3 py-2 text-xs tabular-nums text-ink-muted">{fileSummary}</p>

        {progress &&
        <div role="status" aria-live="polite">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
              className="h-full bg-accent transition-[width] duration-200 ease-out"
              style={{ width: `${progress.total ? progress.done / progress.total * 100 : 0}%` }} />
            
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">
              Rendering {Math.min(progress.done + 1, progress.total)} of {progress.total}
            </p>
          </div>
        }

        {error &&
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-ink">
            {error}
          </p>
        }
      </div>
    </Modal>);

}