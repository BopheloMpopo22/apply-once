import type { HubListingEntry } from '../../types/hubs'
import { LEARNERSHIP_CATEGORY_LABELS } from '../../types/hubs'

function entry(
  e: Omit<HubListingEntry, 'categoryLabel'> & { category: keyof typeof LEARNERSHIP_CATEGORY_LABELS },
): HubListingEntry {
  return { ...e, categoryLabel: LEARNERSHIP_CATEGORY_LABELS[e.category] }
}

function seta(opts: {
  id: string
  name: string
  shortName: string
  website: string
  summary: string
  knownFor: string[]
  whoCanApply?: string[]
  notes?: string
  popularityRank: number
  links?: HubListingEntry['links']
}): HubListingEntry {
  return entry({
    id: opts.id,
    name: opts.name,
    shortName: opts.shortName,
    category: 'seta-portal',
    location: 'National',
    website: opts.website,
    summary: opts.summary,
    knownFor: opts.knownFor,
    whoCanApply: opts.whoCanApply ?? [
      'Unemployed or employed South Africans (requirements vary by programme)',
      'Matric for most entry-level learnerships; NCV/NATED for technical streams',
      'Age 18–35 for many funded youth intakes — confirm on each advert',
    ],
    applicationOpens: 'Rolling via SETA, employers & accredited providers',
    applicationCloses: 'Campaign-specific — check SETA & employer careers pages',
    duration: '12–36 months typical (artisan longer)',
    compensation: 'Monthly stipend set by SETA/employer — never pay to apply',
    links: opts.links ?? [
      { label: `${opts.shortName} website`, url: opts.website, kind: 'official' },
    ],
    notes:
      opts.notes ??
      'Register interest on the SETA site and also apply when employers advertise. Legitimate learnerships are free to apply for.',
    popularityRank: opts.popularityRank,
  })
}

/**
 * SA learnership entry points — all 21 SETAs + government portals + selected corporates.
 * Students apply on official sites; we map the starting points.
 */
