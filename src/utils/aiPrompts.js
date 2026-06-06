import { DOMAINS, LEARNING_STYLES } from './questions.js';
import { getDomainName } from './scoring.js';

export function buildInsightPrompt(profile) {
  const { name, assessmentScores, learningStyle, sessions } = profile;
  const domainSummary = Object.entries(assessmentScores || {})
    .map(([id, score]) => `${getDomainName(id)}: ${score}%`)
    .join(', ');
  const style = LEARNING_STYLES[learningStyle?.dominant]?.name || 'Mixt';
  const sessionCount = sessions?.length || 0;

  return `Ești un coach de dezvoltare personală empatic și direct. Vorbești în română.

Profilul utilizatorului "${name}":
- Scoruri pe domenii: ${domainSummary}
- Stil de învățare dominant: ${style}
- Sesiuni completate: ${sessionCount}

Generează 3 insight-uri personalizate, scurte și puternice (max 2 propoziții fiecare) pentru această persoană.
Fiecare insight trebuie să:
1. Se adreseze direct lui ${name} (folosește "tu")
2. Fie specific la scorurile lor, nu generic
3. Ofere o perspectivă neașteptată sau provocatoare

Format JSON strict:
[
  {"title": "Titlu scurt", "text": "Textul insight-ului", "domain": "id_domeniu"},
  {"title": "...", "text": "...", "domain": "..."},
  {"title": "...", "text": "...", "domain": "..."}
]

Returnează DOAR JSON-ul, fără text suplimentar.`;
}

export function buildSessionPrompt(domain, learningStyle, sessionNumber, previousConcepts) {
  const domainName = getDomainName(domain);
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  const styleDesc = LEARNING_STYLES[learningStyle]?.description || '';
  const prevContext = previousConcepts?.length > 0
    ? `Concepte anterioare: ${previousConcepts.slice(-3).join(', ')}.`
    : 'Prima sesiune pe acest domeniu.';

  return `Ești un educator expert în ${domainName}. Creezi conținut de învățare în română.

Stilul de învățare al utilizatorului: ${style} - ${styleDesc}
${prevContext}
Sesiunea #${sessionNumber}

Creează o sesiune de 13 minute structurată astfel:
1. ANCORARE (2 min): O întrebare sau scenă scurtă care activează cunoștințele existente
2. CONCEPT NOU (5 min): Un concept cheie explicat ÎN STILUL ${style.toUpperCase()} al utilizatorului
3. EXERCIȚIU (3 min): O activitate practică concretă legată de concept
4. CONEXIUNE (2 min): Cum se leagă acest concept de celelalte domenii de viață
5. CLIFFHANGER (1 min): O întrebare intrigantă care îi face să vrea mai mult

Returnează JSON strict:
{
  "concept": "Numele conceptului",
  "anchor": {"title": "...", "content": "..."},
  "main": {"title": "...", "content": "...", "keyPoints": ["...", "...", "..."]},
  "exercise": {"title": "...", "instruction": "...", "duration": "3 minute"},
  "connection": {"title": "...", "content": "..."},
  "cliffhanger": "Întrebarea cliffhanger...",
  "quiz": [
    {"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": 0, "explanation": "..."},
    {"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": 1, "explanation": "..."},
    {"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "correct": 2, "explanation": "..."}
  ]
}

Returnează DOAR JSON-ul.`;
}

export function buildQuizExplanationPrompt(question, userAnswer, correctAnswer, learningStyle) {
  const style = LEARNING_STYLES[learningStyle]?.name || 'Mixt';
  return `Utilizatorul a răspuns greșit la: "${question}"
Răspunsul lor: "${userAnswer}"
Răspunsul corect: "${correctAnswer}"
Stilul lor de învățare: ${style}

Explică de ce răspunsul corect este cel bun, adaptat stilului ${style}.
Max 3 propoziții. Vorbește direct ("ai ales X, dar..."). Fii empatic, nu condescendent.
Returnează doar textul explicației.`;
}

export function buildCurriculumPrompt(domainName) {
  return `Creează un curriculum complet de auto-educație pentru domeniul "${domainName}" în română.

Returnează JSON strict:
{
  "title": "Titlul oficial al curriculumului",
  "description": "1-2 propoziții despre ce vei învăța",
  "duration": "X săptămâni",
  "modules": [
    {
      "id": 1,
      "title": "Titlul modulului",
      "objective": "Ce vei putea face după",
      "concepts": ["concept1", "concept2", "concept3"],
      "duration": "X zile"
    }
  ]
}

Creează exact 5 module, progresive de la fundamental la avansat.
Returnează DOAR JSON-ul.`;
}

export function buildIdentityMessagePrompt(name, streakDays, dominantDomain) {
  const domainName = getDomainName(dominantDomain);
  return `Generează un mesaj de identitate (nu de performanță) pentru ${name}, care are o serie de ${streakDays} zile consecutive și lucrează mult la ${domainName}.

Mesajul trebuie să:
- Fie scurt (1-2 propoziții)
- Vorbească despre tipul de om care este, nu despre ce a realizat
- Fie puternic și memorabil
- Folosească "tu" sau "ești"

Exemple de ton: "Ești genul de om care nu renunță când devine greu.", "Oamenii ca tine schimbă lumea încet, dar sigur."

Returnează doar mesajul, fără ghilimele sau text suplimentar.`;
}
