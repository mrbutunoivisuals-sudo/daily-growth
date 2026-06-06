export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

export default async function handler(req) {
  // Preflight CORS — browserul trimite OPTIONS înainte de POST cross-origin
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: { message: 'Method not allowed' } }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Lipsește cheia API (x-api-key header).' } }),
      { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { message: 'Request body invalid (JSON parse error).' } }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
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
      body: JSON.stringify(body),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: `Nu pot contacta Anthropic API: ${err.message}` } }),
      { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  if (body.stream) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...CORS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
