import type { Project, Slide, TextStyle } from '../types/slides';
import { bestTextColor, blend, contrastRatio, hexToRgb, rgba, type RGB } from './color';
import { headlineWeight } from './fonts';
import type { LoadedImage } from './imageCache';
import { resolveStyle } from './project';

/**
 * The single slide renderer. The editor canvas, thumbnails, quality checks and
 * exports all draw through this function, so what you see is what you download.
 */

export const BASE_WIDTH = 1080;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Word {
  text: string;
  width: number;
  emphasized: boolean;
}

interface Line {
  words: Word[];
  width: number;
}

interface Block {
  lines: Line[];
  font: string;
  lineHeight: number;
  color: string;
  alpha: number;
  gapBefore: number;
  spaceWidth: number;
  letterSpacing: number;
}

interface Layout {
  blocks: Block[];
  height: number;
  width: number;
  tooWide: boolean;
}

export interface RenderOptions {
  project: Project;
  slide: Slide;
  width: number;
  height: number;
  image: LoadedImage | null;
  sampleBackdrop?: boolean;
}

export interface RenderMetrics {
  overflow: boolean;
  fitScale: number;
  boxRect: Rect | null;
  contrast: number | null;
  suggestedTextColor: string | null;
}

export function coverRect(iw: number, ih: number, W: number, H: number, zoom: number, fx: number, fy: number): Rect {
  const s = Math.max(W / iw, H / ih) * Math.max(1, zoom);
  const w = iw * s;
  const h = ih * s;
  return { x: (W - w) * fx, y: (H - h) * fy, w, h };
}

export function renderSlide(ctx: CanvasRenderingContext2D, opts: RenderOptions): RenderMetrics {
  const { project, slide, width: W, height: H, image } = opts;
  const style = resolveStyle(project, slide);
  const scale = W / BASE_WIDTH;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(0, 0, W, H);

  if (image && image.img.naturalWidth && image.img.naturalHeight) {
    const r = coverRect(
      image.img.naturalWidth,
      image.img.naturalHeight,
      W,
      H,
      slide.image.zoom,
      slide.image.focusX,
      slide.image.focusY
    );
    ctx.drawImage(image.img, r.x, r.y, r.w, r.h);
    if (style.overlay > 0) {
      ctx.fillStyle = rgba(style.backgroundColor, style.overlay);
      ctx.fillRect(0, 0, W, H);
    }
  }

  const margin = style.safeMargin * scale;
  const pad = style.boxEnabled ? style.boxPadding * scale : 0;
  const maxW = Math.max(40, W - 2 * margin - 2 * pad);
  const maxH = Math.max(40, H - 2 * margin - 2 * pad);

  let k = 1;
  let layout = buildLayout(ctx, slide, style, scale, k, maxW);
  if (style.autoFit) {
    while ((layout.height > maxH || layout.tooWide) && k > 0.56) {
      k = Math.round((k - 0.05) * 100) / 100;
      layout = buildLayout(ctx, slide, style, scale, k, maxW);
    }
  }
  const overflow = layout.height > maxH + 0.5 || layout.tooWide;

  let boxRect: Rect | null = null;
  let contrast: number | null = null;
  let suggestedTextColor: string | null = null;

  if (layout.blocks.length) {
    const contentW = Math.min(layout.width, maxW);
    const boxW = contentW + 2 * pad;
    const boxH = layout.height + 2 * pad;
    const x = style.hAlign === 'left' ? margin : style.hAlign === 'right' ? W - margin - boxW : (W - boxW) / 2;
    const y = style.vAlign === 'top' ? margin : style.vAlign === 'bottom' ? H - margin - boxH : (H - boxH) / 2;
    boxRect = { x, y, w: boxW, h: boxH };

    if (opts.sampleBackdrop && !image?.tainted) {
      const backdrop = sampleRegion(ctx, boxRect, W, H);
      if (backdrop) {
        const textRgb = hexToRgb(style.textColor) ?? [255, 255, 255];
        const boxRgb = hexToRgb(style.boxColor) ?? [0, 0, 0];
        const effective = style.boxEnabled ? blend(boxRgb, backdrop, style.boxOpacity) : backdrop;
        contrast = contrastRatio(textRgb, effective);
        suggestedTextColor = bestTextColor(effective);
      }
    }

    if (style.boxEnabled) {
      ctx.fillStyle = rgba(style.boxColor, style.boxOpacity);
      roundRectPath(ctx, x, y, boxW, boxH, style.boxRadius * scale);
      ctx.fill();
    }

    if (style.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 16 * scale;
      ctx.shadowOffsetY = 2 * scale;
    }

    ctx.textBaseline = 'middle';
    let cy = y + pad;
    for (const block of layout.blocks) {
      cy += block.gapBefore;
      ctx.font = block.font;
      ctx.globalAlpha = block.alpha;
      for (const line of block.lines) {
        let cx =
        style.hAlign === 'left' ?
        x + pad :
        style.hAlign === 'right' ?
        x + boxW - pad - line.width :
        x + (boxW - line.width) / 2;
        const midY = cy + block.lineHeight / 2;
        for (const word of line.words) {
          ctx.fillStyle = word.emphasized ? style.accentColor : block.color;
          drawWord(ctx, word.text, cx, midY, block.letterSpacing);
          cx += word.width + block.spaceWidth;
        }
        cy += block.lineHeight;
      }
    }
  }

  ctx.restore();
  return { overflow, fitScale: k, boxRect, contrast, suggestedTextColor };
}

