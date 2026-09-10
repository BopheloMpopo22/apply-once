import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'

type CalendarStatus = 'open' | 'upcoming' | 'closed'
type StatusFilter = 'open' | 'closing_soon' | 'upcoming' | 'closed' | 'all'

type TrackItem = {
  slug: string
  name: string
  provider: string
  type: string
  studyFields: string[]
  studyLevels: string[]
  coverage: string
  region: string
  eligibility: string | null
  requiredDocs: string | null
  notes: string | null
  applicationOpens: string | null
  applicationCloses: string
  nextExpectedOpens: string | null
  opensPublished: boolean
  calendarStatus: CalendarStatus
  closingSoon: boolean
  upcoming: boolean
  isOpen: boolean
  applyUrl: string | null
  lastVerifiedAt: string | null
  dateConfidence?: 'official' | 'typical' | 'unknown'
}

type TrackResponse = {
  asOf: string
  lastCheckedAt: string | null
  lastVerifiedAt: string | null
  openCount: number
  closingSoonCount: number
  upcomingCount: number
  closedCount: number
  items: TrackItem[]
}

const FIELD_LABELS: Record<string, string> = {
  engineering: 'Engineering',
  health: 'Health',
  commerce: 'Accounting / Commerce',
  law: 'Law',
  education: 'Education',
  it: 'Computer Science / IT',
  science: 'Science',
  arts: 'Arts & media',
  agriculture: 'Agriculture',
  hospitality: 'Hospitality',
  all: 'All fields',
}

const LEVEL_LABELS: Record<string, string> = {
  undergraduate: 'Undergraduate',
  honours: 'Honours',
  masters: 'Masters',
  phd: 'PhD',
  tvet: 'TVET',
}

