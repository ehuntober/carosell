import type { IntegrationSettings } from '../types/settings';
import { blobToDataUrl } from './imageCache';

/**
 * Image engines are swappable: the studio only calls generateImage(), so adding
 * another backend later means adding one branch here — no UI changes.
 */

export interface ImageRequest {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  seed: number;
  signal?: AbortSignal;
}

export const NEGATIVE_PROMPT =
'text, letters, words, typography, watermark, logo, signature, caption, blurry, low quality, deformed';

export function isImageProviderConfigured(s: IntegrationSettings): boolean {
  if (s.imageProvider === 'comfyui') return Boolean(s.comfyUrl.trim() && s.comfyCheckpoint.trim());
  if (s.imageProvider === 'http') return Boolean(s.httpEndpoint.trim());
  return false;
}

export function providerLabel(s: IntegrationSettings): string {
  if (s.imageProvider === 'comfyui') return 'ComfyUI';
  if (s.imageProvider === 'http') return 'Custom endpoint';
  return 'Not connected';
}

/** Model-friendly size near 1 megapixel with the slide's aspect ratio, in multiples of 64. */
export function generationSize(W: number, H: number): {width: number;height: number;} {
  const ratio = W / H;
  const w = Math.sqrt(1024 * 1024 * ratio);
  const h = w / ratio;
  return {
    width: Math.max(512, Math.round(w / 64) * 64),
    height: Math.max(512, Math.round(h / 64) * 64)
  };
}

export async function generateImage(s: IntegrationSettings, req: ImageRequest): Promise<string> {
  if (s.imageProvider === 'comfyui') return comfyGenerate(s, req);
  if (s.imageProvider === 'http') return httpGenerate(s, req);
  throw new Error('No image engine is connected.');
}

export async function checkImageProvider(s: IntegrationSettings): Promise<{ok: boolean;message: string;}> {
  try {
    if (s.imageProvider === 'comfyui') {
      const res = await fetch(`${trimUrl(s.comfyUrl)}/system_stats`);
      if (!res.ok) return { ok: false, message: `ComfyUI answered with ${res.status}.` };
      const data = (await res.json()) as {system?: {comfyui_version?: string;};};
      return { ok: true, message: `Connected to ComfyUI${data.system?.comfyui_version ? ` ${data.system.comfyui_version}` : ''}` };
    }
    if (s.imageProvider === 'http') {
      const res = await fetch(s.httpEndpoint.trim(), { method: 'OPTIONS' });
      return res.status < 500 ?
      { ok: true, message: 'Endpoint is reachable. It will be fully tested on the first image.' } :
      { ok: false, message: `Endpoint answered with ${res.status}.` };
    }
    return { ok: false, message: 'Choose an image engine first.' };
  } catch {
    return {
      ok: false,
      message:
      s.imageProvider === 'comfyui' ?
      "Couldn't reach ComfyUI. Is it running with --enable-cors-header?" :
      "Couldn't reach the endpoint. Check the URL and its CORS settings."
    };
  }
}

function trimUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

interface ComfyHistoryEntry {
  status?: {status_str?: string;};
  outputs?: Record<string, {images?: {filename: string;subfolder: string;type: string;}[];}>;
}

function comfyWorkflow(s: IntegrationSettings, req: ImageRequest, width: number, height: number) {
  return {
    '3': {
      class_type: 'KSampler',
      inputs: {
        seed: req.seed,
        steps: s.comfySteps,
        cfg: 6.5,
        sampler_name: 'dpmpp_2m',
        scheduler: 'karras',
        denoise: 1,
        model: ['4', 0],
        positive: ['6', 0],
        negative: ['7', 0],
        latent_image: ['5', 0]
      }
    },
    '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: s.comfyCheckpoint.trim() } },
    '5': { class_type: 'EmptyLatentImage', inputs: { width, height, batch_size: 1 } },
    '6': { class_type: 'CLIPTextEncode', inputs: { text: req.prompt, clip: ['4', 1] } },
    '7': { class_type: 'CLIPTextEncode', inputs: { text: req.negativePrompt, clip: ['4', 1] } },
    '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
    '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'carosell', images: ['8', 0] } }
  };
}

async function comfyGenerate(s: IntegrationSettings, req: ImageRequest): Promise<string> {
  const base = trimUrl(s.comfyUrl);
  const { width, height } = generationSize(req.width, req.height);
  let res: Response;
  try {
    res = await fetch(`${base}/prompt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: comfyWorkflow(s, req, width, height), client_id: 'carosell-studio' }),
      signal: req.signal
    });
  } catch (e) {
    if (req.signal?.aborted) throw e;
    throw new Error(`Couldn't reach ComfyUI at ${base}. Is it running with --enable-cors-header?`);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(
      `ComfyUI rejected the job (${res.status}). ${detail.includes('ckpt_name') ? 'Check the checkpoint filename.' : detail.slice(0, 140)}`
    );
  }
  const { prompt_id: promptId } = (await res.json()) as {prompt_id?: string;};
  if (!promptId) throw new Error('ComfyUI did not return a job id.');

  const interrupt = () => {
    void fetch(`${base}/interrupt`, { method: 'POST' }).catch(() => undefined);
  };
  req.signal?.addEventListener('abort', interrupt, { once: true });

  try {
    const deadline = Date.now() + 6 * 60_000;
    while (Date.now() < deadline) {
      await sleep(1500, req.signal);
      const h = await fetch(`${base}/history/${promptId}`, { signal: req.signal });
      if (!h.ok) continue;
      const history = (await h.json()) as Record<string, ComfyHistoryEntry>;
      const entry = history[promptId];
      if (!entry) continue;
      if (entry.status?.status_str === 'error') throw new Error('ComfyUI reported an error while generating.');
      const img = entry.outputs?.['9']?.images?.[0];
      if (img) {
        const params = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type });
        const file = await fetch(`${base}/view?${params.toString()}`, { signal: req.signal });
        if (!file.ok) throw new Error('ComfyUI finished, but the image could not be downloaded.');
        return blobToDataUrl(await file.blob());
      }
    }
    throw new Error('ComfyUI took longer than 6 minutes. Try fewer steps or a lighter model.');
  } finally {
    req.signal?.removeEventListener('abort', interrupt);
  }
}

async function httpGenerate(s: IntegrationSettings, req: ImageRequest): Promise<string> {
  const { width, height } = generationSize(req.width, req.height);
  let res: Response;
  try {
    res = await fetch(s.httpEndpoint.trim(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: req.prompt, negativePrompt: req.negativePrompt, width, height, seed: req.seed }),
      signal: req.signal
    });
  } catch (e) {
    if (req.signal?.aborted) throw e;
    throw new Error("Couldn't reach the image endpoint.");
  }
  if (res.status === 429) throw new Error('The image service quota is used up. Try again later.');
  if (!res.ok) throw new Error(`Image endpoint failed (${res.status}).`);
  const data = (await res.json()) as {image?: string;url?: string;};
  if (data.image) return data.image.startsWith('data:') ? data.image : `data:image/png;base64,${data.image}`;
  if (data.url) {
    const file = await fetch(data.url, { signal: req.signal });
    if (!file.ok) throw new Error('The generated image URL could not be downloaded.');
    return blobToDataUrl(await file.blob());
  }
  throw new Error('The image endpoint returned neither "image" nor "url".');
}