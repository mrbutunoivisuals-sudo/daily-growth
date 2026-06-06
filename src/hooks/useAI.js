import { useState } from 'react';

const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isDev ? 'http://localhost:3001/api/claude' : '/api/claude';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApiKey = () => {
    try { return JSON.parse(localStorage.getItem('dg_apiKey')) || ''; }
    catch { return ''; }
  };

  const callAI = async (prompt) => {
    setLoading(true);
    setError(null);

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Cheia API lipsește. Mergi la Setări.');
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ prompt }),
      });

      const rawText = await response.text();
      console.log('RAW RESPONSE:', rawText);
      const data = JSON.parse(rawText);

      if (!response.ok) {
        throw new Error(data?.error || `Eroare HTTP ${response.status}`);
      }

      setLoading(false);
      return data.content;
    } catch (err) {
      setError(err.message);
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
      setError('Răspunsul AI nu e JSON valid.');
      return null;
    }
  };

  return { callAI, callAIJSON, loading, error, setError };
}
