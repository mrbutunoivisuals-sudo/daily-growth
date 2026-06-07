export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Lipsește cheia API.' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Lipsește promptul.' });

  let upstream;
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: `Fetch failed: ${err.message}` });
  }

  let data;
  try {
    data = await upstream.json();
  } catch (err) {
    return res.status(502).json({ error: `JSON parse failed: ${err.message}` });
  }

  if (!upstream.ok) {
    return res.status(upstream.status).json({
      error: data?.error?.message || `Anthropic error ${upstream.status}`,
    });
  }

  const text = data?.content?.[0]?.text;
  if (!text) {
    return res.status(502).json({ error: `No text in response: ${JSON.stringify(data)}` });
  }

  return res.status(200).json({ content: text });
}
