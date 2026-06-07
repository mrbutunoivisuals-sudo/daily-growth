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

  const callAI = async (prompt, { fast = false } = {}) => {
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
        body: JSON.stringify({ prompt, fast }),
      });

      const rawText = await response.text();
      console.log('RAW RESPONSE:', rawText);
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`JSON invalid. Brut: ${rawText.slice(0, 300)}`);
      }

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

  const callAIJSON = async (prompt, { fast = false } = {}) => {
    const text = await callAI(prompt, { fast });
    if (!text) return null;
    try {
      // Elimină markdown code fences: ```json ... ``` sau ``` ... ```
      const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
      console.log('STRIPPED FOR JSON:', stripped.slice(0, 200));
      // Extrage primul array sau obiect JSON
      const match = stripped.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (!match) throw new Error(`Niciun JSON găsit în: ${stripped.slice(0, 200)}`);
      return JSON.parse(match[0]);
    } catch (err) {
      setError(`JSON parse eșuat: ${err.message}`);
      return null;
    }
  };

  return { callAI, callAIJSON, loading, error, setError };
}
