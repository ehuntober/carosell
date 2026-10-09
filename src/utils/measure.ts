import type { Project, Slide } from '../types/slides';
import type { SlideCheckMetrics } from '../types/quality';
import { ensureFonts } from './fonts';
import { loadImage, type LoadedImage } from './imageCache';
import { resolveStyle } from './project';
import { renderSlide } from './renderSlide';

const MEASURE_WIDTH = 540;

export async function measureSlide(project: Project, slide: Slide): Promise<SlideCheckMetrics> {
  const width = MEASURE_WIDTH;
  const height = Math.round(width * project.canvas.height / project.canvas.width);
  const style = resolveStyle(project, slide);
  await ensureFonts([style.headlineFont, style.bodyFont]);

  let image: LoadedImage | null = null;
  let imageError: string | null = null;
  if (slide.image.src) {
    try {
      image = await loadImage(slide.image.src);
    } catch (e) {
      imageError = e instanceof Error ? e.message : 'Image failed to load';
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { overflow: false, fitScale: 1, contrast: null, suggestedTextColor: null, tainted: false, imageError, imageSize: null };
  }
  const m = renderSlide(ctx, { project, slide, width, height, image, sampleBackdrop: true });
  return {
    overflow: m.overflow,
    fitScale: m.fitScale,
    contrast: m.contrast,
    suggestedTextColor: m.suggestedTextColor,
    tainted: Boolean(image?.tainted),
    imageError,
    imageSize: image ? { w: image.img.naturalWidth, h: image.img.naturalHeight } : null
  };
}

export async function measureProject(project: Project): Promise<Record<string, SlideCheckMetrics>> {
  const entries = await Promise.all(
    project.slides.map(async (s) => [s.id, await measureSlide(project, s)] as const)
  );
  return Object.fromEntries(entries);
}