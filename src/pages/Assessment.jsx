import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ASSESSMENT_QUESTIONS, DOMAINS } from '../utils/questions.js';
import { calculateAssessmentScores, getTopWeakDomains } from '../utils/scoring.js';
import RadarChart from '../components/RadarChart.jsx';

const SCALE_LABELS = [
  { value: 1, label: 'Aproape niciodată', color: '#ef4444' },
  { value: 2, label: 'Rareori', color: '#f97316' },
  { value: 3, label: 'Uneori', color: '#f59e0b' },
  { value: 4, label: 'Frecvent', color: '#10b981' },
  { value: 5, label: 'Aproape întotdeauna', color: '#6366f1' },
];

export default function Assessment() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const question = ASSESSMENT_QUESTIONS[current];
  const progress = (current / ASSESSMENT_QUESTIONS.length) * 100;
  const domain = DOMAINS.find(d => d.id === question?.domain);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    if (current < ASSESSMENT_QUESTIONS.length - 1) {
      setDirection(1);
      setTimeout(() => setCurrent(c => c + 1), 200);
    } else {
      const scores = calculateAssessmentScores(newAnswers);
      const name = JSON.parse(localStorage.getItem('dg_onboardingName') || '"Utilizator"');
      localStorage.setItem('dg_pendingAssessment', JSON.stringify({ scores, answers: newAnswers }));
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (current > 0) {
      setDirection(-1);
      setCurrent(c => c - 1);
    }
  };

  const handleContinue = () => {
    const { scores } = JSON.parse(localStorage.getItem('dg_pendingAssessment') || '{}');
    const name = JSON.parse(localStorage.getItem('dg_onboardingName') || '"Utilizator"');
    const weakDomains = getTopWeakDomains(scores);
    const profile = {
      name,
      assessmentScores: scores,
      weakDomains,
      learningStyle: null,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('dg_userProfile', JSON.stringify(profile));
    navigate('/learning-profile');
  };

  if (showResults) {
    const { scores } = JSON.parse(localStorage.getItem('dg_pendingAssessment') || '{}');
    const weakDomains = getTopWeakDomains(scores);
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Assessmentul tău</h2>
            <p className="text-slate-400">Iată harta vieții tale pe cele 7 domenii</p>
          </div>

          <div className="glass rounded-3xl p-6 mb-6">
            <RadarChart scores={scores} size={320} />
          </div>

          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-slate-200 mb-4">🚀 Top 3 zone de creștere prioritară</h3>
            <div className="space-y-3">
              {weakDomains.map((domainId, i) => {
                const d = DOMAINS.find(x => x.id === domainId);
                return (
                  <div key={domainId} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-lg">{d?.icon}</span>
                    <span className="text-slate-300">{d?.name}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden ml-2">
                      <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${scores[domainId]}%` }} />
                    </div>
                    <span className="text-slate-400 text-sm">{scores[domainId]}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-lg transition-colors glow"
          >
            Continuă cu Profilul de Învățare →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{domain?.icon}</span>
            <span className="text-slate-400 text-sm font-medium">{domain?.name}</span>
          </div>
          <span className="text-slate-500 text-sm">{current + 1} / {ASSESSMENT_QUESTIONS.length}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: domain?.color || '#6366f1' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex mt-2 gap-0.5">
          {DOMAINS.map((d, i) => {
            const domainQuestions = ASSESSMENT_QUESTIONS.filter(q => q.domain === d.id);
            const answeredInDomain = domainQuestions.filter(q => answers[q.id]).length;
            return (
              <div key={d.id} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(answeredInDomain / domainQuestions.length) * 100}%`, background: d.color }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.25 }}
            >
              <div className="glass rounded-3xl p-8 mb-6">
                <p className="text-xl text-slate-100 leading-relaxed font-medium">{question.text}</p>
              </div>

              <div className="space-y-3">
                {SCALE_LABELS.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ x: 6, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      answers[question.id] === opt.value
                        ? 'border-indigo-500/60 bg-indigo-500/10 text-slate-100'
                        : 'border-white/8 bg-white/3 text-slate-300 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${opt.color}25`, color: opt.color }}>
                      {opt.value}
                    </span>
                    <span className="font-medium">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={current === 0}
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} /> Înapoi
            </button>
            {answers[question?.id] && current < ASSESSMENT_QUESTIONS.length - 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { setDirection(1); setCurrent(c => c + 1); }}
                className="flex items-center gap-2 px-4 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Următor <ChevronRight size={18} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
