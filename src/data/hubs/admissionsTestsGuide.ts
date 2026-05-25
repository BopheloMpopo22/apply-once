export type AdmissionsGuideSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

/** Student-facing context shown beside the admissions tests list. */
export const ADMISSIONS_TESTS_GUIDE: AdmissionsGuideSection[] = [
  {
    id: 'who',
    title: 'Who should write these tests?',
    paragraphs: [
      'Not every matriculant needs every test. Use this hub to match your pathway — SA university, health sciences, study abroad, or KZN applications.',
    ],
    bullets: [
      'SA public universities (UCT, Wits, Stellenbosch, UKZN, etc.) — often NBT AQL; maths-heavy degrees need MAT too',
      'Health Sciences at Wits and similar — NBT with strict faculty deadlines',
      'Study in the USA — SAT or ACT; plan test centres in Johannesburg or Cape Town',
      'Study in UK, Australia, Canada, or EU — usually IELTS Academic (or equivalent)',
      'Applying only via CAO (KZN) — register on CAO; still write NBT if your programme requires it',
    ],
  },
  {
    id: 'placement',
    title: 'How tests affect placement',
    paragraphs: [
      'Strong NSC marks get you considered; admissions tests often decide faculty placement, extended programmes, and competitive programmes.',
    ],
    bullets: [
      'NBT results can place you in mainstream, extended, or bridging streams — check each university faculty page',
      'Book NBT early enough for results to reach the university before closing dates (often 6–8 weeks)',
      'SAT/ACT scores are sent to US colleges you select at registration — you can send to more schools later for a fee',
      'IELTS bands must meet each country and course minimum (often 6.0–7.0 overall for UK/EU masters)',
    ],
  },
  {
    id: 'prep',
    title: 'Prep tips that actually help',
    paragraphs: [
      'Treat official practice material as your main source. Free prep links are on each test card.',
    ],
    bullets: [
      'NBT: practise AQL literacy and timed MAT maths — past-style samples on nbt.ac.za',
      'SAT: link Khan Academy to your College Board account for free personalised prep',
      'IELTS: use British Council free practice tests; book Academic, not General Training',
      'Register before popular dates fill — Gauteng and Western Cape venues go first',
    ],
  },
  {
    id: 'timeline',
    title: 'Typical matric timeline',
    paragraphs: [
      'Grade 12 learners usually register in Term 2–3 and write before university applications close.',
    ],
    bullets: [
      'Apr–Jun: NBT registration opens; book a May–Aug write if applying for 2027 entry',
      'Jul–Sep: CAO and many university applications; health sciences may need earlier NBT',
      'Aug–Oct: SAT/ACT international dates; IELTS can be monthly in major cities',
      'Oct: Last recommended NBT writes for many UCT programmes — confirm on your faculty page',
    ],
  },
]
