import type { ThemeDefinition } from '../data/themes';
import type { Project, Slide } from '../types/slides';
import type { ScriptRequest, SlideRequest } from './gemini';
import { getPlatform, getTheme } from './project';

export function composeImagePrompt(slide: Slide, theme: ThemeDefinition): string {
  const base = slide.image.prompt.trim() || slide.visualDirection.trim() || slide.headline.trim();
  return `${base}. ${theme.promptStyle}. Consistent series style, no text, no letters, no watermark.`;
}

export function scriptRequest(project: Project): ScriptRequest {
  const platform = getPlatform(project.canvas.platform);
  return {
    mode: 'script',
    content: project.content,
    platform: platform.label,
    aspectRatio: platform.id === 'custom' ? `${project.canvas.width}x${project.canvas.height}` : platform.ratio,
    visualStyle: getTheme(project.themeId).promptStyle
  };
}

export function slideRequest(project: Project, slide: Slide, mode: 'slide' | 'shorten'): SlideRequest {
  const index = project.slides.findIndex((s) => s.id === slide.id);
  return {
    mode,
    content: project.content,
    slideNumber: index + 1,
    totalSlides: project.slides.length,
    role: slide.role,
    current: { headline: slide.headline, body: slide.body, supportingText: slide.supporting },
    visualStyle: getTheme(project.themeId).promptStyle
  };
}

/** Local fallback when Gemini isn't connected: keep the first sentence and cap word counts. */
export function trimCopyLocally(slide: Slide): Pick<Slide, 'headline' | 'body' | 'supporting'> {
  const capWords = (s: string, n: number) => {
    const words = s.trim().split(/\s+/).filter(Boolean);
    return words.length > n ? `${words.slice(0, n).join(' ')}…` : s.trim();
  };
  const firstSentence = slide.body.trim().match(/^[^.!?]+[.!?]?/)?.[0] ?? slide.body;
  return {
    headline: capWords(slide.headline, 10),
    body: capWords(firstSentence, 18),
    supporting: ''
  };
}