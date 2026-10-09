import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import type { Project } from '../../types/slides';
import { SlideCanvas } from '../SlideCanvas';
import { Button } from '../ui/Button';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  startIndex: number;
}

export function PreviewModal({ open, onClose, project, startIndex }: PreviewModalProps) {
  const [index, setIndex] = useState(startIndex);
  const total = project.slides.length;

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(total - 1, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, total]);

  const slide = project.slides[index];

  return (
    <AnimatePresence>
      {open && slide &&
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Slideshow preview"
        className="fixed inset-0 z-50 flex flex-col bg-black/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}>
        
          <div className="flex h-14 shrink-0 items-center justify-between px-4">
            <p className="text-sm text-ink-muted">
              Preview <span className="tabular-nums text-ink">{index + 1} / {total}</span>
            </p>
            <Button size="icon" variant="ghost" aria-label="Close preview" onClick={onClose} autoFocus>
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 px-4">
            <SlideCanvas project={project} slide={slide} label={`Slide ${index + 1} of ${total}`} />
          </div>
          <div className="flex h-20 shrink-0 items-center justify-center gap-4">
            <Button size="icon" variant="secondary" aria-label="Previous slide" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1.5" aria-hidden>
              {project.slides.map((s, i) =>
            <span key={s.id} className={`h-1.5 rounded-full transition-[width,background-color] duration-200 ${i === index ? 'w-5 bg-ink' : 'w-1.5 bg-ink-subtle'}`} />
            )}
            </div>
            <Button size="icon" variant="secondary" aria-label="Next slide" disabled={index === total - 1} onClick={() => setIndex((i) => i + 1)}>
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      }
    </AnimatePresence>);

}