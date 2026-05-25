import type { StudyAbroadEntry } from '../../types/hubs'

/**
 * Universities and colleges that actively recruit international students —
 * especially popular with South Africans (USA & Europe).
 */
export const INTERNATIONAL_UNIVERSITIES: StudyAbroadEntry[] = [
  {
    id: 'mit-intl',
    name: 'MIT — International undergraduate admissions',
    shortName: 'MIT',
    category: 'international-university',
    destination: 'United States',
    destinationFlag: '🇺🇸',
    website: 'https://mitadmissions.org/apply/international/',
    whatItOffers:
      'World-leading STEM university in Cambridge, Massachusetts. Accepts international applicants with NSC + SAT/ACT; ' +
      'need-aware financial aid for internationals — many SA students compete for highly selective places.',
    whoCanApply: [
      'Strong matric (often 80%+ with rigorous subjects)',
      'SAT or ACT required',
      'English proficiency if not taught in English',
      'Extracurricular depth and essays critical',
    ],
    applicationOpens: 'Aug (Common App cycle)',
    applicationCloses: 'Early Jan (Regular Action — confirm annually)',
    fundingLevel: 'Need-based aid may cover full cost if admitted — not merit-only for internationals',
    links: [
      { label: 'MIT international applicants', url: 'https://mitadmissions.org/apply/international/', kind: 'official' },
      { label: 'MIT financial aid', url: 'https://sfs.mit.edu/undergraduate-students/', kind: 'guide' },
    ],
    notes:
      'Extremely competitive. Pair with EducationUSA advising. Consider also applying to other US tech universities.',
    popularityRank: 101,
  },
  {
    id: 'ucla-intl',
    name: 'UCLA — International freshman admissions',
    shortName: 'UCLA',
    category: 'international-university',
    destination: 'United States',
    destinationFlag: '🇺🇸',
    website: 'https://admission.ucla.edu/apply/international-applicants',
    whatItOffers:
      'Top public research university in California. Large international community; wide range of majors. ' +
      'Uses UC application system — separate from Common App.',
    whoCanApply: [
      'International secondary school graduates',
      'Strong academic record in university-prep subjects',
      'English proficiency (TOEFL/IELTS/Duolingo per UCLA policy)',
    ],
    applicationOpens: 'Aug (UC application)',
    applicationCloses: 'Late Nov (UC system deadline)',
    fundingLevel: 'Limited aid for internationals — budget for full cost of attendance',
    links: [
      { label: 'UCLA international applicants', url: 'https://admission.ucla.edu/apply/international-applicants', kind: 'official' },
      { label: 'UC Apply portal', url: 'https://www.universityofcalifornia.edu/apply', kind: 'register' },
    ],
    notes: 'Also research UC Berkeley, UC San Diego, and other UC campuses on one application.',
    popularityRank: 102,
  },
  {
    id: 'nyu-intl',
    name: 'NYU — International student admissions',
    shortName: 'NYU',
    category: 'international-university',
    destination: 'United States',
    destinationFlag: '🇺🇸',
    website: 'https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/international-applicants.html',
    whatItOffers:
      'Private university in New York City with global campuses (Abu Dhabi, Shanghai). Popular for business, arts, media, and liberal arts.',
    whoCanApply: [
      'International school graduates',
      'Common App or NYU application',
      'Standardised tests per current NYU policy',
      'English proficiency',
    ],
    applicationOpens: 'Aug (fall intake)',
    applicationCloses: 'Early Jan (Regular Decision — confirm)',
    fundingLevel: 'Merit and need-based scholarships limited for internationals — check NYU Abu Dhabi for full scholarships',
    links: [
      { label: 'NYU international admissions', url: 'https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/international-applicants.html', kind: 'official' },
      { label: 'NYU Abu Dhabi admissions', url: 'https://nyuad.nyu.edu/en/admissions/', kind: 'guide' },
    ],
    notes: 'NYU Abu Dhabi offers generous funding for selected global students — separate application.',
    popularityRank: 103,
  },
  {
    id: 'uva-intl',
    name: 'University of Amsterdam — International students',
    shortName: 'UvA',
    category: 'international-university',
    destination: 'Netherlands',
    destinationFlag: '🇳🇱',
    website: 'https://www.uva.nl/en/education/international-students',
    whatItOffers:
      'English-taught bachelor\'s and master\'s in Amsterdam. EU-style admissions; popular for economics, social sciences, and sciences.',
    whoCanApply: [
      'NSC plus subject requirements per programme',
      'Many English programmes — IELTS ~6.5+',
      'Non-EU students need residence permit after admission',
    ],
    applicationOpens: 'Varies — often Jan for September intake',
    applicationCloses: 'Programme-specific — often Apr–May',
    fundingLevel: 'Tuition higher for non-EU students; scholarships limited — compare with EU public unis',
    links: [
      { label: 'UvA international students', url: 'https://www.uva.nl/en/education/international-students', kind: 'official' },
      { label: 'Study in Holland', url: 'https://www.studyinholland.nl', kind: 'guide' },
    ],
    notes: 'Also look at Erasmus University Rotterdam and TU Delft for engineering.',
    popularityRank: 104,
  },
  {
    id: 'tum-intl',
    name: 'Technical University of Munich (TUM)',
    shortName: 'TUM',
    category: 'international-university',
    destination: 'Germany',
    destinationFlag: '🇩🇪',
    website: 'https://www.tum.de/en/studies/application/application-info-portal/international-applicants',
    whatItOffers:
      'Leading German technical university — engineering, informatics, natural sciences, and management. ' +
      'Many English master\'s programmes; some English bachelor tracks.',
    whoCanApply: [
      'International applicants with recognised school-leaving certificate',
      'German or English proficiency depending on programme',
      'Strong maths/science for engineering',
    ],
    applicationOpens: 'Varies by programme',
    applicationCloses: 'Often 15 Jul for winter semester — check TUM portal',
    fundingLevel: 'Low or no tuition at public universities in Bavaria — living costs in Munich are high',
    links: [
      { label: 'TUM international applicants', url: 'https://www.tum.de/en/studies/application/application-info-portal/international-applicants', kind: 'official' },
      { label: 'DAAD scholarships', url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/', kind: 'guide' },
    ],
    notes: 'Pair with DHET Funda Germany for fully funded Constructor University if you want English bachelor with scholarship.',
    popularityRank: 105,
  },
  {
    id: 'eth-intl',
    name: 'ETH Zurich — International students',
    shortName: 'ETH',
    category: 'international-university',
    destination: 'Switzerland',
    destinationFlag: '🇨🇭',
    website: 'https://ethz.ch/en/studies/international-applicants.html',
    whatItOffers:
      'Elite STEM university in Zurich. Bachelor\'s often taught in German; many master\'s in English. ' +
      'Highly selective — strong maths and physics background expected.',
    whoCanApply: [
      'Recognised upper secondary certificate',
      'German B2+ for most bachelor programmes',
      'English for many master\'s',
    ],
    applicationOpens: 'Dec–Jan for autumn intake (typical)',
    applicationCloses: '31 Mar (bachelor autumn — confirm)',
    fundingLevel: 'Low tuition vs living costs; ETH and Swiss scholarships competitive',
    links: [
      { label: 'ETH international applicants', url: 'https://ethz.ch/en/studies/international-applicants.html', kind: 'official' },
    ],
    notes: 'Living in Switzerland is expensive — budget carefully. EPFL Lausanne is a sister option for French/English STEM.',
    popularityRank: 106,
  },
  {
    id: 'sciences-po',
    name: 'Sciences Po — International admissions',
    shortName: 'Sciences Po',
    category: 'international-university',
    destination: 'France',
    destinationFlag: '🇫🇷',
    website: 'https://www.sciencespo.fr/en/admissions/international-admissions',
    whatItOffers:
      'Prestigious social sciences, political science, international relations, and economics in Paris. ' +
      'Many programmes in English; multicultural student body.',
    whoCanApply: [
      'International baccalaureate or equivalent (NSC with strong results)',
      'English or French proficiency',
      'Motivation letter and interview for some pathways',
    ],
    applicationOpens: 'Varies — often Oct',
    applicationCloses: 'Often Feb–Mar for September intake',
    fundingLevel: 'Tuition scales with family income; Eiffel and Campus France scholarships for top students',
    links: [
      { label: 'Sciences Po international', url: 'https://www.sciencespo.fr/en/admissions/international-admissions', kind: 'official' },
      { label: 'Campus France', url: 'https://www.campusfrance.org/en', kind: 'guide' },
    ],
    notes: 'Good fit for learners interested in diplomacy, law, and policy careers.',
    popularityRank: 107,
  },
  {
    id: 'ucl-intl',
    name: 'University College London (UCL)',
    shortName: 'UCL',
    category: 'international-university',
    destination: 'United Kingdom',
    destinationFlag: '🇬🇧',
    website: 'https://www.ucl.ac.uk/prospective-students/international',
    whatItOffers:
      'Russell Group university in central London. Wide range of degrees; large international cohort. ' +
      'Competitive entry — NSC must meet UK equivalence requirements.',
    whoCanApply: [
      'International qualifications meeting UCL entry standards',
      'IELTS or equivalent (often 6.5–7.5 overall)',
      'Some programmes require interviews or portfolios',
    ],
    applicationOpens: 'Sep (UCAS cycle)',
    applicationCloses: '31 Jan UCAS deadline (medicine/dentistry earlier)',
    fundingLevel: 'International fees high — Chevening/Commonwealth for postgrad; limited undergrad aid',
    links: [
      { label: 'UCL international students', url: 'https://www.ucl.ac.uk/prospective-students/international', kind: 'official' },
      { label: 'UCAS apply', url: 'https://www.ucas.com', kind: 'register' },
    ],
    notes: 'Apply via UCAS. Also consider Imperial, LSE, King\'s, and Edinburgh for similar fields.',
    popularityRank: 108,
  },
  {
    id: 'kcl-intl',
    name: "King's College London — International",
    shortName: "King's",
    category: 'international-university',
    destination: 'United Kingdom',
    destinationFlag: '🇬🇧',
    website: 'https://www.kcl.ac.uk/study/international',
    whatItOffers:
      'Major London university known for health sciences, law, humanities, and social sciences. ' +
      'Strong links to NHS and London employers.',
    whoCanApply: [
      'International school-leaving qualifications',
      'English language requirements per programme',
      'Competitive grades for law, medicine, and dentistry',
    ],
    applicationOpens: 'Sep (UCAS)',
    applicationCloses: '31 Jan UCAS (confirm programme)',
    fundingLevel: 'International tuition — postgraduate scholarships more common than undergrad',
    links: [
      { label: "King's international", url: 'https://www.kcl.ac.uk/study/international', kind: 'official' },
      { label: 'Study UK scholarships', url: 'https://study-uk.britishcouncil.org/scholarships', kind: 'guide' },
    ],
    notes: 'Central London location — high living costs. Pair with British Council Study UK planning.',
    popularityRank: 109,
  },
  {
    id: 'leuven-intl',
    name: 'KU Leuven — International degree programmes',
    shortName: 'KU Leuven',
    category: 'international-university',
    destination: 'Belgium',
    destinationFlag: '🇧🇪',
    website: 'https://www.kuleuven.be/english/education/international-students',
    whatItOffers:
      'Belgium\'s largest university — many English-taught master\'s and some bachelor programmes in Leuven. ' +
      'Affordable EU tuition compared to UK/US.',
    whoCanApply: [
      'Recognised secondary diploma',
      'English proficiency for English-taught programmes',
      'Subject prerequisites for sciences and engineering',
    ],
    applicationOpens: 'Varies by programme',
    applicationCloses: 'Often Mar for September intake',
    fundingLevel: 'Moderate EU tuition; living costs lower than UK — scholarship options via university',
    links: [
      { label: 'KU Leuven international', url: 'https://www.kuleuven.be/english/education/international-students', kind: 'official' },
      { label: 'Study in Flanders', url: 'https://www.studyinflanders.be', kind: 'guide' },
    ],
    notes: 'Good alternative to Netherlands/Germany for English-medium EU study.',
    popularityRank: 110,
  },
  {
    id: 'copenhagen-intl',
    name: 'University of Copenhagen — International applicants',
    shortName: 'UCPH',
    category: 'international-university',
    destination: 'Denmark',
    destinationFlag: '🇩🇰',
    website: 'https://www.ku.dk/english/education/international-students',
    whatItOffers:
      'Top Nordic university with English-taught master\'s across sciences, humanities, and health. ' +
      'Denmark known for quality of life and research.',
    whoCanApply: [
      'Bachelor\'s often requires Danish for many programmes — check English list',
      'Master\'s: relevant bachelor\'s degree',
      'English proficiency',
    ],
    applicationOpens: 'Varies',
    applicationCloses: 'Often 15 Jan for September (master\'s)',
    fundingLevel: 'Tuition for non-EU/EEA students; Danish government scholarships limited',
    links: [
      { label: 'UCPH international students', url: 'https://www.ku.dk/english/education/international-students', kind: 'official' },
      { label: 'Study in Denmark', url: 'https://studyindenmark.dk', kind: 'guide' },
    ],
    notes: 'Also explore Lund University (Sweden) and University of Oslo for Nordic options.',
    popularityRank: 111,
  },
  {
    id: 'groningen-intl',
    name: 'University of Groningen — International students',
    shortName: 'RUG',
    category: 'international-university',
    destination: 'Netherlands',
    destinationFlag: '🇳🇱',
    website: 'https://www.rug.nl/education/international-students',
    whatItOffers:
      'Research university in the north of the Netherlands with many English bachelor\'s and master\'s — ' +
      'popular for psychology, international relations, and sciences.',
    whoCanApply: [
      'NSC or equivalent meeting Dutch entry requirements',
      'English proficiency',
      'Numerus fixus programmes have extra selection',
    ],
    applicationOpens: 'Oct (Studielink for many programmes)',
    applicationCloses: '1 May (non-EU deadline typical — confirm)',
    fundingLevel: 'Non-EU tuition higher than EU — Holland Scholarship for some',
    links: [
      { label: 'RUG international students', url: 'https://www.rug.nl/education/international-students', kind: 'official' },
      { label: 'Studielink', url: 'https://www.studielink.nl', kind: 'register' },
    ],
    notes: 'Student city with lower living costs than Amsterdam. Apply via Studielink for Dutch universities.',
    popularityRank: 112,
  },
]
