import type { IncomingMessage, ServerResponse } from 'http';
import { streamFormatPdfRequest } from '../src/server/aiTutorCore.js';

export const maxDuration = 60;

interface VercelRequest extends IncomingMessage {
  method?: string;
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const abortController = new AbortController();
  req.on('close', () => {
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
      body,
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
    console.error('Vercel Format PDF Stream Route Error:', err);
    sendSse('error', {
      status: 500,
      error: err instanceof Error ? err.message : 'Unexpected PDF stream error',
    });
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
}
