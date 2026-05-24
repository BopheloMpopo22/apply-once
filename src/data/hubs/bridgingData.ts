import type { BridgingEntry } from '../../types/hubs'
import { BRIDGING_CATEGORY_LABELS } from '../../types/hubs'

function b(
  e: Omit<BridgingEntry, 'categoryLabel'> & { category: keyof typeof BRIDGING_CATEGORY_LABELS },
): BridgingEntry {
  return { ...e, categoryLabel: BRIDGING_CATEGORY_LABELS[e.category] }
}

export const BRIDGING_PROGRAMMES: BridgingEntry[] = [
  b({
    id: 'uct-edp',
    name: 'University of Cape Town',
    shortName: 'UCT',
    category: 'extended-degree',
    location: 'Western Cape',
    website: 'https://www.uct.ac.za/students/prospective-students',
    summary:
      'UCT Extended Degree Programme (EDP) adds a foundation year to selected degrees. NBT results are used for placement. ' +
      'Apply to both mainstream and extended on the same application.',
    offersBridging: [
      {
        faculty: 'Commerce (CBE)',
        programmes: ['BCom (Accounting, Economics, Finance)', 'BBusSci'],
        routeType: 'Extended degree (4 years)',
        whoQualifies: 'Bachelor\'s pass; APS typically 3–4 points below mainstream; NBT AQL required',
      },
      {
        faculty: 'Engineering & the Built Environment',
        programmes: ['BSc Engineering (Civil, Electrical, Mechanical, Chemical)'],
        routeType: 'Extended degree',
        whoQualifies: 'Maths & Physical Sciences at required level; extended APS band on faculty table',
      },
      {
        faculty: 'Humanities',
        programmes: ['BA (various majors)', 'Social Work (extended where offered)'],
        routeType: 'Extended degree',
        whoQualifies: 'Bachelor\'s pass meeting extended-stream APS',
      },
      {
        faculty: 'Science',
        programmes: ['BSc (Biological & Physical Sciences streams)'],
        routeType: 'Extended degree',
        whoQualifies: 'Maths & science requirements; often placed via NBT + APS into extended stream',
      },
    ],
    noBridgingFor: [
      'Medicine (MBChB) — mainstream only, extremely competitive',
      'Law (LLB) — no general extended LLB; mainstream entry only',
      'Occupational Therapy & some Health Sciences — check faculty (often mainstream selection only)',
    ],
    applicationOpens: '2 April 2026',
    applicationCloses: '31 July 2026',
    duration: '4 years instead of 3 for extended degrees',
    compensation: 'Standard UCT fees — NSFAS eligible',
    links: [
      { label: 'UCT prospective students', url: 'https://www.uct.ac.za/students/prospective-students', kind: 'official' },
      { label: 'Apply online', url: 'https://applyonline.uct.ac.za', kind: 'register' },
    ],
    notes: 'Extended places are limited. If you miss mainstream by a few APS points, apply to extended AND write NBT early.',
    popularityRank: 1,
  }),
  b({
    id: 'wits-extended',
    name: 'University of the Witwatersrand',
    shortName: 'Wits',
    category: 'extended-degree',
    location: 'Gauteng',
    website: 'https://www.wits.ac.za/undergraduate/apply-to-wits/',
    summary:
      'Wits offers extended streams in Science and Health Sciences, plus foundation pathways. ' +
      'Law and most Humanities degrees are mainstream-only — extended options are faculty-specific.',
    offersBridging: [
      {
        faculty: 'Science',
        programmes: ['BSc (Biological & Mathematical Sciences)', 'BSc IT (where extended listed)'],
        routeType: 'Extended BSc (4 years)',
        whoQualifies: 'Extended-stream APS on Wits table; maths/science subject requirements',
      },
      {
        faculty: 'Health Sciences',
        programmes: ['Some allied health extended streams (check handbook)'],
        routeType: 'Extended / foundation in Health Sciences',
        whoQualifies: 'Strict subject + NBT requirements; Health Sciences NBT deadline ~31 Jul 2026',
      },
      {
        faculty: 'Engineering',
        programmes: ['Limited extended access routes — confirm per year in handbook'],
        routeType: 'Varies',
        whoQualifies: 'Maths & Physical Sciences; often near-mainstream APS',
      },
    ],
    noBridgingFor: [
      'Law (LLB) — mainstream entry only; very competitive APS',
      'Psychology (BA/BPsych) — typically mainstream BA entry; no separate extended psychology degree',
      'Medicine (MBChB) — mainstream only with selection tests',
      'Accounting (BCom Accounting) — usually mainstream; check if extended BCom listed in current handbook',
    ],
    applicationOpens: '1 March 2026',
    applicationCloses: '30 September 2026',
    duration: '4+ years depending on programme',
    compensation: 'University fees — NSFAS eligible',
    links: [
      { label: 'Wits apply', url: 'https://www.wits.ac.za/undergraduate/apply-to-wits/', kind: 'official' },
      { label: 'Admission requirements', url: 'https://www.wits.ac.za/undergraduate/apply-to-wits/undergraduate-admission-requirements/', kind: 'guide' },
    ],
    notes: 'Do not assume extended exists for your dream degree — check the Wits handbook column for "Extended" next to your programme.',
    popularityRank: 2,
  }),
  b({
    id: 'uj-ecp',
    name: 'University of Johannesburg',
    shortName: 'UJ',
    category: 'extended-degree',
    location: 'Gauteng',
    website: 'https://www.uj.ac.za/studyatuj/undergraduate/',
    summary:
      'UJ Extended Curriculum Programmes (ECP) spread first year over two years. Select the extended programme code when applying — ' +
      'not all faculties offer ECP for every degree.',
    offersBridging: [
      {
        faculty: 'College of Business & Economics',
        programmes: ['BCom Accounting Extended', 'BCom Finance Extended', 'BCom Economics Extended', 'BCom Business Management Extended'],
        routeType: 'Extended degree (4 years)',
        whoQualifies: 'APS ~25 (Maths) or ~28 (Maths Lit) for BCom extended — see prospectus',
      },
      {
        faculty: 'Engineering',
        programmes: ['Industrial Engineering Extended', 'Mechanical Engineering Extended', 'Extraction Metallurgy Extended'],
        routeType: 'Extended degree',
        whoQualifies: 'APS ~22–24 extended band; maths & science requirements',
      },
      {
        faculty: 'Diplomas (extended)',
        programmes: ['Logistics Extended Diploma', 'People Management Extended Diploma', 'Tourism Extended Diploma'],
        routeType: 'Extended diploma (year 1 over 2 years)',
        whoQualifies: 'Diploma pass; APS ~19–21 extended band',
      },
    ],
    noBridgingFor: [
      'Law (LLB) — confirm current prospectus; LLB typically mainstream only',
      'Psychology — BA Psychology mainstream; extended BA may exist but not a separate psych bridging course',
      'Architecture — portfolio + mainstream selection; no standard ECP',
      'Short bridging courses — UJ does not offer 6-month matric mark upgrade courses',
    ],
    applicationOpens: '1 April 2026',
    applicationCloses: '31 October 2026',
    duration: '4 years for 3-year degrees; 2 years for diploma year 1',
    compensation: 'Standard UJ fees (undergrad application free)',
    links: [
      { label: 'UJ undergraduate', url: 'https://www.uj.ac.za/studyatuj/undergraduate/', kind: 'official' },
      { label: 'Prospectus', url: 'https://www.uj.ac.za/studyatuj/undergraduate/undergraduate-prospectus/', kind: 'guide' },
    ],
    notes: 'Apply to mainstream AND extended as separate choices. Extended codes often end with "Extended" in the name.',
    popularityRank: 3,
  }),
  b({
    id: 'up-extended',
    name: 'University of Pretoria',
    shortName: 'UP',
    category: 'extended-degree',
    location: 'Gauteng',
    website: 'https://www.up.ac.za/undergraduate',
    summary:
      'UP offers extended BEng and the UP Year Programme for foundational preparation. Veterinary Science and Medicine have separate, strict entry — not standard extended routes.',
    offersBridging: [
      {
        faculty: 'Engineering, Built Environment & IT',
        programmes: ['BEng (Civil, Electrical, Mechanical, etc.) Extended'],
        routeType: 'Extended BEng (5 years)',
        whoQualifies: 'Lower APS than mainstream BEng with same maths/science subjects',
      },
      {
        faculty: 'UP Year Programme',
        programmes: ['Foundation year before selected degrees'],
        routeType: 'Foundation / access year',
        whoQualifies: 'Students not meeting direct degree admission; specific UP criteria',
      },
      {
        faculty: 'Natural & Agricultural Sciences',
        programmes: ['Selected BSc extended streams'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended APS on faculty table; maths/science requirements',
      },
    ],
    noBridgingFor: [
      'Veterinary Science (BVSc) — separate early deadline; no extended BVSc',
      'Medicine — mainstream only with strict selection',
      'Law (LLB) — mainstream entry',
      'Most Humanities BA programmes — check handbook; many are mainstream only',
    ],
    applicationOpens: '1 April 2026',
    applicationCloses: '30 June 2026 (general); BVSc 31 May 2026',
    duration: '4–5 years for extended engineering',
    compensation: 'University fees',
    links: [
      { label: 'UP undergraduate', url: 'https://www.up.ac.za/undergraduate', kind: 'official' },
      { label: 'Apply', url: 'https://www.up.ac.za/apply', kind: 'register' },
    ],
    notes: 'UP extended BEng is one of the best-known engineering access routes in SA if you missed mainstream APS by a few points.',
    popularityRank: 4,
  }),
  b({
    id: 'ukzn-access',
    name: 'University of KwaZulu-Natal',
    shortName: 'UKZN',
    category: 'foundation-access',
    location: 'KwaZulu-Natal',
    website: 'https://ukzn.ac.za/study-at-ukzn/undergraduate-studies/',
    summary:
      'UKZN access and foundation programmes target students from disadvantaged schools or those narrowly missing mainstream entry. Apply via CAO.',
    offersBridging: [
      {
        faculty: 'Access Programmes (CTL)',
        programmes: ['Foundation year leading to BA, BSc, BCom, BSocial Science'],
        routeType: '1-year access / foundation',
        whoQualifies: 'School-leavers from quintile 1–3 schools or meeting access APS criteria',
      },
      {
        faculty: 'Science & Agriculture',
        programmes: ['Extended BSc streams (where listed)'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended admission points; maths/science subjects',
      },
      {
        faculty: 'Health Sciences',
        programmes: ['Some extended allied health routes — check CAO handbook'],
        routeType: 'Extended / access',
        whoQualifies: 'Faculty-specific; NBT required for many health programmes',
      },
    ],
    noBridgingFor: [
      'Medicine (MBChB) — mainstream only; closes June',
      'Law (LLB) — typically mainstream; access may feed into BA Law not direct LLB',
      'Psychology — access may lead to BA, not a standalone psych bridging qualification',
    ],
    applicationOpens: '1 March 2026 (via CAO)',
    applicationCloses: '30 September 2026',
    duration: '1 foundation year + degree, or 4-year extended',
    compensation: 'University fees — NSFAS eligible',
    links: [
      { label: 'UKZN undergraduate', url: 'https://ukzn.ac.za/study-at-ukzn/undergraduate-studies/', kind: 'official' },
      { label: 'Apply via CAO', url: 'https://www.cao.ac.za', kind: 'register' },
    ],
    notes: 'Combine with NBT registration. Access programme success is life-changing for students who thought UKZN was out of reach.',
    popularityRank: 5,
  }),
  b({
    id: 'stellenbosch-scimathus',
    name: 'Stellenbosch University',
    shortName: 'Stellenbosch',
    category: 'stem-bridge',
    location: 'Western Cape',
    website: 'https://www.sun.ac.za/english/scimathus',
    summary:
      'SciMathUS is a one-year STEM bridge upgrading maths/science marks. Separate from extended degrees — ' +
      'successful completion allows degree admission. Extended programmes also exist in some faculties.',
    offersBridging: [
      {
        faculty: 'SciMathUS (STEM bridge)',
        programmes: ['Mathematics upgrade', 'Physical Sciences upgrade'],
        routeType: '1-year full-time bridge',
        whoQualifies: 'Matric with maths & science but below degree requirements; SA citizens — apply to SciMathUS',
      },
      {
        faculty: 'Economic & Management Sciences',
        programmes: ['Extended BCom (where offered)'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended APS on Stellenbosch table',
      },
      {
        faculty: 'Science',
        programmes: ['Extended BSc streams'],
        routeType: 'Extended degree (4 years)',
        whoQualifies: 'After SciMathUS OR direct extended admission if APS qualifies',
      },
    ],
    noBridgingFor: [
      'Law (LLB) — mainstream only; Afrikaans/English requirements',
      'Medicine (MBChB) — mainstream only after meeting full requirements (SciMathUS can help maths/science marks)',
      'Psychology — BA mainstream; no separate psych bridge',
    ],
    applicationOpens: 'SciMathUS: mid-year for following year; undergrad: 1 April 2026',
    applicationCloses: '31 July 2026 (undergrad); SciMathUS — confirm on site',
    duration: '1 year SciMathUS; 4 years extended BSc/BCom',
    compensation: 'Programme fees; bursaries may apply for SciMathUS',
    links: [
      { label: 'SciMathUS', url: 'https://www.sun.ac.za/english/scimathus', kind: 'official' },
      { label: 'Maties apply', url: 'https://www.sun.ac.za/english/maties/apply', kind: 'register' },
    ],
    notes: 'If you failed maths/science level, SciMathUS is the fix — not the same as an extended degree.',
    popularityRank: 6,
  }),
  b({
    id: 'nmu-extended',
    name: 'Nelson Mandela University',
    shortName: 'NMU',
    category: 'extended-degree',
    location: 'Eastern Cape',
    website: 'https://www.mandela.ac.za/Study-at-Mandela/Prospective-Students',
    summary: 'Extended curriculum programmes with lower admission points and academic support in year 1.',
    offersBridging: [
      {
        faculty: 'Business & Economic Sciences',
        programmes: ['Extended BCom', 'Extended BAdmin'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended admission points (~370+ band vs higher for mainstream)',
      },
      {
        faculty: 'Science',
        programmes: ['Extended BSc'],
        routeType: 'Extended degree',
        whoQualifies: 'Maths/science subjects; extended points column in prospectus',
      },
      {
        faculty: 'Education',
        programmes: ['Extended BEd (where listed)'],
        routeType: 'Extended degree',
        whoQualifies: 'Diploma or bachelor pass with extended APS',
      },
    ],
    noBridgingFor: [
      'Medicine (MBChB) — mainstream only; closes June',
      'Law — mainstream LLB entry',
      'Pharmacy — mainstream with earlier deadline',
    ],
    applicationOpens: '1 April 2026',
    applicationCloses: '30 September 2026',
    duration: '4 years for 3-year degrees',
    compensation: 'University fees',
    links: [
      { label: 'NMU prospective', url: 'https://www.mandela.ac.za/Study-at-Mandela/Prospective-Students', kind: 'official' },
    ],
    notes: 'Check extended column in NMU prospectus for your exact programme code.',
    popularityRank: 7,
  }),
  b({
    id: 'cput-extended',
    name: 'Cape Peninsula University of Technology',
    shortName: 'CPUT',
    category: 'extended-degree',
    location: 'Western Cape',
    website: 'https://www.cput.ac.za/study/apply',
    summary: 'Extended programmes in engineering and applied sciences for UoT diplomas and degrees.',
    offersBridging: [
      {
        faculty: 'Engineering',
        programmes: ['Extended diplomas/degrees in Civil, Mechanical, Electrical'],
        routeType: 'Extended curriculum',
        whoQualifies: 'Extended APS; maths/science for engineering',
      },
      {
        faculty: 'Applied Sciences',
        programmes: ['Extended BSc / diploma streams'],
        routeType: 'Extended curriculum',
        whoQualifies: 'Extended admission points on CPUT table',
      },
    ],
    noBridgingFor: [
      'Design & Multimedia — portfolio selection; no standard extended route',
      'Health Sciences (Emergency Medical Care) — strict selection; mainstream',
    ],
    applicationOpens: '12 May 2026',
    applicationCloses: '30 September 2026',
    duration: '4–5 years depending on qualification',
    compensation: 'University fees',
    links: [
      { label: 'CPUT apply', url: 'https://www.cput.ac.za/study/apply', kind: 'official' },
    ],
    notes: 'Technology university — strong on applied diplomas with extended options in engineering.',
    popularityRank: 8,
  }),
  b({
    id: 'ufs-preparatory',
    name: 'University of the Free State',
    shortName: 'UFS',
    category: 'foundation-access',
    location: 'Free State',
    website: 'https://www.ufs.ac.za/upp',
    summary: 'University Preparatory Programme (UPP) is a foundation year before UFS degree study.',
    offersBridging: [
      {
        faculty: 'University Preparatory Programme (UPP)',
        programmes: ['Academic literacy, maths, science prep for degree entry'],
        routeType: '1-year foundation',
        whoQualifies: 'Grade 12 graduates not meeting direct admission; disadvantaged backgrounds prioritised',
      },
      {
        faculty: 'Natural & Agricultural Sciences',
        programmes: ['Extended BSc (where listed)'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended APS after UPP or direct extended admission',
      },
    ],
    noBridgingFor: [
      'Medicine & most Health Sciences — strict mainstream selection',
      'Law (LLB) — mainstream entry after UPP if requirements met',
    ],
    applicationOpens: 'Check UFS UPP page annually',
    applicationCloses: 'Confirm on UFS site',
    duration: '1 year UPP + 3–4 year degree',
    compensation: 'Programme fees',
    links: [
      { label: 'UFS UPP', url: 'https://www.ufs.ac.za/upp', kind: 'official' },
      { label: 'UFS apply', url: 'https://www.ufs.ac.za/apply', kind: 'register' },
    ],
    notes: 'UPP success unlocks UFS degree admission the following year — ideal if you missed direct entry.',
    popularityRank: 9,
  }),
  b({
    id: 'nwu-extended',
    name: 'North-West University',
    shortName: 'NWU',
    category: 'extended-degree',
    location: 'North West, Gauteng, Mpumalanga',
    website: 'https://www.nwu.ac.za/undergraduate-studies',
    summary: 'Extended programmes across Potchefstroom, Mahikeng, and Vanderbijlpark campuses.',
    offersBridging: [
      {
        faculty: 'Commerce & Administration',
        programmes: ['Extended BCom', 'Extended BAdmin'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended APS per campus prospectus',
      },
      {
        faculty: 'Natural & Agricultural Sciences',
        programmes: ['Extended BSc'],
        routeType: 'Extended degree',
        whoQualifies: 'Maths/science; extended points column',
      },
      {
        faculty: 'Education',
        programmes: ['Extended BEd streams'],
        routeType: 'Extended degree',
        whoQualifies: 'Extended admission points',
      },
    ],
    noBridgingFor: [
      'Law (LLB) — mainstream on most campuses',
      'Medicine — not offered at NWU',
    ],
    applicationOpens: '1 April 2026',
    applicationCloses: '31 August 2026',
    duration: '4 years typical',
    compensation: 'University fees (free online application)',
    links: [
      { label: 'NWU undergraduate', url: 'https://www.nwu.ac.za/undergraduate-studies', kind: 'official' },
    ],
    notes: 'Check which campus offers extended for your programme — not all programmes on all campuses.',
    popularityRank: 10,
  }),
  b({
    id: 'unisa-higher-cert',
    name: 'University of South Africa',
    shortName: 'UNISA',
    category: 'higher-certificate',
    location: 'Distance learning (national)',
    website: 'https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission',
    summary:
      'Higher certificates and advanced certificates as open-access pathways to diplomas and degrees — ' +
      'ideal if you did not qualify for contact university admission.',
    offersBridging: [
      {
        faculty: 'Higher Certificates',
        programmes: ['HC in Accounting', 'HC in Information Technology', 'HC in Law'],
        routeType: '1-year qualification → diploma/degree',
        whoQualifies: 'Matric or equivalent; many are open access',
      },
      {
        faculty: 'Extended programmes',
        programmes: ['Some extended BCom/BSc routes (check qualification list)'],
        routeType: 'Extended degree by distance',
        whoQualifies: 'APS on UNISA extended column',
      },
    ],
    noBridgingFor: [
      'Contact-health programmes requiring labs — limited at UNISA',
      'Short 6-month bridging — UNISA offers qualifications, not matric upgrades',
    ],
    applicationOpens: '18 August 2026',
    applicationCloses: '10 October 2026',
    duration: '1 year HC; then progress to diploma/degree',
    compensation: 'UNISA module fees',
    links: [
      { label: 'UNISA apply', url: 'https://www.unisa.ac.za/sites/corporate/default/Apply-for-admission', kind: 'register' },
    ],
    notes: 'Self-discipline required. Higher certificate in IT or Accounting is a proven path into full degrees.',
    popularityRank: 11,
  }),
  b({
    id: 'rhodes-extended',
    name: 'Rhodes University',
    shortName: 'Rhodes',
    category: 'extended-degree',
    location: 'Eastern Cape',
    website: 'https://www.ru.ac.za/admissiongateway/',
    summary: 'Small residential university with extended studies streams for qualifying applicants.',
    offersBridging: [
      {
        faculty: 'Science',
        programmes: ['Extended BSc'],
        routeType: 'Extended studies (4 years)',
        whoQualifies: 'Extended admission points; Dean may consider discretionary admission',
      },
      {
        faculty: 'Humanities',
        programmes: ['Extended BA (where listed)'],
        routeType: 'Extended studies',
        whoQualifies: 'Extended-stream Rhodes admission points',
      },
    ],
    noBridgingFor: [
      'Pharmacy (BPharm) — mainstream selection only',
      'Journalism — mainstream BA Journalism; highly competitive',
      'Law — confirm current offering; typically mainstream',
    ],
    applicationOpens: '1 April 2026',
    applicationCloses: '30 September 2026',
    duration: '4 years for 3-year degrees',
    compensation: 'University fees',
    links: [
      { label: 'Rhodes admission', url: 'https://www.ru.ac.za/admissiongateway/', kind: 'official' },
    ],
    notes: 'Small cohorts — extended places fill quickly. Residential life is part of the Rhodes experience.',
    popularityRank: 12,
  }),
]

export const BRIDGING_BY_POPULARITY = [...BRIDGING_PROGRAMMES].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
