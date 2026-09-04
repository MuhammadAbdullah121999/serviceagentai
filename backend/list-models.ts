import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY;

async function run() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  );
  const body = await res.json() as any;

  if (!res.ok) {
    console.error('Status:', res.status);
    console.error(JSON.stringify(body, null, 2));
    return;
  }

  console.log('Models supporting generateContent:\n');
  body.models
    ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .forEach((m: any) => console.log('  ' + m.name.replace('models/', '')));
}

run();