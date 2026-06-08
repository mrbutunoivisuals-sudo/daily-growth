import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const FOCUS_OPTIONS = [
  { key: 'Antreprenoriat', emoji: '🚀', desc: 'Mindset, consistență, creștere' },
  { key: 'Familie',        emoji: '❤️',  desc: 'Tată, soț, prezență, relații' },
  { key: 'Credință',       emoji: '✝️',  desc: 'Identitate, pace, principii' },
  { key: 'Disciplină',     emoji: '⚙️',  desc: 'Obiceiuri, focus, productivitate' },
]

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, x: -24, transition: { duration: 0.2 } },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { setProfile } = useApp()
  const [step, setStep]         = useState(0)
  const [name, setName]         = useState('')
  const [identity, setIdentity] = useState('')

  const handleFinish = (selectedFocus) => {
    const identityArr = identity
      .split(/[,\s]+/)
      .map(w => w.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 3)

    setProfile({
      name: name.trim(),
      identity: identityArr.length > 0 ? identityArr : [name.trim().toLowerCase()],
      focus: selectedFocus,
      onboardingDone: true,
      createdAt: new Date().toISOString(),
    })
    navigate('/today')
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px 20px', background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 48 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 24 : 6, background: i <= step ? 'var(--accent)' : '#E5E7EB' }}
              style={{ height: 6, borderRadius: 3 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" {...slide}>
              <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Daily Growth</p>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                Cum te numești?
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
                Vom personaliza fiecare lecție și task pentru tine.
              </p>
              <input
                className="input"
                placeholder="Numele tău"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(1)}
                autoFocus
                style={{ marginBottom: 12, fontSize: 18 }}
              />
              <motion.button
                className="btn btn-primary btn-full"
                disabled={!name.trim()}
                onClick={() => setStep(1)}
                whileTap={{ scale: 0.97 }}
              >
                Continuă →
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" {...slide}>
              <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Identitate</p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.4px' }}>
                Omul care vrei să devii.
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 4, lineHeight: 1.6 }}>Descrie-l în 3 cuvinte.</p>
              <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 28 }}>ex: disciplinat, prezent, curajos</p>
              <input
                className="input"
                placeholder="3 cuvinte, separate prin virgulă"
                value={identity}
                onChange={e => setIdentity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && identity.trim() && setStep(2)}
                autoFocus
                style={{ marginBottom: 12, fontSize: 16 }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)} whileTap={{ scale: 0.97 }}>
                  ← Înapoi
                </motion.button>
                <motion.button className="btn btn-primary" style={{ flex: 2 }} disabled={!identity.trim()} onClick={() => setStep(2)} whileTap={{ scale: 0.97 }}>
                  Continuă →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...slide}>
              <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Prioritate</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.4px' }}>
                Unde merită cea mai multă atenție acum?
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                Coach-ul va prioritiza lecții din acest domeniu.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {FOCUS_OPTIONS.map(({ key, emoji, desc }) => (
                  <FocusCard key={key} emoji={emoji} label={key} desc={desc} onClick={() => handleFinish(key)} />
                ))}
              </div>
              <motion.button className="btn btn-secondary btn-full" onClick={() => setStep(1)} whileTap={{ scale: 0.97 }}>
                ← Înapoi
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function FocusCard({ emoji, label, desc, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ borderColor: 'var(--accent)', boxShadow: 'var(--shadow-acc)' }}
      style={{
        background: '#fff', border: '1.5px solid var(--border)',
        borderRadius: 20, padding: '18px 14px', textAlign: 'left', cursor: 'pointer',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{desc}</div>
    </motion.button>
  )
}
