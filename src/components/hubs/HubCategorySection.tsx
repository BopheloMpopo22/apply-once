import type { CSSProperties, ReactNode } from 'react'

const CATEGORY_ICONS: Record<string, ReactNode> = {
  'private-general': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M4 20V10l8-6 8 6v10H4zm2-2h4v-6H6v6zm6 0h4v-4h-4v4zm0-6h4v-4h-4v4z" fill="currentColor" />
    </svg>
  ),
  'tvet-public': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 7.5L12 15l7-4.5v7L12 22l-7-4.5v-7z" fill="currentColor" />
    </svg>
  ),
  'nursing-health': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-1 11h-4v4h-2v-4H8v-2h4V8h2v4h4v2z" fill="currentColor" />
    </svg>
  ),
  'hospitality-culinary': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M8 2v8a4 4 0 008 0V2H8zm-4 9v2h1v9h2v-9h2v9h2v-9h2v9h2v-9h1v-2H4z" fill="currentColor" />
    </svg>
  ),
  'artisan-trades': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M22.7 19.3l-5.4-5.4 1.4-1.4-2.1-2.1-1.4 1.4-1.8-1.8 1.4-1.4-2.1-2.1-1.4 1.4-5.4-5.4-2.8 2.8 5.4 5.4-1.4 1.4 2.1 2.1 1.4-1.4 1.8 1.8-1.4 1.4 2.1 2.1 1.4-1.4 5.4 5.4 2.8-2.8z" fill="currentColor" />
    </svg>
  ),
  'creative-media': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 2a8 8 0 018 8 7.9 7.9 0 01-1.3 4.4L7.6 7.3A7.9 7.9 0 0112 4zm-6.7 2.3l11.1 11.1A8 8 0 005.3 6.3z" fill="currentColor" />
    </svg>
  ),
  'coding-ai': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor" />
    </svg>
  ),
  'cloud-tech': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13a4.98 4.98 0 000-9.96 5 5 0 00-.65-.96z" fill="currentColor" />
    </svg>
  ),
  'free-online': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z" fill="currentColor" />
    </svg>
  ),
  'business-digital': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
    </svg>
  ),
  'bootcamp-sa': (
    <svg viewBox="0 0 24 24" aria-hidden className="hubCategoryIconSvg">
      <path d="M20 6h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zM10 4h4v2h-4V4z" fill="currentColor" />
    </svg>
  ),
}

const CATEGORY_ACCENTS: Record<string, string> = {
  'private-general': '#2563eb',
  'tvet-public': '#059669',
  'nursing-health': '#dc2626',
  'hospitality-culinary': '#d97706',
  'artisan-trades': '#7c3aed',
  'creative-media': '#db2777',
  'coding-ai': '#2563eb',
  'cloud-tech': '#0891b2',
  'free-online': '#059669',
  'business-digital': '#ea580c',
  'bootcamp-sa': '#4f46e5',
}

export function HubCategorySection(props: {
  categoryId: string
  title: string
  description?: string
  count: number
  children: ReactNode
}) {
  const accent = CATEGORY_ACCENTS[props.categoryId] ?? '#2563eb'
  const icon = CATEGORY_ICONS[props.categoryId]

  return (
    <section className="hubCategorySection" style={{ '--hub-cat-accent': accent } as CSSProperties}>
      <header className="hubCategoryHeader">
        {icon ? (
          <span className="hubCategoryIcon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="hubCategoryHeaderText">
          <h3 className="hubCategoryTitle">{props.title}</h3>
          {props.description ? <p className="hubCategoryDesc">{props.description}</p> : null}
        </div>
        <span className="hubCategoryCount">
          {props.count} {props.count === 1 ? 'entry' : 'entries'}
        </span>
      </header>
      {props.children}
    </section>
  )
}

export function groupByCategory<T extends { category: string; categoryLabel: string }>(
  entries: T[],
  categoryOrder?: string[],
): { category: string; label: string; items: T[] }[] {
  const map = new Map<string, { label: string; items: T[] }>()
  for (const e of entries) {
    const existing = map.get(e.category)
    if (existing) existing.items.push(e)
    else map.set(e.category, { label: e.categoryLabel, items: [e] })
  }
  const order = categoryOrder ?? Array.from(map.keys())
  return order
    .filter((k) => map.has(k))
    .map((k) => {
      const v = map.get(k)!
      return { category: k, label: v.label, items: v.items }
    })
}
