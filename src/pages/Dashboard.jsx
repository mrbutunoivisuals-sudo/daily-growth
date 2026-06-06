import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Download, Settings, BookOpen, ChevronRight, RefreshCw, Flame } from 'lucide-react';
import RadarChart from '../components/RadarChart.jsx';
import HeatMap from '../components/HeatMap.jsx';
import InsightCard from '../components/InsightCard.jsx';
import { useAI } from '../hooks/useAI.js';
import { exportAllData } from '../hooks/useStorage.js';
import { DOMAINS, LEARNING_STYLES } from '../utils/questions.js';
import { getDomainName, getDomainColor, getDomainIcon, getScoreLabel } from '../utils/scoring.js';
import { buildInsightPrompt } from '../utils/aiPrompts.js';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bună dimineața';
  if (h < 18) return 'Bună ziua';
  return 'Bună seara';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { callAIJSON, loading: aiLoading } = useAI();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState({ current: 0 });
  const [insights, setInsights] = useState([]);
  const [identityMsg, setIdentityMsg] = useState('');

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('dg_userProfile'));
      const s = JSON.parse(localStorage.getItem('dg_sessions') || '[]');
      const st = JSON.parse(localStorage.getItem('dg_streak') || '{"current":0}');
      if (!p) { navigate('/'); return; }
      setProfile(p);
      setSessions(s);
      setStreak(st);

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = { ...st };
      if (st.lastActive !== today) {
        if (st.lastActive === yesterday) {
          newStreak.current = (st.current || 0) + 1;
        } else if (!st.lastActive) {
          newStreak.current = 1;
        }
        newStreak.lastActive = today;
        localStorage.setItem('dg_streak', JSON.stringify(newStreak));
        setStreak(newStreak);
      }

      const cachedInsights = sessionStorage.getItem('dg_insights');
      if (cachedInsights) {
        setInsights(JSON.parse(cachedInsights));
      }
    } catch { navigate('/'); }
  }, []);

  const loadInsights = async () => {
    if (!profile) return;
    const prompt = buildInsightPrompt({ ...profile, sessions });
    const data = await callAIJSON(prompt);
    if (data && Array.isArray(data)) {
      setInsights(data);
      sessionStorage.setItem('dg_insights', JSON.stringify(data));
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-growth-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!profile) return null;

  const scores = profile.assessmentScores || {};
  const weakDomains = profile.weakDomains || [];
  const todayDomain = weakDomains[0];
  const style = LEARNING_STYLES[profile.learningStyle?.dominant];
  const prevSession = sessions[sessions.length - 1];

  const todayStr = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div>
            <p className="text-slate-500 text-sm mb-1">{todayStr}</p>
            <h1 className="text-3xl font-bold text-slate-100">
              {getGreeting()}, <span className="text-gradient">{profile.name}</span> 👋
            </h1>
            {streak.current > 1 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Flame size={16} className="text-orange-400" />
                <span className="text-sm text-orange-400 font-medium">{streak.current} zile consecutive</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} title="Export date" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
              <Download size={18} />
            </button>
            <Link to="/settings" className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
              <Settings size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Today's Session CTA */}
        {todayDomain && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6 mb-6 border border-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-indigo-400" />
                  <span className="text-indigo-400 text-sm font-medium">Sesiunea de azi</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1">
                  {getDomainIcon(todayDomain)} {getDomainName(todayDomain)}
                </h3>
                <p className="text-slate-400 text-sm">
                  Scor actual: <span className="text-slate-300">{scores[todayDomain]}%</span> · {getScoreLabel(scores[todayDomain])}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/session/${todayDomain}`)}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-colors glow"
              >
                Începe <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6">
            <h3 className="font-semibold text-slate-200 mb-4">Harta vieții tale</h3>
            <RadarChart scores={scores} previousScores={prevSession?.scores} size={280} />
            {prevSession && <p className="text-xs text-slate-500 text-center mt-2">— Acum  ···· Sesiunea anterioară</p>}
          </motion.div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Domain scores */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-200">Scoruri domenii</h3>
                <Link to="/domains" className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1">
                  Vezi toate <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {DOMAINS.map(d => (
                  <div key={d.id} className="flex items-center gap-3">
                    <span className="text-base w-6 text-center">{d.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-400">{d.name}</span>
                        <span className="text-xs text-slate-500">{scores[d.id] || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scores[d.id] || 0}%` }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: d.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Learning style */}
            {style && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="text-3xl">{style.icon}</div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Stilul tău de învățare</p>
                  <p className="font-semibold text-slate-200">{style.name}</p>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{style.description.split('.')[0]}.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-3xl p-6 mb-6">
          <h3 className="font-semibold text-slate-200 mb-4">Activitate — ultimele 35 de zile</h3>
          <HeatMap sessions={sessions} />
          <p className="text-xs text-slate-600 mt-3">{sessions.length} sesiuni totale</p>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-200">✨ Insights personalizate</h3>
            <button
              onClick={loadInsights}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 glass rounded-xl transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={aiLoading ? 'animate-spin' : ''} />
              {aiLoading ? 'Generez...' : insights.length ? 'Regenerează' : 'Generează'}
            </button>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">Apasă „Generează" pentru insights AI personalizate bazate pe profilul tău.</p>
              <p className="text-slate-600 text-xs mt-1">Necesită cheie Anthropic API (Setări)</p>
            </div>
          )}
        </motion.div>

        {/* Quick nav */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-2 gap-4">
          <Link to="/domains" className="glass rounded-2xl p-5 hover:border-indigo-500/30 transition-all group">
            <BookOpen size={22} className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-200 text-sm">Domenii & Curriculum</h4>
            <p className="text-slate-500 text-xs mt-1">Explorează și adaugă domenii noi</p>
          </Link>
          <Link to="/settings" className="glass rounded-2xl p-5 hover:border-indigo-500/30 transition-all group">
            <Settings size={22} className="text-slate-400 mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-slate-200 text-sm">Setări</h4>
            <p className="text-slate-500 text-xs mt-1">Cheie API și preferințe</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
