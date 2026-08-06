/** Careers / industries for the magazine left rail and industry articles. */
export const NEWSLETTER_INDUSTRIES = [
  { id: 'mining', label: 'Mining' },
  { id: 'banking', label: 'Banking' },
  { id: 'finance', label: 'Finance' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'technology', label: 'Technology' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'energy', label: 'Energy' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'law', label: 'Law' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'media', label: 'Media & creative' },
  { id: 'public-service', label: 'Public service' },
] as const

export type NewsletterIndustryId = (typeof NEWSLETTER_INDUSTRIES)[number]['id']

export function industryLabel(id: string): string {
  const found = NEWSLETTER_INDUSTRIES.find((i) => i.id === id)
  return found?.label ?? id
}
