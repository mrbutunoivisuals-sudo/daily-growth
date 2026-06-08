import { useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useApp, todayStr } from '../context/AppContext.jsx'
import { useAI } from '../hooks/useAI.js'
import { getRelevantThemes, formatThemesForPrompt, getTheme, PILLARS } from '../lib/themes.js'

// ── Animation variants ────────────────────────────────────────────────────────
const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
}
const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

// ── Derive initial UI step from saved session ─────────────────────────────────
function deriveInitialStep(session, hours) {
  if (!session?.morning_mood || !session?.lesson_content) return 'morning'
  if (session.quiz_score == null) return 'lesson'
  if (session.loop_completed) return 'done'
  if (hours >= 17 && !session.evening_reflection) return 'evening'
  return 'wait'
}

// ── Greeting ──────────────────────────────────────────────────────────────────
function getGreeting(name) {
  const h = new Date().getHours()
  if (h < 12) return `Bună dimineața, ${name} 🌅`
  if (h < 17) return `Bună ziua, ${name} ☀️`
  return `Bună seara, ${name} 🌙`
}

// ── Streak ring ───────────────────────────────────────────────────────────────
function StreakRing({ count }) {
  const r = 38, circ = 2 * Math.PI * r
  const pct = Math.min(count / 7, 1)
  return (
    <div style={{ position: 'relative', width: 90, height: 90 }}>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx={45} cy={45} r={r} fill="none" stroke="var(--accent-light)" strokeWidth={6} />
        <motion.circle
          cx={45} cy={45} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform="rotate(-90 45 45)"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.span
          key={count}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}
        >
          {count}
        </motion.span>
        <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 500, marginTop: 2 }}>zile</span>
      </div>
    </div>
  )
}

// ── STEP 1: Morning check-in ──────────────────────────────────────────────────
const MOODS = [
  { emoji: '😊', label: 'Bine' },
  { emoji: '😴', label: 'Obosit' },
  { emoji: '😤', label: 'Stresat' },
  { emoji: '⚡', label: 'Energizat' },
  { emoji: '😐', label: 'Neutru' },
]
const FOCUSES = [
  { emoji: '🧒', label: 'Tată' },
  { emoji: '💑', label: 'Soț' },
  { emoji: '🚀', label: 'Antreprenor' },
  { emoji: '⚙️', label: 'Disciplină' },
  { emoji: '✝️', label: 'Credință' },
]

function MorningCheckin({ onSubmit }) {
  const [mood, setMood]     = useState('')
  const [focus, setFocus]   = useState([])
  const [custom, setCustom] = useState('')

  const toggleFocus = (label) =>
    setFocus(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label])

  const canSubmit = mood && focus.length > 0

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
        <p className="label-sm" style={{ marginBottom: 6 }}>Check-in dimineață</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
          Cum te simți azi?
        </h2>
      </motion.div>

      <motion.div variants={staggerItem} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {MOODS.map(({ emoji, label }) => (
            <button
              key={label}
              className={`mood-pill ${mood === label ? 'active' : ''}`}
              onClick={() => setMood(label)}
            >
              <span className="emoji">{emoji}</span>
              <span className="lbl">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          Unde vrei să lucrezi azi? <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(alege cel puțin unul)</span>
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FOCUSES.map(({ emoji, label }) => (
            <button
              key={label}
              className={`chip ${focus.includes(label) ? 'active' : ''}`}
              onClick={() => toggleFocus(label)}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>
          Ceva specific la ce vrei să lucrezi? <span style={{ color: 'var(--text-3)' }}>(opțional)</span>
        </p>
        <textarea
          className="input"
          rows={2}
          placeholder="ex: am o discuție importantă azi și nu știu cum să o abordez..."
          value={custom}
          onChange={e => setCustom(e.target.value)}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <motion.button
          className="btn btn-primary btn-full"
          disabled={!canSubmit}
          onClick={() => onSubmit({ morning_mood: mood, morning_focus: focus, morning_custom: custom.trim() })}
          whileTap={{ scale: 0.97 }}
          style={{ fontSize: 18 }}
        >
          Pornește ziua →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── STEP: Generating ──────────────────────────────────────────────────────────
function GeneratingScreen() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 48, marginBottom: 20 }}
      >
        ✨
      </motion.div>
      <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Coach-ul analizează check-in-ul tău</p>
      <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Pregătesc lecția, quizul și task-ul de azi...</p>
    </div>
  )
}

// ── STEP 2: Lesson ────────────────────────────────────────────────────────────
function LessonCard({ session, onContinue }) {
  const theme = getTheme(session.theme_key)
  const pillar = theme ? PILLARS[theme.pillar] : null

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Pillar badge */}
      {pillar && (
        <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--accent-light)', color: 'var(--accent)',
            padding: '5px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
          }}>
            {pillar.emoji} {pillar.label}
          </span>
        </motion.div>
      )}

      {/* Breathing lesson card */}
      <motion.div
        variants={staggerItem}
        animate={{ scale: [1, 1.012, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        className="card"
        style={{ padding: '28px 24px', marginBottom: 16 }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 18, letterSpacing: '-0.3px', lineHeight: 1.25 }}>
          {session.lesson_title}
        </h2>
        <div className="lesson-body">
          {session.lesson_content?.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} style={{ marginBottom: 12 }}>{para}</p>
          ))}
        </div>
      </motion.div>

      {/* Quiz progress */}
      <motion.div variants={staggerItem} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Urmează: Quiz</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{session.quiz?.length || 3} întrebări</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: '33%' }} />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <motion.button className="btn btn-primary btn-full" onClick={onContinue} whileTap={{ scale: 0.97 }} style={{ fontSize: 17 }}>
          Continuă cu quizul →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── STEP 3: Quiz ──────────────────────────────────────────────────────────────
