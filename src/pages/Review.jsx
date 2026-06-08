import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';

function buildReviewPrompt(profile, weekCheckins) {
  const days = weekCheckins.map(c => {
    const d = new Date(c.date).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
    const parts = [];
    if (c.morning?.business) parts.push(`intenție antreprenor: "${c.morning.business}"`);
    if (c.morning?.balance)  parts.push(`intenție echilibru: "${c.morning.balance}"`);
    if (c.evening?.done)     parts.push(`realizat: "${c.evening.done}"`);
    if (c.evening?.learned)  parts.push(`învățat: "${c.evening.learned}"`);
    if (c.evening?.tomorrow) parts.push(`îmbunătățire: "${c.evening.tomorrow}"`);
    return `${d}:\n  ${parts.join('\n  ')}`;
  }).join('\n\n');

  return `Ești un coach de creștere personală bazat pe filozofia Jim Rohn.
Utilizator: ${profile?.name}, identitate=[${profile?.identity?.join(', ')}], focus=${profile?.focus}.
Datele din ultimele 7 zile:
${days || 'Nu există date înregistrate.'}

Generează un review săptămânal în format JSON strict:
{
  "title": "O frază care definește această săptămână",
  "wins": ["realizare concretă 1", "realizare concretă 2", "realizare concretă 3"],
  "lesson": "Lecția principală a săptămânii, extrasă din ce a scris utilizatorul",
  "score": 7,
  "scoreReason": "Explicație scurtă pentru scor (1-2 propoziții)",
  "nextFocus": "Un singur focus clar pentru săptămâna viitoare"
}
Scorul e de la 1 la 10. Fii direct, nu laudă fals. Răspunde DOAR cu JSON valid.`;
}

export default function Review() {
  const { profile, checkins, reviews, setReviews, apiKey } = useApp();
  const { callAIJSON, loading } = useAI();
  const [expanded, setExpanded] = useState(null);

  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const weekCheckins = checkins
    .filter(c => new Date(c.date) >= weekStart)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleGenerate = async () => {
    if (!apiKey) return;
    const data = await callAIJSON(buildReviewPrompt(profile, weekCheckins), { fast: false, max_tokens: 800 });
    if (!data) return;
    const weekOf = weekStart.toISOString();
    const review = {
      id: Date.now(),
      weekOf,
      generatedAt: new Date().toISOString(),
      checkinCount: weekCheckins.length,
      title:       data.title       || '',
      wins:        data.wins        || [],
      lesson:      data.lesson      || '',
      score:       data.score       || 5,
      scoreReason: data.scoreReason || '',
      nextFocus:   data.nextFocus   || '',
    };
    setReviews(prev => [...prev.filter(r => r.weekOf !== weekOf), review]);
    setExpanded(review.id);
  };

  const sorted = [...reviews].sort((a, b) => new Date(b.weekOf) - new Date(a.weekOf));
  const thisWeekReview = sorted.find(r => new Date(r.weekOf) >= weekStart && new Date(r.weekOf) < new Date(weekStart.getTime() + 7 * 86400000));

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 100px' }} className="md:pl-24">

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1D1D1F' }}>Review</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6E6E73' }}>
            Săptămâna aceasta: {weekCheckins.length} {weekCheckins.length === 1 ? 'zi' : 'zile'} înregistrate
          </p>
        </div>

        {/* Generate card */}
        {!apiKey ? (
          <div style={{
            background: '#FFF3CD', border: '1px solid #FFD60A',
            borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          }}>
            <p style={{ margin: 0, fontSize: 13, color: '#856404', lineHeight: 1.5 }}>
              Configurează un API Key în Setări pentru a genera review-uri AI.
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#1D1D1F' }}>
              Review săptămâna aceasta
            </h2>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#6E6E73', lineHeight: 1.5 }}>
              {weekCheckins.length === 0
                ? 'Nu ai date înregistrate săptămâna aceasta. Review-ul va fi bazat pe profilul tău.'
                : `Bazat pe ${weekCheckins.length} ${weekCheckins.length === 1 ? 'zi înregistrată' : 'zile înregistrate'}.`}
            </p>
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading
                ? 'Se analizează...'
                : thisWeekReview ? 'Regenerează review' : 'Generează review'}
            </button>
          </div>
        )}

        {/* Reviews list */}
        {sorted.map(r => (
          <ReviewCard
            key={r.id}
            review={r}
            isExpanded={expanded === r.id}
            onToggle={() => setExpanded(expanded === r.id ? null : r.id)}
          />
        ))}

        {sorted.length === 0 && !loading && (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <p style={{ color: '#AEAEB2', fontSize: 14 }}>Primul tău review apare după ce îl generezi.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review, isExpanded, onToggle }) {
  const scoreColor = review.score >= 8 ? '#34C759' : review.score >= 5 ? '#0071E3' : '#FF9500';

  return (
    <div className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1D1D1F', lineHeight: 1.3 }}>
            {review.title || 'Review'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#AEAEB2' }}>
            {new Date(review.weekOf).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>{review.score}</span>
          <span style={{ fontSize: 18, color: '#C7C7CC' }}>{isExpanded ? '↑' : '↓'}</span>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="fade-up" style={{ padding: '0 20px 20px', borderTop: '1px solid #F2F2F7' }}>

          {/* Wins */}
          {review.wins?.length > 0 && (
            <Section icon="✓" label="Realizări" color="#34C759">
              {review.wins.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#34C759', fontSize: 13, flexShrink: 0, marginTop: 1 }}>•</span>
                  <p style={{ margin: 0, fontSize: 14, color: '#1D1D1F', lineHeight: 1.5 }}>{w}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Lesson */}
          {review.lesson && (
            <Section icon="→" label="Lecția săptămânii" color="#0071E3">
              <p style={{ margin: 0, fontSize: 14, color: '#1D1D1F', lineHeight: 1.6 }}>{review.lesson}</p>
            </Section>
          )}

          {/* Score */}
          <Section icon={null} label="Scor mental" color="#6E6E73">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor }}>{review.score}</span>
              <span style={{ fontSize: 14, color: '#6E6E73' }}>/ 10</span>
            </div>
            {review.scoreReason && (
              <p style={{ margin: 0, fontSize: 13, color: '#6E6E73', lineHeight: 1.5 }}>{review.scoreReason}</p>
            )}
          </Section>

          {/* Next focus */}
          {review.nextFocus && (
            <div style={{
              background: '#F0F7FF', borderRadius: 12, padding: '14px 16px',
              borderLeft: '3px solid #0071E3', marginTop: 4,
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#0071E3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Focus săptămâna viitoare
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1D1D1F', lineHeight: 1.5 }}>{review.nextFocus}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon, label, color, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
      </p>
      {children}
    </div>
  );
}
