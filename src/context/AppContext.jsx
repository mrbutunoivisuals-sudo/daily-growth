import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const KEYS = {
  profile:    'dg_profile',
  habits:     'dg_habits',
  goals:      'dg_goals',
  checkins:   'dg_checkins',
  challenges: 'dg_challenges',
  coach:      'dg_coach',
  reviews:    'dg_reviews',
  streak:     'dg_streak',
  apiKey:     'dg_apiKey',
};

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }) {
  const [profile,    setProfileRaw]    = useState(() => load(KEYS.profile, null));
  const [habits,     setHabitsRaw]     = useState(() => load(KEYS.habits, []));
  const [goals,      setGoalsRaw]      = useState(() => load(KEYS.goals, []));
  const [checkins,   setCheckinsRaw]   = useState(() => load(KEYS.checkins, []));
  const [challenges, setChallengesRaw] = useState(() => load(KEYS.challenges, []));
  const [coach,      setCoachRaw]      = useState(() => load(KEYS.coach, []));
  const [reviews,    setReviewsRaw]    = useState(() => load(KEYS.reviews, []));
  const [streak,     setStreakRaw]     = useState(() => load(KEYS.streak, { current: 0, lastActive: null }));
  const [apiKey,     setApiKeyRaw]     = useState(() => load(KEYS.apiKey, ''));

  // Persist every change
  const setProfile    = useCallback(v => { const n = typeof v === 'function' ? v(profile) : v;    save(KEYS.profile, n);    setProfileRaw(n); }, [profile]);
  const setHabits     = useCallback(v => { const n = typeof v === 'function' ? v(habits) : v;     save(KEYS.habits, n);     setHabitsRaw(n); }, [habits]);
  const setGoals      = useCallback(v => { const n = typeof v === 'function' ? v(goals) : v;      save(KEYS.goals, n);      setGoalsRaw(n); }, [goals]);
  const setCheckins   = useCallback(v => { const n = typeof v === 'function' ? v(checkins) : v;   save(KEYS.checkins, n);   setCheckinsRaw(n); }, [checkins]);
  const setChallenges = useCallback(v => { const n = typeof v === 'function' ? v(challenges) : v; save(KEYS.challenges, n); setChallengesRaw(n); }, [challenges]);
  const setCoach      = useCallback(v => { const n = typeof v === 'function' ? v(coach) : v;      save(KEYS.coach, n);      setCoachRaw(n); }, [coach]);
  const setReviews    = useCallback(v => { const n = typeof v === 'function' ? v(reviews) : v;    save(KEYS.reviews, n);    setReviewsRaw(n); }, [reviews]);
  const setApiKey     = useCallback(v => { save(KEYS.apiKey, v); setApiKeyRaw(v); }, []);

  // Streak logic
  const touchStreak = useCallback(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    setStreakRaw(prev => {
      if (prev.lastActive === today) return prev;
      const next = {
        current: prev.lastActive === yesterday ? prev.current + 1 : 1,
        lastActive: today,
      };
      save(KEYS.streak, next);
      return next;
    });
  }, []);

  // Computed: today's check-ins
  const todayStr = new Date().toDateString();
  const todayCheckins = checkins.filter(c => new Date(c.date).toDateString() === todayStr);
  const morningDone = todayCheckins.some(c => c.type === 'morning');
  const eveningDone = todayCheckins.some(c => c.type === 'evening');

  // Computed: today's habits completed
  const habitsCompletedToday = habits.filter(h =>
    (h.completions || []).some(d => new Date(d).toDateString() === todayStr)
  ).length;

  // Computed: life score from real data
  const lifeScore = computeLifeScore({ habits, goals, checkins, challenges, profile });

  // Export all data
  const exportData = () => {
    const data = {};
    Object.entries(KEYS).forEach(([k, key]) => {
      data[k] = load(key, null);
    });
    return data;
  };

  // Reset everything
  const resetAll = () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    setProfileRaw(null); setHabitsRaw([]); setGoalsRaw([]);
    setCheckinsRaw([]); setChallengesRaw([]); setCoachRaw([]);
    setReviewsRaw([]); setStreakRaw({ current: 0, lastActive: null }); setApiKeyRaw('');
  };

  return (
    <AppContext.Provider value={{
      profile, setProfile,
      habits, setHabits,
      goals, setGoals,
      checkins, setCheckins,
      challenges, setChallenges,
      coach, setCoach,
      reviews, setReviews,
      streak, touchStreak,
      apiKey, setApiKey,
      morningDone, eveningDone,
      habitsCompletedToday,
      lifeScore,
      exportData, resetAll,
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

function computeLifeScore({ habits, goals, checkins, challenges, profile }) {
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - i); return d.toDateString();
  });

  // Habits consistency (last 7 days)
  const habitScore = habits.length === 0 ? 50 : Math.min(100, Math.round(
    habits.reduce((acc, h) => {
      const recent = (h.completions || []).filter(d => last7.includes(new Date(d).toDateString())).length;
      return acc + (recent / 7) * 100;
    }, 0) / habits.length
  ));

  // Goals progress
  const activeGoals = goals.filter(g => g.status !== 'done');
  const goalScore = activeGoals.length === 0 ? 50 : Math.min(100, Math.round(
    activeGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / activeGoals.length
  ));

  // Check-in consistency
  const checkinDays = new Set(checkins.map(c => new Date(c.date).toDateString()));
  const checkinScore = Math.min(100, Math.round((checkinDays.size / Math.max(1, 30)) * 100 * 3));

  // Challenges
  const recentChallenges = challenges.filter(c => last7.includes(new Date(c.date).toDateString()));
  const challengeScore = recentChallenges.length === 0 ? 40
    : Math.round((recentChallenges.filter(c => c.completed).length / recentChallenges.length) * 100);

  // Assessment scores from profile
  const assessmentScores = profile?.assessmentScores || {};
  const assessmentAvg = Object.values(assessmentScores).length > 0
    ? Math.round(Object.values(assessmentScores).reduce((a, b) => a + b, 0) / Object.values(assessmentScores).length)
    : 50;

  return {
    overall: Math.round((habitScore + goalScore + checkinScore + challengeScore + assessmentAvg) / 5),
    habits: habitScore,
    goals: goalScore,
    checkins: checkinScore,
    challenges: challengeScore,
    mindset: assessmentScores.mindset || 50,
    health: assessmentScores.health || 50,
    career: assessmentScores.career || 50,
    finance: assessmentScores.finance || 50,
    relations: assessmentScores.relations || 50,
    purpose: assessmentScores.purpose || 50,
  };
}
