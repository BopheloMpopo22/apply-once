import type { HubListingEntry } from '../../types/hubs'
import { BRIDGING_CATEGORY_LABELS } from '../../types/hubs'

function entry(
  e: Omit<HubListingEntry, 'categoryLabel'> & { category: keyof typeof BRIDGING_CATEGORY_LABELS },
): HubListingEntry {
  return { ...e, categoryLabel: BRIDGING_CATEGORY_LABELS[e.category] }
}

export const BRIDGING_PROGRAMMES: HubListingEntry[] = [
  entry({
    id: 'uct-edp',
    name: 'UCT — Extended Degree Programme (EDP)',
    shortName: 'UCT EDP',
    category: 'extended-degree',
    location: 'Western Cape',
    website: 'https://www.uct.ac.za/students/prospective-students/faculty-handbooks/faculty-handbooks-undergraduate',
    summary:
      'Extended programmes add a foundation year to selected degrees — reduced workload in year 1 ' +
      'with extra academic support. Used for NBT placement and students narrowly below mainstream entry.',
    knownFor: ['Extended degree', 'Science', 'Commerce', 'Humanities'],
    whoCanApply: [
      'Applicants meeting extended programme APS (often 3–4 points below mainstream)',
      "Bachelor's pass required — not for failed matric",
      'NBT results used for placement into extended streams',
    ],
    applicationOpens: 'With UCT undergraduate application (Apr 2026 typical)',
    applicationCloses: '31 Jul 2026 (confirm on UCT site)',
    duration: '4 years instead of 3 for many degrees',
    compensation: 'Standard university fees (NSFAS may apply)',
    links: [
      { label: 'UCT prospective students', url: 'https://www.uct.ac.za/students/prospective-students', kind: 'official' },
      { label: 'Apply to UCT', url: 'https://applyonline.uct.ac.za', kind: 'register' },
    ],
    notes: 'Apply to mainstream and extended versions. Extended places are limited and fill quickly.',
    popularityRank: 1,
  }),
  entry({
    id: 'wits-extended',
    name: 'Wits — Extended programmes & foundation',
    shortName: 'Wits',
    category: 'extended-degree',
    location: 'Gauteng',
    website: 'https://www.wits.ac.za/undergraduate/apply-to-wits/',
    summary:
      'Extended programmes in Science, Health Sciences, and other faculties for students who meet ' +
      'extended-stream requirements. Foundation pathways for eligible applicants.',
    knownFor: ['Extended BSc', 'Health Sciences', 'Engineering access'],
    whoCanApply: [
      'Matriculants meeting extended-stream APS and subject requirements',
      'Health Sciences has strict subject and NBT requirements',
    ],
    applicationOpens: 'Apr 2026 (typical for 2027 intake)',
    applicationCloses: '30 Sep 2026 — confirm on Wits site',
    duration: '4+ years depending on programme',
    compensation: 'University fees — NSFAS eligible',
    links: [
      { label: 'Wits undergraduate apply', url: 'https://www.wits.ac.za/undergraduate/apply-to-wits/', kind: 'official' },
      { label: 'Admission requirements', url: 'https://www.wits.ac.za/undergraduate/apply-to-wits/undergraduate-admission-requirements/', kind: 'guide' },
    ],
    notes: 'Wits Health Sciences extended streams have earlier NBT deadlines. Check faculty handbooks.',
    popularityRank: 2,
  }),
  entry({
    id: 'uj-ecp',
    name: 'UJ — Extended Curriculum Programmes (ECP)',
    shortName: 'UJ ECP',
    category: 'extended-degree',
    location: 'Gauteng',
    website: 'https://www.uj.ac.za/studyatuj/undergraduate/',
    summary:
      'UJ does not offer short bridging courses — instead Extended Curriculum Programmes spread year 1 over two years. ' +
      'Available across Business, Engineering, and other faculties with lower APS than mainstream.',
    knownFor: ['Extended BCom', 'Extended Engineering', 'Extended diplomas'],
    whoCanApply: [
      "Bachelor's or diploma pass in matric",
      'APS typically 3–4 points below mainstream programme',
      'Select extended programme code when applying',
    ],
    applicationOpens: 'Apr 2026 (2027 intake)',
    applicationCloses: '30 Sep 2026 — confirm prospectus',
    duration: '4 years for 3-year degrees; 2 years for year 1 of diplomas',
    compensation: 'Standard UJ fees',
    links: [
      { label: 'UJ undergraduate', url: 'https://www.uj.ac.za/studyatuj/undergraduate/', kind: 'official' },
      { label: 'Apply online', url: 'https://www.uj.ac.za/studyatuj/undergraduate/how-to-apply/', kind: 'register' },
      { label: '2026 prospectus', url: 'https://www.uj.ac.za/studyatuj/undergraduate/undergraduate-prospectus/', kind: 'guide' },
    ],
    notes: 'Apply to mainstream AND extended as separate choices. Look for "Extended" in programme name on application.',
    popularityRank: 3,
  }),
  entry({
    id: 'up-extended',
    name: 'UP — Extended programmes & Year Programme',
    shortName: 'UP',
    category: 'extended-degree',
    location: 'Gauteng',
    website: 'https://www.up.ac.za/undergraduate',
    summary:
      'Extended BEng and other extended degrees, plus the UP Year Programme for students needing ' +
      'foundational preparation before degree study.',
    knownFor: ['Extended BEng', 'Year Programme', 'Natural & Agricultural Sciences'],
    whoCanApply: [
      'Extended: lower APS than mainstream with same subject requirements',
      'Year Programme: specific criteria for foundational year',
    ],
    applicationOpens: 'Mar–Apr 2026 typical',
    applicationCloses: '30 Sep 2026 — confirm',
    duration: '4+ years for extended degrees',
    compensation: 'University fees',
    links: [
      { label: 'UP undergraduate', url: 'https://www.up.ac.za/undergraduate', kind: 'official' },
      { label: 'Apply', url: 'https://www.up.ac.za/apply', kind: 'register' },
    ],
    notes: 'UP extended BEng is a well-known pathway for engineering with slightly lower APS.',
    popularityRank: 4,
  }),
  entry({
    id: 'ukzn-access',
    name: 'UKZN — Access & foundation programmes',
    shortName: 'UKZN',
    category: 'foundation-access',
    location: 'KwaZulu-Natal',
    website: 'https://ukzn.ac.za/study-at-ukzn/undergraduate-studies/',
    summary:
      'Foundation and access programmes for students from disadvantaged schools or those narrowly missing ' +
      'mainstream entry — leads into degree programmes upon success.',
    knownFor: ['Foundation programmes', 'Access', 'CAO application'],
    whoCanApply: [
      'School-leavers meeting access programme criteria',
      'Often targets quintile 1–3 schools or specific APS bands',
      'Apply via CAO for UKZN programmes',
    ],
    applicationOpens: 'Apr 2026 via CAO',
    applicationCloses: '30 Sep 2026 (CAO typical)',
    duration: '1 foundation year + degree',
    compensation: 'University fees — NSFAS eligible',
    links: [
      { label: 'UKZN undergraduate', url: 'https://ukzn.ac.za/study-at-ukzn/undergraduate-studies/', kind: 'official' },
      { label: 'Apply via CAO', url: 'https://www.cao.ac.za', kind: 'register' },
    ],
    notes: 'Must also write NBT where required. See Admissions Tests hub for NBT + CAO combo.',
    popularityRank: 5,
  }),
  entry({
    id: 'stellenbosch-scimathus',
    name: 'Stellenbosch — SciMathUS',
    shortName: 'SciMathUS',
    category: 'stem-bridge',
    location: 'Western Cape',
    website: 'https://www.sun.ac.za/english/scimathus',
    summary:
      'One-year STEM bridging programme for students with matric but insufficient maths/science marks ' +
      'for science degrees at Stellenbosch. Successful completion allows degree admission.',
    knownFor: ['Mathematics upgrade', 'Physical Sciences', 'STEM bridge', '1 year'],
    whoCanApply: [
      'Matric with maths and science but below degree requirements',
      'South African citizens — specific criteria on SciMathUS page',
      'Dedicated application — not standard undergrad form only',
    ],
    applicationOpens: 'Typically opens mid-year for following year',
    applicationCloses: 'Confirm on SciMathUS site annually',
    duration: '1 year full-time',
    compensation: 'Programme fees — bursaries may be available',
    links: [
      { label: 'SciMathUS official', url: 'https://www.sun.ac.za/english/scimathus', kind: 'official' },
      { label: 'Stellenbosch apply', url: 'https://www.sun.ac.za/english/maties/apply', kind: 'register' },
    ],
    notes: 'Different from extended degree — this upgrades matric-level maths/science marks specifically.',
    popularityRank: 6,
  }),
  entry({
    id: 'nmu-extended',
    name: 'NMU — Extended curriculum',
    shortName: 'NMU',
    category: 'extended-degree',
    location: 'Eastern Cape',
    website: 'https://www.mandela.ac.za/Study-at-Mandela/Prospective-Students',
    summary:
      'Extended curriculum programmes across faculties with lower admission points than mainstream ' +
      'and additional academic support in the first years.',
    knownFor: ['Extended curriculum', 'Business', 'Science', 'Education'],
    whoCanApply: [
      'Matriculants meeting extended curriculum admission points',
      'Often 370+ APS band for extended vs higher for mainstream',
    ],
    applicationOpens: 'Apr 2026 typical',
    applicationCloses: '30 Sep 2026 — confirm',
    duration: '4 years for 3-year degrees',
    compensation: 'University fees',
    links: [
      { label: 'NMU prospective students', url: 'https://www.mandela.ac.za/Study-at-Mandela/Prospective-Students', kind: 'official' },
    ],
    notes: 'Former NMMU — now Nelson Mandela University. Check faculty-specific extended lists in prospectus.',
    popularityRank: 7,
  }),
  entry({
    id: 'cput-extended',
    name: 'CPUT — Extended curriculum programmes',
    shortName: 'CPUT',
    category: 'extended-degree',
    location: 'Western Cape',
    website: 'https://www.cput.ac.za/study/apply',
    summary:
      'University of Technology extended programmes in engineering, applied sciences, and business ' +
      'for students meeting extended-stream requirements.',
    knownFor: ['UoT extended', 'Engineering', 'Applied sciences'],
    whoCanApply: [
      'Diploma or bachelor pass with extended-stream APS',
      'Subject requirements match mainstream',
    ],
    applicationOpens: 'Apr 2026',
    applicationCloses: '30 Sep 2026 — confirm',
    duration: '4–5 years depending on programme',
    compensation: 'University fees',
    links: [
      { label: 'CPUT apply', url: 'https://www.cput.ac.za/study/apply', kind: 'official' },
    ],
    notes: 'Technology university — strong focus on applied and engineering diplomas/degrees.',
    popularityRank: 8,
  }),
  entry({
    id: 'ufs-preparatory',
    name: 'UFS — University Preparatory Programme (UPP)',
    shortName: 'UFS UPP',
    category: 'foundation-access',
    location: 'Free State',
    website: 'https://www.ufs.ac.za/upp',
    summary:
      'Foundation year preparing students for degree study at UFS — academic literacy, maths, and science support.',
    knownFor: ['Foundation year', 'Access', 'UFS pathway'],
    whoCanApply: [
      'Grade 12 graduates not meeting direct degree admission',
      'Specific criteria — disadvantaged backgrounds may be prioritised',
    ],
    applicationOpens: 'Check UFS UPP page annually',
    applicationCloses: 'Confirm on UFS site',
    duration: '1 year',
    compensation: 'Programme fees — NSFAS may apply for subsequent degree',
    links: [
      { label: 'UFS UPP', url: 'https://www.ufs.ac.za/upp', kind: 'official' },
      { label: 'UFS apply', url: 'https://www.ufs.ac.za/apply', kind: 'register' },
    ],
    notes: 'Successful UPP completion leads to UFS degree admission in following year.',
    popularityRank: 9,
  }),
  entry({
    id: 'nwu-extended',
    name: 'NWU — Extended programmes',
    shortName: 'NWU',
    category: 'extended-degree',
    location: 'North West, Gauteng, Mpumalanga',
    website: 'https://www.nwu.ac.za/undergraduate-studies',
    summary:
      'Extended degree programmes across NWU campuses (Potchefstroom, Vanderbijlpark, Mahikeng) ' +
      'with additional academic support and lower entry APS.',
    knownFor: ['Extended BSc', 'Education', 'Commerce'],
    whoCanApply: [
      'Matriculants meeting extended programme requirements per faculty',
    ],
    applicationOpens: 'Apr 2026',
    applicationCloses: '30 Sep 2026 — confirm',
    duration: '4 years typical',
    compensation: 'University fees',
    links: [
      { label: 'NWU undergraduate', url: 'https://www.nwu.ac.za/undergraduate-studies', kind: 'official' },
      { label: 'Apply', url: 'https://www.nwu.ac.za/apply', kind: 'register' },
    ],
    notes: 'Three campuses — check which campus offers your extended programme.',
    popularityRank: 10,
  }),
  entry({
    id: 'unisa-higher-cert',
    name: 'UNISA — Higher certificates & pathway qualifications',
    shortName: 'UNISA',
    category: 'higher-certificate',
    location: 'Distance learning (national)',
    website: 'https://www.unisa.ac.za/sites/corporate/default/Colleges/Science,-Engineering-&-Technology/Information-Technology/higher-certificates',
    summary:
      'Higher Certificate and Advanced Certificate qualifications as stepping stones to diplomas and degrees — ' +
      'open access for many programmes with matric.',
    knownFor: ['Higher Certificate', 'Distance learning', 'IT pathway', 'Open access'],
    whoCanApply: [
      'Matric or equivalent for most higher certificates',
      'No APS competition — space available basis for many',
    ],
    applicationOpens: 'Multiple intakes per year',
    applicationCloses: 'Varies — check UNISA registration dates',
    duration: '1 year higher certificate',
    compensation: 'UNISA fees per module',
    links: [
      { label: 'UNISA apply', url: 'https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission', kind: 'register' },
      { label: 'Qualifications', url: 'https://www.unisa.ac.za/sites/corporate/default/Qualifications', kind: 'guide' },
    ],
    notes:
      'Good option if you did not get university admission. Progress to diploma/degree after meeting prerequisites. ' +
      'Self-discipline required for distance study.',
    popularityRank: 11,
  }),
  entry({
    id: 'rhodes-extended',
    name: 'Rhodes — Extended studies',
    shortName: 'Rhodes',
    category: 'extended-degree',
    location: 'Eastern Cape',
    website: 'https://www.ru.ac.za/admissiongateway/',
    summary:
      'Extended studies programmes for students admitted to extended streams — additional academic support ' +
      'in the first year(s) of degree study.',
    knownFor: ['Extended studies', 'Humanities', 'Science'],
    whoCanApply: [
      'Applicants meeting extended-stream admission points',
      'Dean may consider discretionary admission',
    ],
    applicationOpens: 'May 2026 typical',
    applicationCloses: '30 Sep 2026 — confirm',
    duration: '4 years for 3-year degrees',
    compensation: 'University fees',
    links: [
      { label: 'Rhodes admission gateway', url: 'https://www.ru.ac.za/admissiongateway/', kind: 'official' },
    ],
    notes: 'Smaller university — check admission points table for extended vs mainstream columns.',
    popularityRank: 12,
  }),
]

export const BRIDGING_BY_POPULARITY = [...BRIDGING_PROGRAMMES].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
