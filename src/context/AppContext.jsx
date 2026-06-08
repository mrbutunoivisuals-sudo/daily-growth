import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  getUserId,
  fetchProfile, syncProfile,
  fetchCheckins, syncCheckin, rowToCheckin,
  fetchTodayTasks, syncTasks,
  fetchCoachMessages, insertCoachMessage, clearCoachMessages, rowToCoachMsg,
  fetchReviews, syncReview, rowToReview,
} from '../lib/db.js';

const AppContext = createContext(null);

// ── localStorage keys ─────────────────────────────────────────────────────────
const KEYS = {
  profile:  'dg_v3_profile',
  checkins: 'dg_v3_checkins',
  coach:    'dg_v3_coach',
  reviews:  'dg_v3_reviews',
  apiKey:   'dg_apiKey',
};
const TASKS_KEY = 'dg_v3_tasks';

// ── localStorage helpers ──────────────────────────────────────────────────────
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function loadTodayTasksLocal() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.date === todayStr() ? parsed.tasks : null;
  } catch { return null; }
}
function saveTodayTasksLocal(tasks) {
  try { localStorage.setItem(TASKS_KEY, JSON.stringify({ date: todayStr(), tasks })); } catch {}
}

// ═════════════════════════════════════════════════════════════════════════════
export function AppProvider({ children }) {
  const userId = getUserId();

  // ── Local state (seeded from localStorage) ──
  const [profile,    setProfileRaw]    = useState(() => load(KEYS.profile, null));
  const [checkins,   setCheckinsRaw]   = useState(() => load(KEYS.checkins, []));
  const [coach,      setCoachRaw]      = useState(() => load(KEYS.coach, []));
  const [reviews,    setReviewsRaw]    = useState(() => load(KEYS.reviews, []));
  const [apiKey,     setApiKeyRaw]     = useState(() => load(KEYS.apiKey, ''));
  const [todayTasks, setTodayTasksRaw] = useState(() => loadTodayTasksLocal() || []);

  // Ref to track coach length for delta-insert
  const coachLenRef = useRef(coach.length);
  useEffect(() => { coachLenRef.current = coach.length; }, [coach]);

  // ── Load from Supabase on mount (overrides localStorage if fresher) ──
  useEffect(() => {
    async function hydrate() {
      // Profile
      const { data: pRow } = await fetchProfile(userId);
      if (pRow) {
        const p = {
          name: pRow.name,
          identity: Array.isArray(pRow.identity) ? pRow.identity : [],
          focus: pRow.focus,
          onboardingDone: pRow.onboarding_done,
          createdAt: pRow.created_at,
        };
        save(KEYS.profile, p); setProfileRaw(p);
      }

      // Checkins
      const { data: cRows } = await fetchCheckins(userId);
      if (cRows?.length) {
        const c = cRows.map(rowToCheckin);
        save(KEYS.checkins, c); setCheckinsRaw(c);
      }

      // Coach messages
      const { data: mRows } = await fetchCoachMessages(userId);
      if (mRows?.length) {
        const msgs = mRows.map(rowToCoachMsg);
        save(KEYS.coach, msgs); setCoachRaw(msgs);
        coachLenRef.current = msgs.length;
      }

      // Reviews
      const { data: rRows } = await fetchReviews(userId);
      if (rRows?.length) {
        const rv = rRows.map(rowToReview);
        save(KEYS.reviews, rv); setReviewsRaw(rv);
      }

      // Today's tasks
      const { data: tRow } = await fetchTodayTasks(userId, todayStr());
      if (tRow?.tasks?.length) {
        saveTodayTasksLocal(tRow.tasks); setTodayTasksRaw(tRow.tasks);
      }
    }
    hydrate().catch(() => {}); // silent fallback — localStorage already loaded
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Profile ──────────────────────────────────────────────────────────────────
  const setProfile = useCallback((v) => {
    const n = typeof v === 'function' ? v(profile) : v;
    save(KEYS.profile, n); setProfileRaw(n);
    syncProfile(userId, n).catch(() => {});
  }, [profile, userId]);

  // ── Checkins ─────────────────────────────────────────────────────────────────
  const setCheckins = useCallback((v) => {
    const n = typeof v === 'function' ? v(checkins) : v;
    save(KEYS.checkins, n); setCheckinsRaw(n);
  }, [checkins]);

  const todayKey     = new Date().toDateString();
  const todayCheckin = checkins.find(c => new Date(c.date).toDateString() === todayKey) || null;

  const upsertTodayCheckin = useCallback((patch) => {
    setCheckins(prev => {
      const existing = prev.find(c => new Date(c.date).toDateString() === todayKey);
      let updated;
      if (existing) {
        updated = prev.map(c => new Date(c.date).toDateString() === todayKey
          ? { ...c, ...patch } : c);
      } else {
        updated = [...prev, { date: new Date().toISOString(), ...patch }];
      }
      // Sync the modified checkin to Supabase
      const upserted = updated.find(c => new Date(c.date).toDateString() === todayKey);
      if (upserted) syncCheckin(userId, upserted).catch(() => {});
      return updated;
    });
  }, [todayKey, setCheckins, userId]);

  // ── Coach ─────────────────────────────────────────────────────────────────────
  const setCoach = useCallback((v) => {
    const n = typeof v === 'function' ? v(load(KEYS.coach, [])) : v;
    save(KEYS.coach, n); setCoachRaw(n);
  }, []);

  /** Append a single message — also inserts to Supabase */
  const appendCoachMsg = useCallback((msg) => {
    setCoachRaw(prev => {
      const next = [...prev, msg];
      save(KEYS.coach, next);
      return next;
    });
    insertCoachMessage(userId, msg).catch(() => {});
  }, [userId]);

  /** Clear all coach messages */
  const clearCoach = useCallback(() => {
    save(KEYS.coach, []); setCoachRaw([]);
    clearCoachMessages(userId).catch(() => {});
  }, [userId]);

  // ── Reviews ───────────────────────────────────────────────────────────────────
  const setReviews = useCallback((v) => {
    const n = typeof v === 'function' ? v(reviews) : v;
    save(KEYS.reviews, n); setReviewsRaw(n);
  }, [reviews]);

  /** Upsert a single review — also syncs to Supabase */
  const upsertReview = useCallback((review) => {
    setReviewsRaw(prev => {
      const next = [...prev.filter(r => r.weekOf !== review.weekOf), review];
      save(KEYS.reviews, next);
      return next;
    });
    syncReview(userId, review).catch(() => {});
  }, [userId]);

  // ── API key (localStorage only — never goes to Supabase) ──────────────────────
  const setApiKey = useCallback((v) => { save(KEYS.apiKey, v); setApiKeyRaw(v); }, []);

  // ── Today tasks ───────────────────────────────────────────────────────────────
  const setTodayTasks = useCallback((v) => {
    const n = typeof v === 'function' ? v(todayTasks) : v;
    saveTodayTasksLocal(n); setTodayTasksRaw(n);
    syncTasks(userId, todayStr(), n).catch(() => {});
  }, [todayTasks, userId]);

  // ── Computed values ───────────────────────────────────────────────────────────
  const todayCheckinObj    = todayCheckin;
  const morningDone        = !!todayCheckinObj?.morning;
  const eveningDone        = !!todayCheckinObj?.evening;

  const streak = (() => {
    let s = 0, d = new Date();
    while (true) {
      const key = d.toDateString();
      if (checkins.some(c => new Date(c.date).toDateString() === key)) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  const weekHistory = (() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return d.toDateString();
    });
    return checkins
      .filter(c => last7.includes(new Date(c.date).toDateString()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  })();

  // ── Reset ──────────────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem(TASKS_KEY);
    setProfileRaw(null); setCheckinsRaw([]); setCoachRaw([]);
    setReviewsRaw([]); setApiKeyRaw(''); setTodayTasksRaw([]);
  }, []);

  return (
    <AppContext.Provider value={{
      // State
      profile, setProfile,
      checkins, setCheckins, todayCheckin: todayCheckinObj, upsertTodayCheckin,
      coach,    setCoach,   appendCoachMsg, clearCoach,
      reviews,  setReviews, upsertReview,
      apiKey,   setApiKey,
      todayTasks, setTodayTasks,
      // Computed
      morningDone, eveningDone, streak, weekHistory,
      // Utils
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
