import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const FOCUS_OPTIONS = [
  { value: 'business',   label: 'Business',      icon: '🚀' },
  { value: 'health',     label: 'Sănătate',       icon: '💪' },
  { value: 'mindset',    label: 'Mentalitate',    icon: '🧠' },
  { value: 'finance',    label: 'Finanțe',        icon: '💰' },
  { value: 'relations',  label: 'Relații',        icon: '❤️' },
  { value: 'learning',   label: 'Învățare',       icon: '📚' },
];

const STRUGGLE_OPTIONS = [
  { value: 'procrastination', label: 'Procrastinare',       icon: '⏳' },
  { value: 'discipline',      label: 'Lipsă disciplină',    icon: '🔥' },
  { value: 'clarity',         label: 'Lipsă claritate',     icon: '🌫️' },
  { value: 'motivation',      label: 'Lipsă motivație',     icon: '😶' },
  { value: 'fear',            label: 'Frică de eșec',       icon: '😨' },
  { value: 'overwhelm',       label: 'Prea multe lucruri',  icon: '🌊' },
];

const STYLE_OPTIONS = [
  { value: 'calm',     label: 'Calm & blând',        icon: '🌱', desc: 'Suport și răbdare' },
  { value: 'balanced', label: 'Echilibrat',           icon: '⚖️', desc: 'Mixt de suport și provocare' },
  { value: 'direct',   label: 'Direct & la obiect',  icon: '⚡', desc: 'Fără scuze, fapte' },
  { value: 'intense',  label: 'Intens & provocator',  icon: '🔥', desc: 'Împinge limitele' },
];

const STEPS = [
  { key: 'name',     title: 'Cum te cheamă?',                           subtitle: 'Vom personaliza totul pentru tine.' },
  { key: 'focus',    title: 'Care e focusul tău principal?',            subtitle: 'Alege una. Poți schimba oricând.' },
  { key: 'struggle', title: 'Care e cel mai mare obstacol al tău?',     subtitle: 'Sincer — asta ne ajută să te ajutăm.' },
  { key: 'goal90',   title: 'Ce vrei să realizezi în 90 de zile?',      subtitle: 'Un singur obiectiv. Specific.' },
  { key: 'style',    title: 'Cum vrei să fie coach-ul tău AI?',         subtitle: 'Alegerea ta, stilul tău.' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({ name: '', focus: '', struggle: '', goal90: '', style: '' });

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const canAdvance = () => {
    const v = answers[current.key];
    return v && v.trim() !== '';
  };

  const advance = () => {
    if (!canAdvance()) return;
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const back = () => {
    if (step > 0) { setDirection(-1); setStep(s => s - 1); }
  };

  const finish = () => {
    const profile = {
      ...answers,
      language: 'ro',
      createdAt: new Date().toISOString(),
      onboardingDone: true,
    };
    setProfile(profile);
    navigate('/dashboard');
  };

  const select = (key, val) => {
    setAnswers(a => ({ ...a, [key]: val }));
    if (key !== 'name' && key !== 'goal90') {
      setTimeout(() => { setDirection(1); setStep(s => s + 1 < STEPS.length ? s + 1 : s); if (step === STEPS.length - 1) finish(); }, 260);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-10">
        <div className="flex justify-between text-xs text-slate-600 mb-2">
          <span>Daily Growth</span>
          <span>{step + 1} / {STEPS.length}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-indigo-500 rounded-full" animate={{ width: `${progress + (100 / STEPS.length)}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22 }}
          >
            <h2 className="text-3xl font-bold text-slate-100 mb-2">{current.title}</h2>
            <p className="text-slate-500 mb-8">{current.subtitle}</p>

            {/* Name input */}
            {current.key === 'name' && (
              <div>
                <input
                  autoFocus
                  type="text"
                  value={answers.name}
                  onChange={e => setAnswers(a => ({ ...a, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && advance()}
                  placeholder="Prenumele tău..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-100 text-xl placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            )}

            {/* Goal input */}
            {current.key === 'goal90' && (
              <div>
                <textarea
                  autoFocus
                  value={answers.goal90}
                  onChange={e => setAnswers(a => ({ ...a, goal90: e.target.value }))}
                  placeholder="ex: Lansez primul meu produs digital și fac primele 10 vânzări."
                  rows={3}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                />
              </div>
            )}

            {/* Focus options */}
            {current.key === 'focus' && (
              <div className="grid grid-cols-2 gap-3">
                {FOCUS_OPTIONS.map(o => (
                  <motion.button key={o.value} whileTap={{ scale: 0.97 }}
                    onClick={() => select('focus', o.value)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                      answers.focus === o.value ? 'border-indigo-500/60 bg-indigo-500/10 text-slate-100' : 'border-white/8 bg-white/3 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{o.icon}</span>
                    <span className="font-medium text-sm">{o.label}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Struggle options */}
            {current.key === 'struggle' && (
              <div className="grid grid-cols-2 gap-3">
                {STRUGGLE_OPTIONS.map(o => (
                  <motion.button key={o.value} whileTap={{ scale: 0.97 }}
                    onClick={() => select('struggle', o.value)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                      answers.struggle === o.value ? 'border-indigo-500/60 bg-indigo-500/10 text-slate-100' : 'border-white/8 bg-white/3 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{o.icon}</span>
                    <span className="font-medium text-sm">{o.label}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Style options */}
            {current.key === 'style' && (
              <div className="space-y-3">
                {STYLE_OPTIONS.map(o => (
                  <motion.button key={o.value} whileTap={{ scale: 0.98 }}
                    onClick={() => { select('style', o.value); setTimeout(finish, 300); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      answers.style === o.value ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-white/8 bg-white/3 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{o.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-200 text-sm">{o.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{o.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={back} disabled={step === 0}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 disabled:opacity-0 transition-colors">
            <ArrowLeft size={16} /> Înapoi
          </button>

          {(current.key === 'name' || current.key === 'goal90') && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={advance}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-semibold transition-all"
            >
              {step === STEPS.length - 1 ? 'Finalizează' : 'Continuă'} <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
