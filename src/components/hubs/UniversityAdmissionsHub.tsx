import { useMemo, useState } from 'react'
import {
  UNIVERSITY_ADMISSIONS_BY_POPULARITY,
  UNIVERSITY_ADMISSIONS_INTAKE_YEAR,
} from '../../data/hubs/universityAdmissionsData'
import { compareUniversitiesByPopularity } from '../../data/hubs/universityPopularity'
import type { HubMeta, UniversityType } from '../../types/hubs'
import { HubShell } from './HubShell'
import { UniversityAdmissionCard } from './UniversityAdmissionCard'

const TYPE_LABELS: Record<UniversityType, string> = {
  traditional: 'Traditional university',
  'university-of-technology': 'University of technology',
  comprehensive: 'Comprehensive university',
}

export function UniversityAdmissionsHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')
  const [province, setProvince] = useState('all')
  const [universityType, setUniversityType] = useState<'all' | UniversityType>('all')

  const provinces = useMemo(() => {
    const set = new Set(UNIVERSITY_ADMISSIONS_BY_POPULARITY.map((u) => u.province))
    return ['all', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return UNIVERSITY_ADMISSIONS_BY_POPULARITY.filter((u) => {
      if (province !== 'all' && u.province !== province) return false
      if (universityType !== 'all' && u.universityType !== universityType) return false
      if (!q) return true
      return (
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.province.toLowerCase().includes(q) ||
        u.knownFor.some((k) => k.toLowerCase().includes(q)) ||
        u.applicationOpens.toLowerCase().includes(q) ||
        u.applicationCloses.toLowerCase().includes(q)
      )
    }).sort((a, b) => compareUniversitiesByPopularity(a.id, b.id))
  }, [query, province, universityType])

  const hubWithIntakeDisclaimer: HubMeta = {
    ...props.hub,
    disclaimer: `${props.hub.disclaimer} Data below is for ${UNIVERSITY_ADMISSIONS_INTAKE_YEAR} undergraduate intake (application cycle in 2026). Programme-specific dates may close earlier — check each university's site.`,
  }

  return (
    <HubShell hub={hubWithIntakeDisclaimer}>
      <section className="hubSection" aria-labelledby="uni-list-heading">
        <div className="hubIntakeBanner">
          <p className="hubIntakeBannerTitle">
            {UNIVERSITY_ADMISSIONS_BY_POPULARITY.length} public universities ·{' '}
            {UNIVERSITY_ADMISSIONS_INTAKE_YEAR}{' '}
            intake
          </p>
          <p className="hubIntakeBannerText">
            Published opening and closing dates for undergraduate applications. Fees are for SA
            citizens unless noted. Open day dates are listed on each university's official site.
          </p>
        </div>

        <div className="hubToolbar">
          <h2 id="uni-list-heading" className="hubSectionTitle">
            {filtered.length} {filtered.length === 1 ? 'university' : 'universities'}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="Name, province, field, or date…"
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
            <label className="hubFilterField">
              <span className="hubFilterLabel">Type</span>
              <select
                className="hubFilterSelect"
                value={universityType}
                onChange={(e) => setUniversityType(e.target.value as 'all' | UniversityType)}
              >
                <option value="all">All types</option>
                {(Object.keys(TYPE_LABELS) as UniversityType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="hubListingStack hubListingStackUni">
          {filtered.map((entry) => (
            <UniversityAdmissionCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No universities match your search. Try another filter.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
