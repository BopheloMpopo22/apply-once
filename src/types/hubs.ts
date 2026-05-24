export type HubSlug =
  | 'universities'
  | 'colleges'
  | 'admissions-tests'
  | 'study-abroad'
  | 'courses'
  | 'work-opportunities'
  | 'bridging'
  | 'learnerships'
  | 'vacation-work'

export type HubMeta = {
  slug: HubSlug
  title: string
  shortTitle: string
  description: string
  intro: string
  /** Shown on hub pages — dates and fees change yearly. */
  disclaimer: string
  image: string
  imageAlt: string
  accent: 'blue' | 'green'
  status: 'live' | 'coming-soon'
}

export type UniversityType = 'traditional' | 'university-of-technology' | 'comprehensive'

export type UniversityAdmissionEntry = {
  id: string
  name: string
  shortName: string
  province: string
  website: string
  logo?: string
  universityType: UniversityType
  knownFor: string[]
  /** Academic year you would start after this application cycle. */
  intakeYear: number
  applicationOpens: string
  applicationCloses: string
  /** Faculty- or programme-specific earlier deadlines. */
  programmeDeadlines?: string
  applicationFee: string
  openDays: string
  notes: string
}

export type ProgrammeHighlight = {
  name: string
  description: string
}

export type HubComingSoonSection = {
  heading: string
  items: string[]
}

export type HubResourceLink = {
  label: string
  url: string
  kind?: 'official' | 'register' | 'prep' | 'past-paper' | 'centres' | 'guide'
}

export type TestCentreByProvince = {
  province: string
  centres: string
}

export type CollegeCategory =
  | 'private-general'
  | 'tvet-public'
  | 'nursing-health'
  | 'hospitality-culinary'
  | 'artisan-trades'
  | 'creative-media'

export type CollegeEntry = {
  id: string
  name: string
  shortName: string
  category: CollegeCategory
  province: string
  website: string
  institutionType: 'Private' | 'Public TVET'
  knownFor: string[]
  applicationOpens: string
  applicationCloses: string
  applicationFee: string
  notes: string
  popularityRank: number
}

export type AdmissionsTestEntry = {
  id: string
  name: string
  shortName: string
  region: 'south-africa' | 'international'
  website: string
  whatItIs: string
  neededFor: string[]
  registrationOpens: string
  keyDeadlines: string
  fee: string
  testSchedule: string
  testCentres: TestCentreByProvince[]
  centresLink?: HubResourceLink
  prepResources: HubResourceLink[]
  notes: string
  popularityRank: number
}

export const COLLEGE_CATEGORY_LABELS: Record<CollegeCategory, string> = {
  'private-general': 'Private colleges & higher education',
  'tvet-public': 'Public TVET colleges',
  'nursing-health': 'Nursing & health sciences',
  'hospitality-culinary': 'Hospitality & culinary',
  'artisan-trades': 'Artisan & trades training',
  'creative-media': 'Creative arts & media',
}

export type StudyAbroadCategory =
  | 'government-scholarship'
  | 'international-scholarship'
  | 'advising-support'
  | 'country-pathway'

export type StudyAbroadEntry = {
  id: string
  name: string
  shortName: string
  category: StudyAbroadCategory
  destination: string
  destinationFlag?: string
  website: string
  whatItOffers: string
  /** Plain-language: what the scholarship pays for and what you commit to. */
  scholarshipPurpose?: string
  coversWhat?: string[]
  whoCanApply: string[]
  applicationOpens: string
  applicationCloses: string
  fundingLevel: string
  links: HubResourceLink[]
  notes: string
  popularityRank: number
}

export const STUDY_ABROAD_CATEGORY_LABELS: Record<StudyAbroadCategory, string> = {
  'government-scholarship': 'SA government scholarships',
  'international-scholarship': 'International scholarships',
  'advising-support': 'Advising & application support',
  'country-pathway': 'Country study guides',
}

