import {
  FolderOpenIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  LifeBuoyIcon,
  PaletteIcon,
  SettingsIcon,
  SparklesIcon,
  type LucideIcon } from
'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  end?: boolean;
}

export const primaryNav: NavItem[] = [
{ to: '/', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboardIcon, end: true },
{ to: '/studio', label: 'AI Slideshow Studio', shortLabel: 'Studio', icon: SparklesIcon },
{ to: '/projects', label: 'My Projects', shortLabel: 'Projects', icon: FolderOpenIcon },
{ to: '/templates', label: 'Templates', shortLabel: 'Templates', icon: LayoutTemplateIcon },
{ to: '/brand-kit', label: 'Brand Kit', shortLabel: 'Brand', icon: PaletteIcon }];


export const secondaryNav: NavItem[] = [
{ to: '/settings', label: 'Settings', shortLabel: 'Settings', icon: SettingsIcon },
{ to: '/help', label: 'Help & Documentation', shortLabel: 'Help', icon: LifeBuoyIcon }];


export const classicEditorUrl = 'https://thecarosell.netlify.app/';