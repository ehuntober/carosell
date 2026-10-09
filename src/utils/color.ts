export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB | null {
  const raw = hex.trim().replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = parseInt(full, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}

export function isHexColor(value: string): boolean {
  return hexToRgb(value) !== null;
}

export function rgbToHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

export function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance([r, g, b]: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function blend(top: RGB, bottom: RGB, alpha: number): RGB {
  return [
  top[0] * alpha + bottom[0] * (1 - alpha),
  top[1] * alpha + bottom[1] * (1 - alpha),
  top[2] * alpha + bottom[2] * (1 - alpha)];

}

export function isDarkColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  return rgb ? relativeLuminance(rgb) < 0.35 : true;
}

/** Picks whichever of white / near-black reads better on the given backdrop. */
export function bestTextColor(backdrop: RGB): string {
  const white: RGB = [255, 255, 255];
  const black: RGB = [17, 17, 17];
  return contrastRatio(white, backdrop) >= contrastRatio(black, backdrop) ? '#ffffff' : '#111111';
}