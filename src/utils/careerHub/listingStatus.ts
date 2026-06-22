import type { ListingApplicationStatus } from '../../types/careerHub'

/** Best-effort open / expired from free-text dates in our catalogue. */
export function deriveListingStatus(opens: string, closes: string): ListingApplicationStatus {
  const combined = `${opens} ${closes}`.toLowerCase()
  if (
    combined.includes('rolling') ||
    combined.includes('year-round') ||
    combined.includes('ongoing') ||
    combined.includes('n/a — ongoing')
  ) {
    return 'rolling'
  }
  if (closes.toLowerCase().includes('n/a')) return 'rolling'

  const yearMatches = combined.match(/\b20(\d{2})\b/g)
  if (yearMatches) {
    const years = yearMatches.map((y) => Number(y))
    const maxYear = Math.max(...years)
    const nowYear = new Date().getFullYear()
    if (maxYear < nowYear) return 'expired'
    if (maxYear >= nowYear) return 'open'
  }

  if (
    combined.includes('confirm') ||
    combined.includes('typical') ||
    combined.includes('varies') ||
    combined.includes('check')
  ) {
    return 'open'
  }

  return 'open'
}

export function listingStatusLabel(status: ListingApplicationStatus): string {
  if (status === 'open') return 'Open for applications'
  if (status === 'rolling') return 'Rolling applications'
  return 'Applications closed'
}
