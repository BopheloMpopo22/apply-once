/**
 * Calendar status is always calculated from dates.
 * Do not invent an opening date when the funder has not published one.
 */

export const CLOSING_SOON_DAYS = 14

export const STUDY_LEVEL_OPTIONS = ['undergraduate', 'honours', 'masters', 'phd', 'tvet']
export const COVERAGE_OPTIONS = ['full', 'partial', 'unknown']

const CLOSING_SOON_MS = CLOSING_SOON_DAYS * 24 * 60 * 60 * 1000

function asDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** @param {string} raw */
export function parseStudyLevels(raw, fallback = ['undergraduate']) {
  if (Array.isArray(raw)) {
    const list = raw.map((x) => String(x).trim().toLowerCase()).filter((x) => STUDY_LEVEL_OPTIONS.includes(x))
    return list.length ? list : fallback
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parseStudyLevels(parsed, fallback)
    } catch {
      /* comma-separated */
    }
    const list = raw
      .split(/[,]+/)
      .map((x) => x.trim().toLowerCase())
      .filter((x) => STUDY_LEVEL_OPTIONS.includes(x))
    return list.length ? list : fallback
  }
  return fallback
}

/** @param {string} raw */
export function parseCoverage(raw) {
  const v = String(raw || 'unknown').trim().toLowerCase()
  return COVERAGE_OPTIONS.includes(v) ? v : 'unknown'
}

/**
 * upcoming | open | closed
 * Opening date unpublished + closing date still ahead → open (we do not guess an open date).
 */
export function bursaryCalendarStatus(b, now = new Date()) {
  const closes = asDate(b.applicationCloses)
  const opens = asDate(b.applicationOpens)
  if (closes && now.getTime() > closes.getTime()) return 'closed'
  if (opens && now.getTime() < opens.getTime()) return 'upcoming'
  return 'open'
}

export function isClosingSoon(b, now = new Date()) {
  if (bursaryCalendarStatus(b, now) !== 'open') return false
  const closes = asDate(b.applicationCloses)
  if (!closes) return false
  const ms = closes.getTime() - now.getTime()
  return ms >= 0 && ms <= CLOSING_SOON_MS
}

/** Current intake not yet open, or a published next-cycle date after this intake closed. */
export function isUpcomingListing(b, now = new Date()) {
  if (bursaryCalendarStatus(b, now) === 'upcoming') return true
  if (bursaryCalendarStatus(b, now) !== 'closed') return false
  const next = asDate(b.nextExpectedOpens)
  return Boolean(next && now.getTime() < next.getTime())
}

export function toPublicTrackItem(adminItem) {
  return {
    slug: adminItem.slug,
    name: adminItem.name,
    provider: adminItem.provider,
    type: adminItem.type,
    studyFields: adminItem.studyFields,
    studyLevels: adminItem.studyLevels,
    coverage: adminItem.coverage,
    region: adminItem.region,
    eligibility: adminItem.eligibility,
    requiredDocs: adminItem.requiredDocs,
    notes: adminItem.notes,
    applicationOpens: adminItem.applicationOpens,
    applicationCloses: adminItem.applicationCloses,
    nextExpectedOpens: adminItem.nextExpectedOpens,
    opensPublished: Boolean(adminItem.applicationOpens),
    calendarStatus: adminItem.calendarStatus,
    closingSoon: adminItem.closingSoon,
    upcoming: adminItem.upcoming,
    isOpen: adminItem.isOpen,
    applyUrl: adminItem.applyUrl,
    lastVerifiedAt: adminItem.lastVerifiedAt,
    lastCheckedAt: adminItem.lastCheckedAt,
    dateConfidence: adminItem.dateConfidence || 'unknown',
  }
}
