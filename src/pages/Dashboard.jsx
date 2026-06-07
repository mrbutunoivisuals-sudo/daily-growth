import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Zap, Target, MessageCircle, CheckSquare, Sun, Moon, BarChart2, Download, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';
import { buildInsightPrompt } from '../utils/aiPrompts.js';

function greeting(name) {
  const h = new Date().getHours();
  if (h < 5)  return `Noapte bună, ${name}`;
  if (h < 12) return `Bună dimineața, ${name}`;
  if (h < 18) return `Bună ziua, ${name}`;
  return `Bună seara, ${name}`;
}

function ScoreRing({ value, color, size = 56 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ - (value / 100) * circ}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontSize: 12, fill: '#e2e8f0', fontWeight: 600 }}>
        {value}
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, habits, goals, streak, morningDone, eveningDone, habitsCompletedToday, lifeScore, exportData, touchStreak } = useApp();
  const { callAIJSON, loading: aiLoading } = useAI();
  const [insight, setInsight] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dg_daily_insight')); } catch { return null; }
  });

  useEffect(() => { if (profile) touchStreak(); }, []);

  const loadInsight = async () => {
    const result = await callAIJSON(buildInsightPrompt(profile));
    if (result) {
      setInsight(Array.isArray(result) ? result[0] : result);
      sessionStorage.setItem('dg_daily_insight', JSON.stringify(Array.isArray(result) ? result[0] : result));
    }
  };

  useEffect(() => { if (profile && !insight) loadInsight(); }, [profile]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `daily-growth-${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  if (!profile) { navigate('/onboarding'); return null; }

  const todayGoal = goals.find(g => g.horizon === 'today' && g.status !== 'done');
  const todayDate = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
  const habitsTotal = habits.length;

  const QUICK = [
    { to: '/checkin',  icon: morningDone ? Moon : Sun,  label: morningDone ? 'Check-in seară' : 'Check-in dimineață', color: morningDone ? '#8b5cf6' : '#f59e0b', done: morningDone && eveningDone },
    { to: '/coach',    icon: MessageCircle,              label: 'Vorbește cu Coach',    color: '#6366f1' },
    { to: '/goals',    icon: Target,                     label: 'Obiectivele mele',     color: '#10b981' },
    { to: '/habits',   icon: Zap,                        label: 'Obiceiurile mele',     color: '#f97316' },
  ];

  const SCORES = [
    { label: 'Obiceiuri',   value: lifeScore.habits,    color: '#6366f1' },
    { label: 'Obiective',   value: lifeScore.goals,     color: '#10b981' },
    { label: 'Check-ins',   value: lifeScore.checkins,  color: '#f59e0b' },
    { label: 'Provocări',   value: lifeScore.challenges,color: '#ec4899' },
    { label: 'Mentalitate', value: lifeScore.mindset,   color: '#8b5cf6' },
    { label: 'Sănătate',    value: lifeScore.health,    color: '#06b6d4' },
  ];

  return (
    <div className="min-h-screen md:pl-16 pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <p className="text-slate-500 text-sm capitalize">{todayDate}</p>
            <h1 className="text-2xl font-bold text-slate-100 mt-0.5">{greeting(profile.name)}</h1>
            {streak.current > 1 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Flame size={14} className="text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">{streak.current} zile consecutiv</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"><Download size={15} /></button>
            <Link to="/settings" className="w-9 h-9 glass rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"><Settings size={15} /></Link>
          </div>
        </motion.div>

        {/* Life Score Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass rounded-3xl p-6 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
          <div className="relative flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient">{lifeScore.overall}</div>
              <div className="text-xs text-slate-500 mt-1">Life Score</div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                {SCORES.map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <ScoreRing value={s.value} color={s.color} size={48} />
                    <span className="text-[10px] text-slate-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Focus */}
        {todayGoal ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-5 mb-5 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-indigo-400" />
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">Focusul de azi</span>
            </div>
            <p className="text-slate-100 font-semibold">{todayGoal.title}</p>
            <button onClick={() => navigate('/goals')} className="text-xs text-slate-500 hover:text-indigo-400 mt-2 transition-colors flex items-center gap-1">
              Marchează ca făcut <ArrowRight size={12} />
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-5 mb-5 border border-dashed border-white/10">
            <p className="text-slate-500 text-sm">Niciun obiectiv pentru azi.</p>
            <Link to="/goals" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1 transition-colors">
              Adaugă un obiectiv <ArrowRight size={12} />
            </Link>
          </motion.div>
        )}

        {/* Habits today */}
        {habitsTotal > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-orange-400" />
                <span className="text-sm font-medium text-slate-300">Obiceiuri azi</span>
              </div>
              <Link to="/habits" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Vezi toate →
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-orange-400 rounded-full"
                  animate={{ width: `${(habitsCompletedToday / habitsTotal) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }} />
              </div>
              <span className="text-sm font-semibold text-slate-300">{habitsCompletedToday}/{habitsTotal}</span>
            </div>
          </motion.div>
        )}

        {/* AI Insight */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 mb-5 min-h-[80px] flex items-center">
          {aiLoading ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-6 h-6 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />
              <p className="text-slate-500 text-sm">Coach-ul generează insight-ul tău...</p>
            </div>
          ) : insight ? (
            <div className="flex items-start gap-3 w-full">
              <span className="text-xl flex-shrink-0">✨</span>
              <div>
                <p className="text-xs text-indigo-400 font-medium mb-1">{insight.title || 'Insight zilnic'}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{insight.text || insight}</p>
              </div>
              <button onClick={loadInsight} className="ml-auto text-slate-600 hover:text-slate-400 text-xs flex-shrink-0 transition-colors">↻</button>
            </div>
          ) : (
            <button onClick={loadInsight} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-400 transition-colors w-full">
              <span>✨</span> Generează insight AI pentru azi
            </button>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3">
          {QUICK.map(({ to, icon: Icon, label, color, done }, i) => (
            <Link key={to} to={to}>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                className={`glass rounded-2xl p-4 transition-all hover:border-white/15 ${done ? 'opacity-50' : ''}`}>
                <Icon size={20} style={{ color }} className="mb-3" />
                <p className="text-sm font-medium text-slate-200 leading-snug">{label}</p>
                {done && <p className="text-xs text-slate-500 mt-1">Completat ✓</p>}
              </motion.div>
            </Link>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
