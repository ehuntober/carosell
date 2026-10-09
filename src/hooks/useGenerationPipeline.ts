import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '../contexts/SettingsContext';
import { useStudio } from '../contexts/StudioContext';
import { stages } from '../data/pipeline';
import type { PipelineState, SlideBusy, StageId, StageState } from '../types/generation';
import type { Project, Slide, SlideImage, VAlign } from '../types/slides';
import { renderSlideCanvas } from '../utils/exportSlides';
import { GenerationError, isAbortError, requestScript, requestSlide, type ScriptSlide } from '../utils/gemini';
import { generateImage, isImageProviderConfigured, NEGATIVE_PROMPT } from '../utils/imageProviders';
import { measureProject } from '../utils/measure';
import { createImage, createSlide, getTheme } from '../utils/project';
import { composeImagePrompt, scriptRequest, slideRequest, trimCopyLocally } from '../utils/prompts';
import { runQualityChecks } from '../utils/quality';

const ORDER: StageId[] = stages.map((s) => s.id);
export const SCRIPT_BUSY_KEY = '__script';

function freshStages(): Record<StageId, StageState> {
  return Object.fromEntries(ORDER.map((id) => [id, { status: 'pending' }])) as Record<StageId, StageState>;
}

function resetFrom(current: Record<StageId, StageState>, from: StageId): Record<StageId, StageState> {
  const start = ORDER.indexOf(from);
  return Object.fromEntries(
    ORDER.map((id, i) => [id, i >= start ? { status: 'pending' } : current[id]])
  ) as Record<StageId, StageState>;
}

const initialState: PipelineState = {
  status: 'idle',
  projectId: null,
  stages: freshStages(),
  slideJobs: {},
  activeSlideId: null,
  error: null,
  panelOpen: false
};

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.';
}

function abortError() {
  return new DOMException('Aborted', 'AbortError');
}

function toSlide(s: ScriptSlide, i: number, total: number, includeCta: boolean): Slide {
  return createSlide({
    role: i === 0 ? 'hook' : i === total - 1 && includeCta ? 'cta' : 'content',
    headline: s.headline,
    body: s.body,
    supporting: s.supportingText,
    emphasis: s.emphasisWords,
    visualDirection: s.visualDirection,
    recommendedTextColor: s.textColor || undefined,
    contrastHint: s.backgroundContrast,
    image: createImage(s.imagePrompt)
  });
}

/** Gemini suggests a placement per slide; we use the most common one for the whole set so layouts stay consistent. */
function majorityPlacement(slides: ScriptSlide[]): VAlign {
  const counts: Record<VAlign, number> = { top: 0, center: 0, bottom: 0 };
  slides.forEach((s) => counts[s.textPlacement] += 1);
  return (Object.keys(counts) as VAlign[]).sort((a, b) => counts[b] - counts[a])[0];
}

