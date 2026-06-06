export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: 'Lipsește cheia API (x-api-key header).' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: { message: 'Request body invalid.' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };

  if (body.stream) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }

  const data = await upstream.json();
  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
