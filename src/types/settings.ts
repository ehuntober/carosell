import type { ThemeId } from './slides';

export type ImageProviderId = 'none' | 'comfyui' | 'http';

export interface IntegrationSettings {
  geminiEndpoint: string;
  imageProvider: ImageProviderId;
  comfyUrl: string;
  comfyCheckpoint: string;
  comfySteps: number;
  httpEndpoint: string;
}

export interface BrandKit {
  brandName: string;
  handle: string;
  themeId: ThemeId;
  headlineFont: string;
  bodyFont: string;
  textColor: string;
  accentColor: string;
  backgroundColor: string;
  applyToNewProjects: boolean;
}