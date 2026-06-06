import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const key = JSON.parse(localStorage.getItem('dg_apiKey') || '""');
    setApiKey(key);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('dg_apiKey', JSON.stringify(apiKey.trim()));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    const keys = ['dg_userProfile', 'dg_sessions', 'dg_spacedRepetition', 'dg_customDomains', 'dg_streak', 'dg_onboardingName', 'dg_pendingAssessment'];
    keys.forEach(k => localStorage.removeItem(k));
    navigate('/');
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-100">Setări</h1>
        </div>

        {/* API Key */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-4">
          <h3 className="font-semibold text-slate-200 mb-1">Anthropic API Key</h3>
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">
            Necesară pentru generarea sesiunilor AI, insights și curriculum. Cheia este salvată <strong className="text-slate-400">doar local</strong>, în browserul tău.
          </p>

          <div className="relative mb-3">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono text-sm"
            />
            <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-600 flex-1">
              Obține cheia de la{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
                console.anthropic.com
              </a>
            </p>
            <button
              onClick={handleSaveKey}
              disabled={!apiKey.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {saved ? <><CheckCircle size={14} /> Salvat!</> : 'Salvează'}
            </button>
          </div>
        </motion.div>

        {/* Model info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 mb-4">
          <h3 className="font-semibold text-slate-200 mb-3">Model AI utilizat</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">C</div>
            <div>
              <p className="text-sm font-medium text-slate-200">claude-sonnet-4-20250514</p>
              <p className="text-xs text-slate-500">Cel mai performant model pentru educație personalizată</p>
            </div>
          </div>
        </motion.div>

        {/* Data info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-slate-200 mb-3">Date salvate</h3>
          {['dg_userProfile', 'dg_sessions', 'dg_customDomains', 'dg_streak'].map(key => {
            let info = '';
            try {
              const val = JSON.parse(localStorage.getItem(key));
              if (Array.isArray(val)) info = `${val.length} înregistrări`;
              else if (val) info = 'Prezent';
              else info = 'Gol';
            } catch { info = 'Gol'; }
            const labels = { dg_userProfile: 'Profil utilizator', dg_sessions: 'Sesiuni', dg_customDomains: 'Domenii custom', dg_streak: 'Streak' };
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-400">{labels[key]}</span>
                <span className="text-xs text-slate-500">{info}</span>
              </div>
            );
          })}
        </motion.div>

        {/* Reset */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5 border border-red-500/10">
          <h3 className="font-semibold text-red-400 mb-1">Zonă periculoasă</h3>
          <p className="text-slate-500 text-sm mb-4">Resetarea șterge tot progresul și profilul tău. Această acțiune este ireversibilă.</p>

          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors">
              <Trash2 size={14} /> Resetează tot
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-sm font-medium text-red-300">Ești sigur? Nu se poate recupera.</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReset(false)} className="flex-1 py-2 glass rounded-lg text-slate-400 text-sm hover:text-slate-200 transition-colors">Anulează</button>
                <button onClick={handleReset} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">Șterge tot</button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
