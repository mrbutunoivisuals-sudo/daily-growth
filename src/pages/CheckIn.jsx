import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const MOODS = ['😩','😔','😐','🙂','😄'];
const ENERGY = ['🪫','😴','⚡','🔥','🚀'];

function Slider({ label, icons, value, onChange }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-lg">{icons[value - 1]}</span>
      </div>
      <input type="range" min={1} max={5} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-indigo-500 h-1.5 rounded-full bg-white/10 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>Scăzut</span><span>Ridicat</span>
      </div>
    </div>
  );
}

export default function CheckIn() {
  const { checkins, setCheckins, morningDone, eveningDone, touchStreak } = useApp();
  const isMorning = new Date().getHours() < 15;
  const type = isMorning ? 'morning' : 'evening';
  const alreadyDone = type === 'morning' ? morningDone : eveningDone;
  const [done, setDone] = useState(false);

  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  const submit = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      type,
      mood, energy, focus,
      ...(type === 'morning'
        ? { goal: text1, obstacle: text2 }
        : { wins: text1, learned: text2 }),
    };
    setCheckins(prev => [...prev, entry]);
    touchStreak();
    setDone(true);
  };

  if (alreadyDone || done) {
    return (
      <div className="min-h-screen md:pl-16 flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            {type === 'morning' ? 'Dimineața înregistrată!' : 'Seara înregistrată!'}
          </h2>
          <p className="text-slate-500">Revino {type === 'morning' ? 'seara' : 'mâine dimineață'}.</p>
          {checkins.length > 1 && (
            <div className="mt-6 glass rounded-2xl p-4 max-w-xs mx-auto">
              <p className="text-xs text-slate-500 mb-3">Ultimele check-in-uri</p>
              <div className="flex gap-2 justify-center">
                {checkins.slice(-7).map(c => (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <span className="text-lg">{MOODS[c.mood - 1]}</span>
                    <span className="text-xs text-slate-600">{new Date(c.date).toLocaleDateString('ro-RO', { weekday: 'short' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:pl-16 px-4 py-8 pb-28 md:pb-8">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            {type === 'morning'
              ? <Sun size={22} className="text-yellow-400" />
              : <Moon size={22} className="text-indigo-400" />}
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                {type === 'morning' ? 'Bună dimineața' : 'Bună seara'} ☀️
              </h1>
              <p className="text-slate-500 text-sm">Check-in de {type === 'morning' ? 'dimineață' : 'seară'}</p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 mb-4">
            <Slider label="Starea de spirit" icons={MOODS} value={mood} onChange={setMood} />
            <Slider label="Nivelul de energie" icons={ENERGY} value={energy} onChange={setEnergy} />
            <Slider label="Capacitatea de focus" icons={['🌀','😵','🧩','🎯','🔭']} value={focus} onChange={setFocus} />
          </div>

          <div className="glass rounded-2xl p-5 mb-4">
            <label className="text-sm text-slate-400 block mb-2">
              {type === 'morning' ? '🎯 Care e cel mai important lucru de azi?' : '✅ Ce ai realizat astăzi?'}
            </label>
            <textarea value={text1} onChange={e => setText1(e.target.value)} rows={2} placeholder="Scrie..."
              className="w-full bg-transparent text-slate-200 placeholder-slate-600 text-sm focus:outline-none resize-none" />
          </div>

          <div className="glass rounded-2xl p-5 mb-6">
            <label className="text-sm text-slate-400 block mb-2">
              {type === 'morning' ? '⚠️ Care e cel mai mare obstacol anticipat?' : '💡 Ce ai învățat astăzi?'}
            </label>
            <textarea value={text2} onChange={e => setText2(e.target.value)} rows={2} placeholder="Scrie..."
              className="w-full bg-transparent text-slate-200 placeholder-slate-600 text-sm focus:outline-none resize-none" />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={submit}
            disabled={!text1.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl font-semibold transition-all">
            Salvează check-in-ul
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