function QuizFlow({ session, onComplete }) {
  const quiz = session.quiz || []
  const maxScore = quiz.filter(q => q.correct !== -1).length

  const [qIndex, setQIndex]       = useState(0)
  const [selected, setSelected]   = useState(null)
  const [answered, setAnswered]   = useState(false)
  const [answers, setAnswers]     = useState({})

  const question = quiz[qIndex]
  const isReflection = question?.correct === -1

  const handleSelect = (i) => {
    if (answered) return
    setSelected(i)
  }

  const handleCheck = () => {
    if (selected === null) return
    setAnswered(true)
    setAnswers(prev => ({ ...prev, [qIndex]: selected }))
  }

  const handleNext = () => {
    if (qIndex < quiz.length - 1) {
      setQIndex(q => q + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      // Calculate score
      const finalAnswers = { ...answers, [qIndex]: selected }
      const score = quiz.reduce((acc, q, i) => {
        if (q.correct === -1) return acc
        return acc + (finalAnswers[i] === q.correct ? 1 : 0)
      }, 0)
      onComplete(finalAnswers, score)
    }
  }

  if (!question) return null

  const isCorrect = selected === question.correct
  const isLast = qIndex === quiz.length - 1

  return (
    <AnimatePresence mode="wait">
      <motion.div key={qIndex} {...stepVariants}>
        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span className="label-sm">{qIndex + 1} din {quiz.length}</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {quiz.map((_, i) => (
              <div key={i} style={{
                width: i <= qIndex ? 20 : 6, height: 6, borderRadius: 3,
                background: i < qIndex ? 'var(--green)' : i === qIndex ? 'var(--accent)' : 'var(--accent-light)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="card" style={{ padding: '22px 20px', marginBottom: 16 }}>
          {isReflection && (
            <span style={{
              display: 'inline-block', background: 'var(--accent-light)', color: 'var(--accent)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 100, marginBottom: 12,
            }}>
              Reflecție
            </span>
          )}
          <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {question.options?.map((opt, i) => {
            let cls = 'quiz-opt'
            if (answered) {
              if (!isReflection) {
                if (i === question.correct) cls += ' correct'
                else if (i === selected && i !== question.correct) cls += ' wrong'
              } else {
                if (i === selected) cls += ' correct'
              }
            } else if (i === selected) {
              cls += ' selected'
            }
            return (
              <motion.button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={answered}
                whileTap={!answered ? { scale: 0.98 } : {}}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: 6, border: '1.5px solid currentColor',
                  fontSize: 11, fontWeight: 700, marginRight: 10, flexShrink: 0,
                  opacity: 0.5,
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </motion.button>
            )
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: isReflection ? 'var(--accent-light)' : isCorrect ? 'var(--green-light)' : '#FFF5F5',
                borderRadius: 16, padding: '16px 18px', marginBottom: 20,
                borderLeft: `3px solid ${isReflection ? 'var(--accent)' : isCorrect ? 'var(--green)' : 'var(--red)'}`,
              }}
            >
              <p style={{
                fontSize: 13, fontWeight: 700, marginBottom: 4,
                color: isReflection ? 'var(--accent)' : isCorrect ? '#065F46' : '#991B1B',
              }}>
                {isReflection ? '💭 Reflecție' : isCorrect ? '✓ Corect!' : '✗ Aproape'}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.55 }}>
                {question.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!answered ? (
          <motion.button
            className="btn btn-primary btn-full"
            disabled={selected === null}
            onClick={handleCheck}
            whileTap={{ scale: 0.97 }}
          >
            Verifică răspunsul
          </motion.button>
        ) : (
          <motion.button
            className="btn btn-primary btn-full"
            onClick={handleNext}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isLast ? 'Vezi rezultatele →' : 'Continuă →'}
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ── STEP: Quiz results + Task ─────────────────────────────────────────────────
function TaskCard({ session, onConfirm }) {
  const quiz = session.quiz || []
  const maxScore = quiz.filter(q => q.correct !== -1).length
  const score = session.quiz_score ?? 0
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 100

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Score */}
      <motion.div variants={staggerItem} className="card" style={{ padding: '24px 22px', marginBottom: 14, textAlign: 'center' }}>
        <p className="label-sm" style={{ marginBottom: 12 }}>Scor quiz</p>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle cx={40} cy={40} r={32} fill="none" stroke="var(--accent-light)" strokeWidth={6} />
            <motion.circle
              cx={40} cy={40} r={32} fill="none"
              stroke={pct >= 66 ? 'var(--green)' : pct >= 33 ? 'var(--accent)' : 'var(--amber)'}
              strokeWidth={6} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 32}
              initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - pct / 100) }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{score}/{maxScore}</span>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-2)' }}>
          {pct === 100 ? 'Excelent! Ai înțeles lecția.' : pct >= 66 ? 'Bine! Ești pe drumul cel bun.' : 'Poți reveni la lecție oricând.'}
        </p>
      </motion.div>

      {/* Task */}
      <motion.div variants={staggerItem} className="card" style={{ padding: '24px 22px', marginBottom: 24 }}>
        <span style={{
          display: 'inline-block', background: 'var(--accent-light)', color: 'var(--accent)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
          padding: '4px 12px', borderRadius: 100, marginBottom: 14,
        }}>
          📌 Task-ul tău de azi
        </span>
        <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.35 }}>
          {session.task_title}
        </h3>
        {session.task_why && (
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            {session.task_why}
          </p>
        )}
      </motion.div>

      <motion.div variants={staggerItem}>
        <motion.button
          className="btn btn-success btn-full"
          onClick={onConfirm}
          whileTap={{ scale: 0.97 }}
          style={{ fontSize: 17 }}
        >
          ✓ Am înțeles, îl fac azi!
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── STEP: Midday wait ─────────────────────────────────────────────────────────
function MidDayWait({ session, profile, streak, onStartEvening }) {
  const hours = new Date().getHours()
  const eveningTime = hours < 17

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      {/* Streak */}
      <motion.div variants={staggerItem} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <StreakRing count={streak} />
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
            {streak > 0 ? `${streak} ${streak === 1 ? 'zi' : 'zile'} consecutiv${streak === 1 ? 'ă' : 'e'}!` : 'Bucla de azi în curs'}
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 3 }}>
            {streak === 0 ? 'Completează bucla seara' : 'Continuă secvența!'}
          </p>
        </div>
      </motion.div>

      {/* Today task reminder */}
      <motion.div variants={staggerItem} className="card" style={{ padding: '20px 22px', marginBottom: 14 }}>
        <p className="label-sm" style={{ marginBottom: 10 }}>Task de azi</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
          {session.task_title}
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div variants={staggerItem} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {eveningTime ? (
          <div style={{ background: 'var(--accent-light)', borderRadius: 16, padding: '14px 18px' }}>
            <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500, textAlign: 'center' }}>
              🌙 Revino la ora 17:00 pentru check-in-ul de seară
            </p>
          </div>
        ) : (
          <motion.button
            className="btn btn-primary btn-full"
            onClick={onStartEvening}
            whileTap={{ scale: 0.97 }}
          >
            Închide ziua → Check-in seară
          </motion.button>
        )}

        <Link to="/coach" style={{ textDecoration: 'none' }}>
          <motion.button className="btn btn-secondary btn-full" whileTap={{ scale: 0.97 }}>
            💬 Deschide Coach-ul
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  )
}

