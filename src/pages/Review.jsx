import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, TrendingUp, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';
import { buildWeeklyReviewPrompt } from '../utils/aiPrompts.js';

function ScoreMeter({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#6366f1' : '#f59e0b';
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-100">{score}</span>
        <span className="text-xs text-slate-500">/ 100</span>
      </div>
    </div>
  );
}

function ReviewCard({ review, expanded, onToggle }) {
  const label = review.score >= 80 ? 'Săptămână excelentă 🚀' : review.score >= 60 ? 'Săptămână bună 📈' : review.score >= 40 ? 'Progres constant 🌱' : 'Îmbunătățire necesară ⚠️';

  return (
    <motion.div layout className="glass rounded-2xl overflow-hidden mb-3">
      <button className="w-full p-4 flex items-center gap-4 text-left" onClick={onToggle}>
        <div className="flex-1">
          <p className="font-semibold text-slate-200 text-sm">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Săptămâna {new Date(review.generatedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold" style={{ color: review.score >= 70 ? '#10b981' : review.score >= 40 ? '#6366f1' : '#f59e0b' }}>
            {review.score}
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4">
              {review.wins?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1.5"><Trophy size={12} /> Victorii</p>
                  <ul className="space-y-1.5">
                    {review.wins.map((w, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-emerald-500 flex-shrink-0">✓</span>{w}</li>)}
                  </ul>
                </div>
              )}
              {review.lessons?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1.5"><Lightbulb size={12} /> Lecții</p>
                  <ul className="space-y-1.5">
                    {review.lessons.map((l, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-amber-500 flex-shrink-0">→</span>{l}</li>)}
                  </ul>
                </div>
              )}
              {review.nextWeekFocus && (
                <div>
                  <p className="text-xs font-medium text-indigo-400 mb-2 flex items-center gap-1.5"><Target size={12} /> Focus săptămâna viitoare</p>
                  <p className="text-sm text-slate-300">{review.nextWeekFocus}</p>
                </div>
              )}
              {review.recommendation && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/15">
                  <p className="text-xs text-indigo-300 leading-relaxed">{review.recommendation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Review() {
  const { profile, checkins, habits, goals, challenges, reviews, setReviews, apiKey } = useApp();
  const { callAIJSON, loading } = useAI();
  const [expandedId, setExpandedId] = useState(null);

  const thisWeekKey = (() => {
    const d = new Date();
    const day = d.getDay();
    const monday = new Date(d); monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return monday.toDateString();
  })();

  const thisWeekReview = reviews.find(r => r.weekKey === thisWeekKey);

  const generateReview = async () => {
    if (!apiKey) return;
    try {
      const prompt = buildWeeklyReviewPrompt(profile, checkins, habits, goals, challenges);
      const data = await callAIJSON(prompt, { fast: false });
      const review = {
        id: Date.now(),
        weekKey: thisWeekKey,
        generatedAt: new Date().toISOString(),
        wins: data.wins || [],
        lessons: data.lessons || [],
        score: data.score || 50,
        nextWeekFocus: data.nextWeekFocus || '',
        recommendation: data.recommendation || '',
      };
      setReviews(prev => [...prev.filter(r => r.weekKey !== thisWeekKey), review]);
      setExpandedId(review.id);
    } catch (e) {
      console.error('Review error:', e);
    }
  };

  const sorted = [...reviews].sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  const past = sorted.filter(r => r.weekKey !== thisWeekKey);

  // Stats
  const avgScore = reviews.length > 0
    ? Math.round(reviews.reduce((a, r) => a + r.score, 0) / reviews.length)
    : null;
  const bestScore = reviews.length > 0 ? Math.max(...reviews.map(r => r.score)) : null;

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Review săptămânal</h1>
            <p className="text-slate-500 text-sm mt-0.5">Reflecție și direcție pentru săptămâna viitoare</p>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/15 rounded-xl">
              <TrendingUp size={14} className="text-indigo-400" />
              <span className="text-indigo-300 font-semibold text-sm">{reviews.length}</span>
            </div>
          )}
        </div>

        {/* This week */}
        {thisWeekReview ? (
          <ReviewCard review={thisWeekReview} expanded={expandedId === thisWeekReview.id}
            onToggle={() => setExpandedId(expandedId === thisWeekReview.id ? null : thisWeekReview.id)} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-6 mb-6 text-center">
            <ScoreMeter score={0} />
            <p className="text-slate-300 font-semibold mt-4 mb-1">Review săptămâna aceasta</p>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Generează un review AI bazat pe activitatea ta din această săptămână: obiceiuri, obiective, check-in-uri și provocări.
            </p>
            {apiKey ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={generateReview} disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <><RefreshCw size={14} className="animate-spin" /> Se analizează săptămâna...</>
                ) : (
                  <><TrendingUp size={14} /> Generează review</>
                )}
              </motion.button>
            ) : (
              <p className="text-xs text-amber-300 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                💡 Adaugă un API Key în Setări pentru a genera review-ul.
              </p>
            )}
          </motion.div>
        )}

        {/* Regenerate */}
        {thisWeekReview && apiKey && (
          <button onClick={generateReview} disabled={loading}
            className="w-full mb-6 py-2.5 glass rounded-xl text-slate-400 hover:text-slate-200 text-sm transition-colors flex items-center justify-center gap-2">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Se regenerează...' : 'Regenerează review'}
          </button>
        )}

        {/* Lifetime stats */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Review-uri', value: reviews.length, icon: '📋' },
              { label: 'Medie scor', value: avgScore, icon: '📊' },
              { label: 'Cel mai bun', value: bestScore, icon: '🏆' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-3 text-center">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-lg font-bold text-slate-200">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Past reviews */}
        {past.length > 0 && (
          <>
            <p className="text-xs text-slate-500 font-medium mb-3">Review-uri anterioare</p>
            {past.map(r => (
              <ReviewCard key={r.id} review={r} expanded={expandedId === r.id}
                onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
