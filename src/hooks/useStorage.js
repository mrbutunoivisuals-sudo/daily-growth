import { useState, useEffect } from 'react';

export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

export function useProfile() {
  return useStorage('dg_userProfile', null);
}

export function useSessions() {
  return useStorage('dg_sessions', []);
}

export function useSpacedRepetition() {
  return useStorage('dg_spacedRepetition', {});
}

export function useCustomDomains() {
  return useStorage('dg_customDomains', []);
}

export function useApiKey() {
  return useStorage('dg_apiKey', '');
}

export function useStreak() {
  const [streak, setStreak] = useStorage('dg_streak', { current: 0, lastActive: null });

  const updateStreak = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    setStreak(prev => {
      if (prev.lastActive === today) return prev;
      if (prev.lastActive === yesterday) {
        return { current: prev.current + 1, lastActive: today };
      }
      return { current: 1, lastActive: today };
    });
  };

  return [streak, updateStreak];
}

export function exportAllData() {
  const keys = ['dg_userProfile', 'dg_sessions', 'dg_spacedRepetition', 'dg_customDomains', 'dg_streak'];
  const data = {};
  keys.forEach(k => {
    try { data[k] = JSON.parse(localStorage.getItem(k)); } catch {}
  });
  return data;
}
