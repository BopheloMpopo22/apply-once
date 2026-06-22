import type { CourseEntry, HubListingEntry, HubResourceLink } from './hubs'

export type CareerStage =
  | 'in_matric'
  | 'finished_matric'
  | 'in_university'
  | 'finished_university'

export type CareerListingType = 'graduate' | 'internship' | 'vacation'

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
  status: ListingApplicationStatus
  duration: string
  compensation: string
  links: HubResourceLink[]
  notes: string
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

export type CareerHubData = {
  listings: CareerListing[]
  courses: CourseEntry[]
  agencies: CareerAgency[]
}

export type GraduateProgrammeSource = Omit<
  HubListingEntry,
  'category' | 'categoryLabel'
> & {
  type?: CareerListingType
  province?: string
  organisation?: string
}
