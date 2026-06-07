import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Circle, ChevronDown, ChevronUp, Trash2, Target } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const HORIZONS = [
  { value: 'vision', label: 'Viziune',    color: '#8b5cf6', desc: 'Direcția vieții tale' },
  { value: 'year',   label: 'Acest an',   color: '#6366f1', desc: '12 luni' },
  { value: 'quarter',label: 'Trimestru',  color: '#06b6d4', desc: '90 de zile' },
  { value: 'month',  label: 'Luna asta',  color: '#10b981', desc: '30 de zile' },
  { value: 'week',   label: 'Săptămâna', color: '#f59e0b', desc: '7 zile' },
  { value: 'today',  label: 'Azi',        color: '#f97316', desc: 'Focusul zilei' },
];

const CATS = ['Business','Sănătate','Finanțe','Relații','Mentalitate','Învățare','Productivitate','Altele'];

function GoalItem({ goal, onToggle, onDelete, onProgress }) {
  const [expanded, setExpanded] = useState(false);
  const h = HORIZONS.find(h => h.value === goal.horizon);
  const isDone = goal.status === 'done';

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl overflow-hidden transition-all ${isDone ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3 p-4">
        <button onClick={() => onToggle(goal.id)} className="mt-0.5 flex-shrink-0">
          {isDone
            ? <CheckCircle size={18} className="text-emerald-400" />
            : <Circle size={18} className="text-slate-500" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>{goal.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${h?.color}20`, color: h?.color }}>{h?.label}</span>
            {goal.category && <span className="text-xs text-slate-600">{goal.category}</span>}
          </div>
          {!isDone && goal.horizon !== 'vision' && (
            <div className="mt-2">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${goal.progress || 0}%`, background: h?.color }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-slate-600 hover:text-slate-400 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 text-slate-700 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-white/5">
              {goal.description && <p className="text-xs text-slate-500 mt-3 mb-3">{goal.description}</p>}
              {!isDone && goal.horizon !== 'vision' && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Progres: {goal.progress || 0}%</p>
                  <input type="range" min={0} max={100} value={goal.progress || 0}
                    onChange={e => onProgress(goal.id, Number(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Goals() {
  const { goals, setGoals, profile } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', horizon: 'today', progress: 0 });
  const [filterHorizon, setFilterHorizon] = useState('all');

  const addGoal = () => {
    if (!form.title.trim()) return;
    setGoals(prev => [...prev, { ...form, id: Date.now(), status: 'active', createdAt: new Date().toISOString() }]);
    setForm({ title: '', description: '', category: '', horizon: 'today', progress: 0 });
    setShowAdd(false);
  };

  const toggleGoal = (id) => setGoals(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'done' ? 'active' : 'done' } : g));
  const deleteGoal = (id) => setGoals(prev => prev.filter(g => g.id !== id));
  const updateProgress = (id, p) => setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: p } : g));

  const filtered = filterHorizon === 'all' ? goals : goals.filter(g => g.horizon === filterHorizon);
  const active = filtered.filter(g => g.status !== 'done');
  const done = filtered.filter(g => g.status === 'done');

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Obiectivele mele</h1>
            <p className="text-slate-500 text-sm mt-0.5">{active.length} active · {done.length} completate</p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Adaugă
          </motion.button>
        </div>

        {/* Horizon filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          <button onClick={() => setFilterHorizon('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterHorizon === 'all' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
            Toate
          </button>
          {HORIZONS.map(h => (
            <button key={h.value} onClick={() => setFilterHorizon(h.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterHorizon === h.value ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              style={filterHorizon === h.value ? { background: `${h.color}30`, color: h.color } : {}}>
              {h.label}
            </button>
          ))}
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass rounded-2xl p-5 mb-5">
              <h3 className="font-semibold text-slate-200 mb-4 text-sm">Obiectiv nou</h3>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addGoal()}
                placeholder="Ce vrei să realizezi?" autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 mb-3" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detalii opționale..." rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/40 resize-none mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Orizont</label>
                  <select value={form.horizon} onChange={e => setForm(f => ({ ...f, horizon: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm focus:outline-none">
                    {HORIZONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Categorie</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm focus:outline-none">
                    <option value="">Fără</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 glass rounded-xl text-slate-400 text-sm hover:text-slate-200 transition-colors">Anulează</button>
                <button onClick={addGoal} disabled={!form.title.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">Adaugă</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals list */}
        {active.length === 0 && !showAdd ? (
          <div className="text-center py-16">
            <Target size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Niciun obiectiv activ.</p>
            <button onClick={() => setShowAdd(true)} className="text-indigo-400 text-sm mt-2 hover:text-indigo-300 transition-colors">Adaugă primul obiectiv →</button>
          </div>
        ) : (
          <div className="space-y-2">
            {active.map(g => <GoalItem key={g.id} goal={g} onToggle={toggleGoal} onDelete={deleteGoal} onProgress={updateProgress} />)}
            {done.length > 0 && (
              <>
                <p className="text-xs text-slate-600 mt-4 mb-2 px-1">Completate ({done.length})</p>
                {done.map(g => <GoalItem key={g.id} goal={g} onToggle={toggleGoal} onDelete={deleteGoal} onProgress={updateProgress} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
