import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getGeminiClient, runAiTeacherRequest } from './src/server/aiTutorCore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(getGeminiClient()),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/ai-teacher', async (req: Request, res: Response) => {
  try {
    const result = await runAiTeacherRequest(req.body || {});
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    console.error('AI Teacher Route Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unexpected server error',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Arabic Academy server running at http://localhost:${PORT}`);
  });
}

startServer();
