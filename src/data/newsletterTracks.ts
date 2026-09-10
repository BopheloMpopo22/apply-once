/** Mini-newsletter tracks inside School → Industry Weekly. */
export const NEWSLETTER_TRACKS = [
  {
    id: 'courses',
    label: 'Courses',
    shortLabel: 'Courses',
    blurb: 'Free and paid courses you can do online — skills that are not only varsity or college.',
  },
  {
    id: 'certifications',
    label: 'Certifications',
    shortLabel: 'Certifications',
    blurb: 'Industry certificates worth chasing — what they open, and how people get them.',
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    shortLabel: 'Opportunities',
    blurb: 'Competitions, auditions, fairs, open internships, and events in SA and abroad for Africans.',
  },
  {
    id: 'studying-abroad',
    label: 'Studying abroad',
    shortLabel: 'Study abroad',
    blurb: 'Guides, agencies, essays, and real pathways — what to know before you apply overseas.',
  },
] as const

export type NewsletterTrackId = (typeof NEWSLETTER_TRACKS)[number]['id']

export type NewsletterArticleType = 'main' | 'industry' | NewsletterTrackId

const TRACK_ID_SET = new Set<string>(NEWSLETTER_TRACKS.map((t) => t.id))

export function isNewsletterTrack(type: string): type is NewsletterTrackId {
  return TRACK_ID_SET.has(type)
}

export function trackMeta(id: string) {
  return NEWSLETTER_TRACKS.find((t) => t.id === id) ?? null
}

export function trackLabel(id: string): string {
  return trackMeta(id)?.label ?? id
}

export function normalizeNewsletterArticleType(raw: unknown): NewsletterArticleType {
  const v = String(raw || 'main').trim().toLowerCase()
  if (v === 'industry') return 'industry'
  if (isNewsletterTrack(v)) return v
  return 'main'
}
