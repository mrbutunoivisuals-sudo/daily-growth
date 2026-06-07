import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, RefreshCw, CheckCircle2, Lock, Trophy, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';

const FOCUS_CHALLENGES = {
  mindset:  ['Scrie 3 gânduri negative și rescrie-le pozitiv', 'Meditează 5 minute în liniște completă', 'Spune cuiva ceva ce ai evitat să spui', 'Citește 10 pagini dintr-o carte de development', 'Fă un lucru de care ți-e ușor frică'],
  fitness:  ['30 de flotări acum, chiar dacă le împarți', 'Bea 2L de apă azi și bifează fiecare pahar', 'Mergi 20 de minute fără telefon', 'Coboară cu scările în loc de lift toată ziua', 'Fă 100 de genoflexiuni distribuite pe zi'],
  business: ['Contactează un lead pe care l-ai tot amânat', 'Scrie un post de valoare pe LinkedIn', 'Cere un feedback sincer de la un client', 'Identifică 3 oportunități de revenue noi', 'Delegă un task pe care nu ar trebui să-l faci tu'],
  finance:  ['Auditează abonamentele — taie unul inutil', 'Calculează exact cât ai cheltuit luna asta', 'Pune deoparte 10% din ce câștigi azi', 'Citește 20 min despre investiții', 'Găsește o sursă de economisire neexploatată'],
  relations:['Trimite un mesaj sincer cuiva care contează', 'Fă un compliment specific și neașteptat', 'Ascultă activ în orice conversație azi — fără să te gândești la răspuns', 'Planifică o activitate cu cineva important', 'Rezolvă o tensiune mică care tot durează'],
  learning: ['Explică un concept complex unui prieten', 'Încearcă o tehnică nouă la ceva familiar', 'Urmărește un tutorial de 15 min și aplică imediat', 'Scrie rezumatul a ce ai învățat ieri', 'Predă ceva: înregistrează 2 minute explicând un concept'],
};

function buildChallengePrompt(profile) {
  const focus = profile?.focus || 'mindset';
  const goal = profile?.goal90 || '';
  const name = profile?.name || 'utilizator';
  return `Generează o provocare zilnică specifică și acționabilă pentru ${name}. Focus: ${focus}. Obiectiv 90 zile: "${goal}".
Cerințe: concretă, realizabilă în aceeași zi, puțin inconfortabilă dar nu imposibilă.
{"title":"Titlul provocării (max 8 cuvinte)","description":"Ce trebuie să facă exact (2 propoziții)","duration":"X min","category":"${focus}","difficulty":"ușor|mediu|provocator"}
Răspunde DOAR cu JSON valid, fără markdown, fără \`\`\`, fără text înainte sau după. Începe direct cu {.`;
}

