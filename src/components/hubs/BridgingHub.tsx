import { useMemo, useState } from 'react'
import { BRIDGING_BY_POPULARITY } from '../../data/hubs/bridgingData'
import type { HubMeta } from '../../types/hubs'
import { HubShell } from './HubShell'
import { BridgingCard } from './BridgingCard'

export function BridgingHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return BRIDGING_BY_POPULARITY
    return BRIDGING_BY_POPULARITY.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.offersBridging.some(
          (o) =>
            o.faculty.toLowerCase().includes(q) ||
            o.programmes.some((p) => p.toLowerCase().includes(q)),
        ) ||
        e.noBridgingFor.some((n) => n.toLowerCase().includes(q)),
    )
  }, [query])

  return (
    <HubShell hub={props.hub}>
      <section className="hubSection" aria-labelledby="bridging-list-heading">
        <div className="hubIntakeBanner hubIntakeBannerBridging">
          <p className="hubIntakeBannerTitle">
            {BRIDGING_BY_POPULARITY.length} universities with bridging & extended routes
          </p>
          <p className="hubIntakeBannerText hubBodyText">
            Bridging can save your dream degree — but it is <strong>not the same at every faculty</strong>.
            Wits may offer extended Science but not Law. UJ offers extended BCom but not LLB. Each card below
            shows exactly where bridging exists and where it does not.
          </p>
        </div>

        <div className="hubToolbar">
          <h2 id="bridging-list-heading" className="hubSectionTitle">
            {filtered.length} {filtered.length === 1 ? 'university' : 'universities'}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="University, faculty, law, psychology, engineering…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="hubListingStack">
          {filtered.map((entry) => (
            <BridgingCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No programmes match your search. Try another term.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
