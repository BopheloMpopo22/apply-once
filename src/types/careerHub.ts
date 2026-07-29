import type { CourseEntry, HubListingEntry, HubResourceLink } from './hubs'

export type CareerStage =
  | 'in_matric'
  | 'finished_matric'
  | 'in_university'
  | 'finished_university'

export type CareerListingType = 'graduate' | 'internship' | 'vacation' | 'learnership'

export type ListingApplicationStatus = 'open' | 'expired' | 'rolling'

export type CareerProfile = {
  stage: CareerStage
  province: string
  locationDetail: string
  interests: string
  fieldOfStudy: string
  stillInHighSchool: boolean
  jobInterests: string
  displayName: string
  completedAt: string
}

export type CareerListing = {
  id: string
  type: CareerListingType
  name: string
  shortName: string
  organisation: string
  location: string
  province: string
  website: string
  summary: string
  knownFor: string[]
  whoCanApply: string[]
  applicationOpens: string
  applicationCloses: string
  /** Parsed or curated ISO date (YYYY-MM-DD) for sorting. */
  opensOn: string | null
  closesOn: string | null
  status: ListingApplicationStatus
  duration: string
  compensation: string
  links: HubResourceLink[]
  notes: string
  eligibleStages: CareerStage[]
  popularityRank: number
}

export type CareerAgency = {
  id: string
  name: string
  shortName: string
  scope: 'south-africa' | 'abroad' | 'both'
  website: string
  summary: string
  knownFor: string[]
  whoItsFor: string[]
  links: HubResourceLink[]
  notes: string
}

export type JobSearchLinkCategory =
  | 'south-africa'
  | 'remote'
  | 'overseas'
  | 'government-youth'

export type JobSearchLink = {
  id: string
  name: string
  shortName: string
  category: JobSearchLinkCategory
  website: string
  blurb: string
}

export type CareerHubData = {
  listings: CareerListing[]
  courses: CourseEntry[]
  agencies: CareerAgency[]
  jobSearchLinks: JobSearchLink[]
}

export type GraduateProgrammeSource = Omit<
  HubListingEntry,
  'category' | 'categoryLabel'
> & {
  type?: CareerListingType
  province?: string
  organisation?: string
  opensOn?: string
  closesOn?: string
  eligibleStages?: CareerStage[]
}
