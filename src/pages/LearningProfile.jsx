import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LEARNING_PROFILE_QUESTIONS, LEARNING_STYLES } from '../utils/questions.js';
import { calculateLearningStyle } from '../utils/scoring.js';

export default function LearningProfile() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);

  const question = LEARNING_PROFILE_QUESTIONS[current];
  const progress = ((current + 1) / LEARNING_PROFILE_QUESTIONS.length) * 100;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    if (current < LEARNING_PROFILE_QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 200);
    } else {
      const res = calculateLearningStyle(newAnswers);
      setResult(res);
      const profile = JSON.parse(localStorage.getItem('dg_userProfile') || '{}');
      profile.learningStyle = res;
      localStorage.setItem('dg_userProfile', JSON.stringify(profile));
      setShowResults(true);
    }
  };

  if (showResults && result) {
    const dominant = LEARNING_STYLES[result.dominant];
    const styleColors = { visual: '#6366f1', logical: '#06b6d4', narrative: '#f59e0b', kinesthetic: '#10b981' };
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-6xl mb-4"
            >
              {dominant?.icon}
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Stilul tău dominant</h2>
            <div className="inline-block px-5 py-2 rounded-full text-lg font-semibold" style={{ background: `${styleColors[result.dominant]}20`, color: styleColors[result.dominant], border: `1px solid ${styleColors[result.dominant]}40` }}>
              {dominant?.name}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <p className="text-slate-300 text-center leading-relaxed mb-6">{dominant?.description}</p>

            <div className="space-y-3">
              {Object.entries(result.percentages).sort(([,a],[,b]) => b - a).map(([style, pct]) => {
                const s = LEARNING_STYLES[style];
                return (
                  <div key={style}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{s?.icon} {s?.name}</span>
                      <span className="text-sm text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ background: styleColors[style] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mb-6 border border-indigo-500/20">
            <p className="text-sm text-slate-400 text-center">
              <span className="text-indigo-400 font-medium">AI-ul va adapta</span> toate sesiunile, explicațiile și exercițiile la stilul tău {dominant?.name.toLowerCase()}.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-lg transition-colors glow"
          >
            Mergi la Dashboard →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Profilul tău de învățare</h2>
          <p className="text-slate-500 text-sm mt-1">{current + 1} din {LEARNING_PROFILE_QUESTIONS.length}</p>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-indigo-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="glass rounded-3xl p-8 mb-6">
                <p className="text-xl text-slate-100 leading-relaxed font-medium">{question.text}</p>
              </div>
              <div className="space-y-3">
                {question.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full text-left px-5 py-4 rounded-2xl border border-white/8 bg-white/3 text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-white/8 text-slate-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