export function useGenerationPipeline() {
  const studio = useStudio();
  const { integrations } = useSettings();
  const [state, setState] = useState<PipelineState>(initialState);
  const [busy, setBusy] = useState<Record<string, SlideBusy>>({});
  const abortRef = useRef<AbortController | null>(null);
  const studioRef = useRef(studio);
  const integrationsRef = useRef(integrations);
  studioRef.current = studio;
  integrationsRef.current = integrations;

  const getProject = (): Project => {
    const p = studioRef.current.getProject();
    if (!p) throw new Error('No project is open.');
    return p;
  };

  const setStage = (id: StageId, value: StageState) =>
  setState((s) => ({ ...s, stages: { ...s.stages, [id]: value } }));

  const patchImage = (slideId: string, patch: Partial<SlideImage>, record: boolean) =>
  studioRef.current.updateSlide(slideId, (s) => ({ ...s, image: { ...s.image, ...patch } }), { record, key: `image-${slideId}-${Date.now()}` });

  const generateFor = (project: Project, slide: Slide, index: number, seedOffset: number, signal?: AbortSignal) =>
  generateImage(integrationsRef.current, {
    prompt: composeImagePrompt(slide, getTheme(project.themeId)),
    negativePrompt: NEGATIVE_PROMPT,
    width: project.canvas.width,
    height: project.canvas.height,
    seed: project.imageSeed + index + seedOffset,
    signal
  });

  const handlers: Record<StageId, (signal: AbortSignal) => Promise<StageState>> = {
    analyze: async () => {
      const p = getProject();
      const { topic, niche, customNiche, tone, slideCount } = p.content;
      if (topic.trim().split(/\s+/).length < 2) {
        throw new Error('Describe your topic in a few words so Gemini has something to work with.');
      }
      if (niche === 'Custom' && !customNiche.trim()) throw new Error('Name your custom niche, or pick one from the list.');
      if (!integrationsRef.current.geminiEndpoint.trim()) {
        throw new GenerationError('not-configured', "Gemini isn't connected. Add the secure function URL in Settings.");
      }
      return { status: 'done', detail: `${niche === 'Custom' ? customNiche : niche} · ${tone} · ${slideCount} slides` };
    },
    script: async (signal) => {
      const p = getProject();
      const result = await requestScript(integrationsRef.current.geminiEndpoint, scriptRequest(p), signal);
      const total = result.slides.length;
      const slides = result.slides.map((s, i) => toSlide(s, i, total, p.content.includeCta));
      const placement = majorityPlacement(result.slides);
      studioRef.current.update(
        (prev) => ({
          ...prev,
          slides,
          style: { ...prev.style, vAlign: placement },
          caption: prev.content.captions ? result.caption : '',
          hashtags: prev.content.captions ? result.hashtags : [],
          name: prev.name === 'Untitled slideshow' ? prev.content.topic.trim().slice(0, 60) : prev.name,
          isSample: false
        }),
        { key: `generate-${Date.now()}` }
      );
      studioRef.current.selectSlide(slides[0].id);
      setState((s) => ({ ...s, slideJobs: Object.fromEntries(slides.map((sl) => [sl.id, 'pending'])) }));
      return { status: 'done', detail: `${total} slides written and validated` };
    },
    prompts: async () => {
      const p = getProject();
      let filled = 0;
      p.slides.forEach((s) => {
        if (!s.image.prompt.trim()) {
          filled += 1;
          patchImage(s.id, { prompt: s.visualDirection || s.headline }, false);
        }
      });
      return {
        status: 'done',
        detail: `${getTheme(p.themeId).name} style locked for every slide${filled ? ` · ${filled} filled from headlines` : ''}`
      };
    },
    images: async (signal) => {
      if (!isImageProviderConfigured(integrationsRef.current)) {
        return { status: 'skipped', detail: 'No image engine connected — upload images, or connect one in Settings.' };
      }
      const p = getProject();
      const targets = p.slides.filter((s) => s.image.status !== 'ready');
      if (!targets.length) return { status: 'done', detail: 'Every slide already has a background' };
      let failed = 0;
      let firstError = '';
      for (const slide of targets) {
        if (signal.aborted) throw abortError();
        const index = p.slides.findIndex((s) => s.id === slide.id);
        setState((st) => ({
          ...st,
          activeSlideId: slide.id,
          slideJobs: { ...st.slideJobs, [slide.id]: 'running' },
          stages: { ...st.stages, images: { status: 'running', detail: `Slide ${index + 1} of ${p.slides.length}` } }
        }));
        patchImage(slide.id, { status: 'generating', error: undefined }, false);
        try {
          const src = await generateFor(p, slide, index, 0, signal);
          patchImage(slide.id, { src, status: 'ready', source: 'generated', focusX: 0.5, focusY: 0.5, zoom: 1 }, false);
          setState((st) => ({ ...st, slideJobs: { ...st.slideJobs, [slide.id]: 'done' } }));
        } catch (e) {
          if (isAbortError(e) || signal.aborted) {
            patchImage(slide.id, { status: slide.image.src ? 'ready' : 'empty' }, false);
            throw abortError();
          }
          failed += 1;
          const msg = errorMessage(e);
          firstError ||= msg;
          patchImage(slide.id, { status: 'failed', error: msg }, false);
          setState((st) => ({ ...st, slideJobs: { ...st.slideJobs, [slide.id]: 'failed' } }));
        }
      }
      setState((st) => ({ ...st, activeSlideId: null }));
      if (failed === targets.length) throw new Error(`All ${failed} backgrounds failed. ${firstError}`);
      if (failed) {
        return { status: 'partial', detail: `${targets.length - failed} of ${targets.length} ready — retry the failed slides from the filmstrip` };
      }
      return { status: 'done', detail: `${targets.length} backgrounds generated` };
    },
    typography: async () => {
      const p = getProject();
      const metrics = Object.values(await measureProject(p));
      const overflow = metrics.filter((m) => m.overflow).length;
      const shrunk = metrics.filter((m) => m.fitScale < 1 && !m.overflow).length;
      return {
        status: 'done',
        detail: `${p.slides.length} slides laid out${shrunk ? ` · ${shrunk} auto-sized` : ''}${overflow ? ` · ${overflow} need shorter copy` : ''}`
      };
    },
    quality: async () => {
      const p = getProject();
      const issues = runQualityChecks(p, await measureProject(p));
      const errors = issues.filter((i) => i.severity === 'error').length;
      const warnings = issues.length - errors;
      return { status: 'done', detail: issues.length ? `${errors} to fix · ${warnings} to review` : 'All checks passed' };
    },
    export: async (signal) => {
      const p = getProject();
      let blocked = 0;
      for (let i = 0; i < p.slides.length; i += 1) {
        if (signal.aborted) throw abortError();
        try {
          await renderSlideCanvas(p, p.slides[i], i);
        } catch {
          blocked += 1;
        }
      }
      return blocked ?
      { status: 'partial', detail: `${blocked} slide${blocked > 1 ? 's' : ''} can't export yet — see Checks` } :
      { status: 'done', detail: `${p.slides.length} slides ready to download` };
    }
  };

  const run = async (from: StageId) => {
    const project = studioRef.current.getProject();
    if (!project) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState((s) => ({
      ...s,
      status: 'running',
      projectId: project.id,
      error: null,
      panelOpen: true,
      activeSlideId: null,
      stages: from === 'analyze' ? freshStages() : resetFrom(s.stages, from),
      slideJobs: from === 'analyze' ? {} : s.slideJobs
    }));
    let current: StageId = from;
    try {
      for (const id of ORDER.slice(ORDER.indexOf(from))) {
        current = id;
        if (ctrl.signal.aborted) throw abortError();
        setStage(id, { status: 'running' });
        const result = await handlers[id](ctrl.signal);
        setStage(id, result);
      }
      setState((s) => ({ ...s, status: 'done', activeSlideId: null }));
    } catch (e) {
      if (isAbortError(e) || ctrl.signal.aborted) {
        setStage(current, { status: 'cancelled', detail: 'Stopped — you can resume from here' });
        setState((s) => ({ ...s, status: 'cancelled', activeSlideId: null }));
      } else {
        const msg = errorMessage(e);
        setStage(current, { status: 'failed', detail: msg });
        setState((s) => ({ ...s, status: 'failed', error: msg, activeSlideId: null }));
      }
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  };

  const withBusy = async (key: string, kind: SlideBusy, fn: () => Promise<void>) => {
    setBusy((b) => ({ ...b, [key]: kind }));
    try {
      await fn();
    } finally {
      setBusy((b) => {
        const next = { ...b };
        delete next[key];
        return next;
      });
    }
  };

  const requireGemini = (): string | null => {
    const endpoint = integrationsRef.current.geminiEndpoint.trim();
    if (!endpoint) {
      toast.error("Gemini isn't connected", { description: 'Add your secure function URL in Settings to rewrite text with AI.' });
      return null;
    }
    return endpoint;
  };

  const regenerateImage = (slideId: string) =>
  withBusy(slideId, 'image', async () => {
    if (!isImageProviderConfigured(integrationsRef.current)) {
      toast.error('No image engine connected', { description: 'Connect ComfyUI or an image endpoint in Settings, or upload an image.' });
      return;
    }
    const p = getProject();
    const index = p.slides.findIndex((s) => s.id === slideId);
    if (index < 0) return;
    try {
      const src = await generateFor(p, p.slides[index], index, 1 + Math.floor(Math.random() * 10_000));
      patchImage(slideId, { src, status: 'ready', source: 'generated', error: undefined, focusX: 0.5, focusY: 0.5, zoom: 1 }, true);
      toast.success(`Slide ${index + 1} background updated`);
    } catch (e) {
      patchImage(slideId, { status: 'failed', error: errorMessage(e) }, false);
      toast.error(`Slide ${index + 1} image failed`, { description: errorMessage(e) });
    }
  });

  const regenerateText = (slideId: string) =>
  withBusy(slideId, 'text', async () => {
    const endpoint = requireGemini();
    if (!endpoint) return;
    const p = getProject();
    const slide = p.slides.find((s) => s.id === slideId);
    if (!slide) return;
    try {
      const res = await requestSlide(endpoint, slideRequest(p, slide, 'slide'));
      studioRef.current.updateSlide(
        slideId,
        (s) => ({
          ...s,
          headline: res.headline,
          body: res.body,
          supporting: res.supportingText,
          emphasis: res.emphasisWords,
          recommendedTextColor: res.textColor || s.recommendedTextColor,
          image: { ...s.image, prompt: res.imagePrompt || s.image.prompt },
          textEdited: false
        }),
        { key: `regen-${slideId}-${Date.now()}` }
      );
      toast.success('Slide text rewritten');
    } catch (e) {
      toast.error('Could not rewrite this slide', { description: errorMessage(e) });
    }
  });

  const shortenSlide = (slideId: string) =>
  withBusy(slideId, 'shorten', async () => {
    const p = getProject();
    const slide = p.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const endpoint = integrationsRef.current.geminiEndpoint.trim();
    if (!endpoint) {
      studioRef.current.updateSlide(slideId, { ...trimCopyLocally(slide), textEdited: true }, { key: `shorten-${Date.now()}` });
      toast('Copy trimmed locally', { description: 'Connect Gemini in Settings for rewrites that keep the meaning.' });
      return;
    }
    try {
      const res = await requestSlide(endpoint, slideRequest(p, slide, 'shorten'));
      studioRef.current.updateSlide(
        slideId,
        { headline: res.headline, body: res.body, supporting: res.supportingText, textEdited: false },
        { key: `shorten-${Date.now()}` }
      );
      toast.success('Copy shortened');
    } catch (e) {
      toast.error('Could not shorten this slide', { description: errorMessage(e) });
    }
  });

  const regenerateScript = (keepEdited: boolean) =>
  withBusy(SCRIPT_BUSY_KEY, 'text', async () => {
    const endpoint = requireGemini();
    if (!endpoint) return;
    const p = getProject();
    try {
      const result = await requestScript(endpoint, scriptRequest(p));
      const total = result.slides.length;
      studioRef.current.update(
        (prev) => ({
          ...prev,
          caption: prev.content.captions ? result.caption : prev.caption,
          hashtags: prev.content.captions ? result.hashtags : prev.hashtags,
          slides: result.slides.map((s, i) => {
            const fresh = toSlide(s, i, total, prev.content.includeCta);
            const existing = prev.slides[i];
            if (!existing) return fresh;
            if (keepEdited && existing.textEdited) return existing;
            return {
              ...existing,
              role: fresh.role,
              headline: fresh.headline,
              body: fresh.body,
              supporting: fresh.supporting,
              emphasis: fresh.emphasis,
              visualDirection: fresh.visualDirection,
              recommendedTextColor: fresh.recommendedTextColor,
              image: existing.image.src ? existing.image : { ...existing.image, prompt: fresh.image.prompt },
              textEdited: false
            };
          })
        }),
        { key: `script-${Date.now()}` }
      );
      toast.success('Script regenerated', { description: 'Images, styles and layout were kept.' });
    } catch (e) {
      toast.error('Could not regenerate the script', { description: errorMessage(e) });
    }
  });

  const resumeFrom = (): StageId =>
  ORDER.find((id) => !['done', 'skipped', 'partial'].includes(state.stages[id].status)) ?? 'analyze';

  return {
    state,
    busy,
    isRunning: state.status === 'running',
    start: () => run('analyze'),
    resume: () => run(resumeFrom()),
    cancel: () => abortRef.current?.abort(),
    dismiss: () => setState((s) => ({ ...s, panelOpen: false })),
    openPanel: () => setState((s) => ({ ...s, panelOpen: true })),
    reset: () => {
      abortRef.current?.abort();
      setState(initialState);
    },
    regenerateImage,
    regenerateText,
    shortenSlide,
    regenerateScript
  };
}

export type GenerationApi = ReturnType<typeof useGenerationPipeline>;