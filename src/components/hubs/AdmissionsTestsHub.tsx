import { useMemo, useState } from 'react'
import { ADMISSIONS_TESTS_BY_POPULARITY } from '../../data/hubs/admissionsTestsData'
import type { HubMeta } from '../../types/hubs'
import { HubShell } from './HubShell'
import { AdmissionsTestCard } from './AdmissionsTestCard'

export function AdmissionsTestsHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<'all' | 'south-africa' | 'international'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ADMISSIONS_TESTS_BY_POPULARITY.filter((t) => {
      if (region !== 'all' && t.region !== region) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.whatItIs.toLowerCase().includes(q) ||
        t.neededFor.some((n) => n.toLowerCase().includes(q)) ||
        t.testCentres.some(
          (c) =>
            c.province.toLowerCase().includes(q) || c.centres.toLowerCase().includes(q),
        )
      )
    })
  }, [query, region])

  return (
    <HubShell hub={props.hub}>
      <section className="hubSection" aria-labelledby="tests-list-heading">
        <div className="hubIntakeBanner">
          <p className="hubIntakeBannerTitle">
            {ADMISSIONS_TESTS_BY_POPULARITY.length} admissions tests & application services
          </p>
          <p className="hubIntakeBannerText">
            NBT for SA universities, SAT/ACT/IELTS for study abroad, and the KZN CAO application portal.
            Each entry includes fees, deadlines, test centres by province, and prep links including past
            papers where available.
          </p>
        </div>

        <div className="hubToolbar">
          <h2 id="tests-list-heading" className="hubSectionTitle">
            {filtered.length} {filtered.length === 1 ? 'test' : 'tests'}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="Test name, university, province…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Region</span>
              <select
                className="hubFilterSelect"
                value={region}
                onChange={(e) =>
                  setRegion(e.target.value as 'all' | 'south-africa' | 'international')
                }
              >
                <option value="all">All</option>
                <option value="south-africa">South Africa</option>
                <option value="international">International</option>
              </select>
            </label>
          </div>
        </div>

        <div className="hubListingGrid hubListingGrid--wide">
          {filtered.map((entry) => (
            <AdmissionsTestCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No tests match your search. Try another filter.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
