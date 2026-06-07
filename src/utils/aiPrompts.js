import { LEARNING_STYLES } from './questions.js';
import { getDomainName } from './scoring.js';

const J = '\nRăspunde DOAR cu JSON valid, fără markdown, fără ```, fără text înainte sau după. Începe direct cu { sau [.';

export function buildInsightPrompt(profile) {
  const name = profile?.name || 'utilizator';
  const focus = profile?.focus || '';
  const goal = profile?.goal90 || '';
  const weak = Object.entries(profile?.assessmentScores || {})
    .sort(([, a], [, b]) => a - b).slice(0, 3)
    .map(([id, s]) => `${getDomainName(id)}:${s}%`).join(', ');

  return `Coach dezvoltare personală, română. Fii direct și specific.
Utilizator: ${name}, focus=${focus}, obiectiv 90 zile="${goal}"${weak ? `, zone slabe: ${weak}` : ''}.
Generează 1 insight puternic și specific (nu generic) pentru această persoană azi.
Format: {"title":"Titlu scurt","text":"1-2 propoziții directe adresate lui ${name}","domain":"${focus || 'mindset'}"}${J}`;
}

export function buildSessionPrompt(domain, learningStyle, sessionNumber, previousConcepts) {
  const domainName = getDomainName(domain);
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  const prev = previousConcepts?.slice(-2).join(', ') || 'prima sesiune';

  return `Educator ${domainName}, română, stil ${style}. Sesiunea #${sessionNumber}. Anterior: ${prev}.
Creează sesiune de învățare. Structură EXACTĂ:
{"concept":"...","anchor":{"title":"...","content":"..."},"main":{"title":"...","content":"...","keyPoints":["...","...","..."]},"exercise":{"title":"...","instruction":"...","duration":"3 min"},"connection":{"title":"...","content":"..."},"cliffhanger":"...","quiz":[{"question":"...","options":["A....","B....","C....","D...."],"correct":0,"explanation":"..."},{"question":"...","options":["A....","B....","C....","D...."],"correct":1,"explanation":"..."},{"question":"...","options":["A....","B....","C....","D...."],"correct":2,"explanation":"..."}]}${J}`;
}

export function buildQuizExplanationPrompt(question, userAnswer, correctAnswer, learningStyle) {
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  return `Quiz greșit. Stil: ${style}.
Întrebare: "${question}" | Ales: "${userAnswer}" | Corect: "${correctAnswer}"
Explică în 2 propoziții de ce e greșit, adaptat stilului ${style}. Doar textul, fără JSON.`;
}

export function buildCurriculumPrompt(domainName) {
  return `Curriculum auto-educație "${domainName}", română.
{"title":"...","description":"...","duration":"X săptămâni","modules":[{"id":1,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":2,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":3,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":4,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":5,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"}]}${J}`;
}

export function buildWeeklyReviewPrompt(profile, checkins, habits, goals, challenges) {
  const name = profile?.name || 'utilizator';
  const completedHabits = habits.filter(h => (h.completions || []).length > 0).length;
  const completedGoals = goals.filter(g => g.status === 'done').length;
  const avgMood = checkins.length > 0
    ? Math.round(checkins.slice(-7).reduce((a, c) => a + (c.mood || 3), 0) / Math.min(checkins.length, 7))
    : 3;

  return `Review săptămânal pentru ${name}. Date: ${completedHabits} obiceiuri active, ${completedGoals} obiective completate, mood mediu ${avgMood}/5.
Generează review săptămânal:
{"wins":["...","..."],"lessons":["..."],"score":${Math.round((completedHabits * 10 + completedGoals * 20 + avgMood * 10) / 3)},"nextWeekFocus":"...","recommendation":"..."}${J}`;
}
