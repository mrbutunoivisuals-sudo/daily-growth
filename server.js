import express from 'express';
import cors from 'cors';
import { Readable } from 'node:stream';

const app = express();
const PORT = 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));

app.post('/api/claude', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: { message: 'Lipsește cheia API (x-api-key header).' } });
  }

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
  } catch (err) {
    return res.status(502).json({ error: { message: `Nu pot contacta Anthropic API: ${err.message}` } });
  }

  if (req.body.stream === true) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Pipe WHATWG ReadableStream → Node Readable → res
    const nodeReadable = Readable.fromWeb(upstream.body);
    nodeReadable.pipe(res);
    nodeReadable.on('error', () => res.end());
  } else {
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  }
});

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Keep process alive and log unhandled errors instead of crashing
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err?.message ?? err));

app.listen(PORT, () => {
  console.log(`✅ Daily Growth proxy activ → http://localhost:${PORT}`);
  console.log('   Apasă Ctrl+C pentru a opri.\n');
});
