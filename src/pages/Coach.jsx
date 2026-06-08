import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useAI } from '../hooks/useAI.js'
import { motion, AnimatePresence } from 'framer-motion'

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

function buildCoachSystem(profile, recentSessions) {
  const name = profile?.name || 'utilizatorul'
  const focus = profile?.focus || ''
  const identity = (profile?.identity || []).join(', ')

  const ctx = recentSessions.slice(0, 5).map(s => {
    const parts = []
    if (s.lesson_title) parts.push(`Lecție: "${s.lesson_title}"`)
    if (s.quiz_score != null) parts.push(`Quiz: ${s.quiz_score}%`)
    if (s.task_title) parts.push(`Task: "${s.task_title}"`)
    if (s.evening_applied) parts.push(`Aplicat: ${s.evening_applied}`)
    return `[${s.date}] ${parts.join(' | ')}`
  }).join('\n')

  return `Ești un coach personal pentru ${name}, care lucrează la creștere în domeniul: ${focus}.
Identitate vizată: ${identity || 'nedefinită'}.

Context lecții recente (ultimele 5 zile):
${ctx || 'Nicio sesiune anterioară'}

Comportament:
- Vorbești în română, concis, direct, cald dar ferm
- Răspunsuri scurte (2-4 propoziții dacă nu se cere altfel)
- Conectezi răspunsurile la lecțiile și taskurile recente când e relevant
- Nu ești terapeut — ești un coach orientat spre acțiune
- Dacă cineva e descurajat, dai perspectivă + un pas mic concret
- Folosești prenumele rar (nu în fiecare mesaj)`
}

export default function Coach() {
  const { profile, coach, appendCoachMsg, clearCoach, recentSessions, apiKey } = useApp()
  const { callAI } = useAI()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coach, loading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    if (!apiKey) {
      appendCoachMsg({ role: 'assistant', content: 'Configurează cheia API în Setări pentru a folosi coach-ul.', ts: Date.now() })
      return
    }

    const userMsg = { role: 'user', content: text, ts: Date.now() }
    appendCoachMsg(userMsg)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const system = buildCoachSystem(profile, recentSessions)
      const history = [...coach, userMsg]
        .slice(-20)
        .map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
        .join('\n')

      const reply = await callAI(`${system}\n\nConversație:\n${history}\n\nCoach:`, { fast: true, max_tokens: 400 })
      appendCoachMsg({ role: 'assistant', content: reply.trim(), ts: Date.now() })
    } catch {
      appendCoachMsg({ role: 'assistant', content: 'Eroare de conexiune. Verifică cheia API în Setări.', ts: Date.now() })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="page-coach">
      {/* Header */}
      <div style={{
        padding: '20px 20px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Coach</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '2px 0 0' }}>Știe ce ai învățat și ce ai de lucru</p>
        </div>
        {coach.length > 0 && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={clearCoach}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 8, borderRadius: 10 }}>
            <TrashIcon />
          </motion.button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {coach.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
            <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
              Întreabă-mă orice legat de lecția de azi, taskul tău, sau orice te blochează.
            </p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {coach.map((msg, i) => (
            <motion.div key={msg.ts || i}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '78%', padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--card)',
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                fontSize: 14, lineHeight: 1.55,
                boxShadow: msg.role === 'user' ? 'none' : 'var(--shadow)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: 5, padding: '8px 4px', alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
            ))}
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — sits at bottom of flex container which already clears the nav */}
      <div style={{
        padding: '12px 16px 16px', borderTop: '1px solid var(--border)', flexShrink: 0,
        display: 'flex', gap: 10, alignItems: 'flex-end',
        background: 'rgba(255,255,255,0.97)',
      }}>
        <textarea
          ref={el => { textareaRef.current = el; inputRef.current = el }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Scrie un mesaj..."
          rows={1}
          style={{
            flex: 1, resize: 'none', border: '1.5px solid var(--border)', borderRadius: 16,
            padding: '10px 14px', fontSize: 14, lineHeight: 1.5, outline: 'none',
            background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit',
            maxHeight: 120, overflowY: 'auto',
          }}
          onInput={e => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <motion.button whileTap={{ scale: 0.9 }} onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
            border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}>
          <SendIcon />
        </motion.button>
      </div>
    </div>
  )
}
