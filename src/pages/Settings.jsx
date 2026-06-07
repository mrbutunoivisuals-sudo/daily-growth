import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { apiKey, setApiKey, profile, resetAll, exportData, habits, goals, checkins } = useApp();
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleSaveKey = () => {
    setApiKey(keyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `daily-growth-${new Date().toISOString().split('T')[0]}.json`; a.click();
  };

  const handleReset = () => { resetAll(); navigate('/onboarding'); };

  const stats = [
    { label: 'Obiceiuri', value: habits.length },
    { label: 'Obiective', value: goals.length },
    { label: 'Check-in-uri', value: checkins.length },
  ];

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">Setări</h1>

        {/* Profile summary */}
        {profile && (
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-lg">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-200">{profile.name}</p>
                <p className="text-xs text-slate-500">Membru din {new Date(profile.createdAt).toLocaleDateString('ro-RO')}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {stats.map(s => (
                <div key={s.label} className="text-center p-2 rounded-xl bg-white/3">
                  <p className="text-lg font-bold text-slate-200">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Key */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-4">
          <h3 className="font-semibold text-slate-200 mb-1">Anthropic API Key</h3>
          <p className="text-slate-500 text-xs mb-4 leading-relaxed">
            Necesară pentru AI Coach, insights și sesiuni. Salvată doar local în browser.{' '}
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">Obține cheie →</a>
          </p>
          <div className="relative mb-3">
            <input type={showKey ? 'text' : 'password'} value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-indigo-500/40" />
            <button onClick={() => setShowKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-600">Model: claude-haiku-4-5 (sesiuni) · claude-sonnet-4-5 (insights)</p>
            </div>
            <button onClick={handleSaveKey} disabled={!keyInput.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0">
              {saved ? <><CheckCircle size={13} /> Salvat</> : 'Salvează'}
            </button>
          </div>
        </motion.div>

        {/* Export */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5 mb-4">
          <h3 className="font-semibold text-slate-200 mb-1">Export date</h3>
          <p className="text-slate-500 text-xs mb-4">Descarcă toate datele tale în format JSON.</p>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 glass hover:border-slate-500 text-slate-300 rounded-xl text-sm transition-all">
            <Download size={14} /> Descarcă backup
          </button>
        </motion.div>

        {/* Reset */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 border border-red-500/10">
          <h3 className="font-semibold text-red-400 mb-1">Resetează tot</h3>
          <p className="text-slate-500 text-xs mb-4">Șterge profilul, obiceiurile, obiectivele și toate datele. Ireversibil.</p>
          {!showReset ? (
            <button onClick={() => setShowReset(true)} className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-colors">
              Resetează
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-xs font-medium text-red-300">Ești sigur? Nu se poate recupera.</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReset(false)} className="flex-1 py-2 glass rounded-lg text-slate-400 text-xs hover:text-slate-200 transition-colors">Anulează</button>
                <button onClick={handleReset} className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors">Șterge tot</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
