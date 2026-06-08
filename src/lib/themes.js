/**
 * Base de teme curate — organizate pe 4 piloni.
 * Coach-ul AI alege din această listă pe baza check-in-ului zilnic.
 */

export const PILLARS = {
  disciplina: { label: 'Disciplină & Productivitate', emoji: '⚙️', color: '#7C6FF7' },
  credinta:   { label: 'Credință',                    emoji: '✝️',  color: '#10B981' },
  familie:    { label: 'Familie & Parenting',          emoji: '❤️',  color: '#F59E0B' },
  antreprenoriat: { label: 'Antreprenoriat',           emoji: '🚀',  color: '#3B82F6' },
};

export const ALL_THEMES = [
  // ── DISCIPLINĂ & PRODUCTIVITATE ──────────────────────────────────────────────
  {
    key: 'morning_ritual',
    pillar: 'disciplina',
    title: 'Ritualul dimineții',
    hint: 'Prima oră din zi îți setează tonul pentru tot restul. Ritualizează-o.',
  },
  {
    key: 'five_second_rule',
    pillar: 'disciplina',
    title: 'Acționează înainte de emoție',
    hint: 'Creierul tău va găsi mereu un motiv să amâne. Acțiunea vine înainte de motivație.',
  },
  {
    key: 'deep_focus',
    pillar: 'disciplina',
    title: 'Un singur lucru (Deep Work)',
    hint: 'Multi-tasking este iluzia productivității. Focusul profund creează rezultate reale.',
  },
  {
    key: 'energy_management',
    pillar: 'disciplina',
    title: 'Energia ca resursă, nu timpul',
    hint: 'Nu îți lipsește timpul — îți lipsește energia. Cum o protejezi și o regenerezi.',
  },
  {
    key: 'false_urgency',
    pillar: 'disciplina',
    title: 'Urgent vs Important',
    hint: 'Cei mai mulți oameni trăiesc în urgență falsă și neglijează ce e cu adevărat important.',
  },
  {
    key: 'consistency_beats_intensity',
    pillar: 'disciplina',
    title: 'Consecvența bate intensitatea',
    hint: 'Nu exploziile de efort contează — ci ce faci zilnic, indiferent de chef.',
  },
  {
    key: 'weekly_planning',
    pillar: 'disciplina',
    title: 'Planificarea săptămânii',
    hint: 'Cei care planifică săptămâna duminica seara trăiesc diferit față de cei care o improvizează.',
  },
  {
    key: 'mental_declutter',
    pillar: 'disciplina',
    title: 'Curăță-ți spațiul mental',
    hint: 'Mintea aglomerată ia decizii proaste. Externalizează, prioritizează, eliberează.',
  },
  {
    key: 'identity_over_habit',
    pillar: 'disciplina',
    title: 'Identitate, nu obiceiuri',
    hint: 'Jim Rohn: nu construiești obiceiuri bune — devii tipul de om care face acele lucruri.',
  },

  // ── CREDINȚĂ ─────────────────────────────────────────────────────────────────
  {
    key: 'identity_in_christ',
    pillar: 'credinta',
    title: 'Identitatea în Hristos',
    hint: 'Cine ești tu dincolo de performanță, roluri și succese? Fundament care nu se clatină.',
  },
  {
    key: 'prayer_as_dialogue',
    pillar: 'credinta',
    title: 'Rugăciunea ca dialog',
    hint: 'Nu o listă de cereri — o relație. Cum arată rugăciunea unui om de afaceri activ.',
  },
  {
    key: 'serving_as_power',
    pillar: 'credinta',
    title: 'Servirea ca putere',
    hint: 'Cel mai mare dintre voi va fi servitorul tuturor. Paradoxul care funcționează în business.',
  },
  {
    key: 'gratitude_as_antidote',
    pillar: 'credinta',
    title: 'Recunoștința ca antidot',
    hint: 'Nu poți fi anxios și recunoscător în același timp. Practica recunoștinței schimbă neurologia.',
  },
  {
    key: 'peace_beyond_understanding',
    pillar: 'credinta',
    title: 'Pacea care depășește înțelegerea',
    hint: 'Când totul strigă "îngrijorează-te", cum practici pacea activă în mijlocul haosului.',
  },
  {
    key: 'courage_not_absence_of_fear',
    pillar: 'credinta',
    title: 'Curajul nu e absența fricii',
    hint: 'Frica este informație, nu comandă. Cum acționezi credincios când ești speriat.',
  },
  {
    key: 'forgiveness_as_freedom',
    pillar: 'credinta',
    title: 'Iertarea ca libertate personală',
    hint: 'Iertarea nu e pentru celălalt — e pentru tine. Cum eliberezi povara ranchiundei.',
  },
  {
    key: 'providence_vs_control',
    pillar: 'credinta',
    title: 'Providența vs controlul anxios',
    hint: 'Linia fină dintre responsabilitate și obsesia controlului. Ce e al tău și ce e al lui Dumnezeu.',
  },

  // ── FAMILIE & PARENTING ───────────────────────────────────────────────────────
  {
    key: 'full_presence',
    pillar: 'familie',
    title: 'Prezența completă',
    hint: 'Copiii tăi nu vor aminti că ai lucrat mult — vor aminti că ai fost acolo cu adevărat.',
  },
  {
    key: 'discipline_with_love',
    pillar: 'familie',
    title: 'Disciplina cu dragoste',
    hint: 'Cum stabilești limite clare fără să îi zdrobești spiritul. Fermitate caldă.',
  },
  {
    key: 'model_not_instructor',
    pillar: 'familie',
    title: 'Fii modelul, nu instructorul',
    hint: 'Copiii fac ce văd, nu ce aud. Ce văd copiii tăi când te observă pe tine?',
  },
  {
    key: 'meaningful_conversations',
    pillar: 'familie',
    title: 'Conversații care contează',
    hint: 'Cum ajungi la inima unui copil. Întrebările corecte în momentele corecte.',
  },
  {
    key: 'intentional_husband',
    pillar: 'familie',
    title: 'Soțul intenționat',
    hint: 'Căsnicia nu se menține singură. Ce înseamnă să iubești activ, nu să presupui că e bine.',
  },
  {
    key: 'fatigue_as_warning',
    pillar: 'familie',
    title: 'Oboseala ca semnal',
    hint: 'Când ești prea obosit pentru familie, businessul a câștigat mai mult decât ar trebui.',
  },
  {
    key: 'family_rituals',
    pillar: 'familie',
    title: 'Ritualurile de familie',
    hint: 'Tradițiile și ritualurile construiesc sentimentul de siguranță și identitatea familiei.',
  },
  {
    key: 'words_that_remain',
    pillar: 'familie',
    title: 'Cuvintele care rămân',
    hint: 'Un cuvânt de la tată rămâne zeci de ani. Cum folosești această putere cu înțelepciune.',
  },

  // ── ANTREPRENORIAT ────────────────────────────────────────────────────────────
  {
    key: 'entrepreneur_identity',
    pillar: 'antreprenoriat',
    title: 'Identitatea antreprenorului',
    hint: 'Jim Rohn: lucrează mai mult la tine însuți decât la businessul tău. Antreprenorul este produsul.',
  },
  {
    key: 'client_consultation',
    pillar: 'antreprenoriat',
    title: 'Ascultă înainte să vinzi',
    hint: 'Cel mai bun vânzător din cameră e cel care ascultă cel mai bine. Diagnostichează înainte să prescrii.',
  },
  {
    key: 'selling_as_service',
    pillar: 'antreprenoriat',
    title: 'Vânzarea ca servire',
    hint: 'Dacă crezi cu adevărat în ce oferi, a nu vinde este un disserviciu față de client.',
  },
  {
    key: 'message_clarity',
    pillar: 'antreprenoriat',
    title: 'Claritatea mesajului',
    hint: 'Dacă nu poți explica în 30 secunde ce faci și pentru cine, vei pierde clienți la prima frază.',
  },
  {
    key: 'systems_beat_talent',
    pillar: 'antreprenoriat',
    title: 'Sistemele bat talentul',
    hint: 'Un business care depinde de entuziasmul tău zilnic nu e un business — e un job obositor.',
  },
  {
    key: 'fear_of_failure',
    pillar: 'antreprenoriat',
    title: 'Frica de eșec vs frica de stagnare',
    hint: 'Eșecul este reglabil. Stagnarea îți mănâncă energia lent, fără să știi.',
  },
  {
    key: 'values_based_decisions',
    pillar: 'antreprenoriat',
    title: 'Decizii din valori, nu din frică',
    hint: 'Cum recunoști când o decizie vine din frică vs din strategie clară? Test simplu.',
  },
  {
    key: 'growth_through_delegation',
    pillar: 'antreprenoriat',
    title: 'Crești prin delegare',
    hint: 'Dacă faci totul tu însuți, plafoanele businessului sunt limitate de orele tale.',
  },
];

// Mapping focus areas (din check-in) → pillars relevante
export const FOCUS_TO_PILLARS = {
  'Tată':        ['familie'],
  'Soț':         ['familie'],
  'Antreprenor': ['antreprenoriat'],
  'Disciplină':  ['disciplina'],
  'Credință':    ['credinta'],
};

/** Returnează lista de teme relevante pentru focus-urile selectate de user */
export function getRelevantThemes(focusAreas = []) {
  const pillars = new Set(
    focusAreas.flatMap(f => FOCUS_TO_PILLARS[f] || [])
  );
  if (pillars.size === 0) return ALL_THEMES; // fallback: toate temele
  return ALL_THEMES.filter(t => pillars.has(t.pillar));
}

/** Formatează lista de teme pentru prompt AI */
export function formatThemesForPrompt(themes) {
  return themes.map(t => {
    const pillar = PILLARS[t.pillar];
    return `- [${t.key}] ${pillar.emoji} ${t.title} (${pillar.label}): ${t.hint}`;
  }).join('\n');
}

/** Găsește o temă după key */
export function getTheme(key) {
  return ALL_THEMES.find(t => t.key === key) || null;
}
