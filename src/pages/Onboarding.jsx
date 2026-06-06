import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const features = [
  { icon: '🧭', title: 'Assessment personalizat', desc: '60 de întrebări care îți mapează viața pe 7 domenii cheie' },
  { icon: '🎯', title: 'Profil de învățare', desc: 'Detectăm cum înveți cel mai bine și adaptăm tot conținutul' },
  { icon: '🤖', title: 'AI Coach personal', desc: 'Claude generează sesiuni, insights și curriculum pentru tine' },
  { icon: '📈', title: 'Progres vizual', desc: 'Radar chart, heatmap și streak — creșterea ta, vizibilă' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);

  const handleStart = () => {
    if (!name.trim()) return;
    localStorage.setItem('dg_onboardingName', JSON.stringify(name.trim()));
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
      >
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles size={36} className="text-indigo-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold text-slate-100 mb-4 leading-tight"
            >
              Daily<span className="text-gradient"> Growth</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-slate-400 mb-12 max-w-lg mx-auto leading-relaxed"
            >
              Sistemul tău personalizat de dezvoltare personală, alimentat de AI.
              Construiește cine vrei să devii — o zi la rând.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12"
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="glass rounded-2xl p-4 text-left"
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-semibold text-slate-200 text-sm mb-1">{f.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-lg transition-colors glow"
            >
              Începe acum <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="text-center max-w-md mx-auto">
            <div className="text-5xl mb-6">👋</div>
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Cum te cheamă?</h2>
            <p className="text-slate-400 mb-8">Vom personaliza totul pentru tine, de la primul moment.</p>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleStart()}
              placeholder="Prenumele tău..."
              autoFocus
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-100 text-lg placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all mb-6"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={!name.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 glow"
            >
              Începe Assessmentul <ArrowRight size={20} />
            </motion.button>

            <p className="text-xs text-slate-600 mt-4">Durează ~10 minute · Totul se salvează local</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
