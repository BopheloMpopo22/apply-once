import { COURSES } from '../hubs/coursesData'
import { LEARNERSHIPS } from '../hubs/learnershipsData'
import { VACATION_WORK } from '../hubs/vacationWorkData'
import type { CareerListing, CareerListingType, GraduateProgrammeSource } from '../../types/careerHub'
import type { HubListingEntry } from '../../types/hubs'
import { defaultEligibleStages } from '../../utils/careerHub/listingEligibility'
import { deriveListingStatus } from '../../utils/careerHub/listingStatus'
import { parseListingDates } from '../../utils/careerHub/parseListingDates'
import { sortListings } from '../../utils/careerHub/listingSort'
import { CAREER_AGENCIES } from './agenciesData'
import { EARLY_CAREER_PORTALS } from './earlyCareerPortalsData'
import { GRADUATE_PROGRAMME_SOURCES } from './graduateProgrammesData'
import { GRADUATE_PROGRAMME_EXTRA } from './graduateProgrammesExtra'
import { JOB_SEARCH_LINKS } from './jobSearchLinksData'

type ListingSource = HubListingEntry & {
  opensOn?: string
  closesOn?: string
  eligibleStages?: GraduateProgrammeSource['eligibleStages']
}

function inferVacationType(entry: HubListingEntry): CareerListingType {
  const text = `${entry.id} ${entry.name} ${entry.summary}`.toLowerCase()
  if (text.includes('vacation work') || text.includes('vacation programme')) return 'vacation'
  if (text.includes('vacation')) return 'vacation'
  return 'internship'
}

function enrichListing(
  entry: ListingSource,
  type: CareerListingType,
  extras?: { organisation?: string; province?: string },
): CareerListing {
  const dates = parseListingDates(entry.applicationOpens, entry.applicationCloses, {
    opensOn: entry.opensOn ?? null,
    closesOn: entry.closesOn ?? null,
  })

  return {
    id: entry.id,
    type,
    name: entry.name,
    shortName: entry.shortName,
    organisation: extras?.organisation ?? entry.shortName,
    location: entry.location,
    province:
      extras?.province ??
      (entry.location.includes('National') ? 'National' : entry.location.split(',')[0]?.trim() || 'National'),
    website: entry.website,
    summary: entry.summary,
    knownFor: entry.knownFor,
    whoCanApply: entry.whoCanApply,
    applicationOpens: entry.applicationOpens,
    applicationCloses: entry.applicationCloses,
    opensOn: dates.opensOn,
    closesOn: dates.closesOn,
    status: deriveListingStatus(entry.applicationOpens, entry.applicationCloses, dates),
    duration: entry.duration,
    compensation: entry.compensation,
    links: entry.links,
    notes: entry.notes,
    eligibleStages: entry.eligibleStages ?? defaultEligibleStages(type),
    popularityRank: entry.popularityRank,
  }
}

function fromHubListing(entry: HubListingEntry, type: CareerListingType): CareerListing {
  return enrichListing(entry, type)
}

function fromGraduateSource(entry: GraduateProgrammeSource): CareerListing {
  return enrichListing(entry as ListingSource, entry.type ?? 'graduate', {
    organisation: entry.organisation ?? entry.shortName,
    province: entry.province ?? 'National',
  })
}

const vacationListings = VACATION_WORK.map((e) => fromHubListing(e, inferVacationType(e)))
const graduateListings = [...GRADUATE_PROGRAMME_SOURCES, ...GRADUATE_PROGRAMME_EXTRA].map(fromGraduateSource)
const portalListings = EARLY_CAREER_PORTALS.map(fromGraduateSource)
const learnershipListings = LEARNERSHIPS.map((e) => fromHubListing(e, 'learnership'))

export const CAREER_LISTINGS: CareerListing[] = sortListings([
  ...portalListings,
  ...graduateListings,
  ...vacationListings,
  ...learnershipListings,
])

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
    jobSearchLinks: JOB_SEARCH_LINKS,
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
