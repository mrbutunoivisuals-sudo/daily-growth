import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
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

function todayDateStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/* ══════════════════════════════════════════════════════
   PROMPTS
══════════════════════════════════════════════════════ */
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

function TASKS_PROMPT(profile, business, balance, weekHistory) {
  const week = weekHistory.length === 0
    ? 'Fără istoric această săptămână.'
    : weekHistory.slice(0, 3).map(c => {
        const d = new Date(c.date).toLocaleDateString('ro-RO', { weekday: 'short' });
        const parts = [];
        if (c.morning?.business) parts.push(`"${c.morning.business}"`);
        if (c.evening?.done)     parts.push(`realizat: "${c.evening.done}"`);
        return `${d}: ${parts.join(', ')}`;
      }).join(' | ');

  return `Ești un coach bazat pe filozofia Jim Rohn.
Profilul utilizatorului: nume=${profile.name}, identitate=[${profile.identity?.join(', ')}], focus=${profile.focus}
Intenția de azi: antreprenor="${business}", echilibrat="${balance}"
Domeniu prioritar: ${profile.focus}
Istoricul săptămânii: ${week}

Generează exact 3 taskuri pentru azi.
Fiecare task trebuie să:
- fie specific și acționabil (nu vag)
- poată fi completat în maxim 30 minute
- fie direct legat de obiectivul și focusul utilizatorului
- înceapă cu un verb de acțiune

Răspunde DOAR cu JSON valid, fără markdown:
[{"title":"...","why":"..."},{"title":"...","why":"..."},{"title":"...","why":"..."}]`;
}

function FEEDBACK_PROMPT(profile, taskTitle) {
  return `Utilizatorul ${profile.name} tocmai a completat taskul: "${taskTitle}". Profilul său: identitate=[${profile.identity?.join(', ')}], focus=${profile.focus}. Dă un feedback scurt (2-3 propoziții) în stilul Jim Rohn — validează acțiunea, conectează-o la identitatea sa (${profile.identity?.[0] || profile.focus}), și pune O întrebare scurtă de reflecție. Fără markdown, text simplu, în română.`;
}

/* ══════════════════════════════════════════════════════
   PLACEHOLDER TASKS (fără API key)
══════════════════════════════════════════════════════ */
const PLACEHOLDERS = {
  Mental: [
    { title: 'Scrie 3 lucruri pentru care ești recunoscător', why: 'Mintea disciplinată începe cu claritate și recunoștință.' },
    { title: 'Citește 20 de minute dintr-o carte de dezvoltare', why: 'Cunoașterea acumulată zilnic face diferența în timp.' },
    { title: 'Meditează 10 minute în liniște completă', why: 'Prezența de spirit se construiește prin practică zilnică.' },
  ],
  Business: [
    { title: 'Contactează un client sau prospect important', why: 'Relațiile sunt fundamentul oricărei afaceri durabile.' },
    { title: 'Finalizează cel mai important task neterminat', why: 'Productivitatea înseamnă să termini ce ai început.' },
    { title: 'Scrie un plan de acțiune pentru mâine', why: 'Planificarea clară precede execuția eficientă.' },
  ],
  Familie: [
    { title: 'Petrece 30 minute de calitate cu cineva drag', why: 'Prezența reală construiește relații puternice.' },
    { title: 'Trimite un mesaj sincer cuiva important', why: 'Conexiunile autentice necesită efort conștient.' },
    { title: 'Fă un gest mic dar semnificativ pentru familia ta', why: 'Dragostea se exprimă prin acțiuni, nu cuvinte.' },
  ],
  Fizic: [
    { title: 'Fă 30 de minute de mișcare fizică', why: 'Corpul este vehiculul tuturor ambițiilor tale.' },
    { title: 'Bea 2 litri de apă pe parcursul zilei', why: 'Hidratarea optimă susține performanța mentală și fizică.' },
    { title: 'Pregătește o masă sănătoasă de la zero', why: 'Ce mănânci devine energia cu care gândești și acționezi.' },
  ],
};

/* ══════════════════════════════════════════════════════
   TASKS STORAGE
══════════════════════════════════════════════════════ */
const TASKS_KEY = 'dg_v3_tasks';

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date === todayDateStr()) return parsed.tasks;
    return null; // stale — alt zi
  } catch { return null; }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify({ date: todayDateStr(), tasks }));
  } catch {}
}

