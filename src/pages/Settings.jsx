import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { requestNotificationPermission } from '../hooks/useNotifications.js'
import { motion } from 'framer-motion'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, apiKey, setApiKey, notifTimes, setNotifTimes, resetAll, signOut, session } = useApp()

  const [keyInput, setKeyInput] = useState(apiKey || '')
  const [keySaved, setKeySaved] = useState(false)
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const [confirmReset, setConfirmReset] = useState(false)

  const saveKey = () => {
    setApiKey(keyInput.trim())
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const requestNotif = async () => {
    const result = await requestNotificationPermission()
    setNotifStatus(result)
  }

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return }
    resetAll()
    navigate('/onboarding')
  }

  const notifStatusLabel = {
    granted: '✓ Activat',
    denied: '✗ Blocat (permite din setările browserului)',
    default: 'Cere permisiunea',
    unsupported: 'Browserul nu suportă notificări',
  }[notifStatus] || 'Necunoscut'

  return (
    <div className="page">
      <div className="page-inner">
        <p className="label-sm">Configurare</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 24, letterSpacing: '-0.4px' }}>
          Setări
        </h1>

        {/* Profile summary */}
        {profile && (
          <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Profilul tău</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{profile.name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 2 }}>Focus: {profile.focus}</p>
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Identitate: {(profile.identity || []).join(', ')}</p>
          </div>
        )}

        {/* API Key */}
        <div className="card" style={{ marginBottom: 16, padding: '18px 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Cheie API Anthropic</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, lineHeight: 1.5 }}>
            Obține cheia de la{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              console.anthropic.com
            </a>
            {' '}→ API Keys
          </p>
          <input
            className="input"
            type="password"
            placeholder="sk-ant-..."
            value={keyInput}
            onChange={e => { setKeyInput(e.target.value); setKeySaved(false) }}
            style={{ marginBottom: 10, fontSize: 14, fontFamily: 'monospace' }}
          />
          <motion.button
            className={`btn btn-full ${keySaved ? 'btn-success' : 'btn-primary'}`}
            onClick={saveKey}
            whileTap={{ scale: 0.97 }}
          >
            {keySaved ? '✓ Salvat' : 'Salvează cheia'}
          </motion.button>
          {apiKey && (
            <p style={{ fontSize: 12, color: 'var(--green)', textAlign: 'center', marginTop: 8 }}>
              ✓ Cheie activă ({apiKey.slice(0, 8)}…)
            </p>
          )}
        </div>

        {/* Notifications */}
        <div className="card" style={{ marginBottom: 16, padding: '18px 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Notificări</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Status</span>
            <span style={{ fontSize: 13, color: notifStatus === 'granted' ? 'var(--green)' : 'var(--text-3)' }}>
              {notifStatusLabel}
            </span>
          </div>

          {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
            <motion.button className="btn btn-secondary btn-full" onClick={requestNotif} whileTap={{ scale: 0.97 }}
              style={{ marginBottom: 12 }}>
              Activează notificările
            </motion.button>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>🌅 Dimineața</p>
              <input
                type="time"
                className="input"
                value={notifTimes?.morning || '08:00'}
                onChange={e => setNotifTimes({ ...notifTimes, morning: e.target.value })}
                style={{ padding: '10px 12px', fontSize: 15 }}
              />
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>🌙 Seara</p>
              <input
                type="time"
                className="input"
                value={notifTimes?.evening || '21:00'}
                onChange={e => setNotifTimes({ ...notifTimes, evening: e.target.value })}
                style={{ padding: '10px 12px', fontSize: 15 }}
              />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
            Notificările funcționează cât timp tab-ul e deschis în browser.
          </p>
        </div>

        {/* Account */}
        <div className="card" style={{ padding: '18px 20px', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Cont</p>
          {session?.user?.email && (
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 14 }}>
              Autentificat ca <strong style={{ color: 'var(--text)' }}>{session.user.email}</strong>
            </p>
          )}
          <motion.button
            className="btn btn-secondary btn-full"
            onClick={signOut}
            whileTap={{ scale: 0.97 }}
          >
            Deconectează-te
          </motion.button>
        </div>

        {/* Reset */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Zonă periculoasă</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14, lineHeight: 1.5 }}>
            Resetarea șterge tot istoricul local. Datele din Supabase rămân.
          </p>
          <motion.button
            className="btn btn-danger btn-full"
            onClick={handleReset}
            whileTap={{ scale: 0.97 }}
          >
            {confirmReset ? '⚠️ Confirmi? Click din nou.' : 'Resetează aplicația'}
          </motion.button>
          {confirmReset && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="btn btn-ghost btn-full"
              onClick={() => setConfirmReset(false)}
              style={{ marginTop: 8 }}
            >
              Anulează
            </motion.button>
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 24 }}>
          Daily Growth v4 · Construit cu Claude
        </p>
      </div>
    </div>
  )
}
