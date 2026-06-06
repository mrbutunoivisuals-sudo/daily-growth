import { Radar, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DOMAINS } from '../utils/questions.js';

export default function RadarChart({ scores, previousScores, size = 300 }) {
  const data = DOMAINS.map(d => ({
    domain: d.name,
    icon: d.icon,
    current: scores?.[d.id] || 0,
    previous: previousScores?.[d.id] || 0,
  }));

  const CustomTick = ({ x, y, payload }) => {
    const item = data.find(d => d.domain === payload.value);
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" style={{ fontSize: '11px', fill: '#94a3b8' }}>
        {item?.icon} {payload.value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={size}>
      <ReRadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="domain" tick={<CustomTick />} />
        <Tooltip
          contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0' }}
          formatter={(value, name) => [`${value}%`, name === 'current' ? 'Acum' : 'Anterior']}
        />
        {previousScores && (
          <Radar name="previous" dataKey="previous" stroke="rgba(99,102,241,0.3)" fill="rgba(99,102,241,0.05)" strokeDasharray="4 4" />
        )}
        <Radar name="current" dataKey="current" stroke="#6366f1" fill="rgba(99,102,241,0.2)" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
