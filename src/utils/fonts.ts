import { fontOptions } from '../data/options';

const loaded = new Set<string>();

export function headlineWeight(family: string): number {
  return fontOptions.find((f) => f.family === family)?.weight ?? 700;
}

export async function ensureFonts(families: string[]): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  await Promise.all(
    Array.from(new Set(families)).map(async (family) => {
      if (loaded.has(family)) return;
      try {
        await Promise.all([
        document.fonts.load(`${headlineWeight(family)} 48px "${family}"`),
        document.fonts.load(`400 48px "${family}"`)]
        );
      } catch {

        // Falls back to the next font in the stack; rendering still works.
      }loaded.add(family);
    })
  );
}