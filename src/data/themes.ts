import type { TextStyle, ThemeId } from '../types/slides';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  promptStyle: string;
  style: TextStyle;
}

const base: TextStyle = {
  headlineFont: 'Montserrat',
  bodyFont: 'Inter',
  headlineSize: 84,
  bodySize: 40,
  textColor: '#ffffff',
  accentColor: '#fb7185',
  backgroundColor: '#0b0b0f',
  hAlign: 'left',
  vAlign: 'bottom',
  boxEnabled: false,
  boxColor: '#000000',
  boxOpacity: 0.55,
  boxRadius: 28,
  boxPadding: 44,
  safeMargin: 88,
  lineHeight: 1.12,
  letterSpacing: 0,
  paragraphGap: 28,
  overlay: 0.45,
  shadow: true,
  autoFit: true,
  uppercaseHeadline: false
};

export const themes: ThemeDefinition[] = [
{
  id: 'cinematic-dark',
  name: 'Cinematic dark',
  description: 'Moody film stills, bold sans headlines anchored low.',
  promptStyle: 'cinematic dark moody photograph, low-key lighting, deep shadows, film grain, muted color grade, negative space',
  style: base
},
{
  id: 'minimalist',
  name: 'Minimalist',
  description: 'Warm paper tones, centered type, lots of air.',
  promptStyle: 'minimalist soft photograph, pale warm neutral tones, clean composition, lots of empty space, soft daylight',
  style: {
    ...base,
    headlineFont: 'Inter',
    headlineSize: 76,
    bodySize: 38,
    textColor: '#141414',
    accentColor: '#e11d48',
    backgroundColor: '#f5f3ef',
    hAlign: 'center',
    vAlign: 'center',
    overlay: 0.25,
    shadow: false
  }
},
{
  id: 'editorial',
  name: 'Editorial',
  description: 'Magazine serif headlines on a paper text panel.',
  promptStyle: 'editorial magazine photography, natural light, refined composition, subtle film tones',
  style: {
    ...base,
    headlineFont: 'Playfair Display',
    bodyFont: 'Lora',
    headlineSize: 80,
    bodySize: 38,
    textColor: '#1c1917',
    accentColor: '#b91c1c',
    backgroundColor: '#efe9df',
    vAlign: 'top',
    boxEnabled: true,
    boxColor: '#f8f5ef',
    boxOpacity: 0.94,
    boxRadius: 16,
    overlay: 0.1,
    shadow: false
  }
},
{
  id: 'luxury',
  name: 'Luxury',
  description: 'Black and champagne, elegant serif, centered.',
  promptStyle: 'luxury dark still life photograph, black marble and soft gold highlights, elegant, high-end, shallow depth of field',
  style: {
    ...base,
    headlineFont: 'DM Serif Display',
    headlineSize: 88,
    textColor: '#f5ecd7',
    accentColor: '#d4af37',
    backgroundColor: '#0d0c0a',
    hAlign: 'center',
    vAlign: 'center',
    overlay: 0.55,
    letterSpacing: 0.5
  }
},
{
  id: 'modern-gradients',
  name: 'Modern gradients',
  description: 'Smooth color-field backgrounds with a frosted text panel.',
  promptStyle: 'abstract smooth gradient color field background, soft mesh of deep indigo, magenta and orange, glossy, modern',
  style: {
    ...base,
    textColor: '#ffffff',
    accentColor: '#fde047',
    backgroundColor: '#1e1b4b',
    vAlign: 'center',
    boxEnabled: true,
    boxColor: '#0f0a2e',
    boxOpacity: 0.45,
    overlay: 0.15,
    shadow: false
  }
},
{
  id: 'photorealistic',
  name: 'Photorealistic',
  description: 'True-to-life scenes with a dark caption box.',
  promptStyle: 'photorealistic high-detail photograph, natural lighting, 35mm lens, realistic textures',
  style: {
    ...base,
    headlineFont: 'Inter',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    hAlign: 'center',
    boxEnabled: true,
    boxColor: '#000000',
    boxOpacity: 0.5,
    overlay: 0.15,
    shadow: false
  }
},
{
  id: 'illustrated',
  name: 'Illustrated',
  description: 'Flat illustration with tall display type up top.',
  promptStyle: 'flat vector illustration, soft pastel palette, simple shapes, clean lines, friendly, no text',
  style: {
    ...base,
    headlineFont: 'Bebas Neue',
    headlineSize: 116,
    bodySize: 38,
    textColor: '#1f2937',
    accentColor: '#e11d48',
    backgroundColor: '#fff7ed',
    hAlign: 'center',
    vAlign: 'top',
    boxEnabled: true,
    boxColor: '#ffffff',
    boxOpacity: 0.9,
    overlay: 0,
    shadow: false,
    letterSpacing: 1
  }
},
{
  id: 'custom',
  name: 'Custom theme',
  description: 'A neutral starting point to tune by hand.',
  promptStyle: 'cohesive high-quality background image, consistent color palette, uncluttered composition',
  style: { ...base, headlineFont: 'Inter', accentColor: '#e11d48', overlay: 0.35 }
}];