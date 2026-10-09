import type { Project, TextStyle } from '../types/slides';
import type { QualityIssue, SlideCheckMetrics } from '../types/quality';
import { getPlatform } from './project';

const SPACING_KEYS: {key: keyof TextStyle;label: string;}[] = [
{ key: 'safeMargin', label: 'margin' },
{ key: 'boxPadding', label: 'padding' },
{ key: 'lineHeight', label: 'line height' },
{ key: 'paragraphGap', label: 'paragraph gap' },
{ key: 'letterSpacing', label: 'letter spacing' }];


export function runQualityChecks(project: Project, metrics: Record<string, SlideCheckMetrics>): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const { width: W, height: H, platform } = project.canvas;
  const preset = getPlatform(platform);

  if (platform !== 'custom' && (W !== preset.width || H !== preset.height)) {
    issues.push({
      id: 'canvas-size',
      slideId: null,
      slideIndex: null,
      severity: 'error',
      code: 'aspect',
      title: `Canvas isn't ${preset.ratio}`,
      detail: `${preset.label} expects ${preset.width} × ${preset.height}, but slides are ${W} × ${H}.`,
      fixes: [{ action: 'fix-canvas', label: `Reset to ${preset.width} × ${preset.height}` }]
    });
  }
  if (platform === 'custom' && (W < 320 || H < 320 || W > 4096 || H > 4096)) {
    issues.push({
      id: 'canvas-bounds',
      slideId: null,
      slideIndex: null,
      severity: 'error',
      code: 'aspect',
      title: 'Custom size is out of range',
      detail: 'Use between 320 and 4096 pixels on each side.',
      fixes: [{ action: 'fix-canvas', label: 'Reset to 1080 × 1440' }]
    });
  }

  const seen = new Map<string, number>();

  project.slides.forEach((slide, i) => {
    const m = metrics[slide.id];
    const n = i + 1;
    const base = { slideId: slide.id, slideIndex: i };
    const hasText = Boolean(slide.headline.trim() || slide.body.trim());

    if (!hasText && !slide.image.src && slide.image.status !== 'generating') {
      issues.push({
        ...base,
        id: `blank-${slide.id}`,
        severity: 'error',
        code: 'blank',
        title: `Slide ${n} is blank`,
        detail: 'No text and no background image.',
        fixes: [{ action: 'open-slide', label: 'Edit slide' }]
      });
      return;
    }

    if (!slide.headline.trim()) {
      issues.push({
        ...base,
        id: `headline-${slide.id}`,
        severity: 'warning',
        code: 'empty-headline',
        title: 'Headline is empty',
        detail: 'Every slide needs a headline to carry the story.',
        fixes: [{ action: 'open-slide', label: 'Write headline' }]
      });
    }

    if (slide.image.status === 'failed') {
      issues.push({
        ...base,
        id: `image-failed-${slide.id}`,
        severity: 'error',
        code: 'image-failed',
        title: 'Background failed to generate',
        detail: slide.image.error ?? 'The image engine returned an error.',
        fixes: [
        { action: 'generate-image', label: 'Retry image' },
        { action: 'upload-image', label: 'Upload instead' }]

      });
    } else if (m?.imageError) {
      issues.push({
        ...base,
        id: `image-load-${slide.id}`,
        severity: 'error',
        code: 'image-load',
        title: 'Background image failed to load',
        detail: 'The file may have moved or be corrupted.',
        fixes: [{ action: 'upload-image', label: 'Replace image' }]
      });
    } else if (!slide.image.src && slide.image.status !== 'generating') {
      issues.push({
        ...base,
        id: `image-missing-${slide.id}`,
        severity: 'warning',
        code: 'missing-image',
        title: 'No background image',
        detail: 'This slide will export on a solid background color.',
        fixes: [
        { action: 'generate-image', label: 'Generate' },
        { action: 'upload-image', label: 'Upload' }]

      });
    }

    if (m?.tainted) {
      issues.push({
        ...base,
        id: `image-blocked-${slide.id}`,
        severity: 'error',
        code: 'image-blocked',
        title: "Image can't be exported",
        detail: "Its host blocks pixel access, so the browser can't save this slide. Re-upload the file from your device.",
        fixes: [{ action: 'upload-image', label: 'Re-upload image' }]
      });
    }

    if (m?.overflow) {
      issues.push({
        ...base,
        id: `overflow-${slide.id}`,
        severity: 'error',
        code: 'overflow',
        title: "Text doesn't fit",
        detail: 'Even at the smallest auto-fit size, the copy runs outside the safe area.',
        fixes: [
        { action: 'shorten-copy', label: 'Shorten copy' },
        { action: 'fit-text', label: 'Shrink text' }]

      });
    }

    if (hasText && m && m.contrast !== null && m.contrast < 3) {
      const suggested = m.suggestedTextColor ?? '#ffffff';
      issues.push({
        ...base,
        id: `contrast-${slide.id}`,
        severity: 'warning',
        code: 'low-contrast',
        title: `Low text contrast (${m.contrast.toFixed(1)}:1)`,
        detail: 'Text may be hard to read on this background. Aim for at least 3:1.',
        suggestedColor: suggested,
        fixes: [
        { action: 'enable-box', label: 'Add text box' },
        { action: 'swap-text-color', label: suggested === '#ffffff' ? 'Use white text' : 'Use dark text' }]

      });
    }

    if (m?.imageSize) {
      const ratio = m.imageSize.w / m.imageSize.h / (W / H);
      if (ratio > 1.6 || ratio < 0.625) {
        issues.push({
          ...base,
          id: `crop-${slide.id}`,
          severity: 'warning',
          code: 'crop',
          title: 'Image will be heavily cropped',
          detail: `The image is ${m.imageSize.w} × ${m.imageSize.h}, a very different shape from the ${W} × ${H} slide.`,
          fixes: [{ action: 'open-slide', label: 'Adjust framing' }]
        });
      }
    }

    const drift = SPACING_KEYS.filter(({ key }) => key in slide.overrides && slide.overrides[key] !== project.style[key]);
    if (drift.length) {
      issues.push({
        ...base,
        id: `spacing-${slide.id}`,
        severity: 'warning',
        code: 'spacing',
        title: 'Spacing differs from other slides',
        detail: `Custom ${drift.map((d) => d.label).join(', ')} on this slide.`,
        fixes: [{ action: 'reset-spacing', label: 'Match other slides' }]
      });
    }

    const key = slide.headline.trim().toLowerCase();
    if (key) {
      const prev = seen.get(key);
      if (prev !== undefined) {
        issues.push({
          ...base,
          id: `duplicate-${slide.id}`,
          severity: 'warning',
          code: 'duplicate',
          title: `Same headline as slide ${prev + 1}`,
          detail: 'Repeated slides weaken the carousel. Rewrite or delete one.',
          fixes: [{ action: 'open-slide', label: 'Edit slide' }]
        });
      } else {
        seen.set(key, i);
      }
    }

    if (slide.headline.length > 120) {
      issues.push({
        ...base,
        id: `long-${slide.id}`,
        severity: 'warning',
        code: 'malformed',
        title: 'Headline is unusually long',
        detail: 'Headlines over 120 characters usually mean malformed or unedited content.',
        fixes: [{ action: 'shorten-copy', label: 'Shorten copy' }]
      });
    }
  });

  return issues;
}