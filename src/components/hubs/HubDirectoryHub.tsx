import { useMemo, useState } from 'react'
import type { HubListingEntry, HubMeta } from '../../types/hubs'
import { HubShell } from './HubShell'
import { HubListingCard } from './HubListingCard'

export type HubDirectoryConfig = {
  entries: HubListingEntry[]
  bannerTitle: string
  bannerText: string
  listHeadingSingular: string
  listHeadingPlural: string
  searchPlaceholder: string
  sectionId: string
  wideCards?: boolean
}

export function HubDirectoryHub(props: { hub: HubMeta; config: HubDirectoryConfig }) {
  const { hub, config } = props
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const categories = useMemo(() => {
    const labels = new Map<string, string>()
    for (const e of config.entries) {
      labels.set(e.category, e.categoryLabel)
    }
    return [
      { value: 'all', label: 'All categories' },
      ...Array.from(labels.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    ]
  }, [config.entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return config.entries.filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.categoryLabel.toLowerCase().includes(q) ||
        e.knownFor.some((k) => k.toLowerCase().includes(q)) ||
        e.whoCanApply.some((w) => w.toLowerCase().includes(q))
      )
    })
  }, [query, category, config.entries])

  return (
    <HubShell hub={hub}>
      <section className="hubSection" aria-labelledby={config.sectionId}>
        <div className="hubIntakeBanner">
          <p className="hubIntakeBannerTitle">{config.bannerTitle}</p>
          <p className="hubIntakeBannerText">{config.bannerText}</p>
        </div>

        <div className="hubToolbar">
          <h2 id={config.sectionId} className="hubSectionTitle">
            {filtered.length}{' '}
            {filtered.length === 1 ? config.listHeadingSingular : config.listHeadingPlural}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder={config.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Category</span>
              <select
                className="hubFilterSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={config.wideCards ? 'hubListingGrid hubListingGrid--wide' : 'hubListingGrid'}>
          {filtered.map((entry) => (
            <HubListingCard key={entry.id} entry={entry} wide={config.wideCards} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No results match your search. Try another filter.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
