import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const FOCUS_OPTIONS = [
  { key: 'Mental',    emoji: '🧠', desc: 'Claritate, disciplină, mentalitate' },
  { key: 'Business',  emoji: '🚀', desc: 'Productivitate, strategie, creștere' },
  { key: 'Familie',   emoji: '❤️', desc: 'Prezență, relații, conexiune' },
  { key: 'Fizic',     emoji: '💪', desc: 'Sănătate, energie, mișcare' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [identity, setIdentity] = useState('');

  const handleFinish = (selectedFocus) => {
    const identityArr = identity
      .split(/[,\s]+/)
      .map(w => w.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 3);

    setProfile({
      name: name.trim(),
      identity: identityArr,
      focus: selectedFocus,
      onboardingDone: true,
      createdAt: new Date().toISOString(),
    });
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', background: '#F5F5F7',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 48 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i <= step ? '#0071E3' : '#D1D1D6',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {step === 0 && (
          <div className="fade-up">
            <p style={{ color: '#6E6E73', fontSize: 13, marginBottom: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Daily Growth</p>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1D1D1F', marginBottom: 8, lineHeight: 1.2, fontFamily: '-apple-system, SF Pro Display, Inter, sans-serif' }}>
              Cum te numești?
            </h1>
            <p style={{ color: '#6E6E73', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
              Vom personaliza fiecare interacțiune pentru tine.
            </p>
            <input
              className="input-field"
              placeholder="Numele tău"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(1)}
              autoFocus
              style={{ fontSize: 17, padding: '14px 16px', marginBottom: 12 }}
            />
            <button className="btn-primary" style={{ width: '100%' }} disabled={!name.trim()} onClick={() => setStep(1)}>
              Continuă
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-up">
            <p style={{ color: '#6E6E73', fontSize: 13, marginBottom: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Identitate</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1D1D1F', marginBottom: 8, lineHeight: 1.2 }}>
              Omul care vrei să devii.
            </h1>
            <p style={{ color: '#6E6E73', fontSize: 15, marginBottom: 6, lineHeight: 1.6 }}>
              Descrie-l în 3 cuvinte.
            </p>
            <p style={{ color: '#AEAEB2', fontSize: 13, marginBottom: 28 }}>
              ex: disciplinat, prezent, liber
            </p>
            <input
              className="input-field"
              placeholder="3 cuvinte, separate prin virgulă"
              value={identity}
              onChange={e => setIdentity(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && identity.trim() && setStep(2)}
              autoFocus
              style={{ fontSize: 16, padding: '14px 16px', marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)}>Înapoi</button>
              <button className="btn-primary" style={{ flex: 2 }} disabled={!identity.trim()} onClick={() => setStep(2)}>
                Continuă
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <p style={{ color: '#6E6E73', fontSize: 13, marginBottom: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Focus</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1D1D1F', marginBottom: 8, lineHeight: 1.2 }}>
              Cel mai neglijat aspect al vieții tale.
            </h1>
            <p style={{ color: '#6E6E73', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
              Unde merită cea mai multă atenție acum?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {FOCUS_OPTIONS.map(({ key, emoji, desc }) => (
                <FocusCard key={key} emoji={emoji} label={key} desc={desc} onClick={() => handleFinish(key)} />
              ))}
            </div>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setStep(1)}>Înapoi</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FocusCard({ emoji, label, desc, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#0071E3' : '#E5E5EA'}`,
        borderRadius: 16, padding: '18px 14px', textAlign: 'left', cursor: 'pointer',
        boxShadow: hovered ? '0 4px 16px rgba(0,113,227,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1D1D1F', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.4 }}>{desc}</div>
    </button>
  );
}
