import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function QuizCard({ question, onAnswer, aiExplanation, loadingExplanation }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    onAnswer(index, index === question.correct);
  };

  const getOptionStyle = (index) => {
    if (selected === null) return 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer';
    if (index === question.correct) return 'border-emerald-500/60 bg-emerald-500/10';
    if (index === selected && index !== question.correct) return 'border-red-500/60 bg-red-500/10';
    return 'border-white/5 opacity-50';
  };

  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-slate-200 font-medium mb-5 leading-relaxed">{question.question}</p>
      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={selected === null ? { x: 4 } : {}}
            onClick={() => handleSelect(i)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm text-slate-300 flex items-center gap-3 ${getOptionStyle(i)}`}
          >
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0">
              {selected !== null && i === question.correct ? <CheckCircle size={16} className="text-emerald-400" /> :
               selected === i && i !== question.correct ? <XCircle size={16} className="text-red-400" /> :
               String.fromCharCode(65 + i)}
            </span>
            {opt.replace(/^[A-D]\. /, '')}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            {selected === question.correct ? (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-300">{question.explanation}</p>
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                {loadingExplanation ? (
                  <><Loader size={16} className="text-indigo-400 animate-spin mt-0.5 flex-shrink-0" /><p className="text-sm text-indigo-300">AI explică...</p></>
                ) : (
                  <p className="text-sm text-indigo-300">{aiExplanation || question.explanation}</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