export default function Challenges() {
  const { profile, challenges, setChallenges, apiKey, touchStreak } = useApp();
  const { callAIJSON, loading } = useAI();

  const todayKey = new Date().toDateString();
  const todayChallenge = challenges.find(c => new Date(c.date).toDateString() === todayKey);

  const streak = (() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toDateString();
      const ch = challenges.find(c => new Date(c.date).toDateString() === key);
      if (ch?.completed) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  const generateChallenge = async () => {
    if (!apiKey) return;
    try {
      const data = await callAIJSON(buildChallengePrompt(profile), { fast: true });
      const challenge = {
        id: Date.now(),
        date: new Date().toISOString(),
        completed: false,
        ...data,
      };
      setChallenges(prev => [...prev.filter(c => new Date(c.date).toDateString() !== todayKey), challenge]);
    } catch {
      // fallback: use static challenge
      const focus = profile?.focus || 'mindset';
      const list = FOCUS_CHALLENGES[focus] || FOCUS_CHALLENGES.mindset;
      const idx = new Date().getDate() % list.length;
      const challenge = {
        id: Date.now(),
        date: new Date().toISOString(),
        completed: false,
        title: list[idx],
        description: 'Finalizează această provocare înainte de finalul zilei.',
        duration: '15-30 min',
        category: focus,
        difficulty: 'mediu',
      };
      setChallenges(prev => [...prev.filter(c => new Date(c.date).toDateString() !== todayKey), challenge]);
    }
  };

  useEffect(() => {
    if (!todayChallenge) generateChallenge();
  }, []);

  const completeChallenge = () => {
    setChallenges(prev => prev.map(c =>
      c.id === todayChallenge.id ? { ...c, completed: true, completedAt: new Date().toISOString() } : c
    ));
    touchStreak();
  };

  const past = challenges
    .filter(c => new Date(c.date).toDateString() !== todayKey)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 14);

  const DIFF_COLOR = { 'ușor': 'text-emerald-400', 'mediu': 'text-amber-400', 'provocator': 'text-red-400' };

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Provocări zilnice</h1>
            <p className="text-slate-500 text-sm mt-0.5">O provocare pe zi te menține în mișcare</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/15 rounded-xl">
              <Flame size={14} className="text-orange-400" />
              <span className="text-orange-300 font-semibold text-sm">{streak}</span>
            </div>
          )}
        </div>

        {/* Today's challenge */}
        <AnimatePresence mode="wait">
          {loading && !todayChallenge ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass rounded-3xl p-8 mb-6 text-center">
              <div className="flex justify-center gap-1.5 mb-3">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-500"
                    animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }} />
                ))}
              </div>
              <p className="text-slate-500 text-sm">Se generează provocarea de azi...</p>
            </motion.div>
          ) : todayChallenge ? (
            <motion.div key="challenge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-3xl p-6 mb-6 ${todayChallenge.completed ? 'border border-emerald-500/20' : 'border border-indigo-500/10'}`}>
              {/* Badge row */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 font-medium capitalize">
                  {todayChallenge.category}
                </span>
                <span className={`text-xs font-medium ${DIFF_COLOR[todayChallenge.difficulty] || 'text-slate-400'}`}>
                  {todayChallenge.difficulty}
                </span>
                {todayChallenge.duration && (
                  <span className="text-xs text-slate-600 ml-auto">{todayChallenge.duration}</span>
                )}
              </div>

              <h2 className="text-lg font-semibold text-slate-100 mb-2 leading-snug">{todayChallenge.title}</h2>
              {todayChallenge.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{todayChallenge.description}</p>
              )}

              {todayChallenge.completed ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">Completat! Excellent 🎉</span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={completeChallenge}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors">
                    Am completat provocarea ✓
                  </motion.button>
                  {apiKey && (
                    <button onClick={generateChallenge} disabled={loading}
                      className="w-11 h-11 flex items-center justify-center glass rounded-xl text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
                      title="Generează altă provocare">
                      <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" className="glass rounded-3xl p-8 mb-6 text-center">
              <Zap size={28} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">Nu s-a putut genera provocarea.</p>
              <button onClick={generateChallenge} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
                Încearcă din nou
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        {challenges.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total', value: challenges.length, icon: '🎯' },
              { label: 'Completate', value: challenges.filter(c => c.completed).length, icon: '✅' },
              { label: 'Serie max', value: (() => {
                let max = 0, cur = 0;
                const sorted = [...challenges].sort((a,b) => new Date(a.date) - new Date(b.date));
                sorted.forEach(c => { if (c.completed) { cur++; max = Math.max(max, cur); } else cur = 0; });
                return max;
              })(), icon: '🔥' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-3 text-center">
                <p className="text-xl mb-1">{s.icon}</p>
                <p className="text-lg font-bold text-slate-200">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {past.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-slate-500 font-medium mb-3">Istoric provocări</p>
            <div className="space-y-2">
              {past.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${c.completed ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                    {c.completed
                      ? <CheckCircle2 size={12} className="text-emerald-400" />
                      : <Lock size={10} className="text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${c.completed ? 'text-slate-300' : 'text-slate-500 line-through'}`}>{c.title}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {new Date(c.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No API key notice */}
        {!apiKey && (
          <div className="mt-4 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <p className="text-xs text-amber-300">💡 Adaugă un API Key în Setări pentru provocări personalizate AI. Acum primești provocări predefinite.</p>
          </div>
        )}
      </div>
    </div>
  );
}
