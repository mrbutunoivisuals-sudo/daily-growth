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
  const { profile, coach, setCoach, weekHistory } = useApp();
  const { callAI, loading } = useAI();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coach]);

  const send = async (message) => {
    const msg = (message || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    const newHistory = [...coach, userMsg];
    setCoach(newHistory);

    const prompt = buildCoachPrompt(profile, weekHistory, msg, coach);
    const response = await callAI(prompt, { fast: false, max_tokens: 600 });
    if (response) {
      setCoach(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F5F5F7',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        maxWidth: 600, margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh',
        paddingLeft: 20, paddingRight: 20,
      }} className="md:pl-24 md:pr-8">

        {/* Header */}
        <div style={{ paddingTop: 32, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1D1D1F' }}>Coach</h1>
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6E6E73' }}>Filozofia Jim Rohn. Direct și practic.</p>
          </div>
          {coach.length > 0 && (
            <button
              onClick={() => setCoach([])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AEAEB2', fontSize: 12, padding: '6px 10px' }}
            >
              Șterge istoricul
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, paddingBottom: 100 }}>
          {coach.length === 0 ? (
            <div style={{ paddingTop: 20 }}>
              <p style={{ color: '#6E6E73', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                Cu ce mă pot ajuta astăzi, {profile?.name}?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STARTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      background: '#fff', border: '1px solid #E5E5EA', borderRadius: 12,
                      padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                      fontSize: 14, color: '#1D1D1F',
                      transition: 'border-color 0.15s ease',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#0071E3'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5EA'}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ paddingTop: 8 }}>
              {coach.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input — fixed at bottom */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(245,245,247,0.95)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          padding: '12px 20px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          zIndex: 40,
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }} className="md:pl-4">
            <textarea
              ref={textareaRef}
              className="input-field"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrie o întrebare sau o situație..."
              style={{ flex: 1, resize: 'none', minHeight: 44, maxHeight: 120, lineHeight: 1.5, padding: '11px 14px', overflow: 'auto' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="btn-primary"
              style={{ padding: '11px 18px', flexShrink: 0 }}
            >
              {loading ? '...' : '↑'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14,
    }}>
      <div style={{
        maxWidth: '82%',
        background: isUser ? '#0071E3' : '#fff',
        color: isUser ? '#fff' : '#1D1D1F',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '12px 16px',
        fontSize: 15, lineHeight: 1.6,
        boxShadow: isUser ? 'none' : '0 2px 8px rgba(0,0,0,0.07)',
        whiteSpace: 'pre-wrap',
      }}>
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 14 }}>
      <div style={{
        background: '#fff', borderRadius: '18px 18px 18px 4px',
        padding: '12px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: '#AEAEB2',
            animation: `bounce 1s ease infinite ${i * 0.15}s`,
          }} />
        ))}
        <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
      </div>
    </div>
  );
}
