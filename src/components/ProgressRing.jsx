export default function ProgressRing({ score, size = 80, color = '#6366f1', label, sublabel }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontSize: size < 60 ? '12px' : '14px', fill: '#e2e8f0', fontWeight: 600 }}>
          {score}%
        </text>
      </svg>
      {label && <span className="text-xs text-slate-400 text-center leading-tight">{label}</span>}
      {sublabel && <span className="text-xs text-slate-600">{sublabel}</span>}
    </div>
  );
}
