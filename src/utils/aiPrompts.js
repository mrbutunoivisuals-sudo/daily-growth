import { LEARNING_STYLES } from './questions.js';
import { getDomainName } from './scoring.js';

const JSON_INSTRUCTION = '\nRăspunde DOAR cu JSON valid, fără markdown, fără ```, fără text înainte sau după. Începe direct cu { sau [.';

export function buildInsightPrompt(profile) {
  const { name, assessmentScores, learningStyle } = profile;
  const weak = Object.entries(assessmentScores || {})
    .sort(([, a], [, b]) => a - b).slice(0, 3)
    .map(([id, s]) => `${getDomainName(id)}:${s}%`).join(', ');
  const style = LEARNING_STYLES[learningStyle?.dominant]?.name || 'Mixt';

  return `Coach dezvoltare personală, română.
Utilizator: ${name}, stil ${style}, zone slabe: ${weak}.
Generează 3 insight-uri scurte și directe (max 1 propoziție fiecare).
Format: [{"title":"...","text":"...","domain":"id"},{"title":"...","text":"...","domain":"id"},{"title":"...","text":"...","domain":"id"}]${JSON_INSTRUCTION}`;
}

export function buildSessionPrompt(domain, learningStyle, sessionNumber, previousConcepts) {
  const domainName = getDomainName(domain);
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  const prev = previousConcepts?.slice(-2).join(', ') || 'prima sesiune';

  return `Educator ${domainName}, română, stil ${style}. Sesiunea #${sessionNumber}. Anterior: ${prev}.
Creează o sesiune de învățare cu structura EXACTĂ:
{"concept":"...","anchor":{"title":"...","content":"..."},"main":{"title":"...","content":"...","keyPoints":["...","...","..."]},"exercise":{"title":"...","instruction":"...","duration":"3 min"},"connection":{"title":"...","content":"..."},"cliffhanger":"...","quiz":[{"question":"...","options":["A....","B....","C....","D...."],"correct":0,"explanation":"..."},{"question":"...","options":["A....","B....","C....","D...."],"correct":1,"explanation":"..."},{"question":"...","options":["A....","B....","C....","D...."],"correct":2,"explanation":"..."}]}${JSON_INSTRUCTION}`;
}

export function buildQuizExplanationPrompt(question, userAnswer, correctAnswer, learningStyle) {
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  return `Răspuns greșit la quiz. Stil: ${style}.
Întrebare: "${question}" | Ales: "${userAnswer}" | Corect: "${correctAnswer}"
Explică în 2 propoziții de ce e greșit, adaptat stilului ${style}. Răspunde doar cu textul explicației, fără JSON.`;
}

export function buildCurriculumPrompt(domainName) {
  return `Curriculum auto-educație "${domainName}", română.
Format: {"title":"...","description":"...","duration":"X săptămâni","modules":[{"id":1,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":2,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":3,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":4,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"},{"id":5,"title":"...","objective":"...","concepts":["...","..."],"duration":"X zile"}]}${JSON_INSTRUCTION}`;
}

export function buildIdentityMessagePrompt(name, streakDays, dominantDomain) {
  return `Mesaj identitate (nu performanță) pentru ${name}, ${streakDays} zile streak, domeniu ${getDomainName(dominantDomain)}. 1-2 propoziții, folosește "tu"/"ești". Răspunde doar cu mesajul, fără JSON, fără ghilimele.`;
}
