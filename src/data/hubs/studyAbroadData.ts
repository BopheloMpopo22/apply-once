import type { StudyAbroadEntry } from '../../types/hubs'

const DHET_PORTAL = 'https://www.internationalscholarships.dhet.gov.za'

export const STUDY_ABROAD: StudyAbroadEntry[] = [
  {
    id: 'dhet-portal',
    name: 'DHET International Scholarships Portal',
    shortName: 'DHET',
    category: 'government-scholarship',
    destination: 'Multiple countries',
    website: DHET_PORTAL,
    whatItOffers:
      'Official Department of Higher Education and Training listing of government-to-government scholarships ' +
      'for South African citizens to study abroad — undergraduate, postgraduate, and skills programmes.',
    whoCanApply: [
      'South African citizens in good health',
      'Strong academic record (often minimum 60% average)',
      'Meet each scholarship’s field and level requirements',
    ],
    applicationOpens: 'Varies by scholarship — check portal regularly',
    applicationCloses: 'Varies — each country programme has its own deadline',
    fundingLevel: 'Usually fully funded (tuition, stipend, travel) where DHET nominates',
    links: [
      { label: 'Browse all scholarships', url: DHET_PORTAL, kind: 'official' },
      { label: 'Subscribe for updates', url: `${DHET_PORTAL}/index.php/subscribe`, kind: 'register' },
    ],
    notes:
      'Start here for China, Germany, Russia, AU, and other government scholarships. ' +
      'Always verify qualification recognition with SAQA before you apply.',
    popularityRank: 1,
  },
  {
    id: 'china-cgs',
    name: 'Chinese Government Scholarship 2026/27',
    shortName: 'China CGS',
    category: 'government-scholarship',
    destination: 'China',
    website: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/461-china-chinese-government-scholarship-2026-2027`,
    whatItOffers:
      'Undergraduate, master’s, PhD, and Chinese language studies at Chinese universities. ' +
      'DHET nominates successful candidates. Priority fields include engineering, IT, agriculture, and sciences.',
    whoCanApply: [
      'South African citizens',
      'Minimum 60% average in previous studies',
      'Available to study in China from September 2026',
      'Commitment to return to SA after studies',
    ],
    applicationOpens: 'Check DHET portal — typically opens annually',
    applicationCloses: 'Check DHET portal for 2026/27 closing date',
    fundingLevel: 'Fully funded — tuition, accommodation, stipend, travel',
    links: [
      { label: 'DHET scholarship page', url: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/461-china-chinese-government-scholarship-2026-2027`, kind: 'official' },
      { label: 'SAQA verification', url: 'https://www.saqa.org.za', kind: 'guide' },
    ],
    notes:
      'Medical check required for successful applicants. Contract to return to South Africa after completion. ' +
      'Passport needed — applicants without one may still apply in some cycles.',
    popularityRank: 2,
  },
  {
    id: 'germany-funda',
    name: 'DHET Funda Germany — Constructor University',
    shortName: 'Funda Germany',
    category: 'government-scholarship',
    destination: 'Germany',
    website: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/496-germany-dhet-funda-germany-scholarship-programme-2026-2027`,
    whatItOffers:
      'Fully funded bachelor’s, master’s, and PhD at Constructor University (English-medium, Bremen). ' +
      'Fields include engineering, AI, robotics, biotechnology, economics, and more.',
    whoCanApply: [
      'South African citizens meeting Constructor University entry requirements',
      'Bachelor’s and master’s: apply by 15 Feb 2026',
      'PhD: apply by 31 Mar 2026',
    ],
    applicationOpens: 'Open for 2026/27 cycle',
    applicationCloses: '15 Feb 2026 (Bachelor’s/Master’s) · 31 Mar 2026 (PhD)',
    fundingLevel: 'Fully funded — tuition, travel, medical insurance, annual allowance',
    links: [
      { label: 'DHET scholarship page', url: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/496-germany-dhet-funda-germany-scholarship-programme-2026-2027`, kind: 'official' },
      { label: 'Constructor University', url: 'https://www.constructor.university', kind: 'official' },
    ],
    notes:
      'Includes pre-departure orientation and psychosocial support. SAQA verification required for prior qualifications.',
    popularityRank: 3,
  },
  {
    id: 'russia-gov',
    name: 'Russian Government Scholarship 2026/27',
    shortName: 'Russia',
    category: 'government-scholarship',
    destination: 'Russia',
    website: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/488-russia-russian-governments-scholarships-for-south-africans-2026`,
    whatItOffers:
      'Bachelor’s, master’s, and PhD at Russian higher education institutions. ' +
      'DHET support for nominated students already in Russia may also apply.',
    whoCanApply: [
      'South African citizens',
      'Matric/TVET graduates (bachelor’s), or degree holders (postgraduate)',
      'Available from September 2026',
    ],
    applicationOpens: '15 Oct 2025',
    applicationCloses: '15 Jan 2026',
    fundingLevel: 'Fully funded through Russian Government + DHET nomination',
    links: [
      { label: 'DHET scholarship page', url: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/488-russia-russian-governments-scholarships-for-south-africans-2026`, kind: 'official' },
    ],
    notes:
      'Health sciences applications NOT considered for 2026. Engineering applicants must confirm professional body recognition in SA. SAQA verification required.',
    popularityRank: 4,
  },
  {
    id: 'pau',
    name: 'African Union — Pan African University',
    shortName: 'PAU',
    category: 'government-scholarship',
    destination: 'Africa (Nigeria, Cameroon, Algeria)',
    website: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/493-african-union-pan-african-university-scholarship-2025`,
    whatItOffers:
      'Competitive master’s and PhD programmes at PAU institutes — including health sciences (reproductive health), ' +
      'geosciences, water & energy, governance, and life sciences.',
    whoCanApply: [
      'African nationals including South Africans',
      'Relevant bachelor’s for master’s; master’s for PhD',
      'Strong academic record and research proposal (PhD)',
    ],
    applicationOpens: 'Check DHET and PAU announcements',
    applicationCloses: 'Varies by institute and cycle',
    fundingLevel: 'Fully funded AU scholarship (tuition, travel, stipend)',
    links: [
      { label: 'DHET listing', url: `${DHET_PORTAL}/index.php/scholarships/undergraduate-scholarships/493-african-union-pan-african-university-scholarship-2025`, kind: 'official' },
      { label: 'Pan African University', url: 'https://www.pau-africa.org', kind: 'official' },
    ],
    notes:
      'Study on the African continent — not Europe/US but fully international. Institutes in Nigeria, Cameroon, and Algeria.',
    popularityRank: 5,
  },
  {
    id: 'chevening',
    name: 'Chevening Scholarships (UK)',
    shortName: 'Chevening',
    category: 'international-scholarship',
    destination: 'United Kingdom',
    website: 'https://www.chevening.org',
    whatItOffers:
      'Fully funded one-year master’s degree at any eligible UK university. ' +
      'UK government flagship scholarship for future leaders.',
    whoCanApply: [
      'South African citizens (and other Chevening-eligible countries)',
      'Minimum 2 years work experience (2,800 hours)',
      'Undergraduate degree equivalent to UK bachelor’s',
      'Must return to SA for at least 2 years after the award',
    ],
    applicationOpens: 'Aug 2025 (2026/27 cycle)',
    applicationCloses: '7 Oct 2025 at 12:00 UTC (2026/27 cycle closed — watch for 2027/28)',
    fundingLevel: 'Fully funded — tuition, flights, stipend, visa costs',
    links: [
      { label: 'Chevening official site', url: 'https://www.chevening.org', kind: 'official' },
      { label: 'Application timeline', url: 'https://www.chevening.org/scholarships/application-timeline/', kind: 'guide' },
      { label: 'South Africa page', url: 'https://www.chevening.org/scholarship/south-africa/', kind: 'guide' },
      { label: 'Apply online', url: 'https://www.chevening.org/apply/', kind: 'register' },
    ],
    notes:
      'Need unconditional UK university offer by 9 Jul 2026 for 2026/27 cycle. MBA may need extra funding beyond scholarship cap.',
    popularityRank: 6,
  },
  {
    id: 'fulbright',
    name: 'Fulbright Foreign Student Programme',
    shortName: 'Fulbright',
    category: 'international-scholarship',
    destination: 'United States',
    website: 'https://za.usembassy.gov/fulbright-foreign-student-program/',
    whatItOffers:
      'Master’s, PhD, or visiting student research at US universities. ' +
      'Funding for up to 2 years. Comprehensive pre-departure support.',
    whoCanApply: [
      'South African university graduates',
      'Master’s: 4-year bachelor’s, B-Tech, or 3-year degree + honours',
      'PhD: master’s degree required',
      'VSR: registered PhD at SA university',
    ],
    applicationOpens: '2027–28 cycle open',
    applicationCloses: '8 Apr 2026 at midnight SAST (2027–28 cycle)',
    fundingLevel: 'Fully funded — tuition, living costs, health insurance, travel',
    links: [
      { label: 'US Embassy Fulbright page', url: 'https://za.usembassy.gov/fulbright-foreign-student-program/', kind: 'official' },
      { label: 'Apply via IIE', url: 'https://apply.iie.org/ffsp2027', kind: 'register' },
      { label: 'DHET info listing', url: `${DHET_PORTAL}/index.php/scholarships`, kind: 'guide' },
    ],
    notes:
      'Excludes MBA and clinical medical/veterinary programmes requiring patient contact. Contact fpsa@state.gov for questions.',
    popularityRank: 7,
  },
  {
    id: 'educationusa',
    name: 'EducationUSA South Africa',
    shortName: 'EducationUSA',
    category: 'advising-support',
    destination: 'United States',
    website: 'https://za.usembassy.gov/education-culture/educational-advising/',
    whatItOffers:
      'Free, unbiased advising on applying to accredited US universities — not a scholarship itself, ' +
      'but essential guidance on essays, tests, visas, and funding options.',
    whoCanApply: [
      'Any student interested in US study',
      'Attend a general information session first (mandatory for individual advising)',
      'Centres in Cape Town, Johannesburg, Durban, Pretoria',
    ],
    applicationOpens: 'Year-round advising',
    applicationCloses: 'N/A — ongoing service',
    fundingLevel: 'Free advising — university funding separate',
    links: [
      { label: 'EducationUSA SA', url: 'https://za.usembassy.gov/education-culture/educational-advising/', kind: 'official' },
      { label: '5 Steps to US Study', url: 'https://educationusa.state.gov/your-5-steps-us-study', kind: 'guide' },
      { label: 'EducationUSA global', url: 'https://educationusa.state.gov', kind: 'official' },
      { label: 'YouTube channel', url: 'https://www.youtube.com/educationusa', kind: 'prep' },
    ],
    notes:
      'Monthly virtual sessions on Facebook @EducationUSAinSA. Cape Town American Corner has reference materials. Appointments only at consulates.',
    popularityRank: 8,
  },
  {
    id: 'british-council',
    name: 'British Council — Study UK',
    shortName: 'Study UK',
    category: 'country-pathway',
    destination: 'United Kingdom',
    website: 'https://study-uk.britishcouncil.org',
    whatItOffers:
      'Official guide to UK universities, courses, visas, and scholarships. ' +
      'Also administers IELTS testing in South Africa.',
    whoCanApply: [
      'Students planning UK undergraduate or postgraduate study',
      'Scholarship seekers (Chevening, university awards, GREAT scholarships)',
    ],
    applicationOpens: 'Year-round resources',
    applicationCloses: 'N/A',
    fundingLevel: 'Information + IELTS (paid separately)',
    links: [
      { label: 'Study UK portal', url: 'https://study-uk.britishcouncil.org', kind: 'official' },
      { label: 'Scholarships & funding', url: 'https://study-uk.britishcouncil.org/scholarships', kind: 'guide' },
      { label: 'Book IELTS (SA)', url: 'https://www.britishcouncil.org.za/exam/ielts', kind: 'register' },
    ],
    notes: 'Pair with Chevening or direct university applications. Most UK courses require IELTS or equivalent.',
    popularityRank: 9,
  },
  {
    id: 'daad',
    name: 'DAAD — Study in Germany',
    shortName: 'DAAD',
    category: 'country-pathway',
    destination: 'Germany',
    website: 'https://www.daad.de/en/study-and-research-in-germany/',
    whatItOffers:
      'Scholarships, grants, and information for international students studying in Germany. ' +
      'Many programmes are tuition-free at public universities.',
    whoCanApply: [
      'Graduates and researchers',
      'Varies by programme — some require German language',
      'South Africans eligible for many DAAD funding lines',
    ],
    applicationOpens: 'Varies by programme',
    applicationCloses: 'Varies — often Oct–Dec for following year',
    fundingLevel: 'Scholarships from partial to full depending on programme',
    links: [
      { label: 'DAAD study in Germany', url: 'https://www.daad.de/en/study-and-research-in-germany/', kind: 'official' },
      { label: 'DAAD scholarship database', url: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/', kind: 'guide' },
    ],
    notes:
      'Also see DHET Funda Germany for fully funded Constructor University places. Many master’s programmes taught in English.',
    popularityRank: 10,
  },
  {
    id: 'mastercard-scholars',
    name: 'Mastercard Foundation Scholars Program',
    shortName: 'Mastercard',
    category: 'international-scholarship',
    destination: 'Africa, US, Canada (partner universities)',
    website: 'https://mastercardfdn.org/all/scholars/',
    whatItOffers:
      'Comprehensive scholarships for academically talented young Africans from disadvantaged backgrounds ' +
      'at partner universities — includes leadership development and give-back component.',
    whoCanApply: [
      'Young Africans with academic talent and financial need',
      'Apply through partner universities — not directly to Mastercard Foundation',
      'Some SA universities are partners (check current list)',
    ],
    applicationOpens: 'Varies by partner university',
    applicationCloses: 'Varies — apply to partner institution',
    fundingLevel: 'Full scholarship at partner university (tuition, accommodation, stipend)',
    links: [
      { label: 'Mastercard Foundation Scholars', url: 'https://mastercardfdn.org/all/scholars/', kind: 'official' },
      { label: 'Partner universities list', url: 'https://mastercardfdn.org/all/scholars/becoming-a-scholar/', kind: 'guide' },
    ],
    notes:
      'Check if UCT, Wits, or other SA unis participate. Also partners include Ashesi, Edinburgh, Berkeley, and African institutions.',
    popularityRank: 11,
  },
  {
    id: 'australia-awards',
    name: 'Australia Awards Africa',
    shortName: 'Australia Awards',
    category: 'international-scholarship',
    destination: 'Australia',
    website: 'https://australiaawardsafrica.org',
    whatItOffers:
      'Long-term development scholarships for Africans to study in Australia — ' +
      'master’s and short courses aligned with development priorities.',
    whoCanApply: [
      'Citizens of eligible African countries including South Africa',
      'Relevant work experience and academic qualifications',
      'Commitment to development in home country',
    ],
    applicationOpens: 'Typically opens annually — check website',
    applicationCloses: 'Usually Apr–Dec depending on intake',
    fundingLevel: 'Fully funded — tuition, travel, living allowance',
    links: [
      { label: 'Australia Awards Africa', url: 'https://australiaawardsafrica.org', kind: 'official' },
      { label: 'How to apply', url: 'https://australiaawardsafrica.org/apply/', kind: 'register' },
    ],
    notes: 'Focus on fields that support African development. English proficiency (IELTS) usually required.',
    popularityRank: 12,
  },
  {
    id: 'campus-france',
    name: 'Campus France — Study in France',
    shortName: 'Campus France',
    category: 'country-pathway',
    destination: 'France',
    website: 'https://www.campusfrance.org/en',
    whatItOffers:
      'Official portal for studying in France — university applications (Études en France), ' +
      'scholarships, visas, and student life information.',
    whoCanApply: [
      'International students including South Africans',
      'Some programmes in English; many require French B2',
    ],
    applicationOpens: 'Varies — often Oct–Jan for September intake',
    applicationCloses: 'Varies by institution',
    fundingLevel: 'Low public university fees + Eiffel and other scholarships available',
    links: [
      { label: 'Campus France', url: 'https://www.campusfrance.org/en', kind: 'official' },
      { label: 'Eiffel Excellence Scholarship', url: 'https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence', kind: 'guide' },
    ],
    notes: 'Public universities in France charge relatively low tuition. Start language prep early if studying in French.',
    popularityRank: 13,
  },
  {
    id: 'erasmus',
    name: 'Erasmus+ (EU exchange & mobility)',
    shortName: 'Erasmus+',
    category: 'country-pathway',
    destination: 'European Union',
    website: 'https://erasmus-plus.ec.europa.eu',
    whatItOffers:
      'EU programme for student exchanges, joint master’s degrees, and mobility grants. ' +
      'South Africans may access some joint programmes or partner through SA universities.',
    whoCanApply: [
      'Often via SA university partnership — ask your international office',
      'Joint master’s programmes open to international applicants directly',
    ],
    applicationOpens: 'Varies by programme',
    applicationCloses: 'Varies — joint masters often Jan–Mar',
    fundingLevel: 'Mobility grants and tuition support on eligible programmes',
    links: [
      { label: 'Erasmus+ official', url: 'https://erasmus-plus.ec.europa.eu', kind: 'official' },
      { label: 'Erasmus Mundus joint masters', url: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en', kind: 'guide' },
    ],
    notes:
      'Best route for SA students is often a joint Erasmus Mundus master’s with full scholarship, or exchange via your SA university.',
    popularityRank: 14,
  },
  {
    id: 'saqa',
    name: 'SAQA — Qualification recognition',
    shortName: 'SAQA',
    category: 'advising-support',
    destination: 'South Africa (for returning graduates)',
    website: 'https://www.saqa.org.za',
    whatItOffers:
      'Evaluation of foreign qualifications for recognition in South Africa — required for many DHET scholarships ' +
      'and professional registration when you return.',
    whoCanApply: [
      'Anyone with a qualification obtained outside South Africa',
      'DHET scholarship applicants (verification required)',
      'Graduates seeking SA professional body registration',
    ],
    applicationOpens: 'Year-round applications',
    applicationCloses: 'N/A — allow several weeks processing',
    fundingLevel: 'Paid service — fee per evaluation',
    links: [
      { label: 'SAQA official site', url: 'https://www.saqa.org.za', kind: 'official' },
      { label: 'Verify a qualification', url: 'https://www.saqa.org.za/services/evaluation-of-foreign-qualifications/', kind: 'register' },
    ],
    notes:
      'Start SAQA early if applying for government scholarships — delays can affect nomination. ' +
      'Professional bodies (HPCSA, ECSA, etc.) may have additional requirements.',
    popularityRank: 15,
  },
  {
    id: 'commonwealth',
    name: 'Commonwealth Scholarships',
    shortName: 'Commonwealth',
    category: 'international-scholarship',
    destination: 'United Kingdom',
    website: 'https://cscuk.fcdo.gov.uk',
    whatItOffers:
      'Master’s and PhD scholarships for Commonwealth citizens to study in the UK — ' +
      'focused on sustainable development themes.',
    whoCanApply: [
      'Commonwealth citizens including South Africans',
      'Master’s or PhD candidates meeting academic criteria',
      'Unable to afford UK study without scholarship',
    ],
    applicationOpens: 'Typically Sep–Oct annually',
    applicationCloses: 'Usually Dec — check CSC website',
    fundingLevel: 'Fully funded by UK FCDO',
    links: [
      { label: 'Commonwealth Scholarships', url: 'https://cscuk.fcdo.gov.uk', kind: 'official' },
      { label: 'Apply', url: 'https://cscuk.fcdo.gov.uk/apply/', kind: 'register' },
    ],
    notes: 'Separate from Chevening — different eligibility (no work experience requirement in same way). Check themes each year.',
    popularityRank: 16,
  },
]

export const STUDY_ABROAD_BY_POPULARITY = [...STUDY_ABROAD].sort(
  (a, b) => a.popularityRank - b.popularityRank,
)
