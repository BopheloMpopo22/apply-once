import { COURSES } from '../hubs/coursesData'
import { LEARNERSHIPS } from '../hubs/learnershipsData'
import { VACATION_WORK } from '../hubs/vacationWorkData'
import type { CareerListing, CareerListingType, GraduateProgrammeSource } from '../../types/careerHub'
import type { HubListingEntry } from '../../types/hubs'
import { deriveListingStatus } from '../../utils/careerHub/listingStatus'
import { CAREER_AGENCIES } from './agenciesData'
import { GRADUATE_PROGRAMME_SOURCES } from './graduateProgrammesData'

function inferVacationType(entry: HubListingEntry): CareerListingType {
  const text = `${entry.id} ${entry.name} ${entry.summary}`.toLowerCase()
  if (text.includes('vacation work') || text.includes('vacation programme')) return 'vacation'
  if (text.includes('vacation')) return 'vacation'
  return 'internship'
}

function fromHubListing(entry: HubListingEntry, type: CareerListingType): CareerListing {
  return {
    id: entry.id,
    type,
    name: entry.name,
    shortName: entry.shortName,
    organisation: entry.shortName,
    location: entry.location,
    province: entry.location.includes('National') ? 'National' : entry.location.split(',')[0]?.trim() || 'National',
    website: entry.website,
    summary: entry.summary,
    knownFor: entry.knownFor,
    whoCanApply: entry.whoCanApply,
    applicationOpens: entry.applicationOpens,
    applicationCloses: entry.applicationCloses,
    status: deriveListingStatus(entry.applicationOpens, entry.applicationCloses),
    duration: entry.duration,
    compensation: entry.compensation,
    links: entry.links,
    notes: entry.notes,
  }
}

function fromGraduateSource(entry: GraduateProgrammeSource): CareerListing {
  return {
    id: entry.id,
    type: entry.type ?? 'graduate',
    name: entry.name,
    shortName: entry.shortName,
    organisation: entry.organisation ?? entry.shortName,
    location: entry.location,
    province: entry.province ?? 'National',
    website: entry.website,
    summary: entry.summary,
    knownFor: entry.knownFor,
    whoCanApply: entry.whoCanApply,
    applicationOpens: entry.applicationOpens,
    applicationCloses: entry.applicationCloses,
    status: deriveListingStatus(entry.applicationOpens, entry.applicationCloses),
    duration: entry.duration,
    compensation: entry.compensation,
    links: entry.links,
    notes: entry.notes,
  }
}

const vacationListings = VACATION_WORK.map((e) => fromHubListing(e, inferVacationType(e)))
const graduateListings = GRADUATE_PROGRAMME_SOURCES.map(fromGraduateSource)
const learnershipListings = LEARNERSHIPS.map((e) => fromHubListing(e, 'learnership'))

export const CAREER_LISTINGS: CareerListing[] = [
  ...graduateListings,
  ...vacationListings,
  ...learnershipListings,
].sort((a, b) => {
  const order = { open: 0, rolling: 1, expired: 2 }
  const statusDiff = order[a.status] - order[b.status]
  if (statusDiff !== 0) return statusDiff
  return a.name.localeCompare(b.name)
})

export const CAREER_LISTING_TYPE_LABELS: Record<CareerListingType, string> = {
  graduate: 'Graduate programmes',
  internship: 'Internships',
  vacation: 'Vacation work',
  learnership: 'Learnerships',
}

export function getCareerHubData() {
  return {
    listings: CAREER_LISTINGS,
    courses: COURSES,
    agencies: CAREER_AGENCIES,
  }
}

export function filterListings(
  listings: CareerListing[],
  type: CareerListingType | 'all',
  query: string,
): CareerListing[] {
  const q = query.trim().toLowerCase()
  return listings.filter((item) => {
    if (type !== 'all' && item.type !== type) return false
    if (!q) return true
    const hay = [item.name, item.organisation, item.summary, item.location, item.province, ...item.knownFor]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
}
