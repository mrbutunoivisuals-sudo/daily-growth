import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { apiKey, setApiKey, profile, resetAll } = useApp();
  const [keyInput,   setKeyInput]   = useState(apiKey || '');
  const [showKey,    setShowKey]    = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [showReset,  setShowReset]  = useState(false);

  const handleSave = () => {
    setApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => { resetAll(); navigate('/onboarding'); };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '36px 20px 120px' }} className="md:pl-24">

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{
            margin: '0 0 5px', fontSize: 32, fontWeight: 700,
            letterSpacing: '-0.5px', color: '#1D1D1F', lineHeight: 1.1,
          }}>Setări</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#0071E3', fontWeight: 500 }}>
            Profil și configurare
          </p>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="card fade-up-1" style={{ padding: 22, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: '#E8F0FB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#0071E3', flexShrink: 0,
              }}>
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#1D1D1F' }}>{profile.name}</p>
                {profile.identity?.length > 0 && (
                  <p style={{ margin: '3px 0 0', fontSize: 14, color: '#0071E3', fontWeight: 500 }}>
                    {profile.identity.join(' · ')}
                  </p>
                )}
                {profile.focus && (
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#AEAEB2' }}>Focus: {profile.focus}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API Key */}
        <div className="card fade-up-2" style={{ padding: 22, marginBottom: 14 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#1D1D1F' }}>Anthropic API Key</h3>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6E6E73', lineHeight: 1.55 }}>
            Salvată local în browser.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
              style={{ color: '#0071E3', textDecoration: 'none', fontWeight: 500 }}>
              Obține cheie →
            </a>
          </p>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && keyInput.trim() && handleSave()}
              placeholder="sk-ant-..."
              className="input-field"
              style={{ fontFamily: 'monospace', fontSize: 15, paddingRight: 72 }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8E8E93', fontSize: 13, fontWeight: 500,
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#1D1D1F'}
              onMouseLeave={e => e.currentTarget.style.color = '#8E8E93'}
            >
              {showKey ? 'Ascunde' : 'Arată'}
            </button>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#AEAEB2', lineHeight: 1.4 }}>
            Haiku (răspunsuri rapide) · Sonnet (coach și review)
          </p>
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={!keyInput.trim()}
            onClick={handleSave}
          >
            {saved ? '✓ Salvat' : 'Salvează'}
          </button>
        </div>

        {/* Reset */}
        <div className="card fade-up-3" style={{ padding: 22, borderColor: 'rgba(255,59,48,0.2)' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#FF3B30' }}>Resetează totul</h3>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6E6E73', lineHeight: 1.55 }}>
            Șterge profilul și toate datele. Ireversibil.
          </p>
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              style={{
                background: 'none', border: '1.5px solid #FF3B30', borderRadius: 14,
                padding: '13px 22px', color: '#FF3B30', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              Resetează
            </button>
          ) : (
            <div style={{
              background: '#FFF5F5', borderRadius: 14, padding: '16px 18px',
              border: '1px solid rgba(255,59,48,0.15)',
            }}>
              <p style={{ margin: '0 0 14px', fontSize: 14, color: '#FF3B30', fontWeight: 500 }}>
                Ești sigur? Nu se poate recupera.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowReset(false)}>
                  Anulează
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1, background: '#FF3B30', color: '#fff', border: 'none',
                    borderRadius: 14, padding: '13px', fontSize: 16,
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Șterge tot
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