export const LEARNERSHIPS: HubListingEntry[] = [
  entry({
    id: 'sa-youth',
    name: 'SA Youth — National youth opportunity portal',
    shortName: 'SA Youth',
    category: 'government',
    location: 'National',
    website: 'https://sayouth.mobi',
    summary:
      'Government-backed portal where unemployed youth register once and get matched to learnerships, ' +
      'YES placements, internships, and skills programmes from public and private partners.',
    knownFor: ['National portal', 'Learnerships', 'YES', 'Free registration'],
    whoCanApply: [
      'South African youth (typically 18–35)',
      'Unemployed or looking for first work experience',
      'Smartphone or web access to complete profile',
    ],
    applicationOpens: 'Year-round registration',
    applicationCloses: 'N/A — rolling opportunities',
    duration: 'Varies by matched programme',
    compensation: 'Depends on placement (stipend / YES wage)',
    links: [
      { label: 'SA Youth', url: 'https://sayouth.mobi', kind: 'official' },
      { label: 'Register', url: 'https://sayouth.mobi', kind: 'register' },
    ],
    notes: 'Best first stop for matric and post-matric youth. Keep your profile and documents updated.',
    popularityRank: 1,
  }),
  entry({
    id: 'dpsa-internships',
    name: 'DPSA — Public service internships & learnerships',
    shortName: 'DPSA',
    category: 'government',
    location: 'National (all spheres of government)',
    website: 'https://www.dpsa.gov.za',
    summary:
      'Department of Public Service and Administration coordinates public-service internship and learnership ' +
      'adverts across national and provincial departments — admin, finance, IT, HR, and more.',
    knownFor: ['Government internships', 'Public service', 'Provincial & national'],
    whoCanApply: [
      'Unemployed graduates and diploma holders for many internships',
      'Matric / NQF requirements depend on the advertised post',
      'SA citizenship usually required',
    ],
    applicationOpens: 'When departments advertise (often batches during the year)',
    applicationCloses: 'Per advert — watch DPSA & department sites',
    duration: '12–24 months typical for internships',
    compensation: 'Government stipend (per circular)',
    links: [
      { label: 'DPSA', url: 'https://www.dpsa.gov.za', kind: 'official' },
      {
        label: 'Vacancies & circulars',
        url: 'https://www.dpsa.gov.za/dpsa2g/vacancies.asp',
        kind: 'register',
      },
    ],
    notes: 'Also check provincial treasury / premier office career pages for local intakes.',
    popularityRank: 2,
  }),
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
      {
        label: 'SETA links',
        url: 'https://www.dhet.gov.za/SitePages/SETAlinks.aspx',
        kind: 'guide',
      },
    ],
    notes: 'Never pay to apply for a learnership. Legitimate programmes are free to apply.',
    popularityRank: 3,
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
      {
        label: 'Find a Labour Centre',
        url: 'https://www.labour.gov.za/About-Us/Pages/Contact-Us.aspx',
        kind: 'guide',
      },
    ],
    notes: 'First step before applying to some government-funded learnerships. Keep registration proof.',
    popularityRank: 4,
  }),

  // ——— All 21 SETAs ———
  seta({
    id: 'agriseta',
    name: 'AgriSETA — Agriculture, forestry & fisheries learnerships',
    shortName: 'AgriSETA',
    website: 'https://www.agriseta.co.za',
    summary:
      'Agricultural Sector Education and Training Authority — farming, agribusiness, forestry, and fisheries ' +
      'learnerships and apprenticeships with employers nationwide.',
    knownFor: ['Agriculture', 'Farming', 'Agribusiness', 'Forestry'],
    popularityRank: 5,
  }),
  seta({
    id: 'bankseta',
    name: 'BANKSETA — Banking & microfinance learnerships',
    shortName: 'BANKSETA',
    website: 'https://www.bankseta.org.za',
    summary:
      'Banking Sector Education and Training Authority — learnerships with banks and financial institutions ' +
      'for entry-level banking and microfinance roles.',
    knownFor: ['Banking', 'Microfinance', 'Financial services'],
    whoCanApply: [
      'Matric with maths for most programmes',
      'Often 18–30 age range for unemployed intake',
    ],
    notes: 'Also apply directly on bank career pages (Absa, FNB, Nedbank, Standard Bank, Capitec).',
    popularityRank: 6,
  }),
  seta({
    id: 'cathsseta',
    name: 'CATHSSETA — Tourism, hospitality, arts & sport learnerships',
    shortName: 'CATHSSETA',
    website: 'https://www.cathsseta.org.za',
    summary:
      'Culture, Arts, Tourism, Hospitality and Sport SETA — hotel, tourism, culinary, fitness, and creative ' +
      'industry learnerships.',
    knownFor: ['Hospitality', 'Tourism', 'Sport', 'Arts & culture'],
    popularityRank: 7,
  }),
  seta({
    id: 'ceta',
    name: 'CETA — Construction learnerships',
    shortName: 'CETA',
    website: 'https://www.ceta.org.za',
    summary:
      'Construction Education and Training Authority — building, civil engineering, plumbing, and ' +
      'construction management learnerships and artisan pathways.',
    knownFor: ['Construction', 'Plumbing', 'Civil engineering', 'Artisan trades'],
    notes: 'High demand for artisans — pair with TVET college NCV construction programmes.',
    popularityRank: 8,
  }),
  seta({
    id: 'chieta',
    name: 'CHIETA — Chemical industries learnerships',
    shortName: 'CHIETA',
    website: 'https://www.chieta.org.za',
    summary:
      'Chemical Industries Education and Training Authority — process operations, laboratory, glass, ' +
      'and chemical manufacturing skills programmes.',
    knownFor: ['Chemicals', 'Process plant', 'Laboratory', 'Manufacturing'],
    popularityRank: 9,
  }),
  seta({
    id: 'etdp-seta',
    name: 'ETDP SETA — Education & training development learnerships',
    shortName: 'ETDP SETA',
    website: 'https://www.etdpseta.org.za',
    summary:
      'Education, Training and Development Practices SETA — ECD, facilitation, assessor, and education ' +
      'support learnerships for people entering the teaching and training sector.',
    knownFor: ['ECD', 'Facilitation', 'Assessor', 'Education support'],
    popularityRank: 10,
  }),
  seta({
    id: 'ewseta',
    name: 'EWSETA — Energy & water learnerships',
    shortName: 'EWSETA',
    website: 'https://www.ewseta.org.za',
    summary:
      'Energy and Water SETA — electricity, renewable energy, water treatment, and related artisan ' +
      'and technician learnerships.',
    knownFor: ['Energy', 'Water', 'Renewables', 'Artisan'],
    popularityRank: 11,
  }),
  seta({
    id: 'fasset',
    name: 'FASSET — Finance & accounting learnerships',
    shortName: 'FASSET',
    website: 'https://www.fasset.org.za',
    summary:
      'Finance and Accounting Services SETA — bookkeeping, accounting technician, and related NQF ' +
      'qualifications with employers and providers.',
    knownFor: ['Bookkeeping', 'Accounting', 'Finance', 'NQF 4–6'],
    notes: 'Pathway toward AAT(SA) and professional accounting bodies with further study.',
    popularityRank: 12,
  }),
  seta({
    id: 'foodbev',
    name: 'FoodBev SETA — Food & beverage manufacturing learnerships',
    shortName: 'FoodBev SETA',
    website: 'https://www.foodbev.co.za',
    summary:
      'Food and Beverage Manufacturing SETA — production, quality assurance, packaging, and food safety ' +
      'learnerships with manufacturers and processors.',
    knownFor: ['Food manufacturing', 'Quality', 'Packaging', 'Food safety'],
    popularityRank: 13,
  }),
  seta({
    id: 'fpm-seta',
    name: 'FP&M SETA — Fibre, textiles, furniture & manufacturing learnerships',
    shortName: 'FP&M SETA',
    website: 'https://www.fpmseta.org.za',
    summary:
      'Fibre Processing and Manufacturing SETA — clothing, textiles, footwear, furniture, printing, ' +
      'and related manufacturing learnerships.',
    knownFor: ['Textiles', 'Clothing', 'Furniture', 'Printing'],
    popularityRank: 14,
  }),
  seta({
    id: 'hwseta',
    name: 'HWSETA — Health & social development learnerships',
    shortName: 'HWSETA',
    website: 'https://www.hwseta.org.za',
    summary:
      'Health and Welfare SETA — community health work, social auxiliary work, and health support ' +
      '(not professional nursing — see Colleges hub for nursing).',
    knownFor: ['Community health', 'Social work auxiliary', 'Health support'],
    notes: 'Professional nursing requires university/college — not a 12-month learnership.',
    popularityRank: 15,
  }),
  seta({
    id: 'inseta',
    name: 'INSETA — Insurance sector learnerships',
    shortName: 'INSETA',
    website: 'https://www.inseta.org.za',
    summary:
      'Insurance Sector Education and Training Authority — short-term insurance, life assurance, ' +
      'broking, and related financial services learnerships.',
    knownFor: ['Insurance', 'Broking', 'Life assurance', 'Risk'],
    popularityRank: 16,
  }),
  seta({
    id: 'lgseta',
    name: 'LGSETA — Local government learnerships',
    shortName: 'LGSETA',
    website: 'https://www.lgseta.org.za',
    summary:
      'Local Government SETA — municipal administration, finance, community development, and ' +
      'infrastructure-related learnerships with municipalities.',
    knownFor: ['Municipalities', 'Public admin', 'Community development'],
    notes: 'Watch metro and local municipality career pages when LGSETA-funded intakes open.',
    popularityRank: 17,
  }),
  seta({
    id: 'merseta',
    name: 'merSETA — Manufacturing & engineering learnerships',
    shortName: 'merSETA',
    website: 'https://www.merseta.org.za',
    summary:
      'Manufacturing, Engineering and Related Services SETA — artisan, fitter, millwright, automotive, ' +
      'and engineering learnerships and apprenticeships.',
    knownFor: ['Artisan', 'Engineering', 'Automotive', 'Manufacturing'],
    notes: 'TVET NCV is a strong starting point for merSETA artisan pathways.',
    popularityRank: 18,
  }),
  seta({
    id: 'mict-seta',
    name: 'MICT SETA — ICT & digital learnerships',
    shortName: 'MICT SETA',
    website: 'https://www.mict.org.za',
    summary:
      'Media, Information and Communication Technologies SETA — IT support, software development, ' +
      'telecoms, and digital media learnerships.',
    knownFor: ['IT learnerships', 'Digital skills', 'ICT support', 'Telecoms'],
    links: [
      { label: 'MICT SETA', url: 'https://www.mict.org.za', kind: 'official' },
      { label: 'Accredited providers', url: 'https://www.mict.org.za/accredited-providers/', kind: 'guide' },
    ],
    notes: 'Pair with Courses hub (Google, AWS, Microsoft) to strengthen applications.',
    popularityRank: 19,
  }),
  seta({
    id: 'mqa',
    name: 'MQA — Mining qualifications & learnerships',
    shortName: 'MQA',
    website: 'https://www.mqa.org.za',
    summary:
      'Mining Qualifications Authority — mining, minerals processing, and related artisan and ' +
      'operator learnerships with mines and contractors.',
    knownFor: ['Mining', 'Minerals', 'Artisan', 'Operator'],
    notes: 'Also check major mining houses (Anglo American, Exxaro, Glencore) careers pages.',
    popularityRank: 20,
  }),
  seta({
    id: 'pseta',
    name: 'PSETA — Public service sector learnerships',
    shortName: 'PSETA',
    website: 'https://www.pseta.org.za',
    summary:
      'Public Service Sector Education and Training Authority — national and provincial government ' +
      'administration, HR, finance, and related public-sector learnerships.',
    knownFor: ['Public service', 'Administration', 'Government'],
    notes: 'Use together with DPSA vacancy circulars for live public-service intakes.',
    popularityRank: 21,
  }),
  seta({
    id: 'sasseta',
    name: 'SASSETA — Safety & security learnerships',
    shortName: 'SASSETA',
    website: 'https://www.sasseta.org.za',
    summary:
      'Safety and Security SETA — policing support, corrections, private security, legal, and ' +
      'justice-related learnerships and skills programmes.',
    knownFor: ['Security', 'Policing support', 'Corrections', 'Legal'],
    popularityRank: 22,
  }),
  seta({
    id: 'services-seta',
    name: 'Services SETA — Learner portal',
    shortName: 'Services SETA',
    website: 'https://www.serviceseta.org.za',
    summary:
      'Services sector SETA — hospitality-adjacent services, business services, real estate, marketing, ' +
      'and related funded programmes. Register on the learner portal when available.',
    knownFor: ['Learner portal', 'Business services', 'Marketing', 'Real estate'],
    links: [
      { label: 'Services SETA', url: 'https://www.serviceseta.org.za', kind: 'official' },
      { label: 'Learners', url: 'https://servicesseta.org.za/learners/', kind: 'register' },
    ],
    notes: 'Keep your portal profile updated. Employers search for candidates when funding opens.',
    popularityRank: 23,
  }),
  seta({
    id: 'teta',
    name: 'TETA — Transport learnerships',
    shortName: 'TETA',
    website: 'https://www.teta.org.za',
    summary:
      'Transport Education and Training Authority — road freight, passenger, rail, maritime, aviation, ' +
      'and logistics learnerships.',
    knownFor: ['Transport', 'Logistics', 'Aviation', 'Maritime'],
    notes: 'Also watch Transnet and major logistics companies for related intakes.',
    popularityRank: 24,
  }),
  seta({
    id: 'wrseta',
    name: 'W&RSETA — Wholesale & retail learnerships',
    shortName: 'W&RSETA',
    website: 'https://www.wrseta.org.za',
    summary:
      'Wholesale and Retail SETA — store operations, merchandising, buying, and FMCG retail ' +
      'learnerships with major retailers and wholesalers.',
    knownFor: ['Retail', 'Wholesale', 'FMCG', 'Store operations'],
    notes: 'Also apply on Shoprite, Pick n Pay, Woolworths, and other retailer career pages.',
    popularityRank: 25,
  }),

  // ——— Selected corporates & youth programmes ———
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
    links: [{ label: 'Sasol careers', url: 'https://www.sasol.com/careers', kind: 'official' }],
    notes: 'Highly competitive. Closing dates change each intake — always verify on Sasol site.',
    popularityRank: 26,
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
    links: [{ label: 'Eskom careers', url: 'https://www.eskom.co.za/careers/', kind: 'official' }],
    notes: 'Also see Eskom vacation work in Vacation Work hub for students still studying.',
    popularityRank: 27,
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
    links: [{ label: 'Transnet careers', url: 'https://www.transnet.net/Careers', kind: 'official' }],
    notes: 'Large SOE with diverse trades. Set up job alerts on careers portal.',
    popularityRank: 28,
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
    notes: 'Different from a learnership — no NQF qualification, but real work experience. Also register on SA Youth.',
    popularityRank: 29,
  }),
]

export const LEARNERSHIPS_BY_POPULARITY = [...LEARNERSHIPS].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