function buildLayout(
ctx: CanvasRenderingContext2D,
slide: Slide,
style: TextStyle,
scale: number,
k: number,
maxWidth: number)
: Layout {
  const emphasis = new Set(
    slide.emphasis.
    flatMap((e) => e.split(/\s+/)).
    map(normalizeWord).
    filter(Boolean)
  );
  const letterSpacing = style.letterSpacing * scale * k;
  const gap = style.paragraphGap * scale * k;
  const blocks: Block[] = [];

  const add = (
  text: string,
  family: string,
  weight: number,
  size: number,
  lineHeight: number,
  alpha: number,
  useEmphasis: boolean) =>
  {
    if (!text.trim()) return;
    const font = `${weight} ${size}px "${family}", system-ui, sans-serif`;
    ctx.font = font;
    const { lines, spaceWidth } = wrap(ctx, text, maxWidth, letterSpacing, useEmphasis ? emphasis : new Set());
    blocks.push({
      lines,
      font,
      lineHeight: size * lineHeight,
      color: style.textColor,
      alpha,
      gapBefore: blocks.length ? gap : 0,
      spaceWidth,
      letterSpacing
    });
  };

  const headline = style.uppercaseHeadline ? slide.headline.toUpperCase() : slide.headline;
  add(headline, style.headlineFont, headlineWeight(style.headlineFont), style.headlineSize * scale * k, style.lineHeight, 1, true);
  add(slide.body, style.bodyFont, 400, style.bodySize * scale * k, style.lineHeight + 0.22, 0.92, true);
  add(slide.supporting, style.bodyFont, 400, style.bodySize * 0.78 * scale * k, style.lineHeight + 0.22, 0.75, false);

  let height = 0;
  let width = 0;
  for (const b of blocks) {
    height += b.gapBefore + b.lines.length * b.lineHeight;
    for (const l of b.lines) width = Math.max(width, l.width);
  }
  return { blocks, height, width, tooWide: width > maxWidth + 0.5 };
}

function wrap(
ctx: CanvasRenderingContext2D,
text: string,
maxWidth: number,
letterSpacing: number,
emphasis: Set<string>)
: {lines: Line[];spaceWidth: number;} {
  const spaceWidth = ctx.measureText(' ').width + letterSpacing;
  const lines: Line[] = [];
  for (const paragraph of text.split(/\n+/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let current: Word[] = [];
    let width = 0;
    for (const raw of words) {
      const word: Word = {
        text: raw,
        width: measureWord(ctx, raw, letterSpacing),
        emphasized: emphasis.has(normalizeWord(raw))
      };
      const add = current.length ? spaceWidth + word.width : word.width;
      if (current.length && width + add > maxWidth) {
        lines.push({ words: current, width });
        current = [word];
        width = word.width;
      } else {
        current.push(word);
        width += add;
      }
    }
    if (current.length) lines.push({ words: current, width });
  }
  return { lines, spaceWidth };
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
}

function measureWord(ctx: CanvasRenderingContext2D, text: string, letterSpacing: number): number {
  const chars = Array.from(text).length;
  return ctx.measureText(text).width + letterSpacing * Math.max(0, chars - 1);
}

function drawWord(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, letterSpacing: number) {
  if (Math.abs(letterSpacing) < 0.01) {
    ctx.fillText(text, x, y);
    return;
  }
  let cx = x;
  for (const ch of Array.from(text)) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + letterSpacing;
  }
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function sampleRegion(ctx: CanvasRenderingContext2D, r: Rect, W: number, H: number): RGB | null {
  const x = Math.max(0, Math.min(W - 1, Math.floor(r.x)));
  const y = Math.max(0, Math.min(H - 1, Math.floor(r.y)));
  const w = Math.max(1, Math.min(W - x, Math.floor(r.w)));
  const h = Math.max(1, Math.min(H - y, Math.floor(r.h)));
  try {
    const data = ctx.getImageData(x, y, w, h).data;
    const step = Math.max(1, Math.floor(w * h / 4000));
    let rs = 0;
    let gs = 0;
    let bs = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4 * step) {
      rs += data[i];
      gs += data[i + 1];
      bs += data[i + 2];
      n += 1;
    }
    return n ? [rs / n, gs / n, bs / n] : null;
  } catch {
    return null;
  }
}