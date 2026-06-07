import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Trash2, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAI } from '../hooks/useAI.js';

const STARTERS = [
  'Nu am motivație să încep.',
  'Procrastinez constant.',
  'Mă simt copleșit de prea multe task-uri.',
  'Mi-e frică să contactez clienți.',
  'Nu știu de unde să încep cu obiectivul meu.',
  'Vreau să construiesc un obicei nou.',
];

function buildCoachPrompt(profile, userMessage, history) {
  const style = profile?.style || 'balanced';
  const styleInstr = {
    calm:     'Ești un coach calm, empatic și răbdător. Vorbești ușor, cu înțelegere.',
    balanced: 'Ești echilibrat — oferi suport dar și provocare directă când e nevoie.',
    direct:   'Ești direct, la obiect, fără scuze și fără text inutil. Tăios dar util.',
    intense:  'Ești intens, provocator, nu accepți scuze. Împingi utilizatorul la acțiune imediată.',
  }[style] || 'Ești echilibrat și direct.';

  const ctx = history.slice(-4).map(m => `${m.role === 'user' ? 'USER' : 'COACH'}: ${m.text}`).join('\n');

  return `${styleInstr} Ești un coach de dezvoltare personală. Vorbești în română. Ești concis (max 150 cuvinte).

Profilul utilizatorului: focus=${profile?.focus || 'general'}, obstacol=${profile?.struggle || 'necunoscut'}, obiectiv 90 zile="${profile?.goal90 || 'nedefinit'}".

${ctx ? `Conversație anterioară:\n${ctx}\n` : ''}
USER: ${userMessage}

Răspunde cu structura:
1. Reflecție scurtă (1 propoziție — ce se întâmplă cu adevărat)
2. Plan de 3 pași concreți și specifici
3. O acțiune care durează sub 5 minute, acum
4. O întrebare de responsabilizare

Fii ${style === 'intense' ? 'provocator și fără mănuși' : style === 'direct' ? 'direct și eficient' : 'empatic dar util'}. Niciun discurs motivațional generic.`;
}

export default function Coach() {
  const { profile, coach, setCoach } = useApp();
  const { callAI, loading } = useAI();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coach]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg, ts: new Date().toISOString() };
    setCoach(prev => [...prev, userMsg]);

    const prompt = buildCoachPrompt(profile, msg, coach);
    const response = await callAI(prompt);

    if (response) {
      setCoach(prev => [...prev, { id: Date.now(), role: 'coach', text: response, ts: new Date().toISOString() }]);
    }
  };

  const clearHistory = () => setCoach([]);

  return (
    <div className="min-h-screen md:pl-16 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between"
        style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm">AI Coach</h1>
            <p className="text-xs text-slate-500">Stil: {
              { calm: 'Calm', balanced: 'Echilibrat', direct: 'Direct', intense: 'Intens' }[profile?.style] || 'Echilibrat'
            }</p>
          </div>
        </div>
        {coach.length > 0 && (
          <button onClick={clearHistory} className="p-2 text-slate-600 hover:text-slate-400 transition-colors" title="Șterge conversația">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-36 md:pb-6 max-w-2xl mx-auto w-full">
        {coach.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">Coach-ul tău AI</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
              Spune-mi ce te blochează. Îți dau claritate, un plan și prima acțiune.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {STARTERS.map(s => (
                <motion.button key={s} whileHover={{ x: 4 }} onClick={() => send(s)}
                  className="text-left px-4 py-3 glass rounded-xl text-slate-400 text-sm hover:text-slate-200 hover:border-indigo-500/30 transition-all">
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {coach.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'coach' && (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                      <Sparkles size={12} className="text-indigo-400" />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'glass text-slate-300 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={12} className="text-indigo-400" />
                </div>
                <div className="glass px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-16 right-0 px-4 py-3"
        style={{ background: 'rgba(10,10,15,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Spune-mi ce te blochează..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 text-sm transition-all"
          />
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0">
            {loading ? <Loader size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