// ── STEP 5: Evening check-in ──────────────────────────────────────────────────
const APPLIED_OPTIONS = [
  { value: 'Da', emoji: '✅', label: 'Da, l-am aplicat!' },
  { value: 'Parțial', emoji: '🔶', label: 'Parțial' },
  { value: 'Nu', emoji: '❌', label: 'Nu am reușit' },
]

function EveningCheckin({ session, onSubmit, loading }) {
  const [applied, setApplied]     = useState('')
  const [reflection, setReflection] = useState('')
  const canSubmit = applied && reflection.trim().length > 10

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
        <p className="label-sm" style={{ marginBottom: 6 }}>Check-in seară</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 6 }}>
          Cum a decurs ziua?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Task de azi: <em>{session.task_title}</em></p>
      </motion.div>

      <motion.div variants={staggerItem} style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Ai reușit să aplici task-ul?</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {APPLIED_OPTIONS.map(({ value, emoji, label }) => (
            <button
              key={value}
              className={`chip ${applied === value ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', flexDirection: 'column', gap: 2, padding: '12px 8px', borderRadius: 16, fontSize: 13 }}
              onClick={() => setApplied(value)}
            >
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Spune-mi cum a mers...</p>
        <textarea
          className="input"
          rows={4}
          placeholder="Ce s-a întâmplat? Ce ai observat în tine? O lecție din ziua de azi..."
          value={reflection}
          onChange={e => setReflection(e.target.value)}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <motion.button
          className="btn btn-primary btn-full"
          disabled={!canSubmit || loading}
          onClick={() => onSubmit({ evening_applied: applied, evening_reflection: reflection.trim() })}
          whileTap={{ scale: 0.97 }}
          style={{ fontSize: 17 }}
        >
          {loading ? '✨ Se procesează...' : 'Completează ziua →'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ── STEP: Loop done ───────────────────────────────────────────────────────────
function LoopDone({ session, profile, streak }) {
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" style={{ textAlign: 'center', paddingTop: 16 }}>
      {/* Animated check */}
      <motion.div
        variants={staggerItem}
        style={{ marginBottom: 28 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--green)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(16,185,129,0.35)',
          }}
        >
          <motion.svg
            width={36} height={36} viewBox="0 0 36 36" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          >
            <motion.path
              d="M8 18L15 25L28 12"
              stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.svg>
        </motion.div>
        <motion.h2
          variants={staggerItem}
          style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}
        >
          Buclă completă! 🎉
        </motion.h2>
        <motion.p variants={staggerItem} style={{ fontSize: 15, color: 'var(--text-2)' }}>
          {profile?.identity?.[0] ? `Azi ai ales să fii ${profile.identity[0]}.` : 'Bine lucrat azi!'}
        </motion.p>
      </motion.div>

      {/* Streak */}
      <motion.div variants={staggerItem} style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <StreakRing count={streak} />
      </motion.div>

      {/* Evening feedback */}
      {session.evening_feedback && (
        <motion.div
          variants={staggerItem}
          className="card"
          style={{ padding: '20px 22px', marginBottom: 24, textAlign: 'left' }}
        >
          <p className="label-sm" style={{ marginBottom: 8 }}>Coach-ul tău</p>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.65, fontStyle: 'italic' }}>
            {session.evening_feedback}
          </p>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div variants={staggerItem} style={{ display: 'flex', gap: 10 }}>
        <Link to="/coach" style={{ flex: 1, textDecoration: 'none' }}>
          <motion.button className="btn btn-secondary btn-full" whileTap={{ scale: 0.97 }}>
            💬 Coach
          </motion.button>
        </Link>
        <Link to="/review" style={{ flex: 1, textDecoration: 'none' }}>
          <motion.button className="btn btn-secondary btn-full" whileTap={{ scale: 0.97 }}>
            📖 Review
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  )
}

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildGenerationPrompt(profile, morningData, recentSessions) {
  const themes = getRelevantThemes(morningData.morning_focus)
  const themeList = formatThemesForPrompt(themes)

  const recentContext = recentSessions.length
    ? 'LECȚIILE RECENTE (NU repeta aceste teme):\n' +
      recentSessions.slice(0, 5).filter(s => s.theme_key).map(s =>
        `- ${s.date}: ${s.lesson_title || s.theme_key} (scor ${s.quiz_score ?? '—'}/3)`
      ).join('\n')
    : 'Prima sesiune — nicio lecție anterioară.'

  return `Ești coach-ul personal al lui ${profile?.name || 'Marius'} — antreprenor video/media, soț, tată a doi copii, creștin, fan Jim Rohn.

CHECK-IN DIMINEAȚĂ:
- Dispoziție: ${morningData.morning_mood}
- Focus azi: ${morningData.morning_focus?.join(', ')}${morningData.morning_custom ? `\n- Specific: ${morningData.morning_custom}` : ''}

${recentContext}

BAZA DE TEME (alege CE ESTE CEL MAI RELEVANT pentru focusul de azi):
${themeList}

Generează sesiunea zilnică în JSON strict:
{
  "theme_key": "cheia temei alese din lista de mai sus",
  "lesson_title": "Titlu scurt și puternic (4-6 cuvinte)",
  "lesson_content": "200 cuvinte max. Ton Jim Rohn: direct, practic, fără clișee. Exemple concrete din viața reală. Paragrafe scurte separate cu newline.",
  "quiz": [
    {"question": "Întrebare despre conținut", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Explicație scurtă (1-2 propoziții)"},
    {"question": "Întrebare mai profundă", "options": ["A", "B", "C", "D"], "correct": 2, "explanation": "..."},
    {"question": "Reflecție: întrebare personală", "options": ["Opțiune A", "Opțiune B", "Opțiune C", "Opțiune D"], "correct": -1, "explanation": "Nu există greșit. Important e să alegi conștient."}
  ],
  "task_title": "UN SINGUR lucru de făcut AZI — verb, specific, sub 30 min",
  "task_why": "De ce contează direct pentru ${profile?.name || 'Marius'} (2 propoziții directe, fără laudă)"
}

Răspunde EXCLUSIV cu JSON valid. Fără markdown, fără text în afara JSON.`
}

function buildEveningPrompt(profile, session) {
  return `Coach-ul lui ${profile?.name || 'Marius'}.
Lecția de azi: "${session.lesson_title}".
Task: "${session.task_title}".
A aplicat: "${session.evening_applied}".
Reflecție: "${session.evening_reflection}".

Scrie 2-3 propoziții de închidere a zilei: validează ce a făcut, conectează cu identitatea sa (${profile?.identity?.join(', ') || 'persoana care crește'}), lasă o gândire pentru mâine.
Direct, ton Jim Rohn, fără laudă exagerată. Fără markdown.`
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Today() {
  const { profile, todaySession, updateTodaySession, recentSessions, streak, apiKey } = useApp()
  const { callAIJSON, callAI, loading } = useAI()

  const hours = new Date().getHours()
  const [uiStep, setUiStep] = useState(() => deriveInitialStep(todaySession, hours))
  const [genError, setGenError] = useState('')
  const lastMorningData = useRef(null)

  // ── Morning submit → generate session ────────────────────────────────────
  const handleMorning = useCallback(async (morningData) => {
    lastMorningData.current = morningData
    setGenError('')
    updateTodaySession(morningData)   // save check-in immediately
    setUiStep('generating')

    try {
      const prompt = buildGenerationPrompt(profile, morningData, recentSessions)
      const data = await callAIJSON(prompt, { fast: false, max_tokens: 1500 })

      if (data?.lesson_title && data?.lesson_content) {
        updateTodaySession({
          ...morningData,
          theme_key:      data.theme_key      || '',
          lesson_title:   data.lesson_title   || '',
          lesson_content: data.lesson_content || '',
          quiz:           Array.isArray(data.quiz) ? data.quiz : [],
          task_title:     data.task_title     || '',
          task_why:       data.task_why       || '',
        })
        setUiStep('lesson')
      } else {
        // Bad/null response — stay on generating screen but show error + retry
        setGenError('Răspunsul AI nu a putut fi procesat. Încearcă din nou.')
        setUiStep('gen_error')
      }
    } catch (err) {
      setGenError(err?.message?.includes('API') || err?.message?.includes('key')
        ? 'Cheie API invalidă sau lipsă. Verifică în Setări.'
        : 'Eroare de conexiune. Verifică internetul și încearcă din nou.')
      setUiStep('gen_error')
    }
  }, [profile, recentSessions, updateTodaySession, callAIJSON])

  // ── Quiz complete ─────────────────────────────────────────────────────────
  const handleQuizComplete = useCallback((answers, score) => {
    updateTodaySession({ quiz_answers: answers, quiz_score: score })
    setUiStep('task')
  }, [updateTodaySession])

  // ── Task confirmed ────────────────────────────────────────────────────────
  const handleTaskConfirm = useCallback(() => {
    const h = new Date().getHours()
    setUiStep(h >= 17 ? 'evening' : 'wait')
  }, [])

  // ── Evening submit ────────────────────────────────────────────────────────
  const handleEvening = useCallback(async (eveningData) => {
    updateTodaySession(eveningData)

    let feedback = null
    if (apiKey) {
      feedback = await callAI(
        buildEveningPrompt(profile, { ...todaySession, ...eveningData }),
        { fast: true, max_tokens: 150 }
      )
    }

    updateTodaySession({
      ...eveningData,
      evening_feedback: feedback,
      loop_completed: true,
    })
    setUiStep('done')
  }, [profile, todaySession, updateTodaySession, callAI, apiKey])

  // ─────────────────────────────────────────────────────────────────────────
  const date = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="page">
      <div className="page-inner">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: 3 }}>
            {getGreeting(profile?.name || '')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', textTransform: 'capitalize' }}>{date}</p>
        </div>

        {/* No API key banner */}
        {!apiKey && uiStep !== 'done' && (
          <div style={{
            background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 14, padding: '12px 16px', marginBottom: 20,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
          }}>
            <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.45 }}>
              Fără API key, lecțiile AI nu sunt disponibile.
            </p>
            <Link to="/settings" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
              Configurează →
            </Link>
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          {uiStep === 'morning' && (
            <motion.div key="morning" {...stepVariants}>
              <MorningCheckin onSubmit={handleMorning} />
            </motion.div>
          )}

          {uiStep === 'generating' && (
            <motion.div key="generating" {...stepVariants}>
              <GeneratingScreen />
            </motion.div>
          )}

          {uiStep === 'gen_error' && (
            <motion.div key="gen_error" {...stepVariants} style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                Nu am putut genera lecția
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 28, maxWidth: 300, margin: '0 auto 28px' }}>
                {genError}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.button
                  className="btn btn-primary btn-full"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (lastMorningData.current) handleMorning(lastMorningData.current)
                  }}
                >
                  ↺ Încearcă din nou
                </motion.button>
                <Link to="/settings" style={{ textDecoration: 'none' }}>
                  <motion.button className="btn btn-secondary btn-full" whileTap={{ scale: 0.97 }}>
                    ⚙️ Verifică cheia API
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}

          {uiStep === 'lesson' && todaySession?.lesson_content && (
            <motion.div key="lesson" {...stepVariants}>
              <LessonCard session={todaySession} onContinue={() => setUiStep('quiz')} />
            </motion.div>
          )}

          {uiStep === 'quiz' && todaySession?.quiz?.length > 0 && (
            <motion.div key="quiz" {...stepVariants}>
              <QuizFlow session={todaySession} onComplete={handleQuizComplete} />
            </motion.div>
          )}

          {uiStep === 'task' && (
            <motion.div key="task" {...stepVariants}>
              <TaskCard session={todaySession} onConfirm={handleTaskConfirm} />
            </motion.div>
          )}

          {uiStep === 'wait' && (
            <motion.div key="wait" {...stepVariants}>
              <MidDayWait
                session={todaySession}
                profile={profile}
                streak={streak}
                onStartEvening={() => setUiStep('evening')}
              />
            </motion.div>
          )}

          {uiStep === 'evening' && (
            <motion.div key="evening" {...stepVariants}>
              <EveningCheckin
                session={todaySession}
                onSubmit={handleEvening}
                loading={loading}
              />
            </motion.div>
          )}

          {uiStep === 'done' && (
            <motion.div key="done" {...stepVariants}>
              <LoopDone session={todaySession} profile={profile} streak={streak} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
