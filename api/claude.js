export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed' } });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: { message: 'Lipsește cheia API (x-api-key header).' } });

  const body = req.body;
  if (!body) return res.status(400).json({ error: { message: 'Request body lipsește.' } });

  // Clampăm max_tokens pentru a evita timeout
  if (!body.max_tokens || body.max_tokens > 500) body.max_tokens = 500;

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return res.status(502).json({ error: { message: `Nu pot contacta Anthropic: ${err.message}` } });
  }

  let data;
  try {
    data = await upstream.json();
  } catch (err) {
    return res.status(502).json({ error: { message: `Răspuns invalid de la Anthropic: ${err.message}` } });
  }

  if (!upstream.ok) {
    return res.status(upstream.status).json({
      error: {
        message: data?.error?.message || `Anthropic error ${upstream.status}`,
        type: data?.error?.type,
        status: upstream.status,
      },
    });
  }

  const text = data?.content?.[0]?.text || '';
  return res.status(200).json({ content: text });
}
