import { DOMAINS } from './questions.js';

export function calculateAssessmentScores(answers) {
  const scores = {};
  const counts = {};

  DOMAINS.forEach(d => {
    scores[d.id] = 0;
    counts[d.id] = 0;
  });

  Object.entries(answers).forEach(([questionId, value]) => {
    const domain = DOMAINS.find(d => questionId.startsWith(d.id.substring(0, 2)));
    if (domain) {
      scores[domain.id] += value;
      counts[domain.id]++;
    }
  });

  const normalized = {};
  DOMAINS.forEach(d => {
    normalized[d.id] = counts[d.id] > 0
      ? Math.round((scores[d.id] / (counts[d.id] * 5)) * 100)
      : 0;
  });

  return normalized;
}

export function getTopWeakDomains(scores, count = 3) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, count)
    .map(([id]) => id);
}

export function calculateLearningStyle(answers) {
  const counts = { visual: 0, logical: 0, narrative: 0, kinesthetic: 0 };
  Object.values(answers).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const percentages = {};
  Object.entries(counts).forEach(([k, v]) => { percentages[k] = Math.round((v / total) * 100); });
  const dominant = Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];
  return { percentages, dominant };
}

export function getDomainName(id) {
  return DOMAINS.find(d => d.id === id)?.name || id;
}

export function getDomainColor(id) {
  return DOMAINS.find(d => d.id === id)?.color || '#6366f1';
}

export function getDomainIcon(id) {
  return DOMAINS.find(d => d.id === id)?.icon || '📌';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excelent';
  if (score >= 60) return 'Bun';
  if (score >= 40) return 'Moderat';
  if (score >= 20) return 'Necesită atenție';
  return 'Prioritate majoră';
}

export function getScoreColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#6366f1';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}
