import dotenv from 'dotenv';
dotenv.config();

import { analyzeRequest, isAiConfigured } from './src/services/aiService.js';

async function run() {
  if (!isAiConfigured()) {
    console.error('GEMINI_API_KEY is not set in backend/.env');
    return;
  }

  const cases = [
    {
      title: 'Water pouring from ceiling in server room',
      description: 'A pipe has burst above the second floor server room. Water is coming through the ceiling tiles onto the racks. We have shut down the machines.',
    },
    {
      title: 'Meeting room light flickers',
      description: 'One of the ceiling lights in meeting room 3 flickers occasionally. Not urgent, just noticeable during presentations.',
    },
    {
      title: 'thing broken',
      description: 'it does not work properly sometimes',
    },
  ];

  for (const c of cases) {
    console.log(`\n"${c.title}"`);
    try {
      const t = Date.now();
      const ai = await analyzeRequest(c.title, c.description);
      console.log(`  ${ai.category} / ${ai.priority} / confidence ${ai.confidence}  (${Date.now() - t}ms)`);
      console.log(`  summary: ${ai.summary}`);
      console.log(`  action:  ${ai.next_action}`);
    } catch (err: any) {
      console.error('  FAILED:', err.message);
    }
  }
}

run();