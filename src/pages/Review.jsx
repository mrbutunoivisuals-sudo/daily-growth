import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useAI } from '../hooks/useAI.js'
import { motion, AnimatePresence } from 'framer-motion'

function getWeekOf(dateStr) {
  const d = new Date(dateStr || new Date())
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1) // Monday
  return d.toISOString().split('T')[0]
}

function buildReviewPrompt(profile, sessions) {
  const name = profile?.name || 'utilizatorul'
  const focus = profile?.focus || ''
  const identity = (profile?.identity || []).join(', ')

  const sessCtx = sessions.map(s => {
    const parts = []
    if (s.lesson_title) parts.push(`Lecție: "${s.lesson_title}"`)
    if (s.quiz_score != null) parts.push(`Quiz: ${s.quiz_score}%`)
    if (s.task_title) parts.push(`Task: "${s.task_title}"`)
    if (s.evening_applied) parts.push(`Aplicat: ${s.evening_applied}`)
    if (s.evening_reflection) parts.push(`Reflecție: "${s.evening_reflection}"`)
    return `[${s.date}] ${parts.join(' | ')}`
  }).join('\n')

  const completedCount = sessions.filter(s => s.loop_completed).length
  const avgScore = sessions.filter(s => s.quiz_score != null).length
    ? Math.round(sessions.filter(s => s.quiz_score != null).reduce((a, s) => a + s.quiz_score, 0) / sessions.filter(s => s.quiz_score != null).length)
    : null

  return `Ești coach personal pentru ${name}. Focus: ${focus}. Identitate vizată: ${identity}.

Datele săptămânii:
${sessCtx || 'Nicio sesiune completată'}
Zile complete: ${completedCount}/7${avgScore != null ? ` | Scor mediu quiz: ${avgScore}%` : ''}

Generează un review săptămânal structurat în română, cu tonul unui mentor cald și direct.
Format JSON exact:
{
  "titlu": "titlu inspirațional scurt pentru săptămână",
  "rezumat": "2-3 propoziții despre ce a fost săptămâna aceasta — pattern-uri, energie, progres",
  "victorii": ["victorie 1", "victorie 2"],
  "provocari": ["provocare sau pattern de îmbunătățit"],
  "insight": "cel mai important lucru de reținut din această săptămână (1-2 propoziții)",
  "provocare_saptamana_viitoare": "o provocare concretă și specifică pentru săptămâna viitoare"
}`
}

function ScoreBar({ label, value, max = 100, color = 'var(--accent)' }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function Review() {
  const { profile, sessions, reviews, upsertReview, apiKey } = useApp()
  const { callAIJSON } = useAI()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const weekOf = getWeekOf()
  const existingReview = reviews.find(r => r.weekOf === weekOf)

  // Sessions from this week (Mon-Sun)
  const weekStart = new Date(weekOf)
  const weekEnd = new Date(weekOf)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d >= weekStart && d <= weekEnd
  })

  // Past reviews sorted
  const pastReviews = [...reviews]
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
    .slice(0, 8)

  const generateReview = async () => {
    if (!apiKey) { setError('Configurează cheia API în Setări.'); return }
    setError('')
    setLoading(true)
    try {
      const prompt = buildReviewPrompt(profile, weekSessions)
      const data = await callAIJSON(prompt, { fast: false, max_tokens: 800 })
      const review = {
        weekOf,
        ...data,
        generatedAt: new Date().toISOString(),
        sessionCount: weekSessions.length,
        completedCount: weekSessions.filter(s => s.loop_completed).length,
      }
      upsertReview(review)
    } catch {
      setError('Eroare la generare. Încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }

  const review = existingReview

  return (
    <div className="page">
      <div className="page-inner">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p className="label-sm">Review Săptămânal</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.4px' }}>
            {review ? review.titlu || 'Săptămâna ta' : 'Reflecție de sfârșit de săptămână'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            Săptămâna {weekOf} · {weekSessions.filter(s => s.loop_completed).length}/{weekSessions.length} zile complete
          </p>
        </div>

        {/* Stats row */}
        {weekSessions.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Zile', value: weekSessions.filter(s => s.loop_completed).length + '/7' },
              {
                label: 'Quiz avg',
                value: weekSessions.filter(s => s.quiz_score != null).length
                  ? Math.round(weekSessions.filter(s => s.quiz_score != null).reduce((a, s) => a + s.quiz_score, 0) / weekSessions.filter(s => s.quiz_score != null).length) + '%'
                  : '—'
              },
              {
                label: 'Aplicat',
                value: weekSessions.filter(s => s.evening_applied === 'Da').length + '/' + weekSessions.filter(s => s.evening_applied).length || '—'
              },
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Generate / Regenerate */}
        {!review ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
              {weekSessions.length === 0
                ? 'Completează cel puțin o sesiune această săptămână pentru a genera review-ul.'
                : 'Generează review-ul săptămânii cu Claude Sonnet.'}
            </p>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <motion.button
              className="btn btn-primary"
              onClick={generateReview}
              disabled={loading || weekSessions.length === 0}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? 'Se generează...' : '✨ Generează review'}
            </motion.button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Rezumat */}
              <div className="card" style={{ marginBottom: 12, padding: '18px 20px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>{review.rezumat}</p>
              </div>

              {/* Victorii */}
              {review.victorii?.length > 0 && (
                <div className="card" style={{ marginBottom: 12, padding: '18px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Victorii</p>
                  {review.victorii.map((v, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: 'var(--green)', marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Provocări */}
              {review.provocari?.length > 0 && (
                <div className="card" style={{ marginBottom: 12, padding: '18px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>De îmbunătățit</p>
                  {review.provocari.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: 'var(--amber)', marginTop: 1 }}>→</span>
                      <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Insight */}
              {review.insight && (
                <div className="card" style={{
                  marginBottom: 12, padding: '18px 20px',
                  background: 'var(--accent-light)', border: '1.5px solid rgba(124,111,247,0.15)',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Insight cheie</p>
                  <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>"{review.insight}"</p>
                </div>
              )}

              {/* Provocare săptămâna viitoare */}
              {review.provocare_saptamana_viitoare && (
                <div className="card" style={{ marginBottom: 20, padding: '18px 20px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Provocarea săptămânii viitoare</p>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{review.provocare_saptamana_viitoare}</p>
                </div>
              )}

              {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 8 }}>{error}</p>}
              <motion.button className="btn btn-secondary btn-full" onClick={generateReview} disabled={loading} whileTap={{ scale: 0.97 }}>
                {loading ? 'Se regenerează...' : '↺ Regenerează'}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Past reviews */}
        {pastReviews.filter(r => r.weekOf !== weekOf).length > 0 && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Review-uri anterioare
            </p>
            {pastReviews.filter(r => r.weekOf !== weekOf).map(r => (
              <div key={r.weekOf} className="card" style={{ marginBottom: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.titlu || r.weekOf}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{r.completedCount}/{r.sessionCount || 7}</span>
                </div>
                {r.insight && <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>"{r.insight}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
