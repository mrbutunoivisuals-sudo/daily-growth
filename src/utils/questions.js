export const DOMAINS = [
  { id: 'mindset', name: 'Mentalitate', icon: '🧠', color: '#6366f1' },
  { id: 'health', name: 'Sănătate', icon: '💪', color: '#10b981' },
  { id: 'career', name: 'Carieră', icon: '🚀', color: '#f59e0b' },
  { id: 'finance', name: 'Finanțe', icon: '💰', color: '#06b6d4' },
  { id: 'relations', name: 'Relații', icon: '❤️', color: '#ec4899' },
  { id: 'purpose', name: 'Scop', icon: '🎯', color: '#8b5cf6' },
  { id: 'learning', name: 'Învățare', icon: '📚', color: '#f97316' },
];

const SCALE = [
  { value: 1, label: 'Aproape niciodată' },
  { value: 2, label: 'Rareori' },
  { value: 3, label: 'Uneori' },
  { value: 4, label: 'Frecvent' },
  { value: 5, label: 'Aproape întotdeauna' },
];

export const ASSESSMENT_QUESTIONS = [
  // Mentalitate (8)
  { id: 'ms1', domain: 'mindset', text: 'Când dai greș la ceva important, te ridici rapid și cauți lecția din experiență?', scale: SCALE },
  { id: 'ms2', domain: 'mindset', text: 'Crezi că abilitățile tale se pot dezvolta prin efort și practică deliberată?', scale: SCALE },
  { id: 'ms3', domain: 'mindset', text: 'Reușești să rămâi calm și focusat în situații de presiune sau incertitudine?', scale: SCALE },
  { id: 'ms4', domain: 'mindset', text: 'Îți asumi responsabilitatea pentru rezultatele vieții tale, fără să dai vina pe factori externi?', scale: SCALE },
  { id: 'ms5', domain: 'mindset', text: 'Poți să te privești obiectiv, recunoscând atât punctele forte cât și limitele?', scale: SCALE },
  { id: 'ms6', domain: 'mindset', text: 'Reușești să menții gânduri constructive chiar și în momente dificile?', scale: SCALE },
  { id: 'ms7', domain: 'mindset', text: 'Ești confortabil cu disconfortul și incertitudinea ca parte din creștere?', scale: SCALE },
  { id: 'ms8', domain: 'mindset', text: 'Te compari cu versiunea ta anterioară, nu cu alții?', scale: SCALE },

  // Sănătate (8)
  { id: 'hl1', domain: 'health', text: 'Faci activitate fizică regulată (cel puțin 3 ori pe săptămână)?', scale: SCALE },
  { id: 'hl2', domain: 'health', text: 'Dormi 7-8 ore pe noapte și te trezești odihnit?', scale: SCALE },
  { id: 'hl3', domain: 'health', text: 'Mănânci alimente nutritive, echilibrate, fără restricții extreme?', scale: SCALE },
  { id: 'hl4', domain: 'health', text: 'Îți gestionezi eficient nivelul de stres zilnic?', scale: SCALE },
  { id: 'hl5', domain: 'health', text: 'Ai energie susținută pe parcursul zilei, fără căderi bruște?', scale: SCALE },
  { id: 'hl6', domain: 'health', text: 'Acorzi atenție sănătății mintale la fel de mult ca celei fizice?', scale: SCALE },
  { id: 'hl7', domain: 'health', text: 'Eviți obiceiuri dăunătoare (fumat, alcool excesiv, sedentarism)?', scale: SCALE },
  { id: 'hl8', domain: 'health', text: 'Faci controale medicale regulate și te îngrijești preventiv?', scale: SCALE },

  // Carieră (9)
  { id: 'cr1', domain: 'career', text: 'Munca ta zilnică îți aduce satisfacție și sens personal?', scale: SCALE },
  { id: 'cr2', domain: 'career', text: 'Ai o direcție clară pentru cariera ta în următorii 3-5 ani?', scale: SCALE },
  { id: 'cr3', domain: 'career', text: 'Îți dezvolți activ noi abilități relevante pentru domeniul tău?', scale: SCALE },
  { id: 'cr4', domain: 'career', text: 'Comunicarea ta profesională (prezentări, negocieri, email) e eficientă?', scale: SCALE },
  { id: 'cr5', domain: 'career', text: 'Reușești să livrezi rezultate de calitate în termenele stabilite?', scale: SCALE },
  { id: 'cr6', domain: 'career', text: 'Construiești relații profesionale valoroase și networking activ?', scale: SCALE },
  { id: 'cr7', domain: 'career', text: 'Îți gestionezi bine timpul și prioritățile la muncă?', scale: SCALE },
  { id: 'cr8', domain: 'career', text: 'Primești recunoaștere pentru contribuțiile tale profesionale?', scale: SCALE },
  { id: 'cr9', domain: 'career', text: 'Te simți confortabil să ceri mărire de salariu sau avansare când o meriți?', scale: SCALE },

  // Finanțe (8)
  { id: 'fn1', domain: 'finance', text: 'Ai un buget lunar și îl respecți consecvent?', scale: SCALE },
  { id: 'fn2', domain: 'finance', text: 'Economisești cel puțin 10-20% din venitul tău lunar?', scale: SCALE },
  { id: 'fn3', domain: 'finance', text: 'Ai un fond de urgență de 3-6 luni de cheltuieli?', scale: SCALE },
  { id: 'fn4', domain: 'finance', text: 'Înțelegi cum funcționează investițiile și ai bani investiți activ?', scale: SCALE },
  { id: 'fn5', domain: 'finance', text: 'Iei decizii financiare bazate pe analiză, nu pe impuls sau emoție?', scale: SCALE },
  { id: 'fn6', domain: 'finance', text: 'Nivelul tău de datorii e gestionabil și în scădere?', scale: SCALE },
  { id: 'fn7', domain: 'finance', text: 'Înveți regulat despre educație financiară și planificare?', scale: SCALE },
  { id: 'fn8', domain: 'finance', text: 'Ești confortabil cu situația ta financiară actuală și cu direcția ei?', scale: SCALE },

  // Relații (9)
  { id: 'rl1', domain: 'relations', text: 'Ai relații profunde, autentice, bazate pe încredere reciprocă?', scale: SCALE },
  { id: 'rl2', domain: 'relations', text: 'Comunici deschis și sincer nevoile tale în relații?', scale: SCALE },
  { id: 'rl3', domain: 'relations', text: 'Ești cu adevărat prezent în conversații (fără distracții digitale)?', scale: SCALE },
  { id: 'rl4', domain: 'relations', text: 'Gestionezi conflictele constructiv, fără să eviți sau să escaladezi?', scale: SCALE },
  { id: 'rl5', domain: 'relations', text: 'Știi să setezi limite sănătoase în relații?', scale: SCALE },
  { id: 'rl6', domain: 'relations', text: 'Investești timp și energie în relațiile care contează?', scale: SCALE },
  { id: 'rl7', domain: 'relations', text: 'Te simți apreciat și respectat de persoanele din viața ta?', scale: SCALE },
  { id: 'rl8', domain: 'relations', text: 'Ai cel puțin o persoană cu care poți vorbi complet deschis?', scale: SCALE },
  { id: 'rl9', domain: 'relations', text: 'Relația cu tine însuți (auto-compasiune, auto-cunoaștere) e sănătoasă?', scale: SCALE },

  // Scop (8)
  { id: 'pp1', domain: 'purpose', text: 'Ai o viziune clară despre ce vrei să creezi sau să contribui în lume?', scale: SCALE },
  { id: 'pp2', domain: 'purpose', text: 'Activitățile tale zilnice se aliniază cu valorile tale profunde?', scale: SCALE },
  { id: 'pp3', domain: 'purpose', text: 'Simți că munca și viața ta au sens și impact dincolo de tine?', scale: SCALE },
  { id: 'pp4', domain: 'purpose', text: 'Îți cunoști valorile fundamentale și le trăiești activ?', scale: SCALE },
  { id: 'pp5', domain: 'purpose', text: 'Ai obiective pe termen lung care te inspiră și te motivează?', scale: SCALE },
  { id: 'pp6', domain: 'purpose', text: 'Te trezești dimineața cu un sentiment de direcție și scop?', scale: SCALE },
  { id: 'pp7', domain: 'purpose', text: 'Contribui activ la ceva mai mare decât tine (comunitate, cauze, oameni)?', scale: SCALE },
  { id: 'pp8', domain: 'purpose', text: 'Simți că îți folosești talentele și darurile în modul potrivit?', scale: SCALE },

  // Învățare (8)
  { id: 'ln1', domain: 'learning', text: 'Înveți ceva nou în mod deliberat cel puțin câteva ore pe săptămână?', scale: SCALE },
  { id: 'ln2', domain: 'learning', text: 'Aplici activ ceea ce înveți în viața sau munca ta?', scale: SCALE },
  { id: 'ln3', domain: 'learning', text: 'Ești curios și deschis față de idei care îți provoacă convingerile?', scale: SCALE },
  { id: 'ln4', domain: 'learning', text: 'Ai un sistem de notare și revizie a lucrurilor importante pe care le înveți?', scale: SCALE },
  { id: 'ln5', domain: 'learning', text: 'Cauți feedback sincer și îl folosești pentru îmbunătățire?', scale: SCALE },
  { id: 'ln6', domain: 'learning', text: 'Transformi erorile în lecții concrete?', scale: SCALE },
  { id: 'ln7', domain: 'learning', text: 'Ești confortabil să fii începător în domenii noi?', scale: SCALE },
  { id: 'ln8', domain: 'learning', text: 'Ai o rutină de lectură sau consum de conținut educativ de calitate?', scale: SCALE },
];

