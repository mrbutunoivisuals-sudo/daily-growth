import { useState } from 'react';

// În development folosim proxy-ul Express local; în producție (Vercel) apelăm direct /api/claude
const PROXY_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api/claude'
  : '/api/claude';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApiKey = () => {
    try {
      return JSON.parse(localStorage.getItem('dg_apiKey')) || '';
    } catch { return ''; }
  };

  const callAI = async (prompt, onChunk) => {
    setLoading(true);
    setError(null);
    const apiKey = getApiKey();

    if (!apiKey) {
      setError('Cheia API lipsește. Mergi la Setări pentru a o adăuga.');
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
          stream: !!onChunk,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Eroare API: ${response.status}`);
      }

      if (onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                fullText += data.delta.text;
                onChunk(data.delta.text, fullText);
              }
            } catch {}
          }
        }
        setLoading(false);
        return fullText;
      } else {
        const data = await response.json();
        setLoading(false);
        return data.content[0]?.text || '';
      }
    } catch (err) {
      const isConnectionRefused = err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('ECONNREFUSED');
      setError(
        isConnectionRefused
          ? 'Proxy-ul local nu rulează. Pornește serverul cu: npm run server'
          : err.message
      );
      setLoading(false);
      return null;
    }
  };

  const callAIJSON = async (prompt) => {
    const text = await callAI(prompt);
    if (!text) return null;
    try {
      const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : null;
    } catch {
      setError('Eroare la procesarea răspunsului AI.');
      return null;
    }
  };

  return { callAI, callAIJSON, loading, error, setError };
}
