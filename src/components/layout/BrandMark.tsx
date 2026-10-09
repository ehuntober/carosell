import React from 'react';
import { GalleryHorizontalEndIcon } from 'lucide-react';

export function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
        <GalleryHorizontalEndIcon className="h-4 w-4 text-white" aria-hidden />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-semibold tracking-tight text-ink">Carosell</span>
        <span className="text-xs font-medium text-ink-subtle">Studio</span>
      </span>
    </div>);

}