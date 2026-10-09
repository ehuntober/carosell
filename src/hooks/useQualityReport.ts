import { useEffect, useState } from 'react';
import type { Project } from '../types/slides';
import type { QualityIssue, SlideCheckMetrics } from '../types/quality';
import { measureProject } from '../utils/measure';
import { runQualityChecks } from '../utils/quality';

interface QualityReport {
  issues: QualityIssue[];
  metrics: Record<string, SlideCheckMetrics>;
  checking: boolean;
}

export function useQualityReport(project: Project | null): QualityReport {
  const [report, setReport] = useState<QualityReport>({ issues: [], metrics: {}, checking: false });

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setReport((r) => ({ ...r, checking: true }));
    const t = window.setTimeout(async () => {
      try {
        const metrics = await measureProject(project);
        if (cancelled) return;
        setReport({ issues: runQualityChecks(project, metrics), metrics, checking: false });
      } catch {
        if (!cancelled) setReport((r) => ({ ...r, checking: false }));
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [project]);

  return report;
}