export const LEARNING_PROFILE_QUESTIONS = [
  {
    id: 'lp1',
    text: 'Când înveți ceva nou, preferi să...',
    options: [
      { value: 'visual', label: 'Vezi diagrame, grafice sau exemple vizuale' },
      { value: 'logical', label: 'Înțelegi logica și structura din spate' },
      { value: 'narrative', label: 'Asculți/citești o poveste sau un caz real' },
      { value: 'kinesthetic', label: 'Încerci direct și înveți din practică' },
    ],
  },
  {
    id: 'lp2',
    text: 'Când îți explici ceva altcuiva, de obicei...',
    options: [
      { value: 'visual', label: 'Desenezi sau arăți cu mâinile forma lucrului' },
      { value: 'logical', label: 'Explici pas cu pas, cu argumente clare' },
      { value: 'narrative', label: 'Spui o poveste sau o analogie' },
      { value: 'kinesthetic', label: 'Îl pui să facă el singur, pas cu pas' },
    ],
  },
  {
    id: 'lp3',
    text: 'Care tip de carte/curs te captivează cel mai mult?',
    options: [
      { value: 'visual', label: 'Infografice, tutoriale video, prezentări vizuale' },
      { value: 'logical', label: 'Cărți dense cu sisteme și framework-uri' },
      { value: 'narrative', label: 'Memorii, studii de caz, povești de succes' },
      { value: 'kinesthetic', label: 'Workshops practice, proiecte hands-on' },
    ],
  },
  {
    id: 'lp4',
    text: 'Când iei notițe, preferi să...',
    options: [
      { value: 'visual', label: 'Faci mind maps sau scheme colorate' },
      { value: 'logical', label: 'Structurezi pe bullet points și ierarhii clare' },
      { value: 'narrative', label: 'Scrii în formă narativă, cu context și exemple' },
      { value: 'kinesthetic', label: 'Scrii puțin, dar experimentezi mult' },
    ],
  },
  {
    id: 'lp5',
    text: 'Când ai de luat o decizie importantă...',
    options: [
      { value: 'visual', label: 'Vizualizezi scenariile posibile mental sau pe hârtie' },
      { value: 'logical', label: 'Faci o analiză pro/contra sistematică' },
      { value: 'narrative', label: 'Cauți exemple de oameni care au trecut prin asta' },
      { value: 'kinesthetic', label: 'Simți intuitiv ce e bine și acționezi' },
    ],
  },
  {
    id: 'lp6',
    text: 'Cum îți amintești cel mai bine informații noi?',
    options: [
      { value: 'visual', label: 'Asociind cu imagini sau locații mentale' },
      { value: 'logical', label: 'Înțelegând de ce funcționează logica' },
      { value: 'narrative', label: 'Plasând informația într-o poveste' },
      { value: 'kinesthetic', label: 'Repetând fizic sau aplicând imediat' },
    ],
  },
  {
    id: 'lp7',
    text: 'Când ești blocat la un concept greu, ce ajută?',
    options: [
      { value: 'visual', label: 'O schemă sau o metaforă vizuală clară' },
      { value: 'logical', label: 'Să îl descompui în pași mai mici, logici' },
      { value: 'narrative', label: 'Un exemplu concret din viața reală' },
      { value: 'kinesthetic', label: 'Să faci ceva cu acel concept, orice' },
    ],
  },
  {
    id: 'lp8',
    text: 'Care e ritmul tău ideal de învățare?',
    options: [
      { value: 'visual', label: 'Scurte sesiuni intense cu mult material vizual' },
      { value: 'logical', label: 'Sesiuni lungi, cu adâncime și structură' },
      { value: 'narrative', label: 'Lecturi lungi, absorbind contextul complet' },
      { value: 'kinesthetic', label: 'Scurt, direct, cu practică imediată' },
    ],
  },
  {
    id: 'lp9',
    text: 'Ce te motivează mai mult să înveți?',
    options: [
      { value: 'visual', label: 'Să văd progresul vizual și conexiunile' },
      { value: 'logical', label: 'Să înțeleg sistemul complet, de la fundament' },
      { value: 'narrative', label: 'Poveștile inspiraționale ale altora' },
      { value: 'kinesthetic', label: 'Să văd un rezultat concret rapid' },
    ],
  },
  {
    id: 'lp10',
    text: 'Cum abordezi un proiect nou?',
    options: [
      { value: 'visual', label: 'Fac un plan vizual/flowchart înainte' },
      { value: 'logical', label: 'Analizez toate variabilele, apoi structurez' },
      { value: 'narrative', label: 'Caut exemple similare, inspirație și context' },
      { value: 'kinesthetic', label: 'Încep direct, ajustez pe parcurs' },
    ],
  },
  {
    id: 'lp11',
    text: 'Când ești în ședință sau la curs, ești mai atent când...',
    options: [
      { value: 'visual', label: 'Sunt slide-uri sau vizuale pe ecran' },
      { value: 'logical', label: 'Există o structură clară și logică a prezentării' },
      { value: 'narrative', label: 'Prezentatorul spune povești și exemple' },
      { value: 'kinesthetic', label: 'Există exerciții practice sau discuții' },
    ],
  },
  {
    id: 'lp12',
    text: 'Cum te simți cel mai bine după o sesiune de învățare?',
    options: [
      { value: 'visual', label: 'Când am creat o schemă sau o hartă mentală' },
      { value: 'logical', label: 'Când am înțeles complet sistemul' },
      { value: 'narrative', label: 'Când am o poveste sau o analogie care explică totul' },
      { value: 'kinesthetic', label: 'Când am aplicat ceva concret imediat' },
    ],
  },
  {
    id: 'lp13',
    text: 'Cum înveți cel mai bine o limbă nouă?',
    options: [
      { value: 'visual', label: 'Flashcards, imagini, clipuri cu subtitrare' },
      { value: 'logical', label: 'Gramatică sistematică, reguli clare' },
      { value: 'narrative', label: 'Seriale, cărți, conversații autentice' },
      { value: 'kinesthetic', label: 'Imersie totală, vorbit din prima zi' },
    ],
  },
  {
    id: 'lp14',
    text: 'Cum știi că ai înțeles cu adevărat ceva?',
    options: [
      { value: 'visual', label: 'Pot să îl vizualizez clar în minte' },
      { value: 'logical', label: 'Pot să îl explic fără să mă uit pe notițe' },
      { value: 'narrative', label: 'Îl pot lega de experiențe din viața mea' },
      { value: 'kinesthetic', label: 'L-am aplicat și a funcționat' },
    ],
  },
  {
    id: 'lp15',
    text: 'Cel mai mare obstacol în învățare pentru tine este...',
    options: [
      { value: 'visual', label: 'Prea mult text, prea puțin vizual' },
      { value: 'logical', label: 'Lipsa de structură și context' },
      { value: 'narrative', label: 'Informații abstracte fără exemple reale' },
      { value: 'kinesthetic', label: 'Prea multă teorie, prea puțină practică' },
    ],
  },
];

export const LEARNING_STYLES = {
  visual: { name: 'Vizual', icon: '👁️', description: 'Înveți cel mai bine prin imagini, diagrame și reprezentări spațiale.' },
  logical: { name: 'Logic', icon: '🔢', description: 'Înveți cel mai bine prin sisteme, structuri și raționament analitic.' },
  narrative: { name: 'Narativ', icon: '📖', description: 'Înveți cel mai bine prin povești, analogii și contexte reale.' },
  kinesthetic: { name: 'Kinestezic', icon: '🤲', description: 'Înveți cel mai bine prin practică directă și experimentare.' },
};
