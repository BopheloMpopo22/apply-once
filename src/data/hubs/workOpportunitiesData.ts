import type { HubListingEntry } from '../../types/hubs'
import { WORK_OPPORTUNITY_CATEGORY_LABELS } from '../../types/hubs'

function entry(
  e: Omit<HubListingEntry, 'categoryLabel'> & { category: keyof typeof WORK_OPPORTUNITY_CATEGORY_LABELS },
): HubListingEntry {
  return { ...e, categoryLabel: WORK_OPPORTUNITY_CATEGORY_LABELS[e.category] }
}

export const WORK_OPPORTUNITIES: HubListingEntry[] = [
  entry({
    id: 'cultural-care',
    name: 'Cultural Care Au Pair — USA',
    shortName: 'Cultural Care',
    category: 'cultural-exchange',
    location: 'USA (from South Africa)',
    website: 'https://www.culturalcare.co.za',
    summary:
      'Au pair programme placing South Africans with US host families. Live abroad, earn a stipend, ' +
      'and gain childcare experience — typically 1–2 years with J-1 visa support.',
    knownFor: ['Au pair', 'USA', 'Cultural exchange', 'Stipend + accommodation'],
    whoCanApply: [
      'South African citizens, typically 18–26',
      'Matric plus childcare experience (babysitting, tutoring, etc.)',
      'Good English; drivers licence helpful',
      'Clear criminal record and medical check',
    ],
    applicationOpens: 'Rolling — apply year-round for upcoming intakes',
    applicationCloses: 'Varies by intake season',
    duration: '12–24 months',
    compensation: 'Weekly stipend (USD) + room & board with host family',
    links: [
      { label: 'Cultural Care SA', url: 'https://www.culturalcare.co.za', kind: 'official' },
      { label: 'Apply', url: 'https://www.culturalcare.co.za/apply', kind: 'register' },
      { label: 'Requirements', url: 'https://www.culturalcare.com/au-pair/requirements/', kind: 'guide' },
    ],
    notes:
      'Use registered agencies only. Compare with Au Pair International and other DS-2019 sponsors. ' +
      'Programme fees may apply — read contracts carefully.',
    popularityRank: 1,
  }),
  entry({
    id: 'au-pair-international',
    name: 'Au Pair International (API)',
    shortName: 'API',
    category: 'cultural-exchange',
    location: 'USA, Netherlands, and other countries',
    website: 'https://www.aupairinternational.co.za',
    summary:
      'SA-based au pair agency placing candidates in the USA, Netherlands, and other countries. ' +
      'Includes visa guidance and pre-departure support.',
    knownFor: ['Au pair', 'Netherlands', 'USA', 'Gap year abroad'],
    whoCanApply: [
      'South Africans aged 18–28 (varies by country)',
      'Matric; childcare or tutoring experience',
      'Conversational English (and basic Dutch for Netherlands)',
    ],
    applicationOpens: 'Rolling',
    applicationCloses: 'Varies by destination country',
    duration: '6–24 months depending on country',
    compensation: 'Stipend + accommodation with host family',
    links: [
      { label: 'Au Pair International SA', url: 'https://www.aupairinternational.co.za', kind: 'official' },
    ],
    notes: 'Verify agency registration. Never pay unverified agents promising guaranteed visas.',
    popularityRank: 2,
  }),
  entry({
    id: 'protea-hotels',
    name: 'Protea Hotels by Marriott — Hospitality careers',
    shortName: 'Protea Hotels',
    category: 'hospitality-tourism',
    location: 'National',
    website: 'https://www.proteahotels.com/careers',
    summary:
      'Entry-level and trainee roles in hotel operations — front office, food & beverage, housekeeping, ' +
      'and management development across Marriott properties in SA.',
    knownFor: ['Hotels', 'Hospitality training', 'National placements'],
    whoCanApply: [
      'Matric holders interested in hospitality',
      'Some roles require diploma in hospitality (see hotel school hubs)',
      'Customer service orientation',
    ],
    applicationOpens: 'Rolling — check careers portal',
    applicationCloses: 'Rolling',
    duration: 'Permanent or trainee contracts',
    compensation: 'Entry-level salary per role and property',
    links: [
      { label: 'Protea Hotels careers', url: 'https://www.proteahotels.com/careers', kind: 'official' },
      { label: 'Marriott careers SA', url: 'https://careers.marriott.com', kind: 'official' },
    ],
    notes: 'Pair with culinary/hotel management college training for faster progression. See Colleges hub.',
    popularityRank: 3,
  }),
  entry({
    id: 'sun-international',
    name: 'Sun International — Hospitality & gaming',
    shortName: 'Sun International',
    category: 'hospitality-tourism',
    location: 'National (casinos & resorts)',
    website: 'https://www.suninternational.com/careers',
    summary:
      'Careers in hotels, casinos, and resorts — frontline hospitality, food service, and operational roles ' +
      'with on-the-job training.',
    knownFor: ['Casinos', 'Resorts', 'Hospitality', 'Entry-level'],
    whoCanApply: [
      'Matric for many entry roles',
      '18+ for gaming floor roles (licensing requirements apply)',
      'Hospitality diploma advantageous for supervisory tracks',
    ],
    applicationOpens: 'Rolling',
    applicationCloses: 'Rolling',
    duration: 'Permanent employment',
    compensation: 'Role-based salary + benefits',
    links: [
      { label: 'Sun International careers', url: 'https://www.suninternational.com/careers', kind: 'official' },
    ],
    notes: 'Gaming roles require compliance checks. Great for matric holders exploring hospitality without a degree.',
    popularityRank: 4,
  }),
  entry({
    id: 'safair-cabin-crew',
    name: 'Safair / FlySafair — Aviation careers',
    shortName: 'FlySafair',
    category: 'aviation',
    location: 'National (Johannesburg, Cape Town hubs)',
    website: 'https://www.flysafair.co.za/careers',
    summary:
      'Low-cost carrier hiring cabin crew, ground staff, and operational roles. ' +
      'Cabin crew intakes advertised when recruitment opens.',
    knownFor: ['Cabin crew', 'Ground operations', 'Aviation entry'],
    whoCanApply: [
      'Cabin crew: matric, 18+, minimum height, swim proficient, English fluency',
      'No degree required for cabin crew',
      'Medical and security clearance',
    ],
    applicationOpens: 'When recruitment campaigns open — monitor careers page',
    applicationCloses: 'Campaign-specific',
    duration: 'Permanent or fixed-term contracts',
    compensation: 'Airline salary scales + flight benefits',
    links: [
      { label: 'FlySafair careers', url: 'https://www.flysafair.co.za/careers', kind: 'official' },
    ],
    notes: 'Also watch Airlink, CemAir, and international airlines with SA bases. Cabin crew schools offer prep courses.',
    popularityRank: 5,
  }),
  entry({
    id: 'sacaa-info',
    name: 'SACAA — Pilot & aviation training info',
    shortName: 'SACAA',
    category: 'aviation',
    location: 'National',
    website: 'https://www.caa.co.za',
    summary:
      'South African Civil Aviation Authority — official information on licensed flight schools, ' +
      'pilot training requirements, and aviation careers in SA.',
    knownFor: ['Pilot licensing', 'Flight schools', 'Aviation regulations'],
    whoCanApply: [
      'Aspiring pilots — PPL/CPL through approved ATOs (Aviation Training Organisations)',
      'Matric with maths and science strongly recommended',
      'Medical Class 1 or 2 certificate required',
    ],
    applicationOpens: 'N/A — information resource',
    applicationCloses: 'N/A',
    duration: 'PPL ~6–12 months; CPL additional 12–18 months',
    compensation: 'Training is paid by student — pilot roles earn after licensing',
    links: [
      { label: 'SACAA official site', url: 'https://www.caa.co.za', kind: 'official' },
      { label: 'Approved training organisations', url: 'https://www.caa.co.za/industry-information/aviation-training-organisations/', kind: 'guide' },
    ],
    notes:
      'Pilot training is expensive (R500k+ for CPL). Consider airline-sponsored programmes when advertised. ' +
      'Not the same as cabin crew — requires flight school.',
    popularityRank: 6,
  }),
  entry({
    id: 'shoprite-careers',
    name: 'Shoprite Group — Retail careers',
    shortName: 'Shoprite',
    category: 'retail-service',
    location: 'National',
    website: 'https://www.shopriteholdings.co.za/careers.html',
    summary:
      'Africa\'s largest retailer — store assistant, cashier, bakery, and management trainee roles. ' +
      'Entry path for matric holders without tertiary education.',
    knownFor: ['Retail', 'Store operations', 'Trainee management', 'National'],
    whoCanApply: [
      'Matric for store-level roles',
      'Graduate programmes for degree holders',
      'Willingness to work shifts including weekends',
    ],
    applicationOpens: 'Rolling',
    applicationCloses: 'Rolling',
    duration: 'Permanent employment',
    compensation: 'Retail wage scales; learnerships may include stipend',
    links: [
      { label: 'Shoprite careers', url: 'https://www.shopriteholdings.co.za/careers.html', kind: 'official' },
      { label: 'Checkers careers', url: 'https://www.checkers.co.za/careers', kind: 'official' },
    ],
    notes: 'Also see Pick n Pay, Woolworths, and Spar careers pages. Retail learnerships listed on SETA portals.',
    popularityRank: 7,
  }),
  entry({
    id: 'picknpay-careers',
    name: 'Pick n Pay — Retail & supply chain',
    shortName: 'PnP',
    category: 'retail-service',
    location: 'National',
    website: 'https://www.pnp.co.za/careers',
    summary:
      'In-store, distribution centre, and graduate roles. Management development for high performers.',
    knownFor: ['Retail', 'Supply chain', 'Graduate programme'],
    whoCanApply: [
      'Matric for operational roles',
      'Degree for graduate and management tracks',
    ],
    applicationOpens: 'Rolling',
    applicationCloses: 'Rolling',
    duration: 'Permanent',
    compensation: 'Role-based',
    links: [
      { label: 'Pick n Pay careers', url: 'https://www.pnp.co.za/careers', kind: 'official' },
    ],
    notes: 'Distribution and logistics roles suit matric holders wanting warehouse/supply chain experience.',
    popularityRank: 8,
  }),
  entry({
    id: 'cruise-ship',
    name: 'Cruise ship hospitality jobs',
    shortName: 'Cruise ships',
    category: 'gap-year',
    location: 'International (from SA)',
    website: 'https://www.cruisejobfinder.com',
    summary:
      'Hospitality, kitchen, and service roles on international cruise lines. ' +
      'Matric + hospitality experience often sufficient for entry positions.',
    knownFor: ['Hospitality abroad', 'Travel', 'Tax-free income', 'Seasonal contracts'],
    whoCanApply: [
      '18+ with hospitality or culinary training/experience',
      'Valid passport and medical clearance',
      'English fluency; additional languages a plus',
    ],
    applicationOpens: 'Rolling via agencies and cruise line career portals',
    applicationCloses: 'Varies',
    duration: '4–10 month contracts typical',
    compensation: 'USD salary + accommodation on board',
    links: [
      { label: 'Cruise Job Finder (guide)', url: 'https://www.cruisejobfinder.com', kind: 'guide' },
      { label: 'Royal Caribbean careers', url: 'https://www.rclcareers.com', kind: 'official' },
      { label: 'Carnival careers', url: 'https://www.carnivalcareers.com', kind: 'official' },
    ],
    notes:
      'Apply through reputable manning agencies. STCW basic safety training often required. ' +
      'Build hospitality skills locally first (see Colleges hub).',
    popularityRank: 9,
  }),
  entry({
    id: 'tefl-abroad',
    name: 'Teaching English abroad (TEFL)',
    shortName: 'TEFL',
    category: 'gap-year',
    location: 'Asia, Middle East, Europe (from SA)',
    website: 'https://www.tefl.org',
    summary:
      'Teach English as a foreign language abroad. TEFL certificate (120+ hours) + degree often required; ' +
      'some countries accept matric holders with TEFL only.',
    knownFor: ['Teaching abroad', 'Gap year', 'TEFL certificate', 'Travel'],
    whoCanApply: [
      'Native/near-native English speakers',
      'Degree often required (China, UAE, etc.); some countries more flexible',
      '120-hour TEFL certificate minimum',
    ],
    applicationOpens: 'Rolling — recruit year-round',
    applicationCloses: 'Varies by country/school',
    duration: '6–12 month contracts typical',
    compensation: 'Varies — UAE/Asia can be tax-free with accommodation',
    links: [
      { label: 'TEFL.org courses', url: 'https://www.tefl.org', kind: 'official' },
      { label: 'Dave\'s ESL Cafe (job board)', url: 'https://www.eslcafe.com', kind: 'guide' },
    ],
    notes:
      'Research visa requirements per country. Pair with IELTS hub if targeting countries requiring proof of English proficiency.',
    popularityRank: 10,
  }),
  entry({
    id: 'nyda-yes',
    name: 'NYDA — National Youth Development Agency',
    shortName: 'NYDA',
    category: 'trades-entry',
    location: 'National',
    website: 'https://www.nyda.gov.za',
    summary:
      'Government youth agency — grants, mentorship, and links to YES programme placements ' +
      'for unemployed youth aged 18–35.',
    knownFor: ['Youth grants', 'YES programme', 'Business support', 'Career guidance'],
    whoCanApply: [
      'South African citizens aged 14–35',
      'Unemployed youth for work placement programmes',
      'Young entrepreneurs for grant programmes (criteria apply)',
    ],
    applicationOpens: 'Varies by programme',
    applicationCloses: 'Programme-specific',
    duration: 'Varies',
    compensation: 'YES placements include stipend; grants for approved businesses',
    links: [
      { label: 'NYDA official', url: 'https://www.nyda.gov.za', kind: 'official' },
      { label: 'YES programme', url: 'https://www.yes4youth.co.za', kind: 'register' },
    ],
    notes: 'YES partners with corporates for 12-month paid work experience. Also see Learnerships hub for SETA routes.',
    popularityRank: 11,
  }),
  entry({
    id: 'merSETA-artisan',
    name: 'merSETA — Artisan & engineering apprenticeships',
    shortName: 'merSETA',
    category: 'trades-entry',
    location: 'National',
    website: 'https://www.merseta.org.za',
    summary:
      'Manufacturing, engineering, and related SETA — funds apprenticeships and learnerships for fitters, ' +
      'millwrights, electricians, and other trades.',
    knownFor: ['Artisan trades', 'Apprenticeships', 'Engineering', 'NQF qualifications'],
    whoCanApply: [
      'Matric with maths and science for many trades',
      'NCV/NATED holders from TVET colleges',
      'Employed or unemployed via accredited providers',
    ],
    applicationOpens: 'Via employers and training providers year-round',
    applicationCloses: 'Provider-specific',
    duration: '2–4 years for apprenticeships',
    compensation: 'Employer-paid stipend or salary during apprenticeship',
    links: [
      { label: 'merSETA', url: 'https://www.merseta.org.za', kind: 'official' },
      { label: 'Career guidance', url: 'https://www.merseta.org.za/career-guidance/', kind: 'guide' },
    ],
    notes: 'Route to red-seal artisan qualification. See Colleges hub for TVET starting points.',
    popularityRank: 12,
  }),
  entry({
    id: 'bpo-call-centre',
    name: 'BPO & contact centre careers',
    shortName: 'BPO',
    category: 'retail-service',
    location: 'Gauteng, Western Cape, KZN',
    website: 'https://www.bpesa.org.za',
    summary:
      'Business process outsourcing — call centre, customer support, and back-office roles. ' +
      'Common entry point for matric holders with good English.',
    knownFor: ['Call centre', 'Customer support', 'No degree needed', 'Shift work'],
    whoCanApply: [
      'Matric with strong English communication',
      'Some roles require additional languages',
      'Clear speech and basic computer literacy',
    ],
    applicationOpens: 'Rolling — high-volume hiring',
    applicationCloses: 'Rolling',
    duration: 'Permanent',
    compensation: 'Entry R5k–R12k+ depending on role and shift premiums',
    links: [
      { label: 'BPESA (industry body)', url: 'https://www.bpesa.org.za', kind: 'guide' },
    ],
    notes: 'Major employers include Telus, Webhelp, and in-house bank/corporate contact centres. Night shifts often pay more.',
    popularityRank: 13,
  }),
]

export const WORK_OPPORTUNITIES_BY_POPULARITY = [...WORK_OPPORTUNITIES].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
