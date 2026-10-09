export type FeatureState = 'working' | 'needs-setup' | 'preview' | 'verify';

export interface FeatureStatus {
  feature: string;
  state: FeatureState;
  note: string;
}

export const featureStatus: FeatureStatus[] = [
{
  feature: 'Slide editor, typography and auto-fit',
  state: 'working',
  note: 'Text is drawn by the app, never by the image model. Wrapping, auto-sizing, text boxes and overflow detection run in your browser.'
},
{
  feature: 'Reorder, duplicate, delete, undo and redo',
  state: 'working',
  note: 'Drag the handle above a thumbnail or use the arrow keys on it.'
},
{
  feature: 'Quality checks',
  state: 'working',
  note: 'Overflow, contrast, missing or blocked images, blank or duplicate slides, spacing drift and canvas size.'
},
{
  feature: 'PNG / JPEG / ZIP export',
  state: 'working',
  note: 'Renders the actual slide artwork at full resolution with sequential filenames. Optional caption.txt in the ZIP.'
},
{
  feature: 'Projects and autosave',
  state: 'working',
  note: 'Saved in this browser (IndexedDB). Survives refreshes, but does not sync between devices.'
},
{
  feature: 'Script generation with Gemini',
  state: 'needs-setup',
  note: 'Requires the secure Netlify function from Settings. The key never reaches the browser. Responses are validated before use.'
},
{
  feature: 'Background generation (ComfyUI or HTTP)',
  state: 'needs-setup',
  note: 'Requires a running ComfyUI instance or your own image endpoint. Without one, slides are generated text-first and you add images.'
},
{
  feature: 'Sample slideshow',
  state: 'preview',
  note: 'A design preview with pre-made images. It is labelled as a sample and never mixed into real generations.'
},
{
  feature: 'Hand-off to the classic Carosell editor',
  state: 'verify',
  note: 'The existing editor source was not available. Shared project format and component reuse must be confirmed against the repository.'
}];