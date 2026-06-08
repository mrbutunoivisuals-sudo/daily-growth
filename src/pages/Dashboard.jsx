import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';

function getGreeting(name) {
  const h = new Date().getHours();
  const salut = h < 12 ? 'Bună dimineața' : h < 17 ? 'Bună ziua' : 'Bună seara';
  return `${salut}, ${name}`;
}

function getMode() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  return 'evening';
}

const MORNING_PROMPT = (profile, business, balance) =>
  `Ești un coach de creștere personală, filozofia Jim Rohn. Utilizatorul se numește ${profile.name}, identitate: ${profile.identity?.join(', ')}, focus: ${profile.focus}.
Intenția de azi:
- Antreprenor: "${business}"
- Om echilibrat: "${balance}"
Generează O SINGURĂ FRAZĂ de claritate mentală. Directă, fără motivație ieftină, fără clișee. Ton sobru, ca un mentor. Maxim 25 de cuvinte. Doar fraza, fără ghilimele, fără prefix.`;

const EVENING_PROMPT = (profile, done, learned, tomorrow) =>
  `Ești un coach de creștere personală, filozofia Jim Rohn. Utilizatorul: ${profile.name}, identitate: ${profile.identity?.join(', ')}.
Reflecția de seară:
- Realizat: "${done}"
- Învățat: "${learned}"
- Mâine face diferit: "${tomorrow}"
Generează O SINGURĂ FRAZĂ de reflecție. Profundă, directă, fără laudă falsă. Maxim 25 de cuvinte. Doar fraza.`;

/* ─── Shared field component ─── */
function Field({ label, value, onChange, placeholder, rows = 2 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73',
        marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <textarea
        className="input-field"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ lineHeight: 1.55 }}
      />
    </div>
  );
}

/* ─── Reflection quote block ─── */
function ReflectionQuote({ text, delay = 0 }) {
  if (!text) return null;
  return (
    <div className="fade-up" style={{
      animationDelay: `${delay}s`,
      marginTop: 18, padding: '14px 18px',
      background: '#F0F7FF', borderRadius: 12,
      borderLeft: '3px solid #0071E3',
    }}>
      <p style={{ margin: 0, fontSize: 15, color: '#1D1D1F', lineHeight: 1.65, fontStyle: 'italic' }}>
        {text}
      </p>
    </div>
  );
}

/* ─── Intent row ─── */
function IntentRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{
        margin: '0 0 3px', fontSize: 11, fontWeight: 600, color: '#AEAEB2',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{label}</p>
      <p style={{ margin: 0, fontSize: 15, color: '#1D1D1F', lineHeight: 1.55 }}>{value}</p>
    </div>
  );
}

/* ─── Card: Morning form ─── */
function MorningCard({ business, setBusiness, balance, setBalance, onSave, loading, lateNote }) {
  const canSave = business.trim() && balance.trim();
  return (
    <div className="card fade-up" style={{ padding: 24, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>☀️</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1D1D1F' }}>
            {lateNote ? 'Setează intenția' : 'Intenția de azi'}
          </h2>
          {lateNote && (
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#AEAEB2' }}>Nu e prea târziu.</p>
          )}
        </div>
      </div>
      <Field
        label="Ce face azi antreprenorul din tine?"
        value={business} onChange={setBusiness}
        placeholder="ex: finalizez propunerea pentru clientul X"
      />
      <Field
        label="Ce face azi omul echilibrat din tine?"
        value={balance} onChange={setBalance}
        placeholder="ex: mă opresc la 19:00 și fiu prezent cu familia"
      />
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 4 }}
        disabled={!canSave || loading}
        onClick={onSave}
      >
        {loading ? 'Se generează...' : 'Setează intenția'}
      </button>
    </div>
  );
}

