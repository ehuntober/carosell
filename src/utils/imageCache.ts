export interface LoadedImage {
  img: HTMLImageElement;
  /** True when the host blocks pixel access (no CORS). Such images render but cannot be exported. */
  tainted: boolean;
}

const cache = new Map<string, Promise<LoadedImage>>();

function load(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
  });
}

export function loadImage(src: string): Promise<LoadedImage> {
  const cached = cache.get(src);
  if (cached) return cached;
  const isLocal = src.startsWith('data:') || src.startsWith('blob:');
  const promise = load(src, !isLocal).
  then((img) => ({ img, tainted: false })).
  catch(async () => {
    if (isLocal) throw new Error('Image failed to load');
    const img = await load(src, false);
    return { img, tainted: true };
  });
  promise.catch(() => cache.delete(src));
  cache.set(src, promise);
  return promise;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read image data'));
    reader.readAsDataURL(blob);
  });
}