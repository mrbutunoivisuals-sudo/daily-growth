import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Trash2, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const EMOJI_OPTIONS = ['💪','📚','🧘','🏃','💧','🥗','😴','✍️','🎯','🧠','💰','❤️'];

function HabitStreak({ completions }) {
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const str = d.toDateString();
    return (completions || []).some(c => new Date(c).toDateString() === str);
  });
  return (
    <div className="flex gap-0.5">
      {last14.map((done, i) => (
        <div key={i} className="w-3 h-3 rounded-sm transition-all"
          style={{ background: done ? '#6366f1' : 'rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  );
}

function calcStreak(completions) {
  if (!completions?.length) return 0;
  let streak = 0;
  const d = new Date();
  while (true) {
    const str = d.toDateString();
    if (completions.some(c => new Date(c).toDateString() === str)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export default function Habits() {
  const { habits, setHabits, touchStreak } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', emoji: '💪', description: '' });

  const todayStr = new Date().toDateString();

  const toggleToday = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const alreadyDone = (h.completions || []).some(c => new Date(c).toDateString() === todayStr);
      const completions = alreadyDone
        ? h.completions.filter(c => new Date(c).toDateString() !== todayStr)
        : [...(h.completions || []), new Date().toISOString()];
      return { ...h, completions };
    }));
    touchStreak();
  };

  const addHabit = () => {
    if (!form.name.trim()) return;
    setHabits(prev => [...prev, { id: Date.now(), ...form, completions: [], createdAt: new Date().toISOString() }]);
    setForm({ name: '', emoji: '💪', description: '' });
    setShowAdd(false);
  };

  const deleteHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id));

  const completedToday = habits.filter(h => (h.completions || []).some(c => new Date(c).toDateString() === todayStr));
  const allDone = habits.length > 0 && completedToday.length === habits.length;

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Obiceiuri</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {completedToday.length}/{habits.length} completate azi
              {allDone && habits.length > 0 && ' 🔥'}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Adaugă
          </motion.button>
        </div>

        {/* Progress bar */}
        {habits.length > 0 && (
          <div className="glass rounded-2xl p-4 mb-5">
            <div className="flex justify-between mb-2 text-xs text-slate-500">
              <span>Progres azi</span>
              <span>{Math.round((completedToday.length / habits.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-indigo-500"
                animate={{ width: `${(completedToday.length / habits.length) * 100}%` }}
                transition={{ duration: 0.6 }} />
            </div>
          </div>
        )}

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass rounded-2xl p-5 mb-5">
              <h3 className="font-semibold text-slate-200 mb-4 text-sm">Obicei nou</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className={`w-9 h-9 rounded-xl text-lg transition-all ${form.emoji === e ? 'bg-indigo-500/30 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                    {e}
                  </button>
                ))}
              </div>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addHabit()} placeholder="Numele obiceiului..." autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 mb-3" />
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 glass rounded-xl text-slate-400 text-sm hover:text-slate-200 transition-colors">Anulează</button>
                <button onClick={addHabit} disabled={!form.name.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">Adaugă</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habits list */}
        {habits.length === 0 && !showAdd ? (
          <div className="text-center py-16">
            <Zap size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Niciun obicei adăugat.</p>
            <button onClick={() => setShowAdd(true)} className="text-indigo-400 text-sm mt-2 hover:text-indigo-300 transition-colors">Creează primul obicei →</button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {habits.map(h => {
                const doneToday = (h.completions || []).some(c => new Date(c).toDateString() === todayStr);
                const streak = calcStreak(h.completions);
                return (
                  <motion.div key={h.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 flex items-center gap-4">
                    {/* One-tap button */}
                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => toggleToday(h.id)}
                      className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                        doneToday ? 'bg-indigo-500/30 shadow-lg shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10'
                      }`}>
                      {h.emoji}
                    </motion.button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium text-sm ${doneToday ? 'text-slate-300' : 'text-slate-200'}`}>{h.name}</p>
                        {streak > 1 && (
                          <div className="flex items-center gap-1">
                            <Flame size={11} className="text-orange-400" />
                            <span className="text-xs text-orange-400 font-medium">{streak}</span>
                          </div>
                        )}
                        {doneToday && <span className="text-xs text-emerald-400">✓</span>}
                      </div>
                      <HabitStreak completions={h.completions} />
                    </div>
                    <button onClick={() => deleteHabit(h.id)} className="p-1.5 text-slate-700 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
