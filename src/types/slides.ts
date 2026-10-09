export type PlatformId = 'tiktok' | 'ig-portrait' | 'ig-square' | 'custom';

export type ThemeId =
'cinematic-dark' |
'minimalist' |
'editorial' |
'luxury' |
'modern-gradients' |
'photorealistic' |
'illustrated' |
'custom';

export type HAlign = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'center' | 'bottom';
export type SlideRole = 'hook' | 'content' | 'cta';
export type ImageStatus = 'empty' | 'generating' | 'ready' | 'failed';
export type ImageSource = 'generated' | 'upload' | 'sample';

/** All sizes are expressed in pixels at a 1080px-wide canvas and scale proportionally. */
export interface TextStyle {
  headlineFont: string;
  bodyFont: string;
  headlineSize: number;
  bodySize: number;
  textColor: string;
  accentColor: string;
  backgroundColor: string;
  hAlign: HAlign;
  vAlign: VAlign;
  boxEnabled: boolean;
  boxColor: string;
  boxOpacity: number;
  boxRadius: number;
  boxPadding: number;
  safeMargin: number;
  lineHeight: number;
  letterSpacing: number;
  paragraphGap: number;
  overlay: number;
  shadow: boolean;
  autoFit: boolean;
  uppercaseHeadline: boolean;
}

export interface SlideImage {
  src: string | null;
  status: ImageStatus;
  prompt: string;
  error?: string;
  source?: ImageSource;
  focusX: number;
  focusY: number;
  zoom: number;
}

export interface Slide {
  id: string;
  role: SlideRole;
  headline: string;
  body: string;
  supporting: string;
  emphasis: string[];
  visualDirection: string;
  recommendedTextColor?: string;
  contrastHint?: string;
  image: SlideImage;
  overrides: Partial<TextStyle>;
  textEdited: boolean;
}

export interface ContentSettings {
  topic: string;
  niche: string;
  customNiche: string;
  audience: string;
  tone: string;
  language: string;
  slideCount: number;
  includeCta: boolean;
  ctaText: string;
  captions: boolean;
}

export interface CanvasSettings {
  platform: PlatformId;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  isSample: boolean;
  content: ContentSettings;
  canvas: CanvasSettings;
  themeId: ThemeId;
  style: TextStyle;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  imageSeed: number;
}