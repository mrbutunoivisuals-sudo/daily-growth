/**
 * db.js — Supabase CRUD layer
 * Every function returns { data, error } and never throws.
 * All failures are silent — caller falls back to localStorage.
 */
import { supabase } from './supabase.js'

// ── User identity ─────────────────────────────────────────────────────────────
const USER_ID_KEY = 'dg_user_id'

export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDate = (iso) => (iso ? new Date(iso).toISOString().split('T')[0] : null)

// ── Profile ───────────────────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncProfile(userId, profile) {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        name: profile.name,
        identity: profile.identity,
        focus: profile.focus,
        onboarding_done: !!profile.onboardingDone,
      }, { onConflict: 'user_id' })
    return { error }
  } catch (e) { return { error: e } }
}

// ── Checkins ──────────────────────────────────────────────────────────────────
export async function fetchCheckins(userId) {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncCheckin(userId, checkin) {
  try {
    const { error } = await supabase
      .from('checkins')
      .upsert({
        user_id:            userId,
        date:               toDate(checkin.date),
        morning_business:   checkin.morning?.business   || null,
        morning_balance:    checkin.morning?.balance    || null,
        morning_reflection: checkin.morningReflection   || null,
        evening_done:       checkin.evening?.done       || null,
        evening_learned:    checkin.evening?.learned    || null,
        evening_tomorrow:   checkin.evening?.tomorrow   || null,
        evening_reflection: checkin.eveningReflection   || null,
      }, { onConflict: 'user_id,date' })
    return { error }
  } catch (e) { return { error: e } }
}

// ── Daily tasks ───────────────────────────────────────────────────────────────
export async function fetchTodayTasks(userId, dateStr) {
  try {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .maybeSingle()
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncTasks(userId, dateStr, tasks) {
  try {
    const { error } = await supabase
      .from('daily_tasks')
      .upsert({ user_id: userId, date: dateStr, tasks }, { onConflict: 'user_id,date' })
    return { error }
  } catch (e) { return { error: e } }
}

// ── Coach messages ────────────────────────────────────────────────────────────
export async function fetchCoachMessages(userId) {
  try {
    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100)
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function insertCoachMessage(userId, msg) {
  try {
    const { error } = await supabase
      .from('coach_messages')
      .insert({
        user_id:   userId,
        role:      msg.role,
        content:   msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      })
    return { error }
  } catch (e) { return { error: e } }
}

export async function clearCoachMessages(userId) {
  try {
    const { error } = await supabase
      .from('coach_messages')
      .delete()
      .eq('user_id', userId)
    return { error }
  } catch (e) { return { error: e } }
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export async function fetchReviews(userId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('week_of', { ascending: false })
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncReview(userId, review) {
  try {
    const { error } = await supabase
      .from('reviews')
      .upsert({
        user_id:      userId,
        week_of:      toDate(review.weekOf),
        title:        review.title        || null,
        wins:         review.wins         || [],
        lesson:       review.lesson       || null,
        score:        review.score        || null,
        score_reason: review.scoreReason  || null,
        next_focus:   review.nextFocus    || null,
      }, { onConflict: 'user_id,week_of' })
    return { error }
  } catch (e) { return { error: e } }
}

// ── Map Supabase rows → app objects ───────────────────────────────────────────
export function rowToCheckin(row) {
  return {
    date: row.date,
    morning: (row.morning_business || row.morning_balance)
      ? { business: row.morning_business, balance: row.morning_balance }
      : undefined,
    morningReflection: row.morning_reflection || null,
    evening: (row.evening_done || row.evening_learned || row.evening_tomorrow)
      ? { done: row.evening_done, learned: row.evening_learned, tomorrow: row.evening_tomorrow }
      : undefined,
    eveningReflection: row.evening_reflection || null,
  }
}

export function rowToReview(row) {
  return {
    id:          row.id,
    weekOf:      row.week_of,
    generatedAt: row.created_at,
    title:       row.title       || '',
    wins:        row.wins        || [],
    lesson:      row.lesson      || '',
    score:       row.score       || 5,
    scoreReason: row.score_reason || '',
    nextFocus:   row.next_focus  || '',
  }
}

export function rowToCoachMsg(row) {
  return {
    role:      row.role,
    content:   row.content,
    timestamp: row.timestamp || row.created_at,
  }
}
