import { CATEGORIES, PRIORITIES } from './requestService.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const TIMEOUT_MS = 45000;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface AiAnalysis {
  category: string;
  priority: string;
  confidence: number;
  summary: string;
  next_action: string;
  model: string;
}

const buildPrompt = (title: string, description: string) => `You are a triage assistant for a service-request platform used by small service businesses.

Analyse the request below and reply with ONLY a JSON object. No markdown, no code fences, no commentary.

{
  "category": one of ${JSON.stringify(CATEGORIES)},
  "priority": one of ${JSON.stringify(PRIORITIES)},
  "confidence": a number between 0 and 1 reflecting how certain you are of the category,
  "summary": one or two sentences, under 200 characters, plain factual language,
  "next_action": one concrete sentence describing what the team should do first, under 200 characters
}

Priority guidance:
- Urgent: active damage, safety risk, or total loss of an essential service
- High: worsening problem, or something blocking normal use
- Medium: needs attention but stable
- Low: cosmetic, routine, or scheduled work

If the request is too vague to classify, use "Other" and a low confidence rather than guessing.

Title: ${title}

Description: ${description}`;

/** Models sometimes wrap JSON in fences or add prose. Pull out the object. */
function extractJson(raw: string): any {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model returned malformed output');
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** Never trust the model. Coerce everything into a known-good shape. */
function normalize(parsed: any): Omit<AiAnalysis, 'model'> {
  const validCategory = CATEGORIES.includes(parsed?.category);
  const category = validCategory ? parsed.category : 'Other';
  const priority = PRIORITIES.includes(parsed?.priority) ? parsed.priority : 'Medium';

  let confidence = Number(parsed?.confidence);
  if (!Number.isFinite(confidence)) confidence = 0.5;
  confidence = Math.min(1, Math.max(0, confidence));
  // if we had to fall back to Other, the model's stated confidence isn't meaningful
  if (!validCategory) confidence = Math.min(confidence, 0.4);

  const trim = (v: unknown, max: number) =>
    typeof v === 'string' ? v.trim().slice(0, max) : '';

  return {
    category,
    priority,
    confidence: Math.round(confidence * 100) / 100,
    summary: trim(parsed?.summary, 400) || 'No summary available.',
    next_action: trim(parsed?.next_action, 400) || 'Review the request and assign an owner.',
  };
}

export const isAiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

export async function analyzeRequest(
  title: string,
  description: string
): Promise<AiAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('AI is not configured on this server');

  const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(title, description) }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch((err) => {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      throw new Error('AI request timed out');
    }
    throw new Error('Could not reach the AI service');
  });

  const body: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 429) throw new Error('AI rate limit reached. Please try again shortly.');
    throw new Error(body?.error?.message || `AI service returned ${res.status}`);
  }

  const text = body?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p?.text ?? '')
    .join('')
    .trim();

  if (!text) throw new Error('Empty response from the model');

  return { ...normalize(extractJson(text)), model: MODEL };
}