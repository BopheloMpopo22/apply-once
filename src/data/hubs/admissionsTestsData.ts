import type { AdmissionsTestEntry } from '../../types/hubs'
import { NBT_PREP_RESOURCES, SAT_PREP_RESOURCES } from './admissionsTestResources'

export const ADMISSIONS_TESTS: AdmissionsTestEntry[] = [
  {
    id: 'nbt',
    name: 'National Benchmark Tests (NBT)',
    shortName: 'NBT',
    region: 'south-africa',
    website: 'https://www.nbt.ac.za',
    whatItIs:
      'Two tests written on the same day: AQL (Academic & Quantitative Literacy, 3 hours, morning) and MAT ' +
      '(Mathematics, 3 hours, afternoon). Multiple-choice. Measures readiness for university study.',
    neededFor: [
      'UCT — required for most programmes; MAT for maths-heavy degrees',
      'Stellenbosch — used for placement and selection',
      'Wits — Health Sciences requires NBT by ~31 Jul 2026',
      'UKZN, UP, UJ, Rhodes, and others — check each faculty',
      'Used for placement into extended/bridging programmes at many unis',
    ],
    registrationOpens: '1 Apr 2026 (for 2027 university admissions)',
    keyDeadlines:
      'Book early — popular dates fill fast. UCT applicants: last recommended write ~3 Oct 2026. ' +
      'Wits Health Sciences: MAT + AQL by ~31 Jul 2026.',
    fee: 'R185 (AQL only) · R370 (AQL + MAT) — pay via EasyPay at registration',
    testSchedule: 'May–Oct 2026 test windows (Sat/Sun sessions). See official calendar.',
    testCentres: [
      {
        province: 'Eastern Cape',
        centres:
          'Nelson Mandela University area, Walter Sisulu University (Mthatha), East London and Port Elizabeth high schools',
      },
      {
        province: 'Free State',
        centres: 'University of the Free State (Bloemfontein), selected Bloemfontein schools',
      },
      {
        province: 'Gauteng',
        centres:
          'Wits, UP, UJ, TUT campuses; Johannesburg and Pretoria high schools (many venues)',
      },
      {
        province: 'KwaZulu-Natal',
        centres: 'UKZN (Howard College, Pietermaritzburg, Westville), Durban and PMB schools',
      },
      {
        province: 'Limpopo',
        centres: 'University of Limpopo (Polokwane), selected Polokwane schools',
      },
      {
        province: 'Mpumalanga',
        centres: 'Mbombela, Ehlanzeni district schools and colleges',
      },
      {
        province: 'Northern Cape',
        centres: 'Sol Plaatje University area, Kimberley schools',
      },
      {
        province: 'North West',
        centres: 'North-West University (Potchefstroom, Mahikeng), regional schools',
      },
      {
        province: 'Western Cape',
        centres: 'UCT, Stellenbosch, UWC, CPUT; Cape Town and Winelands schools',
      },
    ],
    centresLink: {
      label: 'Full venue list (official PDF)',
      url: 'https://www.nbt.ac.za/sites/default/files/Updated%20test%20venues%2022052026_2.pdf',
      kind: 'centres',
    },
    prepResources: NBT_PREP_RESOURCES,
    notes:
      'You must write AQL and MAT on the same day if you need both — you cannot split across dates. ' +
      'Results take several weeks; book at least 6–8 weeks before your university deadline.',
    popularityRank: 1,
  },
  {
    id: 'sat',
    name: 'SAT (Scholastic Assessment Test)',
    shortName: 'SAT',
    region: 'international',
    website: 'https://satsuite.collegeboard.org/sat',
    whatItIs:
      'Standardised test used for US university admissions and some scholarships. Digital SAT tests ' +
      'reading, writing, and maths. Scored out of 1600.',
    neededFor: [
      'US universities — most require SAT or ACT for undergraduate admission',
      'Some US merit scholarships and athletic programmes',
      'Select SA students applying to US institutions or exchange programmes',
      'Not required for SA public universities (use NSC + NBT instead)',
    ],
    registrationOpens: 'Rolling — register ~4 weeks before test date',
    keyDeadlines:
      '2025–26 international dates include Mar, May, Jun, Aug, Oct, Dec. ' +
      'Late registration costs more — check satsuite.collegeboard.org/sat/dates-deadlines.',
    fee: 'Approx. $103 USD (international fee) — varies by date and region',
    testSchedule: 'International test dates on select Saturdays. No test centres every month.',
    testCentres: [
      {
        province: 'Gauteng',
        centres: 'American International School of Johannesburg and other approved centres',
      },
      {
        province: 'Western Cape',
        centres: 'Approved Cape Town area international schools (search at registration)',
      },
      {
        province: 'KwaZulu-Natal',
        centres: 'Limited — search College Board test centre map during registration',
      },
      {
        province: 'Other provinces',
        centres: 'Very limited — most SA students travel to JHB or CPT centres',
      },
    ],
    centresLink: {
      label: 'Find SAT test centres',
      url: 'https://satsuite.collegeboard.org/sat/test-center-search',
      kind: 'centres',
    },
    prepResources: SAT_PREP_RESOURCES,
    notes:
      'Create a College Board account to register. Photo ID required on test day. ' +
      'Free prep via Khan Academy linked to your College Board account.',
    popularityRank: 2,
  },
  {
    id: 'act',
    name: 'ACT (American College Testing)',
    shortName: 'ACT',
    region: 'international',
    website: 'https://www.act.org',
    whatItIs:
      'Alternative to SAT for US college admissions. Tests English, maths, reading, and science reasoning. ' +
      'Composite score out of 36.',
    neededFor: [
      'US universities that accept ACT instead of SAT',
      'Some scholarship programmes in the US',
      'Not used by SA public universities',
    ],
    registrationOpens: 'Rolling — register before registration deadline for each date',
    keyDeadlines: 'Check act.org for international test dates and deadlines',
    fee: 'Approx. $150+ USD (international with writing optional)',
    testSchedule: 'Limited international dates — fewer centres than SAT in SA',
    testCentres: [
      {
        province: 'Gauteng',
        centres: 'Select international schools — search during registration at act.org',
      },
      {
        province: 'Western Cape',
        centres: 'Limited availability — confirm at registration',
      },
      {
        province: 'Other provinces',
        centres: 'Rare — plan to test in major metros',
      },
    ],
    centresLink: {
      label: 'ACT test centre search',
      url: 'https://www.act.org/content/act/en/products-and-services/the-act/registration.html',
      kind: 'centres',
    },
    prepResources: [
      {
        label: 'ACT official site',
        url: 'https://www.act.org',
        kind: 'official',
      },
      {
        label: 'Register for the ACT',
        url: 'https://www.act.org/content/act/en/products-and-services/the-act/registration.html',
        kind: 'register',
      },
      {
        label: 'Free ACT practice tests',
        url: 'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html',
        kind: 'past-paper',
      },
      {
        label: 'ACT test prep guide',
        url: 'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html',
        kind: 'prep',
      },
    ],
    notes:
      'If applying to US colleges, check whether your target schools prefer SAT or accept ACT. ' +
      'You can send scores to multiple universities for a fee.',
    popularityRank: 3,
  },
  {
    id: 'ielts',
    name: 'IELTS (International English Language Testing System)',
    shortName: 'IELTS',
    region: 'international',
    website: 'https://www.ielts.org',
    whatItIs:
      'English proficiency test for study, work, or migration abroad. Four sections: listening, reading, ' +
      'writing, speaking. Band score 0–9.',
    neededFor: [
      'UK, Australia, Canada, and many EU universities — proof of English if NSC is not sufficient',
      'Some SA postgraduate programmes for international applicants',
      'Visa applications for study abroad',
      'Not typically required for SA public universities if you wrote NSC in English',
    ],
    registrationOpens: 'Rolling — book slots available most weeks in major cities',
    keyDeadlines: 'Book 2–3 months before university application deadlines',
    fee: 'Approx. R4 500–R5 500 (varies by test centre)',
    testSchedule: 'Multiple dates monthly at British Council and IDP centres',
    testCentres: [
      {
        province: 'Gauteng',
        centres: 'British Council Johannesburg; IDP Pretoria and Johannesburg',
      },
      {
        province: 'Western Cape',
        centres: 'British Council Cape Town; IDP Cape Town',
      },
      {
        province: 'KwaZulu-Natal',
        centres: 'IDP Durban',
      },
      {
        province: 'Eastern Cape',
        centres: 'Occasional sessions — check ielts.org for Port Elizabeth',
      },
    ],
    centresLink: {
      label: 'Find IELTS test locations',
      url: 'https://www.ielts.org/for-test-takers/book-a-test/find-a-test-location',
      kind: 'centres',
    },
    prepResources: [
      {
        label: 'IELTS official site',
        url: 'https://www.ielts.org',
        kind: 'official',
      },
      {
        label: 'Book IELTS (British Council SA)',
        url: 'https://www.britishcouncil.org.za/exam/ielts/book-test',
        kind: 'register',
      },
      {
        label: 'Free IELTS practice tests',
        url: 'https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-practice-tests',
        kind: 'past-paper',
      },
      {
        label: 'IELTS preparation resources',
        url: 'https://www.ielts.org/for-test-takers/how-to-prepare',
        kind: 'prep',
      },
    ],
    notes:
      'Choose Academic IELTS for university applications (not General Training). ' +
      'Results valid for 2 years.',
    popularityRank: 4,
  },
  {
    id: 'cao',
    name: 'CAO — KwaZulu-Natal central applications',
    shortName: 'CAO',
    region: 'south-africa',
    website: 'https://www.cao.ac.za',
    whatItIs:
      'Not a written test — the Central Applications Office processes applications to KZN institutions ' +
      '(UKZN, DUT, UNIZULU, MUT, and others) through one portal.',
    neededFor: [
      'University of KwaZulu-Natal (UKZN)',
      'Durban University of Technology (DUT)',
      'University of Zululand (UNIZULU)',
      'Mangosuthu University of Technology (MUT)',
      'Some KZN TVET and college programmes',
    ],
    registrationOpens: 'Apr 2026 (typical — confirm on cao.ac.za)',
    keyDeadlines: '30 Sep 2026 closing for most programmes (confirm annually)',
    fee: 'R250 (single application) · R400 (multiple programmes)',
    testSchedule: 'N/A — this is an application service, not a sit-down exam',
    testCentres: [
      {
        province: 'KwaZulu-Natal',
        centres: 'Apply online at cao.ac.za; CAO office in Durban for enquiries',
      },
    ],
    centresLink: {
      label: 'CAO handbook & programme list',
      url: 'https://www.cao.ac.za',
      kind: 'guide',
    },
    prepResources: [
      {
        label: 'CAO official website',
        url: 'https://www.cao.ac.za',
        kind: 'official',
      },
      {
        label: 'CAO application guide (PDF)',
        url: 'https://www.cao.ac.za/Content/Uploads/cao/files/CAO%20Handbook.pdf',
        kind: 'guide',
      },
      {
        label: 'Apply online',
        url: 'https://www.cao.ac.za/Apply',
        kind: 'register',
      },
    ],
    notes:
      'If you apply to KZN institutions you still need NBT where required (e.g. UKZN). ' +
      'CAO is separate from NBT registration — do both if applying to KZN unis.',
    popularityRank: 5,
  },
]

export const ADMISSIONS_TESTS_BY_POPULARITY = [...ADMISSIONS_TESTS].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
