import type { CareerListing, CareerListingType, CareerProfile } from '../../types/careerHub'
import { CAREER_LISTING_SECTION_ORDER } from './listingEligibility'
import { sortListingsForProfile } from './listingSort'

export type CareerListingSection = {
  type: CareerListingType
  listings: CareerListing[]
  eligibleCount: number
  totalCount: number
}

function matchesSearch(listing: CareerListing, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = [listing.name, listing.organisation, listing.summary, listing.location, listing.province, ...listing.knownFor]
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

export function buildCareerListingSections(
  listings: CareerListing[],
  profile: CareerProfile,
  options: {
    search: string
    showAll: boolean
  },
): CareerListingSection[] {
  const searched = listings.filter((listing) => matchesSearch(listing, options.search))
  const includeIneligible = options.showAll || options.search.trim().length > 0

  return CAREER_LISTING_SECTION_ORDER.map((type) => {
    const typed = searched.filter((listing) => listing.type === type)
    const sorted = sortListingsForProfile(typed, profile, { includeIneligible })
    const eligibleCount = typed.filter((listing) => listing.eligibleStages.includes(profile.stage)).length
    return {
      type,
      listings: sorted,
      eligibleCount,
      totalCount: typed.length,
    }
  })
}
