import type { PlatformId } from '../types/slides';

export const niches = [
'Psychology',
'Motivation',
'Crypto',
'Finance',
'Fitness',
'Technology',
'Storytelling',
'Education',
'Relationships',
'Custom'];


export const tones = ['Educational', 'Cinematic', 'Emotional', 'Conversational', 'Bold', 'Storytelling'];

export const languages = [
'English',
'Spanish',
'French',
'German',
'Portuguese',
'Italian',
'Hindi',
'Arabic',
'Indonesian',
'Japanese'];


export const slideCounts = [4, 5, 6, 8, 10];

export interface PlatformPreset {
  id: PlatformId;
  label: string;
  ratio: string;
  width: number;
  height: number;
}

export const platformPresets: PlatformPreset[] = [
{ id: 'tiktok', label: 'TikTok Photo Mode', ratio: '9:16', width: 1080, height: 1920 },
{ id: 'ig-portrait', label: 'Instagram portrait', ratio: '4:5', width: 1080, height: 1350 },
{ id: 'ig-square', label: 'Instagram square', ratio: '1:1', width: 1080, height: 1080 },
{ id: 'custom', label: 'Custom size', ratio: 'Custom', width: 1080, height: 1440 }];


export interface FontOption {
  family: string;
  weight: number;
  category: 'Sans' | 'Serif' | 'Display';
}

export const fontOptions: FontOption[] = [
{ family: 'Inter', weight: 800, category: 'Sans' },
{ family: 'Montserrat', weight: 800, category: 'Sans' },
{ family: 'Oswald', weight: 700, category: 'Display' },
{ family: 'Bebas Neue', weight: 400, category: 'Display' },
{ family: 'Playfair Display', weight: 700, category: 'Serif' },
{ family: 'DM Serif Display', weight: 400, category: 'Serif' },
{ family: 'Lora', weight: 700, category: 'Serif' }];