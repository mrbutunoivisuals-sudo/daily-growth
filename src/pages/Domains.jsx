import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Loader, CheckCircle, Edit3, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useAI } from '../hooks/useAI.js';
import { DOMAINS } from '../utils/questions.js';
import { getScoreLabel, getScoreColor } from '../utils/scoring.js';
import { buildCurriculumPrompt } from '../utils/aiPrompts.js';

export default function Domains() {
  const navigate = useNavigate();
  const { callAIJSON, loading, error } = useAI();
  const [profile, setProfile] = useState(null);
  const [customDomains, setCustomDomains] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [generatingCurriculum, setGeneratingCurriculum] = useState(false);
  const [pendingCurriculum, setPendingCurriculum] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('dg_userProfile') || 'null');
    const cd = JSON.parse(localStorage.getItem('dg_customDomains') || '[]');
    if (!p) { navigate('/'); return; }
    setProfile(p);
    setCustomDomains(cd);
  }, []);

  const handleGenerateCurriculum = async () => {
    if (!newDomainName.trim()) return;
    setGeneratingCurriculum(true);
    const prompt = buildCurriculumPrompt(newDomainName.trim());
    const data = await callAIJSON(prompt);
    setGeneratingCurriculum(false);
    if (data) {
      setPendingCurriculum({ name: newDomainName.trim(), ...data });
    }
  };

  const handleApproveCurriculum = () => {
    const newDomain = {
      id: `custom_${Date.now()}`,
      name: pendingCurriculum.name,
      title: pendingCurriculum.title,
      description: pendingCurriculum.description,
      duration: pendingCurriculum.duration,
      modules: pendingCurriculum.modules,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...customDomains, newDomain];
    setCustomDomains(updated);
    localStorage.setItem('dg_customDomains', JSON.stringify(updated));
    setPendingCurriculum(null);
    setNewDomainName('');
    setShowAdd(false);
  };

  if (!profile) return null;
  const scores = profile.assessmentScores || {};

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Domenii & Curriculum</h1>
            <p className="text-slate-500 text-sm">Explorează și construiește traseele tale de creștere</p>
          </div>
        </div>

        {/* Core domains */}
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Domenii de bază</h2>
        <div className="space-y-3 mb-8">
          {DOMAINS.map((d, i) => {
            const score = scores[d.id] || 0;
            const isExpanded = expanded === d.id;
            return (
              <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <span className="text-2xl w-10 text-center">{d.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{d.name}</span>
                      <span className="text-xs font-semibold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: d.color }} />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">{score}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/session/${d.id}`)}
                      className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors"
                      title="Începe sesiune"
                    >
                      <Play size={14} />
                    </button>
                    <button onClick={() => setExpanded(isExpanded ? null : d.id)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 pt-0 border-t border-white/5">
                        <p className="text-sm text-slate-400 mt-3 mb-3">
                          Zonă cu potențial de creștere. {score < 60 ? 'Recomandăm să prioritizezi sesiuni în acest domeniu.' : 'Performanță bună — menține progresul!'}
                        </p>
                        <button onClick={() => navigate(`/session/${d.id}`)} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                          <Play size={14} /> Pornește o sesiune de {d.name.toLowerCase()}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Custom domains */}
        {customDomains.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Domenii personalizate</h2>
            <div className="space-y-3 mb-8">
              {customDomains.map((cd, i) => (
                <motion.div key={cd.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-200">{cd.title || cd.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{cd.duration} · {cd.modules?.length || 0} module</p>
                      </div>
                      <div className="text-sm font-semibold text-indigo-400">{cd.progress || 0}%</div>
                    </div>
                    {cd.description && <p className="text-sm text-slate-400 mb-4 leading-relaxed">{cd.description}</p>}
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${cd.progress || 0}%` }} />
                    </div>
                    {cd.modules && (
                      <div className="space-y-2">
                        {cd.modules.map(m => (
                          <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
                            <div className="w-5 h-5 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs text-slate-500">{m.id}</span>
                            </div>
                            <div>
                              <p className="text-sm text-slate-300 font-medium">{m.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{m.objective}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Add domain */}
        <AnimatePresence>
          {!showAdd && !pendingCurriculum && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(true)}
              className="w-full py-4 glass rounded-2xl border-dashed border-white/15 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Adaugă domeniu nou
            </motion.button>
          )}

          {showAdd && !pendingCurriculum && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-slate-200 mb-4">Domeniu nou</h3>
              <input
                type="text"
                value={newDomainName}
                onChange={e => setNewDomainName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateCurriculum()}
                placeholder="ex: Fotografie, Public Speaking, Programare..."
                autoFocus
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 mb-4"
              />
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setShowAdd(false); setNewDomainName(''); }} className="flex-1 py-2.5 glass rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-sm">
                  Anulează
                </button>
                <button
                  onClick={handleGenerateCurriculum}
                  disabled={!newDomainName.trim() || generatingCurriculum}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {generatingCurriculum ? <><Loader size={14} className="animate-spin" /> Generez...</> : '✨ Generează curriculum'}
                </button>
              </div>
            </motion.div>
          )}

          {pendingCurriculum && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className="text-emerald-400" />
                <h3 className="font-semibold text-slate-200">Curriculum generat</h3>
              </div>
              <p className="text-indigo-400 font-medium text-lg mb-1">{pendingCurriculum.title}</p>
              <p className="text-slate-400 text-sm mb-2">{pendingCurriculum.description}</p>
              <p className="text-xs text-slate-500 mb-5">Durată estimată: {pendingCurriculum.duration}</p>

              <div className="space-y-3 mb-6">
                {pendingCurriculum.modules?.map(m => (
                  <div key={m.id} className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{m.id}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{m.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.objective}</p>
                      <p className="text-xs text-slate-600 mt-1">{m.duration}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPendingCurriculum(null)} className="flex-1 py-3 glass rounded-xl text-slate-400 hover:text-slate-200 transition-colors text-sm">
                  Regenerează
                </button>
                <button onClick={handleApproveCurriculum} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors">
                  ✓ Aprobă și adaugă
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
