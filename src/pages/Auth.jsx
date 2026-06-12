import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { motion, AnimatePresence } from 'framer-motion'

export default function Auth() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const sendMagicLink = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setLoading(true)
    setError('')

    const { error: authErr } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        // After clicking the link, Supabase redirects here.
        // The client auto-detects the token and fires onAuthStateChange.
        emailRedirectTo: window.location.origin,
      },
    })

    if (authErr) {
      setError(authErr.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px 20px', background: 'var(--bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: 'var(--shadow-acc)',
          }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>DG</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
            Daily Growth
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Sistemul tău de transformare personală</p>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                Intră în cont
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.5 }}>
                Trimitem un link magic pe email — fără parolă.
              </p>

              <input
                className="input"
                type="email"
                placeholder="adresa@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                autoFocus
                style={{ marginBottom: 12, fontSize: 16 }}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12, lineHeight: 1.4 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                className="btn btn-primary btn-full"
                disabled={!email.trim() || loading}
                onClick={sendMagicLink}
                whileTap={{ scale: 0.97 }}
                style={{ fontSize: 17 }}
              >
                {loading ? 'Se trimite...' : 'Trimite link magic →'}
              </motion.button>

              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
                Dacă nu ai cont, îl creăm automat la prima conectare.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                style={{ fontSize: 52, marginBottom: 20 }}
              >
                📬
              </motion.div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
                Verifică email-ul
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 24 }}>
                Am trimis un link magic la{' '}
                <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                Dă click pe el și revii automat în aplicație.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 20 }}>
                Linkul expiră în 1 oră. Nu găsești emailul? Verifică spam-ul.
              </p>
              <motion.button
                className="btn btn-secondary btn-full"
                onClick={() => { setSent(false); setEmail('') }}
                whileTap={{ scale: 0.97 }}
              >
                ← Schimbă adresa
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
