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
