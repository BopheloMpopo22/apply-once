import { useMemo, useState } from 'react'
import { COURSES_BY_POPULARITY } from '../../data/hubs/coursesData'
import type { CourseCategory, CourseCostType, HubMeta } from '../../types/hubs'
import { COURSE_CATEGORY_LABELS } from '../../types/hubs'
import { HubShell } from './HubShell'
import { CourseCard } from './CourseCard'
import { HubCategorySection, groupByCategory } from './HubCategorySection'

const CATEGORY_ORDER: CourseCategory[] = [
  'cloud-tech',
  'coding-ai',
  'bootcamp-sa',
  'business-digital',
  'free-online',
]

const COST_OPTIONS: { value: 'all' | CourseCostType; label: string }[] = [
  { value: 'all', label: 'All costs' },
  { value: 'free', label: 'Free' },
  { value: 'funded', label: 'Funded programme' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
]

export function CoursesHub(props: { hub: HubMeta }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | CourseCategory>('all')
  const [costType, setCostType] = useState<'all' | CourseCostType>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COURSES_BY_POPULARITY.filter((c) => {
      if (category !== 'all' && c.category !== category) return false
      if (costType !== 'all' && c.costType !== costType) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.whatYouLearn.toLowerCase().includes(q) ||
        c.knownFor.some((k) => k.toLowerCase().includes(q))
      )
    })
  }, [query, category, costType])

  const grouped = useMemo(
    () =>
      groupByCategory(
        filtered.map((c) => ({ ...c, categoryLabel: COURSE_CATEGORY_LABELS[c.category] })),
        category === 'all' ? CATEGORY_ORDER : [category],
      ),
    [filtered, category],
  )

  return (
    <HubShell hub={props.hub}>
      <section className="hubSection" aria-labelledby="courses-list-heading">
        <div className="hubIntakeBanner">
          <p className="hubIntakeBannerTitle">{COURSES_BY_POPULARITY.length} courses & skills programmes</p>
          <p className="hubIntakeBannerText hubBodyText">
            Grouped by skill area — cloud certifications, coding, SA bootcamps, business skills, and free
            online learning. Filter by cost to find free and funded options first.
          </p>
        </div>

        <div className="hubToolbar">
          <h2 id="courses-list-heading" className="hubSectionTitle">
            {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
          </h2>
          <div className="hubFilters">
            <label className="hubFilterField">
              <span className="hubFilterLabel">Search</span>
              <input
                type="search"
                className="hubFilterInput"
                placeholder="Skill, provider, or technology…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Category</span>
              <select
                className="hubFilterSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'all' | CourseCategory)}
              >
                <option value="all">All categories</option>
                {(Object.entries(COURSE_CATEGORY_LABELS) as [CourseCategory, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="hubFilterField">
              <span className="hubFilterLabel">Cost</span>
              <select
                className="hubFilterSelect"
                value={costType}
                onChange={(e) => setCostType(e.target.value as 'all' | CourseCostType)}
              >
                {COST_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
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
              count={group.items.length}
            >
              <div className="hubListingGrid hubListingGridCategory">
                {group.items.map((entry) => (
                  <CourseCard key={entry.id} entry={entry} />
                ))}
              </div>
            </HubCategorySection>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="hubEmpty">No courses match your search. Try another filter.</p>
        ) : null}
      </section>
    </HubShell>
  )
}
