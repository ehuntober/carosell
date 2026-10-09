import { platformPresets } from '../data/options';
import { sampleCaption, sampleHashtags, sampleSlides, sampleTopic } from '../data/sampleProject';
import { themes, type ThemeDefinition } from '../data/themes';
import type { BrandKit } from '../types/settings';
import type {
  ContentSettings,
  PlatformId,
  Project,
  Slide,
  SlideImage,
  TextStyle,
  ThemeId } from
'../types/slides';

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return themes.find((t) => t.id === id) ?? themes[0];
}

export function getPlatform(id: PlatformId) {
  return platformPresets.find((p) => p.id === id) ?? platformPresets[0];
}

export function resolveStyle(project: Project, slide: Slide | null): TextStyle {
  return slide ? { ...project.style, ...slide.overrides } : project.style;
}

export function createImage(prompt = '', patch: Partial<SlideImage> = {}): SlideImage {
  return { src: null, status: 'empty', prompt, focusX: 0.5, focusY: 0.5, zoom: 1, ...patch };
}

export function createSlide(patch: Partial<Slide> = {}): Slide {
  return {
    id: uid('slide'),
    role: 'content',
    headline: '',
    body: '',
    supporting: '',
    emphasis: [],
    visualDirection: '',
    image: createImage(),
    overrides: {},
    textEdited: false,
    ...patch
  };
}

export function cloneSlide(slide: Slide): Slide {
  return {
    ...slide,
    id: uid('slide'),
    emphasis: [...slide.emphasis],
    image: { ...slide.image, status: slide.image.status === 'generating' ? 'empty' : slide.image.status },
    overrides: { ...slide.overrides }
  };
}

export function defaultContent(topic = ''): ContentSettings {
  return {
    topic,
    niche: 'Psychology',
    customNiche: '',
    audience: '',
    tone: 'Educational',
    language: 'English',
    slideCount: 6,
    includeCta: true,
    ctaText: 'Follow for more',
    captions: true
  };
}

export function brandStyle(kit: BrandKit): Partial<TextStyle> {
  return {
    headlineFont: kit.headlineFont,
    bodyFont: kit.bodyFont,
    textColor: kit.textColor,
    accentColor: kit.accentColor,
    backgroundColor: kit.backgroundColor
  };
}

export function createProject(
brandKit: BrandKit | null,
init: {topic?: string;themeId?: ThemeId;} = {})
: Project {
  const useBrand = brandKit?.applyToNewProjects ? brandKit : null;
  const themeId = init.themeId ?? useBrand?.themeId ?? 'cinematic-dark';
  const theme = getTheme(themeId);
  const preset = platformPresets[0];
  const now = Date.now();
  return {
    id: uid('proj'),
    name: init.topic?.trim() ? init.topic.trim().slice(0, 60) : 'Untitled slideshow',
    createdAt: now,
    updatedAt: now,
    isSample: false,
    content: defaultContent(init.topic ?? ''),
    canvas: { platform: preset.id, width: preset.width, height: preset.height },
    themeId,
    style: { ...theme.style, ...(useBrand && !init.themeId ? brandStyle(useBrand) : {}) },
    slides: [],
    caption: '',
    hashtags: [],
    imageSeed: Math.floor(Math.random() * 1_000_000_000)
  };
}

export function createSampleProject(): Project {
  const project = createProject(null, { themeId: 'cinematic-dark', topic: sampleTopic });
  return {
    ...project,
    name: 'Sample — Respect habits',
    isSample: true,
    content: { ...project.content, slideCount: 5 },
    caption: sampleCaption,
    hashtags: sampleHashtags,
    slides: sampleSlides.map((s) =>
    createSlide({
      role: s.role,
      headline: s.headline,
      body: s.body,
      emphasis: s.emphasis,
      visualDirection: s.visualDirection,
      overrides: { vAlign: s.vAlign },
      image: createImage(s.imagePrompt, { src: s.imageUrl, status: 'ready', source: 'sample' })
    })
    )
  };
}

/** Text-first slides for when no AI is connected. Empty headlines are flagged by quality checks. */
export function createBlankSlides(project: Project): Slide[] {
  const { slideCount, topic, includeCta, ctaText } = project.content;
  return Array.from({ length: slideCount }, (_, i) => {
    const isLast = i === slideCount - 1;
    if (i === 0) return createSlide({ role: 'hook', headline: topic.trim() });
    if (isLast && includeCta) return createSlide({ role: 'cta', headline: ctaText.trim() });
    return createSlide({ role: 'content' });
  });
}

export function slugify(value: string): string {
  return (
    value.
    toLowerCase().
    replace(/[^a-z0-9]+/g, '-').
    replace(/^-+|-+$/g, '').
    slice(0, 48) || 'slideshow');

}

export function roleLabel(role: Slide['role']): string {
  if (role === 'hook') return 'Hook';
  if (role === 'cta') return 'Call to action';
  return 'Content';
}