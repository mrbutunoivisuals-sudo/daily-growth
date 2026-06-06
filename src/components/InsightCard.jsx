import { motion } from 'framer-motion';
import { getDomainColor, getDomainIcon } from '../utils/scoring.js';

export default function InsightCard({ insight, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ background: getDomainColor(insight.domain) }}
      />
      <div className="pl-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getDomainIcon(insight.domain)}</span>
          <h4 className="font-semibold text-slate-200 text-sm">{insight.title}</h4>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">{insight.text}</p>
      </div>
    </motion.div>
  );
}
