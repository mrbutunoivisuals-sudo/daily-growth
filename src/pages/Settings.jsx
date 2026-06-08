import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { apiKey, setApiKey, profile, resetAll } = useApp();
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSave = () => {
    setApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetAll();
    navigate('/onboarding');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 100px' }} className="md:pl-24">

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1D1D1F', margin: '0 0 28px' }}>Setări</h1>

        {/* Profile summary */}
        {profile && (
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 22, background: '#E8F0FB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#0071E3', flexShrink: 0,
              }}>
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1D1D1F' }}>{profile.name}</p>
                {profile.identity?.length > 0 && (
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6E6E73' }}>{profile.identity.join(' · ')}</p>
                )}
                {profile.focus && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#AEAEB2' }}>Focus: {profile.focus}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API Key */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#1D1D1F' }}>Anthropic API Key</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6E6E73', lineHeight: 1.5 }}>
            Salvată local în browser.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
              style={{ color: '#0071E3', textDecoration: 'none' }}>
              Obține cheie →
            </a>
          </p>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="input-field"
              style={{ fontFamily: 'monospace', fontSize: 14, paddingRight: 44 }}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#AEAEB2', fontSize: 13,
              }}
            >
              {showKey ? 'Ascunde' : 'Arată'}
            </button>
          </div>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#AEAEB2' }}>
            Model: claude-haiku-4-5 (răspunsuri rapide) · claude-sonnet-4-5 (coach și review)
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
        <div className="card" style={{ padding: 20, border: '1px solid #FFE5E5' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#FF3B30' }}>Resetează totul</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6E6E73', lineHeight: 1.5 }}>
            Șterge profilul și toate datele. Ireversibil.
          </p>
          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              style={{
                background: 'none', border: '1px solid #FF3B30', borderRadius: 10,
                padding: '10px 20px', color: '#FF3B30', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Resetează
            </button>
          ) : (
            <div style={{ background: '#FFF5F5', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#FF3B30' }}>Ești sigur? Nu se poate recupera.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowReset(false)}>Anulează</button>
                <button
                  onClick={handleReset}
                  style={{
                    flex: 1, background: '#FF3B30', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
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
