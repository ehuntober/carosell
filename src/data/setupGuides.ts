export const geminiFunctionPath = '/.netlify/functions/carosell-generate';

export const geminiSetupSteps = [
'In your Carosell repository, create netlify/functions/carosell-generate.mjs with the code below.',
'Run npm install @google/genai so Netlify bundles the SDK with the function.',
'In Netlify → Site configuration → Environment variables, add GEMINI_API_KEY (never prefix it with VITE_ or REACT_APP_).',
'Deploy, then paste the function URL above and press Test connection.'];


export const geminiFunctionCode = `// netlify/functions/carosell-generate.mjs
// The API key stays on the server. The browser only ever sees slide JSON.
import { GoogleGenAI, Type } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    slideNumber: { type: Type.INTEGER },
    headline: { type: Type.STRING },
    body: { type: Type.STRING },
    supportingText: { type: Type.STRING },
    imagePrompt: { type: Type.STRING },
    visualDirection: { type: Type.STRING },
    textPlacement: { type: Type.STRING, enum: ["top", "center", "bottom"] },
    textColor: { type: Type.STRING },
    backgroundContrast: { type: Type.STRING, enum: ["light", "dark"] },
    emphasisWords: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["slideNumber", "headline", "body", "imagePrompt", "visualDirection", "textPlacement", "textColor", "backgroundContrast"],
};

const scriptSchema = {
  type: Type.OBJECT,
  properties: {
    slides: { type: Type.ARRAY, items: slideSchema },
    caption: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["slides"],
};

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.GEMINI_API_KEY) return json({ error: "GEMINI_API_KEY is not set on the server" }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
  if (body.mode === "ping") return json({ ok: true, model: MODEL });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const single = body.mode === "slide" || body.mode === "shorten";

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: single ? slidePrompt(body) : scriptPrompt(body),
      config: {
        responseMimeType: "application/json",
        responseSchema: single ? slideSchema : scriptSchema,
        temperature: 0.9,
      },
    });
    return json(JSON.parse(result.text));
  } catch (err) {
    const message = String(err && err.message);
    const quota = (err && err.status === 429) || /RESOURCE_EXHAUSTED|quota/i.test(message);
    return json(
      { error: quota ? "Gemini free-tier quota reached. Try again later." : "Gemini request failed: " + message },
      quota ? 429 : 502
    );
  }
};

function scriptPrompt(b) {
  const c = b.content;
  return [
    "You write viral social media carousel slideshows.",
    "Topic: " + c.topic,
    "Niche: " + (c.niche === "Custom" ? c.customNiche : c.niche),
    "Audience: " + (c.audience || "general social media audience"),
    "Tone: " + c.tone + ". Language: " + c.language + ".",
    "Platform: " + b.platform + " (" + b.aspectRatio + ").",
    "Write exactly " + c.slideCount + " slides.",
    "Slide 1 is a scroll-stopping hook. Middle slides each deliver one clear, specific idea.",
    c.includeCta
      ? "The final slide is a call to action: " + (c.ctaText || "follow for more") + "."
      : "The final slide is a strong conclusion.",
    "Headlines: max 10 words. Body: max 28 words.",
    "imagePrompt: a background scene with NO text, in this visual style: " + b.visualStyle + ".",
    "Keep every imagePrompt visually consistent with the others.",
    "textColor: a hex color that is readable on the described background.",
    c.captions ? "Also write a caption (max 220 characters) and 5-8 hashtags." : "Return an empty caption and no hashtags.",
  ].join("\\n");
}

function slidePrompt(b) {
  const c = b.content;
  const task = b.mode === "shorten"
    ? "Shorten this slide so it fits: headline max 8 words, body max 18 words. Keep the meaning."
    : "Rewrite this slide with a fresh angle while keeping its role in the slideshow.";
  return [
    task,
    "Slideshow topic: " + c.topic + ". Tone: " + c.tone + ". Language: " + c.language + ".",
    "This is slide " + b.slideNumber + " of " + b.totalSlides + " (role: " + b.role + ").",
    "Current headline: " + b.current.headline,
    "Current body: " + b.current.body,
    "Visual style for imagePrompt: " + b.visualStyle + ". No text in images.",
  ].join("\\n");
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
`;

export const comfySetupSteps = [
'Install ComfyUI on a computer with a capable GPU (8 GB+ VRAM recommended for SDXL).',
'Put an SDXL checkpoint (for example sd_xl_base_1.0.safetensors) in ComfyUI/models/checkpoints.',
'Start it with: python main.py --enable-cors-header "*" --listen 127.0.0.1',
'Enter the URL and the exact checkpoint filename here, then press Test connection.',
'Chrome and Firefox allow an https site to call http://127.0.0.1. Safari blocks it — use Chrome for local generation.'];


export const httpProviderContract = `POST <your endpoint>
{ "prompt": "...", "negativePrompt": "...", "width": 768, "height": 1344, "seed": 1234 }

→ 200 { "image": "data:image/png;base64,..." }   or   { "url": "https://..." }`;