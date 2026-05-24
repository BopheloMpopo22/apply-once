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
  website: string
  whatItOffers: string
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
