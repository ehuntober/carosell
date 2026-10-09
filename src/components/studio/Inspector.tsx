import React from 'react';
import type { InspectorTab } from '../../types/editor';
import type { FixAction, QualityIssue } from '../../types/quality';
import type { Project, Slide } from '../../types/slides';
import { CaptionTab } from './inspector/CaptionTab';
import { ImageTab } from './inspector/ImageTab';
import { QualityPanel } from './inspector/QualityPanel';
import { StyleTab } from './inspector/StyleTab';
import { TextTab } from './inspector/TextTab';

interface InspectorProps {
  project: Project;
  slide: Slide | null;
  index: number;
  tab: InspectorTab;
  onTabChange: (tab: InspectorTab) => void;
  issues: QualityIssue[];
  checking: boolean;
  onFix: (issue: QualityIssue, action: FixAction) => void;
  onSelectSlide: (id: string) => void;
  onUpload: (file: File) => void;
  onRemoveImage: () => void;
}

const tabs: {id: InspectorTab;label: string;}[] = [
{ id: 'text', label: 'Text' },
{ id: 'style', label: 'Style' },
{ id: 'image', label: 'Image' },
{ id: 'caption', label: 'Caption' },
{ id: 'checks', label: 'Checks' }];


export function Inspector({
  project,
  slide,
  index,
  tab,
  onTabChange,
  issues,
  checking,
  onFix,
  onSelectSlide,
  onUpload,
  onRemoveImage
}: InspectorProps) {
  const errorCount = issues.filter((i) => i.severity === 'error').length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div role="tablist" aria-label="Slide settings" className="sticky top-0 z-10 flex shrink-0 gap-0.5 border-b border-line bg-surface px-2 py-2">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => onTabChange(t.id)}
              className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors duration-150 ${
              active ? 'bg-surface-3 text-ink' : 'text-ink-muted hover:text-ink'}`
              }>
              
              {t.label}
              {t.id === 'checks' && issues.length > 0 &&
              <span
                className={`rounded px-1 text-[10px] font-semibold tabular-nums ${errorCount ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                
                  {issues.length}
                </span>
              }
            </button>);

        })}
      </div>
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'caption' && <CaptionTab project={project} />}
        {tab === 'checks' && <QualityPanel issues={issues} checking={checking} onFix={onFix} onSelectSlide={onSelectSlide} />}
        {(tab === 'text' || tab === 'style' || tab === 'image') && (
        slide ?
        <>
              {tab === 'text' && <TextTab project={project} slide={slide} index={index} />}
              {tab === 'style' && <StyleTab project={project} slide={slide} index={index} />}
              {tab === 'image' && <ImageTab project={project} slide={slide} onUpload={onUpload} onRemove={onRemoveImage} />}
            </> :

        <p className="text-sm text-ink-muted">Select a slide to edit it.</p>)
        }
      </div>
    </div>);

}