import type { NewsletterArticleType } from '../../data/newsletterTracks'

export type MagArticle = {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  body?: string
  articleType: NewsletterArticleType
  industry: string
  coveredIndustries?: string[]
  issueNumber: number
  publishedAt: string | null
}

export type IssuesResponse = {
  unlocked: boolean
  brand: { name: string; tagline: string }
  issues: MagArticle[]
  subscriber: { firstName: string; lastName: string; email: string } | null
}

export function formatNewsletterDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
