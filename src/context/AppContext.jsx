import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  getUserId,
  fetchProfile, syncProfile,
  fetchTodaySession, syncSession, fetchRecentSessions, rowToSession,
  fetchCoachMessages, insertCoachMessage, clearCoachMessages, rowToCoachMsg,
  fetchReviews, syncReview, rowToReview,
} from '../lib/db.js'

const AppContext = createContext(null)

// ── localStorage keys ─────────────────────────────────────────────────────────
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
  const userId = getUserId()

  const [profile,   setProfileRaw]   = useState(() => load(K.profile, null))
  const [sessions,  setSessionsRaw]  = useState(() => load(K.sessions, []))
  const [coach,     setCoachRaw]     = useState(() => load(K.coach, []))
  const [reviews,   setReviewsRaw]   = useState(() => load(K.reviews, []))
  const [apiKey,    setApiKeyRaw]    = useState(() => load(K.apiKey, ''))
  const [notifTimes, setNotifRaw]    = useState(() => load(K.notif, { morning: '08:00', evening: '21:00' }))

  // ── Hydrate from Supabase on mount ────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      // Profile
      const { data: pRow } = await fetchProfile(userId)
      if (pRow) {
        const p = {
          name: pRow.name,
          identity: Array.isArray(pRow.identity) ? pRow.identity : [],
          focus: pRow.focus,
          onboardingDone: pRow.onboarding_done,
          createdAt: pRow.created_at,
        }
        save(K.profile, p); setProfileRaw(p)
      }

      // Recent sessions
      const { data: sRows } = await fetchRecentSessions(userId, 20)
      if (sRows?.length) {
        const mapped = sRows.map(rowToSession)
        save(K.sessions, mapped); setSessionsRaw(mapped)
      }

      // Today's session (might be fresher than the list above)
      const { data: todayRow } = await fetchTodaySession(userId, todayStr())
      if (todayRow) {
        const ts = rowToSession(todayRow)
        setSessionsRaw(prev => {
          const updated = [ts, ...prev.filter(s => s.date !== ts.date)]
          save(K.sessions, updated)
          return updated
        })
      }

      // Coach
      const { data: mRows } = await fetchCoachMessages(userId)
      if (mRows?.length) {
        const msgs = mRows.map(rowToCoachMsg)
        save(K.coach, msgs); setCoachRaw(msgs)
      }

      // Reviews
      const { data: rRows } = await fetchReviews(userId)
      if (rRows?.length) {
        const rv = rRows.map(rowToReview)
        save(K.reviews, rv); setReviewsRaw(rv)
      }
    }
    hydrate().catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    syncProfile(userId, n).catch(() => {})
  }, [profile, userId])

  // ── Sessions ──────────────────────────────────────────────────────────────
  const updateTodaySession = useCallback((patch) => {
    setSessionsRaw(prev => {
      const today = todayStr()
      const existing = prev.find(s => s.date === today) || { date: today }
      const next = { ...existing, ...patch }
      const updated = [next, ...prev.filter(s => s.date !== today)]
      save(K.sessions, updated)
      syncSession(userId, next).catch(() => {})
      return updated
    })
  }, [userId])

  // ── Coach ─────────────────────────────────────────────────────────────────
  const appendCoachMsg = useCallback((msg) => {
    setCoachRaw(prev => {
      const next = [...prev, msg]
      save(K.coach, next)
      return next
    })
    insertCoachMessage(userId, msg).catch(() => {})
  }, [userId])

  const clearCoach = useCallback(() => {
    save(K.coach, []); setCoachRaw([])
    clearCoachMessages(userId).catch(() => {})
  }, [userId])

  // ── Reviews ───────────────────────────────────────────────────────────────
  const upsertReview = useCallback((review) => {
    setReviewsRaw(prev => {
      const next = [...prev.filter(r => r.weekOf !== review.weekOf), review]
      save(K.reviews, next)
      return next
    })
    syncReview(userId, review).catch(() => {})
  }, [userId])

  // ── Settings ──────────────────────────────────────────────────────────────
  const setApiKey = useCallback((v) => { save(K.apiKey, v); setApiKeyRaw(v) }, [])

  const setNotifTimes = useCallback((v) => {
    save(K.notif, v); setNotifRaw(v)
  }, [])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetAll = useCallback(() => {
    Object.values(K).forEach(k => localStorage.removeItem(k))
    setProfileRaw(null); setSessionsRaw([]); setCoachRaw([])
    setReviewsRaw([]); setApiKeyRaw(''); setNotifRaw({ morning: '08:00', evening: '21:00' })
  }, [])

  return (
    <AppContext.Provider value={{
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
