import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useElementSize } from '../hooks/useElementSize';
import type { Project, Slide } from '../types/slides';
import { ensureFonts } from '../utils/fonts';
import { loadImage, type LoadedImage } from '../utils/imageCache';
import { resolveStyle } from '../utils/project';
import { coverRect, renderSlide } from '../utils/renderSlide';
import { clamp } from '../utils/ui';

interface SlideCanvasProps {
  project: Project;
  slide: Slide;
  className?: string;
  frameClassName?: string;
  interactive?: boolean;
  onReposition?: (focusX: number, focusY: number) => void;
  label?: string;
  children?: React.ReactNode;
}

interface DragState {
  x: number;
  y: number;
  fx: number;
  fy: number;
  rangeX: number;
  rangeY: number;
}

/** Shows the complete slide scaled to fit its container — never cropped. */
export function SlideCanvas({
  project,
  slide,
  className,
  frameClassName,
  interactive,
  onReposition,
  label,
  children
}: SlideCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const { width: cw, height: ch } = useElementSize(wrapRef);
  const W = project.canvas.width;
  const H = project.canvas.height;
  const ratio = W / H;

  let dw = cw;
  let dh = cw / ratio;
  if (ch > 0 && dh > ch) {
    dh = ch;
    dw = ch * ratio;
  }

  const src = slide.image.src;
  const [image, setImage] = useState<{src: string;loaded: LoadedImage;} | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }
    let alive = true;
    loadImage(src).
    then((loaded) => alive && setImage({ src, loaded })).
    catch(() => alive && setImage(null));
    return () => {
      alive = false;
    };
  }, [src]);

  const current = image && image.src === src ? image.loaded : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dw < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.max(1, Math.round(dw * dpr));
    const ph = Math.max(1, Math.round(pw / ratio));
    const style = resolveStyle(project, slide);
    let alive = true;
    ensureFonts([style.headlineFont, style.bodyFont]).then(() => {
      if (!alive) return;
      if (canvas.width !== pw) canvas.width = pw;
      if (canvas.height !== ph) canvas.height = ph;
      const ctx = canvas.getContext('2d');
      if (ctx) renderSlide(ctx, { project, slide, width: pw, height: ph, image: current });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.style, project.canvas.width, project.canvas.height, slide, current, dw, ratio]);

  const canDrag = Boolean(interactive && current && onReposition);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDrag || !current) return;
    const r = coverRect(current.img.naturalWidth, current.img.naturalHeight, W, H, slide.image.zoom, slide.image.focusX, slide.image.focusY);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      fx: slide.image.focusX,
      fy: slide.image.focusY,
      rangeX: r.w - W,
      rangeY: r.h - H
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (!d || !onReposition || dw < 2) return;
    const k = W / dw;
    const dx = (e.clientX - d.x) * k;
    const dy = (e.clientY - d.y) * k;
    const fx = d.rangeX > 1 ? clamp(d.fx - dx / d.rangeX, 0, 1) : d.fx;
    const fy = d.rangeY > 1 ? clamp(d.fy - dy / d.rangeY, 0, 1) : d.fy;
    onReposition(fx, fy);
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div ref={wrapRef} className={twMerge('relative flex h-full w-full items-center justify-center', className)}>
      <div
        className={twMerge('relative overflow-hidden rounded-md bg-surface-2', frameClassName)}
        style={{ width: dw || undefined, height: dh || undefined }}>
        
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label ?? `Slide: ${slide.headline || 'untitled'}`}
          className={twMerge('block h-full w-full', canDrag && 'cursor-grab active:cursor-grabbing lg:touch-none')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag} />
        
        {children}
      </div>
    </div>);

}