import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const METRICS = [
  { key: 'habits',    label: 'Obiceiuri',   icon: '⚡', color: '#6366f1', desc: 'Consistența zilnică' },
  { key: 'goals',     label: 'Obiective',   icon: '🎯', color: '#10b981', desc: 'Progres spre ținte' },
  { key: 'checkins',  label: 'Check-ins',   icon: '📝', color: '#f59e0b', desc: 'Reflecție zilnică' },
  { key: 'challenges',label: 'Provocări',   icon: '🔥', color: '#ec4899', desc: 'Ieșit din zona de confort' },
  { key: 'mindset',   label: 'Mentalitate', icon: '🧠', color: '#8b5cf6', desc: 'Din assessment' },
  { key: 'health',    label: 'Sănătate',    icon: '💪', color: '#06b6d4', desc: 'Din assessment' },
  { key: 'career',    label: 'Carieră',     icon: '🚀', color: '#f97316', desc: 'Din assessment' },
  { key: 'finance',   label: 'Finanțe',     icon: '💰', color: '#84cc16', desc: 'Din assessment' },
  { key: 'relations', label: 'Relații',     icon: '❤️', color: '#f43f5e', desc: 'Din assessment' },
  { key: 'purpose',   label: 'Scop',        icon: '✨', color: '#a78bfa', desc: 'Din assessment' },
];

function Bar({ value, color, delay }) {
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden flex-1">
      <motion.div className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        style={{ background: color }} />
    </div>
  );
}

function ScoreGauge({ value }) {
  const r = 70;
  const circ = Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#6366f1' : '#ef4444';

  return (
    <svg width={160} height={90} className="overflow-visible">
      <path d={`M 10 80 A ${r} ${r} 0 0 1 150 80`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} strokeLinecap="round" />
      <motion.path d={`M 10 80 A ${r} ${r} 0 0 1 150 80`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }} />
      <text x="80" y="72" textAnchor="middle" fontSize="28" fontWeight="700" fill="#e2e8f0">{value}</text>
      <text x="80" y="90" textAnchor="middle" fontSize="11" fill="#64748b">/ 100</text>
    </svg>
  );
}

export default function LifeScore() {
  const { lifeScore, habits, goals, checkins, challenges } = useApp();

  const label = lifeScore.overall >= 80 ? 'Excelent 🚀' : lifeScore.overall >= 60 ? 'Bun 📈' : lifeScore.overall >= 40 ? 'În progres 🌱' : 'Nevoie de atenție ⚠️';

  const TIPS = [
    habits.length === 0     && { text: 'Adaugă primul obicei',           to: '/habits' },
    goals.length === 0      && { text: 'Setează un obiectiv',            to: '/goals' },
    checkins.length < 3     && { text: 'Completează 3 check-in-uri',     to: '/checkin' },
    challenges.length === 0 && { text: 'Acceptă prima provocare',        to: '/challenges' },
  ].filter(Boolean);

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Life Score</h1>
        <p className="text-slate-500 text-sm mb-8">Calculat din activitatea ta reală.</p>

        {/* Main gauge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-6 text-center">
          <div className="flex justify-center mb-3">
            <ScoreGauge value={lifeScore.overall} />
          </div>
          <p className="text-lg font-semibold text-slate-200">{label}</p>
          <p className="text-xs text-slate-500 mt-1">Actualizat în timp real din obiceiuri, obiective și check-in-uri</p>
        </motion.div>

        {/* Breakdown */}
        <div className="space-y-3 mb-6">
          {METRICS.map(({ key, label, icon, color, desc }, i) => {
            const value = lifeScore[key] ?? 50;
            return (
              <motion.div key={key} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-lg w-7 text-center">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-300">{label}</span>
                    <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
                  </div>
                  <Bar value={value} color={color} delay={0.3 + i * 0.04} />
                  <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tips */}
        {TIPS.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-3 font-medium">💡 Cum să crești scorul</p>
            <div className="space-y-2">
              {TIPS.map((tip, i) => (
                <Link key={i} to={tip.to} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-indigo-500/10 hover:border-indigo-500/20 border border-transparent transition-all">
                  <span className="text-sm text-slate-300">{tip.text}</span>
                  <span className="text-indigo-400 text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
