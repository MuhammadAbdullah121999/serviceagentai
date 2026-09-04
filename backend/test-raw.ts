import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL;

async function run() {
  console.log('model:', model);
  const t = Date.now();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Reply with exactly: OK' }] }],
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    const body = await res.json() as any;
    console.log('status:', res.status, `(${Date.now() - t}ms)`);

    if (!res.ok) {
      console.log(JSON.stringify(body, null, 2));
      return;
    }

    console.log('reply:', body.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err: any) {
    console.error(`failed after ${Date.now() - t}ms:`, err.message);
  }
}

run();