import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';

function buildCoachPrompt(profile, weekHistory, userMessage, history) {
  const weekSummary = weekHistory.length === 0
    ? 'Nu există date din această săptămână.'
    : weekHistory.map(c => {
        const d = new Date(c.date).toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric' });
        const parts = [];
        if (c.morning?.business) parts.push(`intenție: "${c.morning.business}"`);
        if (c.evening?.done)     parts.push(`realizat: "${c.evening.done}"`);
        if (c.evening?.learned)  parts.push(`învățat: "${c.evening.learned}"`);
        return `${d}: ${parts.join(' | ')}`;
      }).join('\n');

  const conversationHistory = history.slice(-10).map(m =>
    `${m.role === 'user' ? 'Utilizator' : 'Coach'}: ${m.content}`
  ).join('\n');

  return `Ești un coach de creștere personală bazat pe filozofia Jim Rohn.
Profilul utilizatorului: nume=${profile?.name}, identitate=[${profile?.identity?.join(', ')}], focus=${profile?.focus}.
Istoricul acestei săptămâni:
${weekSummary}
${conversationHistory ? `\nConversație anterioară:\n${conversationHistory}` : ''}
Principii de urmat:
- Disciplină > motivație
- Identitate > comportament
- Răspunde, nu reacționa
- Pune întrebări care duc la propria înțelegere
- Nu da discursuri. Nu fi pozitiv fals. Fii direct și practic.
- Răspunsul are maxim 4 paragrafe scurte
- Ultimul paragraf e întotdeauna o întrebare de reflecție
Răspunde în română.

Utilizator: ${userMessage}`;
}

const STARTERS = [
  'De ce nu reușesc să fiu consistent?',
  'Cum știu dacă sunt pe drumul cel bun?',
  'Ce înseamnă disciplina în practică?',
  'Cum îmi reconstruiesc un obicei pierdut?',
];

export default function Coach() {
  const { profile, coach, appendCoachMsg, clearCoach, weekHistory } = useApp();
  const { callAI, loading } = useAI();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coach]);

  const send = async (message) => {
    const msg = (message || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    appendCoachMsg(userMsg);

    const prompt = buildCoachPrompt(profile, weekHistory, msg, coach);
    const response = await callAI(prompt, { fast: false, max_tokens: 600 });
    if (response) {
      appendCoachMsg({
        role: 'assistant', content: response,
        timestamp: new Date().toISOString(),
        isNew: true,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <div
        style={{ maxWidth: 600, margin: '0 auto', width: '100%', minHeight: '100vh', paddingLeft: 20, paddingRight: 20 }}
        className="md:pl-24 md:pr-8"
      >
        {/* ── Header ── */}
        <div className="fade-up" style={{
          paddingTop: 36, paddingBottom: 20,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{
              margin: 0, fontSize: 32, fontWeight: 700,
              letterSpacing: '-0.5px', color: '#1D1D1F', lineHeight: 1.1,
            }}>Coach</h1>
            <p style={{ margin: '5px 0 0', fontSize: 14, color: '#0071E3', fontWeight: 500 }}>
              Filozofia Jim Rohn. Direct și practic.
            </p>
          </div>
          {coach.length > 0 && (
            <button
              onClick={() => clearCoach()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#AEAEB2', fontSize: 13, padding: '8px 0', marginTop: 4,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#6E6E73'}
              onMouseLeave={e => e.currentTarget.style.color = '#AEAEB2'}
            >
              Șterge istoricul
            </button>
          )}
        </div>

        {/* ── Messages area ── */}
        <div style={{ paddingBottom: 120 }}>
          {coach.length === 0 ? (
            <div className="fade-up-1">
              <p style={{ color: '#6E6E73', fontSize: 16, marginBottom: 20, lineHeight: 1.6 }}>
                Cu ce mă pot ajuta astăzi, {profile?.name}?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STARTERS.map((s, i) => (
                  <StarterButton key={s} text={s} delay={i * 0.06} onClick={() => send(s)} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              {coach.map((m, i) => (
                <MessageBubble key={i} message={m} isLatest={i === coach.length - 1} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Fixed input bar ── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(245,245,247,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.07)',
          padding: '12px 20px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          zIndex: 40,
        }}>
          <div
            style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}
            className="md:pl-4"
          >
            <textarea
              className="input-field"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrie o întrebare sau o situație..."
              style={{
                flex: 1, resize: 'none', minHeight: 48, maxHeight: 130,
                lineHeight: 1.5, padding: '13px 16px', overflow: 'auto',
                fontSize: 16,
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ padding: '13px 20px', fontSize: 18, flexShrink: 0, borderRadius: 14 }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', animation: 'pulse 1s ease infinite' }}>···</span>
              ) : '↑'}
            </button>
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
        </div>
      </div>
    </div>
  );
}

/* ── Starter button ── */
function StarterButton({ text, delay, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? '#0071E3' : '#E5E5EA'}`,
        borderRadius: 14, padding: '14px 18px', textAlign: 'left', cursor: 'pointer',
        fontSize: 15, color: '#1D1D1F', lineHeight: 1.4,
        boxShadow: hovered ? '0 4px 14px rgba(0,113,227,0.10)' : '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'all 0.15s ease',
        animation: `fadeUp 0.4s ease ${delay}s both`,
      }}
    >
      {text}
    </button>
  );
}

/* ── Message bubble ── */
function MessageBubble({ message, isLatest }) {
  const isUser = message.role === 'user';
  // Animate only the latest assistant message
  const shouldAnimate = !isUser && message.isNew;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      animation: shouldAnimate ? 'msgIn 0.35s ease forwards' : 'none',
    }}>
      {/* Avatar dot for assistant */}
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 9, background: '#0071E3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginRight: 10, marginTop: 2,
        }}>
          <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>DG</span>
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        background: isUser ? '#0071E3' : '#FFFFFF',
        color: isUser ? '#fff' : '#1D1D1F',
        borderRadius: isUser ? '20px 20px 5px 20px' : '5px 20px 20px 20px',
        padding: '14px 18px',
        fontSize: 17, lineHeight: 1.6,
        boxShadow: isUser ? 'none' : '0 2px 12px rgba(0,0,0,0.08)',
        border: isUser ? 'none' : '1px solid rgba(0,0,0,0.05)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {message.content}
      </div>
    </div>
  );
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 9, background: '#0071E3',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>DG</span>
      </div>
      <div style={{
        background: '#fff', borderRadius: '5px 20px 20px 20px',
        padding: '14px 18px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#C7C7CC',
            animation: `bounce 1.1s ease infinite ${i * 0.18}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.5} 40%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  );
}
