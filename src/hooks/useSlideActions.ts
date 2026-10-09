import { toast } from 'sonner';
import { useGeneration } from '../contexts/GenerationContext';
import { useStudio } from '../contexts/StudioContext';
import type { InspectorTab } from '../types/editor';
import type { FixAction, QualityIssue } from '../types/quality';
import type { TextStyle } from '../types/slides';
import { isDarkColor } from '../utils/color';
import { blobToDataUrl, loadImage } from '../utils/imageCache';
import { cloneSlide, createSlide, getPlatform, resolveStyle } from '../utils/project';

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const SPACING_KEYS: (keyof TextStyle)[] = ['safeMargin', 'boxPadding', 'lineHeight', 'paragraphGap', 'letterSpacing'];

export function useSlideActions(onOpenTab?: (tab: InspectorTab) => void) {
  const { getProject, update, updateSlide, selectSlide, undo } = useStudio();
  const gen = useGeneration();

  const addSlide = () => {
    const slide = createSlide();
    update((p) => ({ ...p, slides: [...p.slides, slide] }), { key: `add-${slide.id}` });
    selectSlide(slide.id);
  };

  const duplicateSlide = (id: string) => {
    const source = getProject()?.slides.find((s) => s.id === id);
    if (!source) return;
    const copy = cloneSlide(source);
    update(
      (p) => {
        const i = p.slides.findIndex((s) => s.id === id);
        const slides = [...p.slides];
        slides.splice(i + 1, 0, copy);
        return { ...p, slides };
      },
      { key: `dup-${copy.id}` }
    );
    selectSlide(copy.id);
  };

  const deleteSlide = (id: string) => {
    const p = getProject();
    if (!p) return;
    if (p.slides.length <= 1) {
      toast.error('A slideshow needs at least one slide.');
      return;
    }
    const i = p.slides.findIndex((s) => s.id === id);
    const neighbor = p.slides[i + 1] ?? p.slides[i - 1];
    update((prev) => ({ ...prev, slides: prev.slides.filter((s) => s.id !== id) }), { key: `del-${id}` });
    selectSlide(neighbor?.id ?? null);
    toast(`Slide ${i + 1} deleted`, { action: { label: 'Undo', onClick: () => undo() } });
  };

  const moveSlide = (id: string, dir: -1 | 1) => {
    update(
      (p) => {
        const i = p.slides.findIndex((s) => s.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= p.slides.length) return p;
        const slides = [...p.slides];
        [slides[i], slides[j]] = [slides[j], slides[i]];
        return { ...p, slides };
      },
      { key: `move-${id}-${Date.now()}` }
    );
  };

  const uploadImage = async (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Choose a JPG, PNG or WEBP image.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('That image is larger than 15 MB.');
      return;
    }
    try {
      const src = await blobToDataUrl(file);
      await loadImage(src);
      updateSlide(
        id,
        (s) => ({ ...s, image: { ...s.image, src, status: 'ready', source: 'upload', error: undefined, focusX: 0.5, focusY: 0.5, zoom: 1 } }),
        { key: `upload-${id}-${Date.now()}` }
      );
    } catch {
      toast.error("That file couldn't be read as an image.");
    }
  };

  const removeImage = (id: string) => {
    updateSlide(id, (s) => ({ ...s, image: { ...s.image, src: null, status: 'empty', source: undefined, error: undefined } }), {
      key: `remove-image-${id}`
    });
  };

  const applyFix = (issue: QualityIssue, action: FixAction) => {
    const p = getProject();
    if (!p) return;
    const slide = issue.slideId ? p.slides.find((s) => s.id === issue.slideId) ?? null : null;
    if (slide) selectSlide(slide.id);
    const style = resolveStyle(p, slide);

    switch (action) {
      case 'open-slide':
        onOpenTab?.(issue.code === 'crop' ? 'image' : 'text');
        return;
      case 'upload-image':
        onOpenTab?.('image');
        return;
      case 'generate-image':
        if (slide) void gen.regenerateImage(slide.id);
        return;
      case 'shorten-copy':
        if (slide) void gen.shortenSlide(slide.id);
        return;
      case 'fit-text':
        if (!slide) return;
        updateSlide(slide.id, (s) => ({
          ...s,
          overrides: {
            ...s.overrides,
            autoFit: true,
            headlineSize: Math.round(style.headlineSize * 0.82),
            bodySize: Math.round(style.bodySize * 0.85)
          }
        }));
        return;
      case 'enable-box':{
          if (!slide) return;
          const darkText = isDarkColor(style.textColor);
          updateSlide(slide.id, (s) => ({
            ...s,
            overrides: {
              ...s.overrides,
              boxEnabled: true,
              boxColor: darkText ? '#ffffff' : '#000000',
              boxOpacity: Math.max(style.boxOpacity, 0.7)
            }
          }));
          return;
        }
      case 'swap-text-color':
        if (!slide || !issue.suggestedColor) return;
        updateSlide(slide.id, (s) => ({ ...s, overrides: { ...s.overrides, textColor: issue.suggestedColor } }));
        return;
      case 'reset-spacing':
        if (!slide) return;
        updateSlide(slide.id, (s) => {
          const overrides = { ...s.overrides };
          SPACING_KEYS.forEach((k) => delete overrides[k]);
          return { ...s, overrides };
        });
        return;
      case 'fix-canvas':{
          const preset = getPlatform(p.canvas.platform);
          update((prev) => ({ ...prev, canvas: { ...prev.canvas, width: preset.width, height: preset.height } }));
          return;
        }
      default:
        return;
    }
  };

  return { addSlide, duplicateSlide, deleteSlide, moveSlide, uploadImage, removeImage, applyFix };
}