import type { ContentSettings, SlideRole, VAlign } from '../types/slides';
import { isHexColor } from './color';

export type GenerationErrorKind = 'not-configured' | 'quota' | 'network' | 'invalid-response' | 'server';

export class GenerationError extends Error {
  kind: GenerationErrorKind;
  constructor(kind: GenerationErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'GenerationError';
  }
}

export interface ScriptSlide {
  slideNumber: number;
  headline: string;
  body: string;
  supportingText: string;
  imagePrompt: string;
  visualDirection: string;
  textPlacement: VAlign;
  textColor: string;
  backgroundContrast: 'light' | 'dark';
  emphasisWords: string[];
}

export interface ScriptResult {
  slides: ScriptSlide[];
  caption: string;
  hashtags: string[];
}

export interface ScriptRequest {
  mode: 'script';
  content: ContentSettings;
  platform: string;
  aspectRatio: string;
  visualStyle: string;
}

export interface SlideRequest {
  mode: 'slide' | 'shorten';
  content: ContentSettings;
  slideNumber: number;
  totalSlides: number;
  role: SlideRole;
  current: {headline: string;body: string;supportingText: string;};
  visualStyle: string;
}

export function isAbortError(e: unknown): boolean {
  return (e instanceof DOMException || e instanceof Error) && e.name === 'AbortError';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

async function post(endpoint: string, body: unknown, signal?: AbortSignal): Promise<unknown> {
  if (!endpoint.trim()) {
    throw new GenerationError('not-configured', "Gemini isn't connected. Add your secure function URL in Settings.");
  }
  let res: Response;
  try {
    res = await fetch(endpoint.trim(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal
    });
  } catch (e) {
    if (isAbortError(e)) throw e;
    throw new GenerationError('network', `Couldn't reach the Gemini function at ${endpoint}. Check the URL and that it's deployed.`);
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (res.status === 429) {
    throw new GenerationError(
      'quota',
      'Gemini free-tier quota reached. Wait a minute for the per-minute limit, or try again tomorrow if the daily limit is used up.'
    );
  }
  if (!res.ok) {
    const message = isRecord(data) && typeof data.error === 'string' ? data.error : `Request failed (${res.status}).`;
    throw new GenerationError('server', message);
  }
  if (data === null) throw new GenerationError('invalid-response', "The function's response wasn't valid JSON.");
  return data;
}

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export function validateSlide(raw: unknown, index: number): ScriptSlide {
  const where = `slide ${index + 1}`;
  if (!isRecord(raw)) throw new GenerationError('invalid-response', `Gemini returned malformed data for ${where}.`);
  const headline = text(raw.headline);
  if (!headline) throw new GenerationError('invalid-response', `Gemini returned an empty headline for ${where}.`);
  const placement = text(raw.textPlacement);
  const contrast = text(raw.backgroundContrast);
  const color = text(raw.textColor);
  return {
    slideNumber: typeof raw.slideNumber === 'number' ? raw.slideNumber : index + 1,
    headline,
    body: text(raw.body),
    supportingText: text(raw.supportingText),
    imagePrompt: text(raw.imagePrompt),
    visualDirection: text(raw.visualDirection),
    textPlacement: placement === 'top' || placement === 'center' ? placement : 'bottom',
    textColor: isHexColor(color) ? color : '',
    backgroundContrast: contrast === 'light' ? 'light' : 'dark',
    emphasisWords: Array.isArray(raw.emphasisWords) ?
    raw.emphasisWords.filter((w): w is string => typeof w === 'string' && w.trim().length > 0) :
    []
  };
}

export function validateScript(data: unknown, expected: number): ScriptResult {
  if (!isRecord(data) || !Array.isArray(data.slides)) {
    throw new GenerationError('invalid-response', 'Gemini returned JSON without a slides array.');
  }
  if (data.slides.length < 2) {
    throw new GenerationError('invalid-response', `Expected ${expected} slides but received ${data.slides.length}.`);
  }
  const slides = data.slides.slice(0, expected).map((s, i) => validateSlide(s, i));
  const hashtags = Array.isArray(data.hashtags) ?
  data.hashtags.
  filter((h): h is string => typeof h === 'string' && h.trim().length > 0).
  map((h) => h.trim().startsWith('#') ? h.trim() : `#${h.trim()}`) :
  [];
  return { slides, caption: text(data.caption), hashtags };
}

export async function requestScript(endpoint: string, req: ScriptRequest, signal?: AbortSignal): Promise<ScriptResult> {
  const data = await post(endpoint, req, signal);
  return validateScript(data, req.content.slideCount);
}

export async function requestSlide(endpoint: string, req: SlideRequest, signal?: AbortSignal): Promise<ScriptSlide> {
  const data = await post(endpoint, req, signal);
  return validateSlide(data, req.slideNumber - 1);
}

export async function pingGemini(endpoint: string): Promise<{ok: boolean;message: string;}> {
  try {
    const data = await post(endpoint, { mode: 'ping' });
    if (isRecord(data) && data.ok === true) {
      return { ok: true, message: `Connected${typeof data.model === 'string' ? ` · ${data.model}` : ''}` };
    }
    return { ok: false, message: 'The function responded, but not with { ok: true }.' };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Unknown error' };
  }
}