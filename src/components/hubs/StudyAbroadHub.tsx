import { useMemo, useState } from 'react'
import { STUDY_ABROAD_BY_POPULARITY } from '../../data/hubs/studyAbroadData'
import type { HubMeta, StudyAbroadCategory } from '../../types/hubs'
import { STUDY_ABROAD_CATEGORY_LABELS } from '../../types/hubs'
import { HubShell } from './HubShell'
import { StudyAbroadCard } from './StudyAbroadCard'
import { HubCategorySection, groupByCategory } from './HubCategorySection'

const CATEGORY_OPTIONS = Object.entries(STUDY_ABROAD_CATEGORY_LABELS) as [
  StudyAbroadCategory,
  string,
][]

const CATEGORY_ORDER: StudyAbroadCategory[] = [
  'government-scholarship',
  'international-scholarship',
  'international-university',
  'country-pathway',
  'advising-support',
]

const CATEGORY_DESCRIPTIONS: Partial<Record<StudyAbroadCategory, string>> = {
  'government-scholarship': 'DHET-nominated scholarships to study in China, Germany, Russia, and more.',
  'international-scholarship': 'Chevening, Fulbright, Commonwealth, and other competitive awards.',
  'international-university':
    'Universities in the USA and Europe that actively welcome international students — what SA learners need to know before applying.',
  'country-pathway': 'Official country portals for UK, Germany, France, Australia, and the EU.',
  'advising-support': 'Free advising and qualification recognition when you return to SA.',
}

export function StudyAbroadHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | StudyAbroadCategory>('all')
  const [destination, setDestination] = useState('all')

  const destinations = useMemo(() => {
    const set = new Set(STUDY_ABROAD_BY_POPULARITY.map((e) => e.destination))
    return ['all', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STUDY_ABROAD_BY_POPULARITY.filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (destination !== 'all' && e.destination !== destination) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.destination.toLowerCase().includes(q) ||
        e.whatItOffers.toLowerCase().includes(q) ||
        e.whoCanApply.some((w) => w.toLowerCase().includes(q))
      )
    })
  }, [query, category, destination])

  const grouped = useMemo(
    () =>
      groupByCategory(
        filtered.map((e) => ({
          ...e,
          categoryLabel: STUDY_ABROAD_CATEGORY_LABELS[e.category],
        })),
        category === 'all' ? CATEGORY_ORDER : [category],
      ),
    [filtered, category],
  )

  return (
    <HubShell hub={props.hub}>
      <section className="hubSection" aria-labelledby="abroad-list-heading">
        <div className="hubIntakeBanner">
          <p className="hubIntakeBannerTitle">
            {STUDY_ABROAD_BY_POPULARITY.length} scholarships, universities & study pathways
          </p>
          <p className="hubIntakeBannerText hubBodyText">
            Government scholarships (DHET), international awards like Chevening and Fulbright, universities
            in the USA and Europe that welcome SA students, country guides, and SAQA recognition — with
            deadlines, funding levels, and official links.
          </p>
        </div>

        <div className="hubToolbar">
          <h2 id="abroad-list-heading" className="hubSectionTitle">
            {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="Country, scholarship, or field…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Category</span>
              <select
                className="hubFilterSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'all' | StudyAbroadCategory)}
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
              <span className="hubFilterLabel">Destination</span>
              <select
                className="hubFilterSelect"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {destinations.map((d) => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All destinations' : d}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="hubCategoryStack">
          {grouped.map((group) => (
            <HubCategorySection
              key={group.category}
              categoryId={group.category}
              title={group.label}
              description={CATEGORY_DESCRIPTIONS[group.category as StudyAbroadCategory]}
              count={group.items.length}
            >
              <div className="hubListingStack">
                {group.items.map((entry) => (
                  <StudyAbroadCard key={entry.id} entry={entry} />
                ))}
              </div>
            </HubCategorySection>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No opportunities match your search. Try another filter.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
