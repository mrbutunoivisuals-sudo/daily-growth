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
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(USER_ID_KEY, id) }
  return id
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles').select('*').eq('user_id', userId).maybeSingle()
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncProfile(userId, profile) {
  try {
    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      name: profile.name,
      identity: profile.identity,
      focus: profile.focus,
      onboarding_done: !!profile.onboardingDone,
    }, { onConflict: 'user_id' })
    return { error }
  } catch (e) { return { error: e } }
}

// ── Daily sessions (v4 — core table) ─────────────────────────────────────────
export async function fetchTodaySession(userId, dateStr) {
  try {
    const { data, error } = await supabase
      .from('daily_sessions').select('*')
      .eq('user_id', userId).eq('date', dateStr).maybeSingle()
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncSession(userId, session) {
  try {
    const { error } = await supabase.from('daily_sessions').upsert({
      user_id:             userId,
      date:                session.date,
      morning_mood:        session.morning_mood        ?? null,
      morning_focus:       session.morning_focus       ?? [],
      morning_custom:      session.morning_custom      ?? null,
      theme_key:           session.theme_key           ?? null,
      lesson_title:        session.lesson_title        ?? null,
      lesson_content:      session.lesson_content      ?? null,
      quiz:                session.quiz                ?? [],
      quiz_answers:        session.quiz_answers        ?? {},
      quiz_score:          session.quiz_score          ?? null,
      task_title:          session.task_title          ?? null,
      task_why:            session.task_why            ?? null,
      evening_applied:     session.evening_applied     ?? null,
      evening_reflection:  session.evening_reflection  ?? null,
      evening_feedback:    session.evening_feedback    ?? null,
      loop_completed:      !!session.loop_completed,
    }, { onConflict: 'user_id,date' })
    return { error }
  } catch (e) { return { error: e } }
}

export async function fetchRecentSessions(userId, limit = 14) {
  try {
    const { data, error } = await supabase
      .from('daily_sessions').select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export function rowToSession(row) {
  return {
    id:                  row.id,
    date:                row.date,
    morning_mood:        row.morning_mood,
    morning_focus:       Array.isArray(row.morning_focus) ? row.morning_focus : [],
    morning_custom:      row.morning_custom,
    theme_key:           row.theme_key,
    lesson_title:        row.lesson_title,
    lesson_content:      row.lesson_content,
    quiz:                Array.isArray(row.quiz) ? row.quiz : [],
    quiz_answers:        row.quiz_answers && typeof row.quiz_answers === 'object' ? row.quiz_answers : {},
    quiz_score:          row.quiz_score,
    task_title:          row.task_title,
    task_why:            row.task_why,
    evening_applied:     row.evening_applied,
    evening_reflection:  row.evening_reflection,
    evening_feedback:    row.evening_feedback,
    loop_completed:      !!row.loop_completed,
  }
}

// ── Coach messages ─────────────────────────────────────────────────────────────
export async function fetchCoachMessages(userId) {
  try {
    const { data, error } = await supabase
      .from('coach_messages').select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }).limit(100)
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function insertCoachMessage(userId, msg) {
  try {
    const { error } = await supabase.from('coach_messages').insert({
      user_id: userId, role: msg.role, content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
    })
    return { error }
  } catch (e) { return { error: e } }
}

export async function clearCoachMessages(userId) {
  try {
    const { error } = await supabase.from('coach_messages').delete().eq('user_id', userId)
    return { error }
  } catch (e) { return { error: e } }
}

export function rowToCoachMsg(row) {
  return { role: row.role, content: row.content, timestamp: row.timestamp || row.created_at }
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export async function fetchReviews(userId) {
  try {
    const { data, error } = await supabase
      .from('reviews').select('*').eq('user_id', userId)
      .order('week_of', { ascending: false })
    return { data, error }
  } catch (e) { return { data: null, error: e } }
}

export async function syncReview(userId, review) {
  try {
    const toDate = (iso) => iso ? new Date(iso).toISOString().split('T')[0] : null
    const { error } = await supabase.from('reviews').upsert({
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

export function rowToReview(row) {
  return {
    id:          row.id,
    weekOf:      row.week_of,
    generatedAt: row.created_at,
    title:       row.title        || '',
    wins:        row.wins         || [],
    lesson:      row.lesson       || '',
    score:       row.score        || 5,
    scoreReason: row.score_reason || '',
    nextFocus:   row.next_focus   || '',
  }
}
