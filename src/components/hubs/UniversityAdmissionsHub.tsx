import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UNIVERSITY_ADMISSIONS } from '../../data/hubs/universityAdmissions'
import type { HubMeta } from '../../types/hubs'
import { HubShell } from './HubShell'
import { UniversityAdmissionCard } from './UniversityAdmissionCard'

export function UniversityAdmissionsHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')
  const [province, setProvince] = useState('all')

  const provinces = useMemo(() => {
    const set = new Set(UNIVERSITY_ADMISSIONS.map((u) => u.province))
    return ['all', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return UNIVERSITY_ADMISSIONS.filter((u) => {
      if (province !== 'all' && u.province !== province) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.province.toLowerCase().includes(q) ||
        u.knownFor.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [query, province])

  return (
    <HubShell
      hub={props.hub}
      actions={
        <Link className="btn btnOutline btnSmall hubHeroCalcLink" to="/varsity-calculator">
          Varsity calculator (APS)
        </Link>
      }
    >
      <section className="hubSection" aria-labelledby="uni-list-heading">
        <div className="hubToolbar">
          <h2 id="uni-list-heading" className="hubSectionTitle">
            {filtered.length} universities
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="Name, province, or field…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Province</span>
              <select
                className="hubFilterSelect"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p === 'all' ? 'All provinces' : p}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="hubSectionLead">
          The varsity calculator helps you check programme eligibility. This hub focuses on
          admissions timing, fees, open days, and official links.
        </p>

        <div className="hubListingGrid">
          {filtered.map((entry) => (
            <UniversityAdmissionCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No universities match your search. Try another province or name.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
