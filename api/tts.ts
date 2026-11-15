import { runGeminiTtsRequest } from '../src/server/aiTutorCore.js';

export const maxDuration = 30;

export default async function handler(
  req: { method?: string; body?: unknown },
  res: { status: (code: number) => { json: (data: unknown) => void } }
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body: Record<string, unknown> = {};
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as Record<string, unknown>;
  } catch {
    res.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }

  const result = await runGeminiTtsRequest(body);
  res.status(result.status).json(result.body);
}
