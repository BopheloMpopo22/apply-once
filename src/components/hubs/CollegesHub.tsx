import { useMemo, useState } from 'react'
import {
  COLLEGES_BY_POPULARITY,
  COLLEGES_INTAKE_YEAR,
} from '../../data/hubs/collegesData'
import type { CollegeCategory, HubMeta } from '../../types/hubs'
import { COLLEGE_CATEGORY_LABELS } from '../../types/hubs'
import { HubShell } from './HubShell'
import { CollegeCard } from './CollegeCard'

const CATEGORY_OPTIONS = Object.entries(COLLEGE_CATEGORY_LABELS) as [CollegeCategory, string][]

export function CollegesHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')
  const [province, setProvince] = useState('all')
  const [category, setCategory] = useState<'all' | CollegeCategory>('all')
  const [institutionType, setInstitutionType] = useState<'all' | 'Private' | 'Public TVET'>('all')

  const provinces = useMemo(() => {
    const set = new Set(COLLEGES_BY_POPULARITY.map((c) => c.province))
    return ['all', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COLLEGES_BY_POPULARITY.filter((c) => {
      if (province !== 'all' && c.province !== province) return false
      if (category !== 'all' && c.category !== category) return false
      if (institutionType !== 'all' && c.institutionType !== institutionType) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.province.toLowerCase().includes(q) ||
        COLLEGE_CATEGORY_LABELS[c.category].toLowerCase().includes(q) ||
        c.knownFor.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [query, province, category, institutionType])

  const hubWithIntakeDisclaimer: HubMeta = {
    ...props.hub,
    disclaimer: `${props.hub.disclaimer} Dates below target ${COLLEGES_INTAKE_YEAR} intakes where known. Private colleges often accept rolling applications — confirm on each site.`,
  }

  return (
    <HubShell hub={hubWithIntakeDisclaimer}>
      <section className="hubSection" aria-labelledby="colleges-list-heading">
        <div className="hubIntakeBanner">
          <p className="hubIntakeBannerTitle">
            {COLLEGES_BY_POPULARITY.length} colleges & training institutions
          </p>
          <p className="hubIntakeBannerText">
            Private colleges, nursing schools, culinary institutes, artisan/TVET colleges, and creative
            media schools — grouped by category. For all 50 public TVET colleges, use the DHET directory
            entry at the bottom of the list.
          </p>
        </div>

        <div className="hubToolbar">
          <h2 id="colleges-list-heading" className="hubSectionTitle">
            {filtered.length} {filtered.length === 1 ? 'college' : 'colleges'}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="Name, field, province, or category…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Category</span>
              <select
                className="hubFilterSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'all' | CollegeCategory)}
              >
                <option value="all">All categories</option>
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
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
                value={institutionType}
                onChange={(e) =>
                  setInstitutionType(e.target.value as 'all' | 'Private' | 'Public TVET')
                }
              >
                <option value="all">All types</option>
                <option value="Private">Private</option>
                <option value="Public TVET">Public TVET</option>
              </select>
            </label>
          </div>
        </div>

        <div className="hubListingGrid">
          {filtered.map((entry) => (
            <CollegeCard key={entry.id} entry={entry} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No colleges match your search. Try another filter.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
