import React from 'react';
import { AlertTriangleIcon, Loader2Icon, OctagonAlertIcon, ShieldCheckIcon } from 'lucide-react';
import type { FixAction, QualityIssue } from '../../../types/quality';
import { Button } from '../../ui/Button';

interface QualityPanelProps {
  issues: QualityIssue[];
  checking: boolean;
  onFix: (issue: QualityIssue, action: FixAction) => void;
  onSelectSlide: (id: string) => void;
}

export function QualityPanel({ issues, checking, onFix, onSelectSlide }: QualityPanelProps) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const ordered = [...errors, ...warnings];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Quality checks</h3>
        {checking &&
        <span className="flex items-center gap-1.5 text-xs text-ink-subtle" role="status">
            <Loader2Icon className="h-3 w-3 animate-spin" aria-hidden /> Checking
          </span>
        }
      </div>

      {ordered.length === 0 ?
      <div className="flex items-start gap-3 rounded-lg border border-line p-3">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
          <div>
            <p className="text-sm text-ink">Ready to export</p>
            <p className="mt-0.5 text-xs text-ink-muted">Text fits, contrast is readable and every slide renders.</p>
          </div>
        </div> :

      <>
          <p className="text-xs text-ink-muted">
            {errors.length > 0 && <span className="text-danger">{errors.length} to fix</span>}
            {errors.length > 0 && warnings.length > 0 && ' · '}
            {warnings.length > 0 && <span className="text-warning">{warnings.length} to review</span>}
          </p>
          <ul className="divide-y divide-line">
            {ordered.map((issue) => {
            const Icon = issue.severity === 'error' ? OctagonAlertIcon : AlertTriangleIcon;
            return (
              <li key={issue.id} className="py-3 first:pt-0">
                  <div className="flex items-start gap-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${issue.severity === 'error' ? 'text-danger' : 'text-warning'}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm text-ink">{issue.title}</p>
                        {issue.slideId && issue.slideIndex !== null &&
                      <button
                        type="button"
                        onClick={() => onSelectSlide(issue.slideId as string)}
                        className="shrink-0 text-xs tabular-nums text-ink-muted underline underline-offset-2 hover:text-ink">
                        
                            Slide {issue.slideIndex + 1}
                          </button>
                      }
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">{issue.detail}</p>
                      {issue.fixes.length > 0 &&
                    <div className="mt-2 flex flex-wrap gap-1.5">
                          {issue.fixes.map((f) =>
                      <Button key={f.action} size="sm" variant="secondary" onClick={() => onFix(issue, f.action)}>
                              {f.label}
                            </Button>
                      )}
                        </div>
                    }
                    </div>
                  </div>
                </li>);

          })}
          </ul>
        </>
      }
    </div>);

}