const COVERAGE_LABELS: Record<string, string> = {
  full: 'Full funding',
  partial: 'Partial funding',
  unknown: 'Coverage not listed',
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return 'Not published'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Not published'
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function DateCell(props: { iso: string | null | undefined; typical?: boolean; unpublished?: boolean }) {
  if (props.unpublished) return <span className="adminMuted">Not published</span>
  return (
    <div>
      <div>{formatDate(props.iso)}</div>
      {props.typical ? <div className="bursaryDateTypical">Typical (last year)</div> : null}
    </div>
  )
}

function fieldLabel(slug: string) {
  return FIELD_LABELS[slug] || slug
}

function fieldsLabel(fields: string[]) {
  if (!fields?.length || fields.includes('all')) return 'All fields'
  return fields.map(fieldLabel).join(', ')
}

function levelsLabel(levels: string[]) {
  if (!levels?.length) return 'Not listed'
  return levels.map((l) => LEVEL_LABELS[l] || l).join(', ')
}

function StatusBadge(props: { item: TrackItem }) {
  const { item } = props
  if (item.closingSoon) return <span className="bursaryStatusChip bursaryStatusClosing">Closing soon</span>
  if (item.calendarStatus === 'open') return <span className="bursaryStatusChip bursaryStatusOpen">Open</span>
  if (item.calendarStatus === 'upcoming') {
    return <span className="bursaryStatusChip bursaryStatusUpcoming">Upcoming</span>
  }
  return <span className="bursaryStatusChip bursaryStatusClosed">Closed</span>
}

function applyLabel(item: TrackItem) {
  if (!item.applyUrl) return null
  if (item.calendarStatus === 'open') return 'Apply'
  if (item.calendarStatus === 'upcoming' || item.upcoming) return 'Prepare'
  return 'View details'
}

export function BursaryTrackPage() {
  const [data, setData] = useState<TrackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('open')
  const [field, setField] = useState('all')
  const [openSlug, setOpenSlug] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const res = await api<TrackResponse>('/api/bursaries/track')
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load bursary track')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const fieldOptions = useMemo(() => {
    const set = new Set<string>()
    for (const item of data?.items ?? []) {
      for (const f of item.studyFields || []) set.add(f)
    }
    return [...set].sort()
  }, [data])

  const visible = useMemo(() => {
    const items = data?.items ?? []
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === 'open' && item.calendarStatus !== 'open') return false
      if (filter === 'closing_soon' && !item.closingSoon) return false
      if (filter === 'upcoming' && !item.upcoming) return false
      if (filter === 'closed' && item.calendarStatus !== 'closed') return false
      if (field !== 'all' && !(item.studyFields || []).includes(field) && !(item.studyFields || []).includes('all')) {
        return false
      }
      if (!q) return true
      const hay = [
        item.name,
        item.provider,
        item.type,
        item.region,
        fieldsLabel(item.studyFields),
        levelsLabel(item.studyLevels),
        item.eligibility || '',
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [data, field, filter, query])

  const heading =
    filter === 'open'
      ? 'Open now'
      : filter === 'closing_soon'
        ? 'Closing soon'
        : filter === 'upcoming'
          ? 'Upcoming'
          : filter === 'closed'
            ? 'Closed'
            : 'All bursaries'

  return (
    <div className="formShell hubShell bursaryTrackShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Application', to: '/application' },
          { label: 'Newsletter', to: '/newsletter', accent: 'red' },
        ]}
      />
      <main className="hubMain">
        <div className="hubContainer hubContainerWide">
          <div className="hubPanel">
            <nav className="hubBreadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden>/</span>
              <span>Bursaries</span>
            </nav>

            <header className="hubHero">
              <div className="hubHeroText">
                <p className="hubHeroKicker">South Africa · bursary calendar</p>
                <h1 className="hubHeroTitle">Bursaries</h1>
                <p className="hubHeroIntro">
                  A live directory of South African bursaries and scholarships we track for Apply Once students —
                  what is open now, what is closing soon, and what you can prepare for later. Status is calculated
                  from dates, not typed in by hand. Opening dates are only shown when the funder has published one.
                </p>
                <p className="hubDisclaimer">
                  Other public directories are useful starting points, but none of them is a complete official list.
                  Always confirm dates, eligibility, and how to apply on the funder’s own page. We do not invent
                  opening dates. Where this year’s national dates are not out yet (for example NSFAS), we may show
                  last year’s dates labelled “Typical (last year)” so the listing is not stuck on an old closed
                  window. This is a national and major-scheme calendar, not every bursary in the country.
                </p>
              </div>
            </header>

            {error ? <div className="formError">{error}</div> : null}
            {busy ? <p className="formLead">Loading the live directory…</p> : null}

            {data ? (
              <>
                <p className="adminMuted bursaryTrackMeta">
                  {data.openCount} open now · {data.closingSoonCount} closing soon · {data.upcomingCount} upcoming ·{' '}
                  {data.closedCount} closed
                  {data.lastCheckedAt ? (
                    <> · links last checked {new Date(data.lastCheckedAt).toLocaleString()}</>
                  ) : (
                    <> · automatic link check runs around 06:00 SAST</>
                  )}
                </p>

                <section className="hubSection" aria-labelledby="bursary-track-filters">
                  <h2 id="bursary-track-filters" className="hubSectionTitle">
                    Find a bursary
                  </h2>
                  <div className="bursaryTrackChips" role="tablist" aria-label="Application status">
                    {(
                      [
                        ['open', `Open now (${data.openCount})`],
                        ['closing_soon', `Closing soon (${data.closingSoonCount})`],
                        ['upcoming', `Upcoming (${data.upcomingCount})`],
                        ['closed', `Closed (${data.closedCount})`],
                        ['all', `All (${data.items.length})`],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={filter === id}
                        className={filter === id ? 'bursaryTrackChip bursaryTrackChipActive' : 'bursaryTrackChip'}
                        onClick={() => setFilter(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="hubToolbar bursaryTrackToolbar">
                    <label className="hubFilterField">
                      <span className="hubFilterLabel">Search</span>
                      <input
                        type="search"
                        className="hubFilterInput"
                        placeholder="e.g. NSFAS, Sasol, Funza, engineering…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <label className="hubFilterField">
                      <span className="hubFilterLabel">Study field</span>
                      <select className="hubFilterInput" value={field} onChange={(e) => setField(e.target.value)}>
                        <option value="all">All fields</option>
                        {fieldOptions
                          .filter((f) => f !== 'all')
                          .map((f) => (
                            <option key={f} value={f}>
                              {fieldLabel(f)}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section className="hubSection" aria-labelledby="bursary-track-list">
                  <h2 id="bursary-track-list" className="hubSectionTitle">
                    {heading}
                  </h2>
                  {visible.length === 0 ? (
                    <p className="formLead">No listings match that search.</p>
                  ) : (
                    <div className="adminTableWrap">
                      <table className="adminTable bursaryTrackTable">
                        <thead>
                          <tr>
                            <th>Bursary</th>
                            <th>Study field</th>
                            <th>Level</th>
                            <th>Opens</th>
                            <th>Closes</th>
                            <th>Status</th>
                            <th>Official site</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((item) => {
                            const expanded = openSlug === item.slug
                            const cta = applyLabel(item)
                            return (
                              <Fragment key={item.slug}>
                                <tr className={expanded ? 'bursaryTrackRowOpen' : undefined}>
                                  <td>
                                    <button
                                      type="button"
                                      className="bursaryTrackNameBtn"
                                      aria-expanded={expanded}
                                      onClick={() => setOpenSlug(expanded ? null : item.slug)}
                                    >
                                      {item.name}
                                    </button>
                                    <div className="adminMuted">{item.provider}</div>
                                  </td>
                                  <td>{fieldsLabel(item.studyFields)}</td>
                                  <td>{levelsLabel(item.studyLevels)}</td>
                                  <td>
                                    <DateCell
                                      iso={item.applicationOpens}
                                      unpublished={!item.opensPublished}
                                      typical={item.dateConfidence === 'typical' && item.opensPublished}
                                    />
                                  </td>
                                  <td>
                                    <DateCell iso={item.applicationCloses} typical={item.dateConfidence === 'typical'} />
                                  </td>
                                  <td>
                                    <StatusBadge item={item} />
                                  </td>
                                  <td>
                                    {item.applyUrl && cta ? (
                                      <a href={item.applyUrl} target="_blank" rel="noreferrer">
                                        {cta}
                                      </a>
                                    ) : (
                                      <span className="adminMuted">—</span>
                                    )}
                                  </td>
                                </tr>
                                {expanded ? (
                                  <tr className="bursaryTrackDetailRow">
                                    <td colSpan={7}>
                                      <div className="bursaryTrackDetail">
                                        <p>
                                          <strong>Funder:</strong> {item.provider}
                                          {' · '}
                                          <strong>Coverage:</strong> {COVERAGE_LABELS[item.coverage] || item.coverage}
                                          {' · '}
                                          <strong>Region:</strong> {item.region === 'nationwide' ? 'Nationwide' : item.region}
                                        </p>
                                        {item.eligibility ? (
                                          <p>
                                            <strong>Eligibility:</strong> {item.eligibility}
                                          </p>
                                        ) : (
                                          <p className="adminMuted">Eligibility: confirm on the official apply page.</p>
                                        )}
                                        {item.requiredDocs ? (
                                          <p>
                                            <strong>Required documents:</strong> {item.requiredDocs}
                                          </p>
                                        ) : null}
                                        {item.dateConfidence === 'typical' ? (
                                          <p>
                                            <strong>Dates:</strong> Typical (last year’s published window). This year’s
                                            dates are not confirmed yet — use these as a guide only and check the
                                            official page before you apply.
                                          </p>
                                        ) : null}
                                        {item.nextExpectedOpens ? (
                                          <p>
                                            <strong>Next expected opening:</strong>{' '}
                                            {formatDate(item.nextExpectedOpens)}
                                            {item.dateConfidence === 'typical' ? ' (typical)' : ''}
                                          </p>
                                        ) : null}
                                        {item.notes ? (
                                          <p>
                                            <strong>Notes:</strong> {item.notes}
                                          </p>
                                        ) : null}
                                        <p className="adminMuted">
                                          Last verified:{' '}
                                          {item.lastVerifiedAt ? new Date(item.lastVerifiedAt).toLocaleDateString('en-ZA') : 'Not yet verified by Apply Once'}
                                          . Always check the official page before you apply — dates can change.
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : null}
                              </Fragment>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            ) : null}
          </div>
        </div>
      </main>
      <SiteFooter
        brand={{ name: 'Apply Once', description: 'One profile. Many bursaries.' }}
      />
    </div>
  )
}
