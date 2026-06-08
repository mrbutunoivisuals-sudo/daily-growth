import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

const KEYS = {
  profile:  'dg_v3_profile',
  checkins: 'dg_v3_checkins',
  coach:    'dg_v3_coach',
  reviews:  'dg_v3_reviews',
  apiKey:   'dg_apiKey', // shared cu v1/v2 — utilizatorul nu re-introduce cheia
};

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }) {
  const [profile,  setProfileRaw]  = useState(() => load(KEYS.profile, null));
  const [checkins, setCheckinsRaw] = useState(() => load(KEYS.checkins, []));
  const [coach,    setCoachRaw]    = useState(() => load(KEYS.coach, []));
  const [reviews,  setReviewsRaw]  = useState(() => load(KEYS.reviews, []));
  const [apiKey,   setApiKeyRaw]   = useState(() => load(KEYS.apiKey, ''));

  const setProfile  = useCallback(v => { const n = typeof v === 'function' ? v(profile)  : v; save(KEYS.profile,  n); setProfileRaw(n);  }, [profile]);
  const setCheckins = useCallback(v => { const n = typeof v === 'function' ? v(checkins) : v; save(KEYS.checkins, n); setCheckinsRaw(n); }, [checkins]);
  const setCoach    = useCallback(v => { const n = typeof v === 'function' ? v(coach)    : v; save(KEYS.coach,    n); setCoachRaw(n);    }, [coach]);
  const setReviews  = useCallback(v => { const n = typeof v === 'function' ? v(reviews)  : v; save(KEYS.reviews,  n); setReviewsRaw(n);  }, [reviews]);
  const setApiKey   = useCallback(v => { save(KEYS.apiKey, v); setApiKeyRaw(v); }, []);

  // Checkin de azi
  const todayKey = new Date().toDateString();
  const todayCheckin = checkins.find(c => new Date(c.date).toDateString() === todayKey) || null;

  const upsertTodayCheckin = useCallback((patch) => {
    setCheckins(prev => {
      const existing = prev.find(c => new Date(c.date).toDateString() === todayKey);
      if (existing) {
        return prev.map(c => new Date(c.date).toDateString() === todayKey ? { ...c, ...patch } : c);
      }
      return [...prev, { date: new Date().toISOString(), ...patch }];
    });
  }, [todayKey, setCheckins]);

  // Streak — zile consecutive cu cel puțin un check-in
  const streak = (() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toDateString();
      const found = checkins.some(c => new Date(c.date).toDateString() === key);
      if (found) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  // Ultimele 7 zile de check-in-uri (pentru Coach + Review)
  const weekHistory = (() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return d.toDateString();
    });
    return checkins
      .filter(c => last7.includes(new Date(c.date).toDateString()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  })();

  const resetAll = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setProfileRaw(null); setCheckinsRaw([]); setCoachRaw([]); setReviewsRaw([]); setApiKeyRaw('');
  }, []);

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      checkins, setCheckins, todayCheckin, upsertTodayCheckin,
      coach, setCoach,
      reviews, setReviews,
      apiKey, setApiKey,
      streak, weekHistory,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
