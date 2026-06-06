import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader, ChevronRight, Star } from 'lucide-react';
import QuizCard from '../components/QuizCard.jsx';
import { useAI } from '../hooks/useAI.js';
import { DOMAINS, LEARNING_STYLES } from '../utils/questions.js';
import { getDomainName, getDomainIcon } from '../utils/scoring.js';
import { buildSessionPrompt, buildQuizExplanationPrompt } from '../utils/aiPrompts.js';

const SESSION_STEPS = [
  { key: 'anchor', label: 'Ancorare', duration: '2 min', icon: '⚓' },
  { key: 'main', label: 'Concept Nou', duration: '5 min', icon: '💡' },
  { key: 'exercise', label: 'Exercițiu', duration: '3 min', icon: '✍️' },
  { key: 'connection', label: 'Conexiune', duration: '2 min', icon: '🔗' },
  { key: 'quiz', label: 'Quiz', duration: '3 min', icon: '❓' },
  { key: 'cliffhanger', label: 'Cliffhanger', duration: '1 min', icon: '🎯' },
];

export default function Session() {
  const { domainId } = useParams();
  const navigate = useNavigate();
  const { callAIJSON, callAI, loading, error, setError } = useAI();
  const [sessionData, setSessionData] = useState(null);
  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [aiExplanations, setAiExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  const domain = DOMAINS.find(d => d.id === domainId);
  const profile = JSON.parse(localStorage.getItem('dg_userProfile') || '{}');
  const sessions = JSON.parse(localStorage.getItem('dg_sessions') || '[]');
  const learningStyle = profile.learningStyle?.dominant || 'logical';
  const prevConcepts = sessions.filter(s => s.domain === domainId).map(s => s.concept).filter(Boolean);

  useEffect(() => {
    generateSession();
  }, []);

  const generateSession = async () => {
    const prompt = buildSessionPrompt(domainId, learningStyle, sessions.length + 1, prevConcepts);
    const data = await callAIJSON(prompt);
    if (data) setSessionData(data);
  };

  const handleQuizAnswer = async (questionIndex, isCorrect) => {
    const key = `q${questionIndex}`;
    setQuizAnswers(prev => ({ ...prev, [key]: isCorrect }));
    if (!isCorrect && sessionData?.quiz?.[questionIndex]) {
      const q = sessionData.quiz[questionIndex];
      setLoadingExplanation(true);
      const prompt = buildQuizExplanationPrompt(
        q.question,
        q.options[quizAnswers[key] ?? 0],
        q.options[q.correct],
        learningStyle
      );
      const explanation = await callAI(prompt);
      setAiExplanations(prev => ({ ...prev, [key]: explanation }));
      setLoadingExplanation(false);
    }
  };

  const handleNextStep = () => {
    if (step < SESSION_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    const score = Object.values(quizAnswers).filter(Boolean).length;
    const total = sessionData?.quiz?.length || 1;
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      domain: domainId,
      concept: sessionData?.concept || '',
      quizScore: Math.round((score / total) * 100),
      scores: profile.assessmentScores,
    };
    const updated = [...sessions, newSession];
    localStorage.setItem('dg_sessions', JSON.stringify(updated));

    const today = new Date().toDateString();
    const streak = JSON.parse(localStorage.getItem('dg_streak') || '{"current":0}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.lastActive !== today) {
      const newStreak = {
        current: streak.lastActive === yesterday ? streak.current + 1 : 1,
        lastActive: today,
      };
      localStorage.setItem('dg_streak', JSON.stringify(newStreak));
    }

    setCompleted(true);
  };

  if (completed) {
    const score = Object.values(quizAnswers).filter(Boolean).length;
    const total = sessionData?.quiz?.length || 1;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Sesiune completă!</h2>
          <p className="text-slate-400 mb-6">Ai explorat: <span className="text-slate-200 font-medium">{sessionData?.concept}</span></p>
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star size={20} className="text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold text-slate-100">{pct}%</span>
              <span className="text-slate-400 text-sm">la quiz</span>
            </div>
            <p className="text-slate-400 text-sm">{score} din {total} răspunsuri corecte</p>
          </div>
          {sessionData?.cliffhanger && (
            <div className="glass rounded-2xl p-5 mb-6 border border-indigo-500/20">
              <p className="text-xs text-indigo-400 mb-2 font-medium">🎯 CLIFFHANGER — Mâine explorăm:</p>
              <p className="text-slate-300 italic">"{sessionData.cliffhanger}"</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 glass rounded-2xl text-slate-300 hover:text-slate-100 transition-colors">
              Dashboard
            </button>
            <button onClick={generateSession} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-colors">
              Altă sesiune
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading && !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={40} className="text-indigo-400 animate-spin mx-auto mb-4" />
          <h3 className="text-slate-200 font-semibold mb-1">AI generează sesiunea ta...</h3>
          <p className="text-slate-500 text-sm">Personalizat pentru stilul tău {LEARNING_STYLES[learningStyle]?.name?.toLowerCase()}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-slate-200 font-semibold mb-2">Eroare la generare</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/settings')} className="px-4 py-2 glass rounded-xl text-indigo-400 text-sm">Configurează API Key</button>
            <button onClick={() => { setError(null); generateSession(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Încearcă din nou</button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) return null;

  const currentStep = SESSION_STEPS[step];

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-200">{domain?.icon} {getDomainName(domainId)}</h2>
            <p className="text-xs text-slate-500">{sessionData.concept}</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 mb-8">
          {SESSION_STEPS.map((s, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                animate={{ width: i <= step ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{currentStep.icon}</span>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">{currentStep.label}</h3>
                <span className="text-xs text-slate-500">{currentStep.duration}</span>
              </div>
            </div>

            {step === 0 && sessionData.anchor && (
              <div className="glass rounded-3xl p-7">
                <h4 className="font-semibold text-slate-200 mb-3">{sessionData.anchor.title}</h4>
                <p className="text-slate-300 leading-relaxed">{sessionData.anchor.content}</p>
              </div>
            )}

            {step === 1 && sessionData.main && (
              <div className="space-y-4">
                <div className="glass rounded-3xl p-7">
                  <h4 className="font-bold text-slate-100 text-xl mb-4">{sessionData.main.title}</h4>
                  <p className="text-slate-300 leading-relaxed mb-5">{sessionData.main.content}</p>
                  {sessionData.main.keyPoints && (
                    <div className="space-y-2">
                      {sessionData.main.keyPoints.map((p, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/8">
                          <CheckCircle size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-300">{p}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && sessionData.exercise && (
              <div className="glass rounded-3xl p-7">
                <h4 className="font-semibold text-slate-200 mb-2">{sessionData.exercise.title}</h4>
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs mb-4">{sessionData.exercise.duration}</div>
                <p className="text-slate-300 leading-relaxed">{sessionData.exercise.instruction}</p>
              </div>
            )}

            {step === 3 && sessionData.connection && (
              <div className="glass rounded-3xl p-7">
                <h4 className="font-semibold text-slate-200 mb-3">{sessionData.connection.title}</h4>
                <p className="text-slate-300 leading-relaxed">{sessionData.connection.content}</p>
              </div>
            )}

            {step === 4 && sessionData.quiz && (
              <div className="space-y-4">
                {sessionData.quiz.map((q, i) => (
                  <QuizCard
                    key={i}
                    question={q}
                    onAnswer={(idx, correct) => handleQuizAnswer(i, correct)}
                    aiExplanation={aiExplanations[`q${i}`]}
                    loadingExplanation={loadingExplanation}
                  />
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="glass rounded-3xl p-8 border border-indigo-500/20 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="font-bold text-slate-100 text-xl mb-4">Cliffhanger</h4>
                <p className="text-slate-300 text-lg leading-relaxed italic">"{sessionData.cliffhanger}"</p>
                <p className="text-slate-500 text-sm mt-4">Această întrebare te va ghida în sesiunea de mâine.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNextStep}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-colors"
          >
            {step < SESSION_STEPS.length - 1 ? 'Continuă' : 'Finalizează sesiunea'} <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
