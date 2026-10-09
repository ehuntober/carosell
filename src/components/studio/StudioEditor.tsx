import React, { useEffect, useState } from 'react';
import { useGeneration } from '../../contexts/GenerationContext';
import { useStudio } from '../../contexts/StudioContext';
import { useQualityReport } from '../../hooks/useQualityReport';
import { useSlideActions } from '../../hooks/useSlideActions';
import type { InspectorTab } from '../../types/editor';
import { CanvasStage } from './CanvasStage';
import { EditorToolbar } from './EditorToolbar';
import { ExportDialog } from './ExportDialog';
import { Filmstrip } from './Filmstrip';
import { GenerationProgress } from './GenerationProgress';
import { Inspector } from './Inspector';
import { PreviewModal } from './PreviewModal';
import { WorkflowIndicator } from './WorkflowIndicator';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

export function StudioEditor() {
  const { project, selectedSlideId, selectSlide, updateSlide, undo, redo } = useStudio();
  const gen = useGeneration();
  const report = useQualityReport(project);
  const [tab, setTab] = useState<InspectorTab>('text');
  const [exportOpen, setExportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const actions = useSlideActions(setTab);

  const slides = project?.slides ?? [];
  const foundIndex = slides.findIndex((s) => s.id === selectedSlideId);
  const index = foundIndex >= 0 ? foundIndex : 0;
  const slide = slides[index] ?? null;

  useEffect(() => {
    if (slides.length && foundIndex < 0) selectSlide(slides[0].id);
  }, [slides, foundIndex, selectSlide]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) redo();else
      undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  if (!project) return null;

  const pipelineHere = gen.state.projectId === project.id;
  const showProgress = pipelineHere && gen.state.panelOpen;
  const overflow = Boolean(slide && report.metrics[slide.id]?.overflow);

  const stage = gen.state.stages;
  const workflowStep = !pipelineHere || gen.state.status === 'done' || gen.state.status === 'idle' ?
  4 :
  stage.script.status !== 'done' ?
  1 :
  stage.images.status === 'running' || stage.prompts.status === 'running' ?
  2 :
  3;

  const emptyMessage =
  gen.state.status === 'running' ? 'Writing your slides…' : 'No slides yet. Resume generation, or go back to setup.';

  return (
    <div className="flex flex-col lg:h-full">
      <EditorToolbar
        issues={report.issues}
        checking={report.checking}
        onOpenChecks={() => {
          gen.dismiss();
          setTab('checks');
        }}
        onPreview={() => setPreviewOpen(true)}
        onExport={() => setExportOpen(true)} />
      

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section aria-label="Slide canvas" className="flex min-w-0 flex-1 flex-col bg-canvas">
          <WorkflowIndicator current={workflowStep} className="px-4 pt-3 lg:px-8" />
          <CanvasStage
            project={project}
            slide={slide}
            index={index}
            busy={slide ? gen.busy[slide.id] : undefined}
            overflow={overflow}
            emptyMessage={emptyMessage}
            onPrev={() => index > 0 && selectSlide(slides[index - 1].id)}
            onNext={() => index < slides.length - 1 && selectSlide(slides[index + 1].id)}
            onReposition={(fx, fy) =>
            slide && updateSlide(slide.id, (s) => ({ ...s, image: { ...s.image, focusX: fx, focusY: fy } }), { key: `drag-${slide.id}` })
            }
            onShorten={() => slide && void gen.shortenSlide(slide.id)}
            onShrink={() => {
              const issue = report.issues.find((i) => i.code === 'overflow' && i.slideId === slide?.id);
              if (issue) actions.applyFix(issue, 'fit-text');
            }} />
          
          {slides.length > 0 && <Filmstrip project={project} selectedId={slide?.id ?? null} issues={report.issues} actions={actions} />}
        </section>

        <aside
          aria-label={showProgress ? 'Generation progress' : 'Slide settings'}
          className="flex w-full flex-col border-t border-line bg-surface lg:min-h-0 lg:w-[360px] lg:shrink-0 lg:border-l lg:border-t-0">
          
          {showProgress ?
          <GenerationProgress /> :

          <Inspector
            project={project}
            slide={slide}
            index={index}
            tab={tab}
            onTabChange={setTab}
            issues={report.issues}
            checking={report.checking}
            onFix={actions.applyFix}
            onSelectSlide={selectSlide}
            onUpload={(file) => slide && void actions.uploadImage(slide.id, file)}
            onRemoveImage={() => slide && actions.removeImage(slide.id)} />

          }
        </aside>
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        project={project}
        currentIndex={index}
        issues={report.issues}
        onReview={() => {
          setExportOpen(false);
          gen.dismiss();
          setTab('checks');
        }} />
      
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} project={project} startIndex={index} />
    </div>);

}