export type CourseCategory =
  | 'coding-ai'
  | 'cloud-tech'
  | 'free-online'
  | 'business-digital'
  | 'bootcamp-sa'

export type CourseCostType = 'free' | 'freemium' | 'paid' | 'funded'

export type CourseEntry = {
  id: string
  name: string
  shortName: string
  category: CourseCategory
  provider: string
  website: string
  whatYouLearn: string
  knownFor: string[]
  duration: string
  cost: string
  costType: CourseCostType
  certificate: string
  eligibility: string
  links: HubResourceLink[]
  notes: string
  popularityRank: number
}

export const COURSE_CATEGORY_LABELS: Record<CourseCategory, string> = {
  'coding-ai': 'Coding & AI',
  'cloud-tech': 'Cloud & IT certifications',
  'free-online': 'Free online courses',
  'business-digital': 'Business & digital skills',
  'bootcamp-sa': 'SA coding bootcamps',
}

export type WorkOpportunityCategory =
  | 'cultural-exchange'
  | 'hospitality-tourism'
  | 'aviation'
  | 'retail-service'
  | 'trades-entry'
  | 'gap-year'

export type BridgingCategory =
  | 'extended-degree'
  | 'foundation-access'
  | 'stem-bridge'
  | 'higher-certificate'

export type LearnershipCategory =
  | 'seta-portal'
  | 'corporate'
  | 'government'
  | 'sector-programme'

export type VacationWorkCategory =
  | 'professional-services'
  | 'banking-finance'
  | 'government-soe'
  | 'corporate-industrial'
  | 'research-ngo'

export type BridgingFacultyOffer = {
  faculty: string
  programmes: string[]
  routeType: string
  whoQualifies: string
}

export type BridgingEntry = {
  id: string
  name: string
  shortName: string
  category: BridgingCategory
  categoryLabel: string
  location: string
  website: string
  summary: string
  /** Faculties/programmes where bridging or extended routes exist */
  offersBridging: BridgingFacultyOffer[]
  /** Programmes that typically have NO extended route — mainstream only */
  noBridgingFor: string[]
  applicationOpens: string
  applicationCloses: string
  duration: string
  compensation: string
  links: HubResourceLink[]
  notes: string
  popularityRank: number
}

export type HubListingEntry = {
  id: string
  name: string
  shortName: string
  category: string
  categoryLabel: string
  location: string
  website: string
  summary: string
  knownFor: string[]
  whoCanApply: string[]
  applicationOpens: string
  applicationCloses: string
  duration: string
  compensation: string
  links: HubResourceLink[]
  notes: string
  popularityRank: number
}

export const WORK_OPPORTUNITY_CATEGORY_LABELS: Record<WorkOpportunityCategory, string> = {
  'cultural-exchange': 'Cultural exchange & au pair',
  'hospitality-tourism': 'Hospitality & tourism',
  aviation: 'Aviation & travel',
  'retail-service': 'Retail & customer service',
  'trades-entry': 'Trades & entry-level training',
  'gap-year': 'Gap year & working abroad',
}

export const BRIDGING_CATEGORY_LABELS: Record<BridgingCategory, string> = {
  'extended-degree': 'Extended degree programmes',
  'foundation-access': 'Foundation & access programmes',
  'stem-bridge': 'STEM bridging (SciMathUS etc.)',
  'higher-certificate': 'Higher certificates & pathways',
}

export const LEARNERSHIP_CATEGORY_LABELS: Record<LearnershipCategory, string> = {
  'seta-portal': 'SETA learner portals',
  corporate: 'Corporate learnerships',
  government: 'Government programmes',
  'sector-programme': 'Sector-specific programmes',
}

export const VACATION_WORK_CATEGORY_LABELS: Record<VacationWorkCategory, string> = {
  'professional-services': 'Professional services (Big 4)',
  'banking-finance': 'Banking & finance',
  'government-soe': 'Government & SOEs',
  'corporate-industrial': 'Corporate & industrial',
  'research-ngo': 'Research, NGO & public sector',
}
