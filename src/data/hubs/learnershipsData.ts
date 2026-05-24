import type { HubListingEntry } from '../../types/hubs'
import { LEARNERSHIP_CATEGORY_LABELS } from '../../types/hubs'

function entry(
  e: Omit<HubListingEntry, 'categoryLabel'> & { category: keyof typeof LEARNERSHIP_CATEGORY_LABELS },
): HubListingEntry {
  return { ...e, categoryLabel: LEARNERSHIP_CATEGORY_LABELS[e.category] }
}

export const LEARNERSHIPS: HubListingEntry[] = [
  entry({
    id: 'dhet-learnerships',
    name: 'DHET — Skills development & learnership info',
    shortName: 'DHET',
    category: 'government',
    location: 'National',
    website: 'https://www.dhet.gov.za',
    summary:
      'Department of Higher Education and Training oversees SETA learnerships funded by the skills development levy. ' +
      'Official starting point for understanding how learnerships work in SA.',
    knownFor: ['Policy', 'SETA overview', 'NQF qualifications', 'Official info'],
    whoCanApply: [
      'Unemployed or employed South Africans via SETAs',
      'Requirements vary by learnership level (NQF 2–6)',
    ],
    applicationOpens: 'N/A — information resource',
    applicationCloses: 'N/A',
    duration: '12–36 months typical',
    compensation: 'Stipend set by SETA/employer — not below minimum wage',
    links: [
      { label: 'DHET', url: 'https://www.dhet.gov.za', kind: 'official' },
      { label: 'Career development services', url: 'https://www.dhet.gov.za/SitePages/Career_Development_Services.aspx', kind: 'guide' },
    ],
    notes: 'Never pay to apply for a learnership. Legitimate programmes are free to apply.',
    popularityRank: 1,
  }),
  entry({
    id: 'labour-centre',
    name: 'Department of Employment & Labour — Work-seeker registration',
    shortName: 'Labour Centre',
    category: 'government',
    location: 'National (all provinces)',
    website: 'https://www.labour.gov.za',
    summary:
      'Register as a work-seeker at your nearest Labour Centre — required for some government learnerships ' +
      '(e.g. UIF ITR) and helps match you to opportunities.',
    knownFor: ['Work-seeker registration', 'UIF programmes', 'Free service'],
    whoCanApply: [
      'Unemployed South African citizens',
      'Bring ID, CV, and qualifications to nearest centre',
    ],
    applicationOpens: 'Year-round registration',
    applicationCloses: 'N/A',
    duration: 'N/A — registration step',
    compensation: 'N/A — enables learnership applications',
    links: [
      { label: 'Dept of Employment & Labour', url: 'https://www.labour.gov.za', kind: 'official' },
      { label: 'Find a Labour Centre', url: 'https://www.labour.gov.za/About-Us/Pages/Contact-Us.aspx', kind: 'guide' },
    ],
    notes: 'First step before applying to some government-funded learnerships. Keep registration proof.',
    popularityRank: 2,
  }),
  entry({
    id: 'mict-seta',
    name: 'MICT SETA — ICT & digital learnerships',
    shortName: 'MICT SETA',
    category: 'seta-portal',
    location: 'National',
    website: 'https://www.mict.org.za',
    summary:
      'Media, Information and Communication Technologies SETA — learnerships in IT support, software development, ' +
      'telecoms, and digital media.',
    knownFor: ['IT learnerships', 'Digital skills', 'ICT support'],
    whoCanApply: [
      'Matric for entry-level ICT learnerships',
      'Unemployed youth 18–35 for many programmes',
      'Via accredited training providers on MICT database',
    ],
    applicationOpens: 'Varies by provider intake',
    applicationCloses: 'Provider-specific',
    duration: '12–24 months typical',
    compensation: 'Monthly stipend (varies, often R4k–R8k)',
    links: [
      { label: 'MICT SETA', url: 'https://www.mict.org.za', kind: 'official' },
      { label: 'Accredited providers', url: 'https://www.mict.org.za/accredited-providers/', kind: 'guide' },
    ],
    notes: 'Pair with Courses hub for Microsoft/AWS certs to strengthen applications.',
    popularityRank: 3,
  }),
  entry({
    id: 'fasset',
    name: 'FASSET — Finance & accounting learnerships',
    shortName: 'FASSET',
    category: 'seta-portal',
    location: 'National',
    website: 'https://www.fasset.org.za',
    summary:
      'Finance and Accounting Services SETA — learnerships leading to bookkeeping, accounting technician, ' +
      'and related NQF qualifications.',
    knownFor: ['Bookkeeping', 'Accounting', 'Finance', 'NQF 4–6'],
    whoCanApply: [
      'Matric with maths literacy or pure maths depending on programme',
      'Unemployed or employed via participating employers',
    ],
    applicationOpens: 'Via employers and providers year-round',
    applicationCloses: 'Varies',
    duration: '12–36 months',
    compensation: 'Employer/SETA stipend',
    links: [
      { label: 'FASSET', url: 'https://www.fasset.org.za', kind: 'official' },
    ],
    notes: 'Pathway toward AAT(SA) and professional accounting bodies with further study.',
    popularityRank: 4,
  }),
  entry({
    id: 'bankseta',
    name: 'BANKSETA — Banking & microfinance learnerships',
    shortName: 'BANKSETA',
    category: 'seta-portal',
    location: 'National',
    website: 'https://www.bankseta.org.za',
    summary:
      'Banking Sector Education and Training Authority — learnerships with banks and financial institutions ' +
      'for entry-level banking roles.',
    knownFor: ['Banking', 'Microfinance', 'Financial services'],
    whoCanApply: [
      'Matric with maths for most programmes',
      'Often 18–30 age range for unemployed intake',
    ],
    applicationOpens: 'When banks advertise — typically early year',
    applicationCloses: 'Campaign-specific',
    duration: '12–18 months',
    compensation: 'Stipend/salary during learnership',
    links: [
      { label: 'BANKSETA', url: 'https://www.bankseta.org.za', kind: 'official' },
    ],
    notes: 'Also apply directly on bank career pages (Absa, FNB, Nedbank, Standard Bank).',
    popularityRank: 5,
  }),
  entry({
    id: 'merseta',
    name: 'merSETA — Manufacturing & engineering learnerships',
    shortName: 'merSETA',
    category: 'seta-portal',
    location: 'National',
    website: 'https://www.merseta.org.za',
    summary:
      'Manufacturing, Engineering and Related Services SETA — artisan, fitter, millwright, and engineering learnerships.',
    knownFor: ['Artisan', 'Engineering', 'Manufacturing', 'Apprenticeships'],
    whoCanApply: [
      'Matric with maths and science for technical programmes',
      'NCV holders from TVET',
    ],
    applicationOpens: 'Via employers year-round',
    applicationCloses: 'Varies',
    duration: '24–48 months for artisan trades',
    compensation: 'Stipend increasing with skill level',
    links: [
      { label: 'merSETA', url: 'https://www.merseta.org.za', kind: 'official' },
    ],
    notes: 'See Work Opportunities hub for merSETA artisan overview. TVET NCV is a strong starting point.',
    popularityRank: 6,
  }),
  entry({
    id: 'services-seta',
    name: 'Services SETA — Learner portal',
    shortName: 'Services SETA',
    category: 'seta-portal',
    location: 'National',
    website: 'https://servicesseta.org.za/learners/',
    summary:
      'Services sector SETA learner portal — register your profile to be matched with employers and training providers ' +
      'offering funded programmes in hospitality, retail, cleaning, and related services.',
    knownFor: ['Learner portal', 'Hospitality', 'Retail services', 'Profile matching'],
    whoCanApply: [
      'Employed or unemployed South Africans',
      'Register on learner portal with ID number',
    ],
    applicationOpens: 'Year-round portal registration',
    applicationCloses: 'N/A',
    duration: 'Varies by learnership',
    compensation: 'Stipend per programme',
    links: [
      { label: 'Services SETA learners', url: 'https://servicesseta.org.za/learners/', kind: 'official' },
      { label: 'Learner portal login', url: 'https://servicesseta.org.za/learners/', kind: 'register' },
    ],
    notes: 'Keep your portal profile updated. Employers search for candidates when funding opens.',
    popularityRank: 7,
  }),
  entry({
    id: 'ceta',
    name: 'CETA — Construction learnerships',
    shortName: 'CETA',
    category: 'seta-portal',
    location: 'National',
    website: 'https://www.ceta.org.za',
    summary:
      'Construction Education and Training Authority — learnerships in building, civil engineering, plumbing, ' +
      'and construction management.',
    knownFor: ['Construction', 'Plumbing', 'Civil engineering', 'Artisan trades'],
    whoCanApply: [
      'Matric for entry-level; NCV construction streams advantageous',
      'Physical fitness for site work',
    ],
    applicationOpens: 'Via construction companies and providers',
    applicationCloses: 'Varies',
    duration: '12–36 months',
    compensation: 'Site-based stipend',
    links: [
      { label: 'CETA', url: 'https://www.ceta.org.za', kind: 'official' },
    ],
    notes: 'Construction sector has high demand for artisans — pair with TVET college NCV programmes.',
    popularityRank: 8,
  }),
  entry({
    id: 'hwseta',
    name: 'HWSETA — Health & social development learnerships',
    shortName: 'HWSETA',
    category: 'seta-portal',
    location: 'National',
    website: 'https://www.hwseta.org.za',
    summary:
      'Health and Welfare SETA — learnerships in community health work, social auxiliary work, ' +
      'and health support (not professional nursing — see colleges hub for nursing).',
    knownFor: ['Community health', 'Social work auxiliary', 'Health support'],
    whoCanApply: [
      'Matric for most entry programmes',
      'Some require specific subjects (life sciences)',
    ],
    applicationOpens: 'Via NGOs, government, and providers',
    applicationCloses: 'Varies',
    duration: '12–24 months',
    compensation: 'Stipend',
    links: [
      { label: 'HWSETA', url: 'https://www.hwseta.org.za', kind: 'official' },
    ],
    notes: 'Professional nursing requires university/college — not a 12-month learnership.',
    popularityRank: 9,
  }),
  entry({
    id: 'sasol-artisan',
    name: 'Sasol — Artisan learnership 2026',
    shortName: 'Sasol',
    category: 'corporate',
    location: 'Mpumalanga (Secunda)',
    website: 'https://www.sasol.com/careers',
    summary:
      '36-month artisan learnership at Secunda Operations — electrical, mechanical, instrumentation, ' +
      'and chemical processing trades with workplace and classroom training.',
    knownFor: ['Artisan', 'Energy sector', '36 months', 'Secunda'],
    whoCanApply: [
      'NSC with English, Maths/Technical Maths, Science/Technical Science',
      'No prior work experience required',
    ],
    applicationOpens: 'When advertised on Sasol careers',
    applicationCloses: '2 Mar 2026 (2026 intake — confirm on site)',
    duration: '36 months fixed-term',
    compensation: 'Learnership salary/stipend',
    links: [
      { label: 'Sasol careers', url: 'https://www.sasol.com/careers', kind: 'official' },
    ],
    notes: 'Highly competitive. Reference ID and closing dates change each intake — always verify on Sasol site.',
    popularityRank: 10,
  }),
  entry({
    id: 'eskom-learnership',
    name: 'Eskom — Learnerships & apprenticeships',
    shortName: 'Eskom',
    category: 'corporate',
    location: 'National',
    website: 'https://www.eskom.co.za/careers/',
    summary:
      'Eskom offers artisan, technician, and engineering learnerships when recruitment opens — ' +
      'critical skills for power generation and distribution.',
    knownFor: ['Artisan', 'Electrical', 'Engineering', 'SOE'],
    whoCanApply: [
      'Matric with maths and science for technical programmes',
      'NCV/NATED advantageous',
    ],
    applicationOpens: 'When Eskom advertises — monitor careers page',
    applicationCloses: 'Campaign-specific',
    duration: '24–48 months',
    compensation: 'Learnership stipend/salary',
    links: [
      { label: 'Eskom careers', url: 'https://www.eskom.co.za/careers/', kind: 'official' },
    ],
    notes: 'Also see Eskom vacation work in Vacation Work hub for students still studying.',
    popularityRank: 11,
  }),
  entry({
    id: 'transnet-learnership',
    name: 'Transnet — Learnerships',
    shortName: 'Transnet',
    category: 'corporate',
    location: 'National (ports, rail, pipelines)',
    website: 'https://www.transnet.net/Careers',
    summary:
      'Freight rail, port, and pipeline operations learnerships — engineering, operations, and safety disciplines.',
    knownFor: ['Rail', 'Ports', 'Engineering', 'SOE'],
    whoCanApply: [
      'Matric with relevant subjects per learnership',
      'Some roles require driver licence',
    ],
    applicationOpens: 'When advertised',
    applicationCloses: 'Campaign-specific',
    duration: '12–36 months',
    compensation: 'Stipend/salary',
    links: [
      { label: 'Transnet careers', url: 'https://www.transnet.net/Careers', kind: 'official' },
    ],
    notes: 'Large SOE with diverse trades. Set up job alerts on careers portal.',
    popularityRank: 12,
  }),
  entry({
    id: 'myseta',
    name: 'MYSETA — Accredited learnerships 2026',
    shortName: 'MYSETA',
    category: 'sector-programme',
    location: 'National',
    website: 'https://www.myseta.org.za',
    summary:
      'Mining and related SETA offering accredited learnerships with monthly stipend for unemployed youth 18–35.',
    knownFor: ['Mining sector', '12-month programmes', 'Online application'],
    whoCanApply: [
      'SA citizens 18–35, unemployed',
      'Minimum matric; some require NQF 4–5',
      'Must reside near training/host site',
    ],
    applicationOpens: 'Nov 2025 (2026 intake example)',
    applicationCloses: '31 Dec 2025 — confirm annually on portal',
    duration: '12 months full-time',
    compensation: 'Monthly stipend',
    links: [
      { label: 'MYSETA portal', url: 'https://www.myseta.org.za', kind: 'official' },
      { label: 'Learner programmes', url: 'https://www.myseta.org.za', kind: 'register' },
    ],
    notes: 'Online application only — no email/fax. Certified documents required.',
    popularityRank: 13,
  }),
  entry({
    id: 'yes-youth',
    name: 'YES — Youth Employment Service',
    shortName: 'YES',
    category: 'sector-programme',
    location: 'National',
    website: 'https://www.yes4youth.co.za',
    summary:
      '12-month paid work experience placing unemployed youth in corporate roles — not a SETA qualification ' +
      'but valuable CV experience (often leads to permanent employment).',
    knownFor: ['12-month placement', 'Stipend', 'Corporate experience', 'CV building'],
    whoCanApply: [
      'SA citizens 18–34',
      'Unemployed and not studying full-time',
      'Matric advantageous',
    ],
    applicationOpens: 'Rolling via YES portal',
    applicationCloses: 'Rolling',
    duration: '12 months',
    compensation: 'Minimum wage stipend (YES standard)',
    links: [
      { label: 'YES4Youth', url: 'https://www.yes4youth.co.za', kind: 'official' },
      { label: 'Register', url: 'https://www.yes4youth.co.za', kind: 'register' },
    ],
    notes: 'Different from learnership — no NQF qualification but real work experience. See NYDA in Work hub.',
    popularityRank: 14,
  }),
]

export const LEARNERSHIPS_BY_POPULARITY = [...LEARNERSHIPS].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
