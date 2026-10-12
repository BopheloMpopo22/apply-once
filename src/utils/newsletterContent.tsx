import type { ReactNode } from 'react'
import { NEWSLETTER_INDUSTRIES } from '../data/newsletterIndustries'

function headingIndustryId(headingText: string): string | undefined {
  const normalized = headingText.trim().toLowerCase()
  const hit = NEWSLETTER_INDUSTRIES.find(
    (ind) => ind.label.toLowerCase() === normalized || ind.id === normalized,
  )
  return hit ? `industry-${hit.id}` : undefined
}

const IMAGE_MARKDOWN = /^!\[([^\]]*)\]\(([^)]+)\)$/

/** Lightweight body renderer for newsletter plain-text format. */
export function renderNewsletterBody(body: string): ReactNode[] {
  const blocks = body.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)
  return blocks.map((block, i) => {
    const lines = block.split('\n').map((l) => l.trimEnd())
    const first = lines[0]?.trim() ?? ''
    const imageMatch = first.match(IMAGE_MARKDOWN)
    if (imageMatch && lines.filter((l) => l.trim()).length === 1) {
      const alt = imageMatch[1].trim()
      const src = imageMatch[2].trim()
      return (
        <figure key={i} className="nlBodyFigure">
          <img src={src} alt={alt || 'Newsletter image'} className="nlBodyImage" loading="lazy" />
          {alt ? <figcaption className="nlBodyCaption">{alt}</figcaption> : null}
        </figure>
      )
    }

    if (first.startsWith('### ')) {
      const text = first.slice(4)
      return (
        <h4 key={i} className="nlBodyH4" id={headingIndustryId(text)}>
          {inlineFormat(text)}
        </h4>
      )
    }
    if (first.startsWith('## ')) {
      const text = first.slice(3)
      return (
        <h3 key={i} className="nlBodyH3" id={headingIndustryId(text)}>
          {inlineFormat(text)}
        </h3>
      )
    }
    if (first.startsWith('# ')) {
      const text = first.slice(2)
      return (
        <h2 key={i} className="nlBodyH2" id={headingIndustryId(text)}>
          {inlineFormat(text)}
        </h2>
      )
    }

    const isList = lines.every((l) => !l.trim() || l.trim().startsWith('- ') || l.trim().startsWith('* '))
    if (isList) {
      return (
        <ul key={i} className="nlBodyList">
          {lines
            .filter((l) => l.trim())
            .map((l, j) => (
              <li key={j}>{inlineFormat(l.trim().replace(/^[-*]\s+/, ''))}</li>
            ))}
        </ul>
      )
    }

    return (
      <p key={i} className="nlBodyP">
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 ? <br /> : null}
            {inlineFormat(line)}
          </span>
        ))}
      </p>
    )
  })
}

function inlineFormat(text: string): ReactNode {
  const withImages = text.split(/(!\[[^\]]*\]\([^)]+\))/g)
  return withImages.map((segment, si) => {
    const img = segment.match(IMAGE_MARKDOWN)
    if (img) {
      const alt = img[1].trim()
      const src = img[2].trim()
      return (
        <img
          key={`img-${si}`}
          src={src}
          alt={alt || 'Newsletter image'}
          className="nlBodyImage nlBodyImageInline"
          loading="lazy"
        />
      )
    }
    const parts = segment.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={`${si}-${i}`}>{part.slice(2, -2)}</strong>
    }
    // Autolink bare urls
    const urlParts = part.split(/(https?:\/\/[^\s]+)/g)
    return urlParts.map((u, j) => {
      if (/^https?:\/\//.test(u)) {
        return (
          <a key={`${si}-${i}-${j}`} href={u} target="_blank" rel="noopener noreferrer">
            {u}
          </a>
        )
      }
      return <span key={`${si}-${i}-${j}`}>{u}</span>
    })
  })
  })
}

export const NEWSLETTER_BRAND = {
  name: 'School → Industry Weekly',
  tagline: 'Weekly industry news for learners across South Africa and Africa — school to career.',
}

/** First readable prose paragraph from magazine body (skips headings). */
export function firstBodyParagraph(body: string): string {
  const blocks = body.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)
  for (const block of blocks) {
    const t = block.trim()
    if (!t) continue
    if (/^#{1,3}\s/.test(t)) continue
    if (t.startsWith('- ') || t.startsWith('* ')) continue
    if (t === '---') continue
    return t.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim()
  }
  return ''
}

export const ISSUE_0_TEMPLATE = {
  title: 'Welcome: School → Industry starts here',
  kicker: 'This week · Getting started',
  summary:
    'Why SA students miss opportunities, how this weekly magazine works, and five pathways after matric.',
  body: `# Welcome to School → Industry Weekly

South Africa and the rest of the continent have more pathways than most learners hear about in class — bursaries, learnerships, vacation work, graduate programmes, TVET routes, and short courses. The hard part is often **knowing what exists**, **what industries are hiring**, and **what to do next**.

This free magazine from Apply Once is your weekly map: what’s moving in business and public life, what school subjects and skills open doors, and where to apply — in South Africa and across Africa.

## Across industries this week

Banking and finance keep recruiting for client-facing and digital roles. Mining and energy still talk scarce skills — artisans, engineers, and ESG-aware operators. Technology demands people who can learn tools fast. Education and healthcare remain high-purpose careers with long training roads. Logistics, marketing, and hospitality reward reliability and communication.

## Five pathways after matric

- **University** — degrees + points (APS / APS equivalents)
- **TVET / college** — diplomas, NCV, artisan pathways
- **Learnerships** — earn + learn with SETAs and employers
- **Work first** — internships, vacation work, YES, entry jobs
- **Skills bootcamps** — short courses (Google, AWS, coding) while you apply

## This week’s action

1. Open **Programmes for work** on Apply Once and set your stage (matric, finished matric, university…).
2. Browse the industry rail on the left — pick the career you care about most.
3. Bookmark **SA Youth** and one job board from the job-search links on the programmes hub.

## Opportunities to explore

- Programmes for work: https://applyonce.org/programmes-for-work
- Learnerships hubs & SETAs: https://applyonce.org/hubs/learnerships
- Varsity calculator: https://applyonce.org/varsity-calculator

## What industries want (quick truth)

Employers look for proof you can learn, show up, and communicate. Matric subjects matter for some careers — but **profiles, CVs, short courses, and applying on time** matter for almost all of them.

You’re in. Tap an industry on the left for sector deep-dives, and share this brief with a friend in Grade 11–12.

**— Apply Once**
`,
}
