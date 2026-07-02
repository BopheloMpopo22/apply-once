import type { ListingApplicationStatus } from '../../types/careerHub'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Open / expired from ISO dates when available, else free-text heuristics. */
export function deriveListingStatus(
  opens: string,
  closes: string,
  dates?: { opensOn?: string | null; closesOn?: string | null },
): ListingApplicationStatus {
  const combined = `${opens} ${closes}`.toLowerCase()
  if (
    combined.includes('rolling') ||
    combined.includes('year-round') ||
    combined.includes('ongoing') ||
    combined.includes('n/a — ongoing') ||
    combined.includes('information resource')
  ) {
    return 'rolling'
  }
  if (closes.toLowerCase().includes('n/a') && !dates?.closesOn) return 'rolling'

  const now = todayIso()
  if (dates?.closesOn) {
    if (dates.closesOn < now) return 'expired'
    if (dates.opensOn && dates.opensOn > now) return 'open'
    return 'open'
  }

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
