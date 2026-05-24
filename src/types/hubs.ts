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

export type UniversityAdmissionEntry = {
  id: string
  name: string
  shortName: string
  province: string
  website: string
  applyUrl: string
  logo: string
  knownFor: string[]
  applicationOpens: string
  applicationCloses: string
  applicationFee: string
  openDays: string
  notes: string
}

export type HubComingSoonSection = {
  heading: string
  items: string[]
}
