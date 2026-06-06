import { LEARNING_STYLES } from './questions.js';
import { getDomainName } from './scoring.js';

export function buildInsightPrompt(profile) {
  const { name, assessmentScores, learningStyle } = profile;
  const weak = Object.entries(assessmentScores || {})
    .sort(([, a], [, b]) => a - b).slice(0, 3)
    .map(([id, s]) => `${getDomainName(id)}:${s}%`).join(', ');
  const style = LEARNING_STYLES[learningStyle?.dominant]?.name || 'Mixt';

  return `Coach dezvoltare personală, română, răspuns JSON.

Utilizator: ${name}, stil ${style}, zone slabe: ${weak}

3 insight-uri scurte și directe (max 1 propoziție fiecare).
JSON:
[{"title":"...","text":"...","domain":"id"},{"title":"...","text":"...","domain":"id"},{"title":"...","text":"...","domain":"id"}]

Doar JSON.`;
}

export function buildSessionPrompt(domain, learningStyle, sessionNumber, previousConcepts) {
  const domainName = getDomainName(domain);
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  const prev = previousConcepts?.slice(-2).join(', ') || 'prima sesiune';

  return `Educator ${domainName}, română, stil ${style}. Sesiunea #${sessionNumber}. Anterior: ${prev}.

Creează sesiune de învățare. JSON strict (fără text extra):
{"concept":"...","anchor":{"title":"...","content":"..."},"main":{"title":"...","content":"...","keyPoints":["...","...","..."]},"exercise":{"title":"...","instruction":"...","duration":"3 min"},"connection":{"title":"...","content":"..."},"cliffhanger":"...","quiz":[{"question":"...","options":["A....","B....","C....","D...."],"correct":0,"explanation":"..."},{"question":"...","options":["A....","B....","C....","D...."],"correct":1,"explanation":"..."},{"question":"...","options":["A....","B....","C....","D...."],"correct":2,"explanation":"..."}]}`;
}

export function buildQuizExplanationPrompt(question, userAnswer, correctAnswer, learningStyle) {
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  return `Răspuns greșit la quiz. Stil: ${style}.
Întrebare: "${question}" | Ales: "${userAnswer}" | Corect: "${correctAnswer}"
Explică în 2 propoziții de ce e greșit, adaptat stilului ${style}. Doar textul.`;
}

export function buildCurriculumPrompt(domainName) {
  return `Curriculum auto-educație "${domainName}", română. JSON strict:
{"title":"...","description":"...","duration":"X săptămâni","modules":[{"id":1,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":2,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":3,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":4,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":5,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"}]}
Doar JSON.`;
}

export function buildIdentityMessagePrompt(name, streakDays, dominantDomain) {
  return `Mesaj identitate (nu performanță) pentru ${name}, ${streakDays} zile streak, domeniu ${getDomainName(dominantDomain)}. 1-2 propoziții, folosește "tu"/"ești". Doar mesajul.`;
}
