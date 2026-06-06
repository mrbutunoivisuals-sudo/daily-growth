export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return json({ error: { message: 'Method not allowed' } }, 405);
  }

  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return json({ error: { message: 'Lipsește cheia API (x-api-key header).' } }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ error: { message: `JSON parse error: ${e.message}` } }, 400);
  }

  // Limităm max_tokens pentru a evita timeout pe Edge (limită 30s)
  if (body.max_tokens && body.max_tokens > 500) body.max_tokens = 500;

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
    return json({ error: { message: `Network error reaching Anthropic: ${err.message}` } }, 502);
  }

  // Dacă Anthropic returnează eroare, retransmite răspunsul complet ca JSON
  if (!upstream.ok) {
    let errBody;
    try {
      errBody = await upstream.json();
    } catch {
      errBody = { error: { message: `Anthropic HTTP ${upstream.status}` } };
    }
    return json({
      error: {
        message: errBody?.error?.message || `Anthropic error ${upstream.status}`,
        type: errBody?.error?.type || 'api_error',
        status: upstream.status,
        raw: errBody,
      },
    }, upstream.status);
  }

  if (body.stream) {
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }

  const data = await upstream.json();
  return json(data, 200);
}
