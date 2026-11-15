import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getGeminiKeyPoolInfo,
  runAiTeacherRequest,
  runFormatPdfRequest,
  runGeminiTtsRequest,
  streamFormatPdfRequest,
} from './src/server/aiTutorCore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '60mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  const poolInfo = getGeminiKeyPoolInfo();
  res.json({
    ok: true,
    geminiConfigured: poolInfo.configuredKeyCount > 0,
    configuredKeyCount: poolInfo.configuredKeyCount,
    availableKeyCount: poolInfo.availableKeyCount,
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

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const result = await runGeminiTtsRequest(req.body || {});
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    console.error('TTS Route Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unexpected TTS error',
    });
  }
});

app.post('/api/format-pdf', async (req: Request, res: Response) => {
  try {
    const result = await runFormatPdfRequest(req.body || {});
    res.status(result.status).json(result.body);
  } catch (err: unknown) {
    console.error('Format PDF Route Error:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unexpected PDF format error',
    });
  }
});

app.post('/api/format-pdf-stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const abortController = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  const sendSse = (event: string, data: unknown) => {
    if (res.writableEnded) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await streamFormatPdfRequest(
      req.body || {},
      (ev) => {
        if (ev.type === 'progress') {
          sendSse('progress', { charsReceived: ev.charsReceived, model: ev.model });
        } else if (ev.type === 'result') {
          sendSse('result', { document: ev.document, model: ev.model });
        } else if (ev.type === 'error') {
          sendSse('error', { status: ev.status, error: ev.error });
        }
      },
      abortController.signal
    );
  } catch (err: unknown) {
    console.error('Format PDF Stream Route Error:', err);
    sendSse('error', {
      status: 500,
      error: err instanceof Error ? err.message : 'Unexpected PDF stream error',
    });
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
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