/* ══════════════════════════════════════════════════════
   TASK CARD
══════════════════════════════════════════════════════ */
function TaskCard({ task, index, profile, apiKey, onToggle, onFeedback }) {
  const { callAI, loading: feedbackLoading } = useAI();
  const [celebrated, setCelebrated] = useState(false);

  const handleCheck = async () => {
    if (task.completed) return; // nu de-bifăm
    onToggle(task.id, true);

    if (!apiKey) return;

    const text = await callAI(FEEDBACK_PROMPT(profile, task.title), { fast: true, max_tokens: 150 });
    if (text) onFeedback(task.id, text);
  };

  // Animație de celebrare la prima bifă
  useEffect(() => {
    if (task.completed && !celebrated) {
      setCelebrated(true);
    }
  }, [task.completed]);

  return (
    <div
      style={{
        animation: `fadeUp 0.4s ease ${index * 0.1}s both`,
      }}
    >
      <div
        className="card"
        style={{
          padding: '18px 20px',
          marginBottom: 10,
          transition: 'opacity 0.2s ease',
          opacity: task.completed ? 0.75 : 1,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Checkbox */}
          <button
            onClick={handleCheck}
            disabled={task.completed || feedbackLoading}
            style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              border: task.completed ? 'none' : '2px solid #E5E5EA',
              background: task.completed ? '#34C759' : 'transparent',
              cursor: task.completed ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1,
              transition: 'all 0.2s ease',
              transform: celebrated ? 'scale(1)' : undefined,
            }}
          >
            {task.completed && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: '0 0 4px', fontSize: 17, fontWeight: 500, color: '#1D1D1F',
              lineHeight: 1.4,
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}>
              {task.title}
            </p>
            <p style={{
              margin: 0, fontSize: 14, color: '#6E6E73',
              lineHeight: 1.5, fontStyle: 'italic',
            }}>
              {task.why}
            </p>
          </div>
        </div>

        {/* Feedback loading */}
        {feedbackLoading && (
          <div style={{
            marginTop: 14, paddingTop: 14,
            borderTop: '1px solid #F2F2F7',
            display: 'flex', gap: 6, alignItems: 'center',
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#C7C7CC',
                animation: `bounce 1.1s ease infinite ${i * 0.18}s`,
              }}/>
            ))}
            <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-5px);opacity:1}}`}</style>
          </div>
        )}

        {/* AI Feedback */}
        {task.feedback && (
          <div style={{
            marginTop: 14, paddingTop: 14,
            borderTop: '1px solid #F2F2F7',
            animation: 'fadeUp 0.3s ease both',
          }}>
            <p style={{
              margin: 0, fontSize: 14, color: '#1D1D1F',
              lineHeight: 1.65, fontStyle: 'italic',
            }}>
              {task.feedback}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TASKS SECTION
══════════════════════════════════════════════════════ */
function TasksSection({ tasks, tasksLoading, profile, apiKey, onToggle, onFeedback }) {
  const allDone = tasks.length > 0 && tasks.every(t => t.completed);

  if (tasksLoading) {
    return (
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1D1D1F', margin: '0 0 14px', letterSpacing: '-0.3px' }}>
          Taskurile tale de azi
        </h2>
        {[0,1,2].map(i => (
          <div key={i} className="card" style={{
            padding: '18px 20px', marginBottom: 10,
            animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F2F2F7', flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ height: 16, borderRadius: 6, background: '#F2F2F7', width: '70%', marginBottom: 8 }}/>
                <div style={{ height: 13, borderRadius: 6, background: '#F2F2F7', width: '90%' }}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) return null;

  return (
    <div style={{ marginBottom: 8 }}>
      <h2 style={{
        fontSize: 20, fontWeight: 700, color: '#1D1D1F',
        margin: '0 0 14px', letterSpacing: '-0.3px',
        animation: 'fadeUp 0.4s ease both',
      }}>
        Taskurile tale de azi
      </h2>

      {tasks.map((task, i) => (
        <TaskCard
          key={task.id}
          task={task}
          index={i}
          profile={profile}
          apiKey={apiKey}
          onToggle={onToggle}
          onFeedback={onFeedback}
        />
      ))}

      {/* All done celebration */}
      {allDone && (
        <div
          className="card"
          style={{
            padding: '18px 20px', marginTop: 4,
            background: '#F0FFF4',
            border: '1px solid rgba(52,199,89,0.2)',
            animation: 'celebrate 0.3s ease both',
          }}
        >
          <style>{`@keyframes celebrate{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}`}</style>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1D1D1F', lineHeight: 1.4 }}>
            Toate taskurile completate.
          </p>
          {profile?.identity?.[0] && (
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#34C759', fontWeight: 500 }}>
              Azi ai ales să fii {profile.identity[0]}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED FIELD
══════════════════════════════════════════════════════ */
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

function ReflectionQuote({ text }) {
  if (!text) return null;
  return (
    <div style={{
      marginTop: 18, padding: '14px 18px',
      background: '#F0F7FF', borderRadius: 12,
      borderLeft: '3px solid #0071E3',
      animation: 'fadeUp 0.4s ease both',
    }}>
      <p style={{ margin: 0, fontSize: 15, color: '#1D1D1F', lineHeight: 1.65, fontStyle: 'italic' }}>
        {text}
      </p>
    </div>
  );
}

function IntentRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ margin: '0 0 3px', fontSize: 11, fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 15, color: '#1D1D1F', lineHeight: 1.55 }}>{value}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MORNING CARD
══════════════════════════════════════════════════════ */
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
          {lateNote && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#AEAEB2' }}>Nu e prea târziu.</p>}
        </div>
      </div>
      <Field label="Ce face azi antreprenorul din tine?" value={business} onChange={setBusiness}
        placeholder="ex: finalizez propunerea pentru clientul X" />
      <Field label="Ce face azi omul echilibrat din tine?" value={balance} onChange={setBalance}
        placeholder="ex: mă opresc la 19:00 și fiu prezent cu familia" />
      <button className="btn-primary" style={{ width: '100%', marginTop: 4 }}
        disabled={!canSave || loading} onClick={onSave}>
        {loading ? 'Se generează...' : 'Setează intenția'}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DAY CARD
══════════════════════════════════════════════════════ */
function DayCard({ checkin, compact }) {
  return (
    <div className="card fade-up" style={{ padding: 24, marginBottom: 14 }}>
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

/* ══════════════════════════════════════════════════════
   EVENING CARD
══════════════════════════════════════════════════════ */
function EveningCard({ done, setDone, learned, setLearned, tomorrow, setTomorrow, onSave, loading }) {
  const canSave = done.trim() && learned.trim() && tomorrow.trim();
  return (
    <div className="card fade-up-1" style={{ padding: 24, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 20 }}>🌙</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1D1D1F' }}>Închide ziua</h2>
      </div>
      <Field label="Ce ai realizat azi?" value={done} onChange={setDone} placeholder="Cel mai important lucru finalizat..." />
      <Field label="Ce ai învățat?" value={learned} onChange={setLearned} placeholder="O înțelegere nouă, o lecție..." />
      <Field label="Mâine fac diferit..." value={tomorrow} onChange={setTomorrow} placeholder="O decizie concretă pentru mâine..." />
      <button className="btn-primary" style={{ width: '100%', marginTop: 4 }}
        disabled={!canSave || loading} onClick={onSave}>
        {loading ? 'Se generează...' : 'Închide ziua'}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COMPLETED CARD
══════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { profile, todayCheckin, upsertTodayCheckin, streak, apiKey, weekHistory } = useApp();
  // Separate useAI instances — independent loading states
  const { callAI, loading: loadingIntent }    = useAI();
  const { callAIJSON, loading: loadingTasks } = useAI();

  const mode = getMode();

  // ── Morning/evening form state ──
  const [business, setBusiness] = useState(todayCheckin?.morning?.business || '');
  const [balance,  setBalance]  = useState(todayCheckin?.morning?.balance  || '');
  const [done,     setDone]     = useState(todayCheckin?.evening?.done     || '');
  const [learned,  setLearned]  = useState(todayCheckin?.evening?.learned  || '');
  const [tomorrow, setTomorrow] = useState(todayCheckin?.evening?.tomorrow || '');

  // ── Daily tasks state ──
  const [tasks, setTasksRaw] = useState(() => loadTasks() || []);

  const setTasks = useCallback((updater) => {
    setTasksRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveTasks(next);
      return next;
    });
  }, []);

  // Sync form fields if checkin already exists
  useEffect(() => {
    if (todayCheckin?.morning?.business) setBusiness(todayCheckin.morning.business);
    if (todayCheckin?.morning?.balance)  setBalance(todayCheckin.morning.balance);
    if (todayCheckin?.evening?.done)     setDone(todayCheckin.evening.done);
    if (todayCheckin?.evening?.learned)  setLearned(todayCheckin.evening.learned);
    if (todayCheckin?.evening?.tomorrow) setTomorrow(todayCheckin.evening.tomorrow);
  }, []);

  // Auto-generate tasks on load if morning exists and no tasks yet
  useEffect(() => {
    const saved = loadTasks();
    if (!saved && todayCheckin?.morning && profile) {
      generateTasks(todayCheckin.morning.business, todayCheckin.morning.balance);
    }
  }, []);

  /* ── Generate tasks ── */
  const generateTasks = async (biz, bal) => {
    if (!profile) return;

    if (!apiKey) {
      // Placeholders
      const focus = profile.focus || 'Mental';
      const base = PLACEHOLDERS[focus] || PLACEHOLDERS.Mental;
      const built = base.map((t, i) => ({
        id: Date.now() + i,
        title: t.title,
        why: t.why,
        completed: false,
        feedback: null,
        date: todayDateStr(),
      }));
      setTasks(built);
      return;
    }

    const prompt = TASKS_PROMPT(profile, biz, bal, weekHistory);
    const data = await callAIJSON(prompt, { fast: true, max_tokens: 400 });
    if (!data || !Array.isArray(data)) return;

    const built = data.slice(0, 3).map((t, i) => ({
      id: Date.now() + i,
      title: t.title || '',
      why: t.why || '',
      completed: false,
      feedback: null,
      date: todayDateStr(),
    }));
    setTasks(built);
  };

  /* ── Save morning + generate tasks ── */
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
    // Generate tasks after intention is saved
    if (tasks.length === 0) {
      await generateTasks(business.trim(), balance.trim());
    }
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

  /* ── Task actions ── */
  const handleToggle = useCallback((id, completed) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
  }, [setTasks]);

  const handleFeedback = useCallback((id, feedback) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, feedback } : t));
  }, [setTasks]);

  const morningDone = !!todayCheckin?.morning;
  const eveningDone = !!todayCheckin?.evening;
  const showTasks   = morningDone && tasks.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 20px 120px' }} className="md:pl-24">

        {/* ── Header ── */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', color: '#1D1D1F', margin: '0 0 5px', lineHeight: 1.15 }}>
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
              Fără API key, reflecțiile și taskurile AI nu sunt disponibile.
            </p>
            <Link to="/settings" style={{ fontSize: 14, fontWeight: 600, color: '#0071E3', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Configurează →
            </Link>
          </div>
        )}

        {/* ── Morning (not done) ── */}
        {!morningDone && (mode === 'morning' || mode === 'day') && (
          <MorningCard
            business={business} setBusiness={setBusiness}
            balance={balance}   setBalance={setBalance}
            onSave={handleMorning} loading={loadingIntent || loadingTasks}
          />
        )}

        {/* ── Morning done: intention summary ── */}
        {morningDone && !eveningDone && <DayCard checkin={todayCheckin} />}

        {/* ── Tasks section ── */}
        {(showTasks || loadingTasks) && (
          <div style={{ marginBottom: 14, marginTop: morningDone ? 4 : 0 }}>
            <TasksSection
              tasks={tasks}
              tasksLoading={loadingTasks && tasks.length === 0}
              profile={profile}
              apiKey={apiKey}
              onToggle={handleToggle}
              onFeedback={handleFeedback}
            />
          </div>
        )}

        {/* ── Evening (not done, after 17:00) ── */}
        {mode === 'evening' && !eveningDone && (
          <EveningCard
            done={done} setDone={setDone}
            learned={learned} setLearned={setLearned}
            tomorrow={tomorrow} setTomorrow={setTomorrow}
            onSave={handleEvening} loading={loadingIntent}
          />
        )}

        {/* ── Late arrival: morning form ── */}
        {mode === 'evening' && !morningDone && !eveningDone && (
          <MorningCard
            business={business} setBusiness={setBusiness}
            balance={balance}   setBalance={setBalance}
            onSave={handleMorning} loading={loadingIntent || loadingTasks}
            lateNote
          />
        )}

        {/* ── Full day completed ── */}
        {eveningDone && <CompletedCard checkin={todayCheckin} />}

        {/* ── Streak ── */}
        {streak > 0 && (
          <div className="fade-up-2" style={{ textAlign: 'center', marginTop: 36 }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: '#1D1D1F', letterSpacing: '-1px', display: 'block', lineHeight: 1 }}>
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
