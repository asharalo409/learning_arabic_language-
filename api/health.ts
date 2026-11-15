import { getGeminiKeyPoolInfo } from '../src/server/aiTutorCore.js';

export default function handler(_req: unknown, res: { status: (code: number) => { json: (data: unknown) => void } }) {
  const poolInfo = getGeminiKeyPoolInfo();
  res.status(200).json({
    ok: true,
    geminiConfigured: poolInfo.configuredKeyCount > 0,
    configuredKeyCount: poolInfo.configuredKeyCount,
    availableKeyCount: poolInfo.availableKeyCount,
    timestamp: new Date().toISOString(),
  });
}
