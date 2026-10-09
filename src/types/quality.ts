export type IssueSeverity = 'error' | 'warning';

export type FixAction =
'fit-text' |
'shorten-copy' |
'enable-box' |
'swap-text-color' |
'upload-image' |
'generate-image' |
'reset-spacing' |
'open-slide' |
'fix-canvas';

export interface IssueFix {
  action: FixAction;
  label: string;
}

export interface QualityIssue {
  id: string;
  slideId: string | null;
  slideIndex: number | null;
  severity: IssueSeverity;
  code: string;
  title: string;
  detail: string;
  fixes: IssueFix[];
  suggestedColor?: string;
}

export interface SlideCheckMetrics {
  overflow: boolean;
  fitScale: number;
  contrast: number | null;
  suggestedTextColor: string | null;
  tainted: boolean;
  imageError: string | null;
  imageSize: {w: number;h: number;} | null;
}