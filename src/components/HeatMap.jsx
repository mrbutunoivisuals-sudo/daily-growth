export default function HeatMap({ sessions }) {
  const days = 35;
  const today = new Date();
  const sessionDates = new Set((sessions || []).map(s => new Date(s.date).toDateString()));

  const cells = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const dateStr = date.toDateString();
    const count = (sessions || []).filter(s => new Date(s.date).toDateString() === dateStr).length;
    return { date, count, active: sessionDates.has(dateStr) };
  });

  const getColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count === 1) return 'rgba(99,102,241,0.3)';
    if (count === 2) return 'rgba(99,102,241,0.6)';
    return '#6366f1';
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {cells.map((cell, i) => (
          <div
            key={i}
            title={`${cell.date.toLocaleDateString('ro-RO')}: ${cell.count} sesiuni`}
            style={{ width: 12, height: 12, borderRadius: 3, background: getColor(cell.count), transition: 'background 0.2s' }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
        <span>Mai puțin</span>
        {[0, 1, 2, 3].map(n => (
          <div key={n} style={{ width: 10, height: 10, borderRadius: 2, background: getColor(n) }} />
        ))}
        <span>Mai mult</span>
      </div>
    </div>
  );
}
