import JSZip from 'jszip';
import type { Project, Slide } from '../types/slides';
import { ensureFonts } from './fonts';
import { loadImage, type LoadedImage } from './imageCache';
import { resolveStyle, slugify } from './project';
import { renderSlide } from './renderSlide';

export type ExportFormat = 'png' | 'jpeg';

export function slideFilename(index: number, format: ExportFormat): string {
  return `carosell-slide-${String(index + 1).padStart(2, '0')}.${format === 'png' ? 'png' : 'jpg'}`;
}

export function zipFilename(project: Project): string {
  return `carosell-${slugify(project.name)}.zip`;
}

export function captionText(project: Project): string {
  return [project.caption.trim(), project.hashtags.join(' ')].filter(Boolean).join('\n\n');
}

export async function renderSlideCanvas(project: Project, slide: Slide, index: number): Promise<HTMLCanvasElement> {
  const { width, height } = project.canvas;
  const style = resolveStyle(project, slide);
  await ensureFonts([style.headlineFont, style.bodyFont]);

  let image: LoadedImage | null = null;
  if (slide.image.src) {
    try {
      image = await loadImage(slide.image.src);
    } catch {
      throw new Error(`Slide ${index + 1}: the background image failed to load.`);
    }
    if (image.tainted) {
      throw new Error(`Slide ${index + 1}: the image host blocks exporting. Re-upload the image from your device.`);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create a drawing surface.');
  renderSlide(ctx, { project, slide, width, height, image });
  return canvas;
}

export async function renderSlideBlob(
project: Project,
slide: Slide,
index: number,
format: ExportFormat,
quality: number)
: Promise<Blob> {
  const canvas = await renderSlideCanvas(project, slide, index);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error(`Slide ${index + 1} could not be encoded.`)),
      format === 'png' ? 'image/png' : 'image/jpeg',
      format === 'jpeg' ? quality : undefined
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function buildZip(
project: Project,
format: ExportFormat,
quality: number,
includeCaption: boolean,
onProgress: (done: number, total: number) => void)
: Promise<Blob> {
  const zip = new JSZip();
  const total = project.slides.length;
  for (let i = 0; i < total; i += 1) {
    const blob = await renderSlideBlob(project, project.slides[i], i, format, quality);
    zip.file(slideFilename(i, format), blob);
    onProgress(i + 1, total);
  }
  const caption = captionText(project);
  if (includeCaption && caption) zip.file('caption.txt', caption);
  return zip.generateAsync({ type: 'blob' });
}