/* ─── Card: Day summary ─── */
function DayCard({ checkin, compact, animDelay = 0 }) {
  return (
    <div className="card" style={{
      padding: 24, marginBottom: 14,
      animation: `fadeUp 0.4s ease ${animDelay}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 10 : 16 }}>
        <span style={{ fontSize: 15, color: '#34C759', fontWeight: 700 }}>✓</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#34C759' }}>Intenția setată</h2>
      </div>
      {!compact && (
        <>
          <IntentRow label="Antreprenor" value={checkin?.morning?.business} />
          <IntentRow label="Om echilibrat" value={checkin?.morning?.balance} />
        </>
      )}
      <ReflectionQuote text={checkin?.morningReflection} />
    </div>
  );
}

/* ─── Card: Evening form ─── */
function EveningCard({ done, setDone, learned, setLearned, tomorrow, setTomorrow, onSave, loading }) {
  const canSave = done.trim() && learned.trim() && tomorrow.trim();
  return (
    <div className="card fade-up-1" style={{ padding: 24, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>🌙</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1D1D1F' }}>Închide ziua</h2>
      </div>
      <Field label="Ce ai realizat azi?" value={done} onChange={setDone}
        placeholder="Cel mai important lucru finalizat..." />
      <Field label="Ce ai învățat?" value={learned} onChange={setLearned}
        placeholder="O înțelegere nouă, o lecție..." />
      <Field label="Mâine fac diferit..." value={tomorrow} onChange={setTomorrow}
        placeholder="O decizie concretă pentru mâine..." />
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 4 }}
        disabled={!canSave || loading}
        onClick={onSave}
      >
        {loading ? 'Se generează...' : 'Închide ziua'}
      </button>
    </div>
  );
}

/* ─── Card: Full day completed ─── */
function CompletedCard({ checkin }) {
  return (
    <div className="card fade-up" style={{ padding: 24, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🌙</span>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#34C759' }}>Zi închisă</h2>
      </div>
      <IntentRow label="Realizat" value={checkin?.evening?.done} />
      <IntentRow label="Învățat" value={checkin?.evening?.learned} />
      <IntentRow label="Mâine" value={checkin?.evening?.tomorrow} />
      <ReflectionQuote text={checkin?.eveningReflection} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function Dashboard() {
  const { profile, todayCheckin, upsertTodayCheckin, streak, apiKey } = useApp();
  const { callAI, loading } = useAI();
  const mode = getMode();

  const [business, setBusiness] = useState(todayCheckin?.morning?.business || '');
  const [balance,  setBalance]  = useState(todayCheckin?.morning?.balance  || '');
  const [done,     setDone]     = useState(todayCheckin?.evening?.done     || '');
  const [learned,  setLearned]  = useState(todayCheckin?.evening?.learned  || '');
  const [tomorrow, setTomorrow] = useState(todayCheckin?.evening?.tomorrow || '');

  useEffect(() => {
    if (todayCheckin?.morning?.business) setBusiness(todayCheckin.morning.business);
    if (todayCheckin?.morning?.balance)  setBalance(todayCheckin.morning.balance);
    if (todayCheckin?.evening?.done)     setDone(todayCheckin.evening.done);
    if (todayCheckin?.evening?.learned)  setLearned(todayCheckin.evening.learned);
    if (todayCheckin?.evening?.tomorrow) setTomorrow(todayCheckin.evening.tomorrow);
  }, []);

  const handleMorning = async () => {
    if (!business.trim() || !balance.trim()) return;
    let reflection = null;
    if (apiKey) {
      reflection = await callAI(MORNING_PROMPT(profile, business, balance), { fast: true, max_tokens: 80 });
    }
    upsertTodayCheckin({
      morning: { business: business.trim(), balance: balance.trim() },
      morningReflection: reflection || null,
    });
  };

  const handleEvening = async () => {
    if (!done.trim() || !learned.trim() || !tomorrow.trim()) return;
    let reflection = null;
    if (apiKey) {
      reflection = await callAI(EVENING_PROMPT(profile, done, learned, tomorrow), { fast: true, max_tokens: 80 });
    }
    upsertTodayCheckin({
      evening: { done: done.trim(), learned: learned.trim(), tomorrow: tomorrow.trim() },
      eveningReflection: reflection || null,
    });
  };

  const morningDone = !!todayCheckin?.morning;
  const eveningDone = !!todayCheckin?.evening;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <div
        style={{ maxWidth: 560, margin: '0 auto', padding: '36px 20px 120px' }}
        className="md:pl-24"
      >
        {/* ── Header ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px',
            color: '#1D1D1F', margin: '0 0 5px', lineHeight: 1.15,
          }}>
            {getGreeting(profile?.name || '')}
          </h1>
          {profile?.identity?.length > 0 && (
            <p style={{ color: '#0071E3', fontSize: 14, margin: 0, fontWeight: 500 }}>
              {profile.identity.join(' · ')}
            </p>
          )}
        </div>

        {/* ── No API key banner ── */}
        {!apiKey && (
          <div className="fade-up-1" style={{
            background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 14, padding: '13px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <p style={{ fontSize: 14, color: '#92400E', margin: 0, lineHeight: 1.45 }}>
              Fără API key, reflecțiile AI nu sunt disponibile.
            </p>
            <Link to="/settings" style={{
              fontSize: 14, fontWeight: 600, color: '#0071E3',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Configurează →
            </Link>
          </div>
        )}

        {/* ── Morning (not done) ── */}
        {!morningDone && (mode === 'morning' || mode === 'day') && (
          <MorningCard
            business={business} setBusiness={setBusiness}
            balance={balance}  setBalance={setBalance}
            onSave={handleMorning} loading={loading}
          />
        )}

        {/* ── Morning done: show summary ── */}
        {morningDone && !eveningDone && (
          <DayCard checkin={todayCheckin} animDelay={0} />
        )}

        {/* ── Evening (not done) — only after noon ── */}
        {mode === 'evening' && !eveningDone && (
          <EveningCard
            done={done} setDone={setDone}
            learned={learned} setLearned={setLearned}
            tomorrow={tomorrow} setTomorrow={setTomorrow}
            onSave={handleEvening} loading={loading}
          />
        )}

        {/* ── Late morning: show form with note ── */}
        {mode === 'evening' && !morningDone && !eveningDone && (
          <MorningCard
            business={business} setBusiness={setBusiness}
            balance={balance}  setBalance={setBalance}
            onSave={handleMorning} loading={loading}
            lateNote
          />
        )}

        {/* ── Full day completed ── */}
        {eveningDone && <CompletedCard checkin={todayCheckin} />}

        {/* ── Streak ── */}
        {streak > 0 && (
          <div className="fade-up-2" style={{ textAlign: 'center', marginTop: 36 }}>
            <span style={{
              fontSize: 40, fontWeight: 700, color: '#1D1D1F',
              letterSpacing: '-1px', display: 'block', lineHeight: 1,
            }}>
              {streak}
            </span>
            <p style={{ fontSize: 14, color: '#6E6E73', margin: '6px 0 0' }}>
              {streak === 1 ? 'zi consecutivă de creștere' : 'zile consecutive de creștere'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
