import type { ReactNode } from 'react'

/** Lightweight body renderer for newsletter plain-text format. */
export function renderNewsletterBody(body: string): ReactNode[] {
  const blocks = body.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)
  return blocks.map((block, i) => {
    const lines = block.split('\n').map((l) => l.trimEnd())
    const first = lines[0]?.trim() ?? ''

    if (first.startsWith('### ')) {
      return (
        <h4 key={i} className="nlBodyH4">
          {inlineFormat(first.slice(4))}
        </h4>
      )
    }
    if (first.startsWith('## ')) {
      return (
        <h3 key={i} className="nlBodyH3">
          {inlineFormat(first.slice(3))}
        </h3>
      )
    }
    if (first.startsWith('# ')) {
      return (
        <h2 key={i} className="nlBodyH2">
          {inlineFormat(first.slice(2))}
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
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    // Autolink bare urls
    const urlParts = part.split(/(https?:\/\/[^\s]+)/g)
    return urlParts.map((u, j) => {
      if (/^https?:\/\//.test(u)) {
        return (
          <a key={`${i}-${j}`} href={u} target="_blank" rel="noopener noreferrer">
            {u}
          </a>
        )
      }
      return <span key={`${i}-${j}`}>{u}</span>
    })
  })
}

export const NEWSLETTER_BRAND = {
  name: 'School → Industry Weekly',
  tagline: 'The free SA brief from high school to varsity, work, and industry.',
}

export const ISSUE_0_TEMPLATE = {
  title: 'Welcome: School → Industry starts here',
  kicker: 'Issue 0 · Getting started',
  summary:
    'Why SA students miss opportunities, how this weekly brief works, and five pathways after matric.',
  body: `# Welcome to School → Industry Weekly

South Africa has many opportunities — bursaries, learnerships, vacation work, graduate programmes, TVET routes, and short courses. The hard part is often **knowing what exists** and **what to do next**.

This free brief is Apply Once’s map: industry stories, what jobs actually need, what to study, and where to apply — every week.

## Five pathways after matric

- **University** — degrees + points (APS / APS equivalents)
- **TVET / college** — diplomas, NCV, artisan pathways
- **Learnerships** — earn + learn with SETAs and employers
- **Work first** — internships, vacation work, YES, entry jobs
- **Skills bootcamps** — short courses (Google, AWS, coding) while you apply

## This week’s action

1. Open **Programmes for work** on Apply Once and set your stage (matric, finished matric, university…).
2. Bookmark **SA Youth** and one job board from the job-search links panel.
3. Reply to this brief (or message us) with the industry you want next week — banking, nursing, mining, digital, teaching, and more.

## Opportunities to explore

- Programmes for work: https://applyonce.org/programmes-for-work
- Learnerships hubs & SETAs: https://applyonce.org/hubs/learnerships
- Varsity calculator: https://applyonce.org/varsity-calculator

## What industries want (quick truth)

Employers look for proof you can learn, show up, and communicate. Matric subjects matter for some careers — but **profiles, CVs, short courses, and applying on time** matter for almost all of them.

---

You’re in. Next week we go deep on one industry. Share this brief with a friend in Grade 11–12.

**— Apply Once**
`,
}
