import type { CareerListing, CareerProfile } from '../../types/careerHub'
import { isListingEligibleForStage } from './listingEligibility'

const STATUS_ORDER = { open: 0, rolling: 1, expired: 2 } as const

function opensTimestamp(listing: CareerListing): number {
  if (!listing.opensOn) return 0
  const t = Date.parse(listing.opensOn)
  return Number.isNaN(t) ? 0 : t
}

function closesTimestamp(listing: CareerListing): number {
  if (!listing.closesOn) return Number.MAX_SAFE_INTEGER
  const t = Date.parse(listing.closesOn)
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t
}

export function compareListings(a: CareerListing, b: CareerListing): number {
  const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  if (statusDiff !== 0) return statusDiff

  const openDiff = opensTimestamp(b) - opensTimestamp(a)
  if (openDiff !== 0) return openDiff

  const closeDiff = closesTimestamp(a) - closesTimestamp(b)
  if (closeDiff !== 0) return closeDiff

  const rankDiff = (a.popularityRank ?? 999) - (b.popularityRank ?? 999)
  if (rankDiff !== 0) return rankDiff

  return a.name.localeCompare(b.name)
}

export function sortListings(listings: CareerListing[]): CareerListing[] {
  return [...listings].sort(compareListings)
}

export function sortListingsForProfile(
  listings: CareerListing[],
  profile: CareerProfile,
  options?: { includeIneligible?: boolean },
): CareerListing[] {
  const includeIneligible = options?.includeIneligible ?? false
  const eligible: CareerListing[] = []
  const ineligible: CareerListing[] = []

  for (const listing of listings) {
    if (isListingEligibleForStage(listing, profile.stage)) eligible.push(listing)
    else if (includeIneligible) ineligible.push(listing)
  }

  return [...sortListings(eligible), ...sortListings(ineligible)]
}
