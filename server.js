import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));

app.post('/api/claude', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Lipsește cheia API.' });

  const { prompt, fast } = req.body;
  const model = fast ? 'claude-haiku-4-5' : 'claude-sonnet-4-5';
  if (!prompt) return res.status(400).json({ error: 'Lipsește promptul.' });

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || `Eroare ${upstream.status}` });
    }

    return res.status(200).json({ content: data.content[0].text });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err?.message ?? err));

app.listen(PORT, () => {
  console.log(`✅ Daily Growth proxy → http://localhost:${PORT}`);
});
