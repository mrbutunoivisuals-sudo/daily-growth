import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import {
  fetchProfile, syncProfile,
  fetchTodaySession, syncSession, fetchRecentSessions, rowToSession,
  fetchCoachMessages, insertCoachMessage, clearCoachMessages, rowToCoachMsg,
  fetchReviews, syncReview, rowToReview,
} from '../lib/db.js'

const AppContext = createContext(null)

// ── localStorage keys (profile/sessions/etc. still cached locally for speed) ──
const K = {
  profile:  'dg_v4_profile',
  sessions: 'dg_v4_sessions',
  coach:    'dg_v4_coach',
  reviews:  'dg_v4_reviews',
  apiKey:   'dg_apiKey',
  notif:    'dg_v4_notif',
}

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // ── Auth state ────────────────────────────────────────────────────────────
  // authLoading = true until Supabase tells us whether a session exists.
  // This is the single source of truth for "is the user logged in?".
  const [session,     setSession]     = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // ── App data ──────────────────────────────────────────────────────────────
  const [profile,    setProfileRaw]  = useState(() => load(K.profile, null))
  const [sessions,   setSessionsRaw] = useState(() => load(K.sessions, []))
  const [coach,      setCoachRaw]    = useState(() => load(K.coach, []))
  const [reviews,    setReviewsRaw]  = useState(() => load(K.reviews, []))
  const [apiKey,     setApiKeyRaw]   = useState(() => load(K.apiKey, ''))
  const [notifTimes, setNotifRaw]    = useState(() => load(K.notif, { morning: '08:00', evening: '21:00' }))

  // ── Listen for Supabase auth changes ─────────────────────────────────────
  useEffect(() => {
    // getSession() resolves with the current persisted session (or null).
    // Works reliably in PWA and across Safari restarts because Supabase stores
    // the refresh token in localStorage under its own keys and refreshes it
    // automatically — we no longer manage our own user UUID.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (!s) setAuthLoading(false) // no session → nothing to hydrate
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) {
        // Logged out — clear local cache
        Object.values(K).forEach(k => localStorage.removeItem(k))
        setProfileRaw(null); setSessionsRaw([]); setCoachRaw([])
        setReviewsRaw([])
        setAuthLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Hydrate app data from Supabase when session is available ──────────────
  useEffect(() => {
    if (!session?.user?.id) return

    const userId = session.user.id

    async function hydrate() {
      // ── Profile ────────────────────────────────────────────────────────
      const { data: pRow, error: pErr } = await fetchProfile(userId)

      if (pErr) console.warn('[DG] fetchProfile error:', pErr)

      if (pRow) {
        const local = load(K.profile, null)
        const p = {
          name:      pRow.name     || local?.name     || '',
          identity:  Array.isArray(pRow.identity) && pRow.identity.length
                       ? pRow.identity : (local?.identity || []),
          focus:     pRow.focus    || local?.focus    || '',
          createdAt: pRow.created_at || local?.createdAt,
          // Never downgrade: if either source says done, it's done
          onboardingDone: !!pRow.onboarding_done || !!local?.onboardingDone,
        }
        save(K.profile, p)
        setProfileRaw(p)
      }

      // ── Sessions ───────────────────────────────────────────────────────
      const { data: sRows } = await fetchRecentSessions(userId, 20)
      if (sRows?.length) {
        const mapped = sRows.map(rowToSession)
        save(K.sessions, mapped); setSessionsRaw(mapped)
      }

      const { data: todayRow } = await fetchTodaySession(userId, todayStr())
      if (todayRow) {
        const ts = rowToSession(todayRow)
        setSessionsRaw(prev => {
          const updated = [ts, ...prev.filter(s => s.date !== ts.date)]
          save(K.sessions, updated)
          return updated
        })
      }

      // ── Coach ──────────────────────────────────────────────────────────
      const { data: mRows } = await fetchCoachMessages(userId)
      if (mRows?.length) {
        const msgs = mRows.map(rowToCoachMsg)
        save(K.coach, msgs); setCoachRaw(msgs)
      }

      // ── Reviews ────────────────────────────────────────────────────────
      const { data: rRows } = await fetchReviews(userId)
      if (rRows?.length) {
        const rv = rRows.map(rowToReview)
        save(K.reviews, rv); setReviewsRaw(rv)
      }
    }

    hydrate()
      .catch(e => console.warn('[DG] hydrate error:', e))
      .finally(() => setAuthLoading(false))
  }, [session?.user?.id])

  // ── Computed ──────────────────────────────────────────────────────────────
  const todaySession = sessions.find(s => s.date === todayStr()) || null

  const streak = (() => {
    let s = 0
    const d = new Date()
    while (true) {
      const key = d.toISOString().split('T')[0]
      if (sessions.some(sess => sess.date === key && sess.loop_completed)) {
        s++; d.setDate(d.getDate() - 1)
      } else break
    }
    return s
  })()

  const recentSessions = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)

  // ── Profile ───────────────────────────────────────────────────────────────
  const setProfile = useCallback((v) => {
    const n = typeof v === 'function' ? v(profile) : v
    save(K.profile, n); setProfileRaw(n)
    if (session?.user?.id) {
      syncProfile(session.user.id, n).catch(() => {})
    }
  }, [profile, session])

  // ── Sessions ──────────────────────────────────────────────────────────────
  const updateTodaySession = useCallback((patch) => {
    if (!session?.user?.id) return
    const userId = session.user.id
    setSessionsRaw(prev => {
      const today = todayStr()
      const existing = prev.find(s => s.date === today) || { date: today }
      const next = { ...existing, ...patch }
      const updated = [next, ...prev.filter(s => s.date !== today)]
      save(K.sessions, updated)
      syncSession(userId, next).catch(() => {})
      return updated
    })
  }, [session])

  // ── Coach ─────────────────────────────────────────────────────────────────
  const appendCoachMsg = useCallback((msg) => {
    setCoachRaw(prev => {
      const next = [...prev, msg]
      save(K.coach, next)
      return next
    })
    if (session?.user?.id) {
      insertCoachMessage(session.user.id, msg).catch(() => {})
    }
  }, [session])

  const clearCoach = useCallback(() => {
    save(K.coach, []); setCoachRaw([])
    if (session?.user?.id) {
      clearCoachMessages(session.user.id).catch(() => {})
    }
  }, [session])

  // ── Reviews ───────────────────────────────────────────────────────────────
  const upsertReview = useCallback((review) => {
    setReviewsRaw(prev => {
      const next = [...prev.filter(r => r.weekOf !== review.weekOf), review]
      save(K.reviews, next)
      return next
    })
    if (session?.user?.id) {
      syncReview(session.user.id, review).catch(() => {})
    }
  }, [session])

  // ── Settings ──────────────────────────────────────────────────────────────
  const setApiKey = useCallback((v) => { save(K.apiKey, v); setApiKeyRaw(v) }, [])
  const setNotifTimes = useCallback((v) => { save(K.notif, v); setNotifRaw(v) }, [])

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange fires → clears everything
  }, [])

  // ── Reset (wipe local data, keep auth) ────────────────────────────────────
  const resetAll = useCallback(() => {
    Object.values(K).forEach(k => localStorage.removeItem(k))
    setProfileRaw(null); setSessionsRaw([]); setCoachRaw([])
    setReviewsRaw([]); setApiKeyRaw(''); setNotifRaw({ morning: '08:00', evening: '21:00' })
  }, [])

  return (
    <AppContext.Provider value={{
      // auth
      session, authLoading, signOut,
      // app data
      profile, setProfile,
      sessions, todaySession, updateTodaySession, recentSessions,
      coach, appendCoachMsg, clearCoach,
      reviews, upsertReview,
      apiKey, setApiKey,
      notifTimes, setNotifTimes,
      streak,
      resetAll,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
