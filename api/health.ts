import { getGeminiClient } from '../src/server/aiTutorCore.js';

export default function handler(_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) {
  res.status(200).json({
    ok: true,
    geminiConfigured: Boolean(getGeminiClient()),
    timestamp: new Date().toISOString(),
  });
}
