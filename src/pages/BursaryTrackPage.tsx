import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'

type TrackItem = {
  slug: string
  name: string
  provider: string
  type: string
  applicationCloses: string
  applyUrl: string | null
  isOpen: boolean
  studyFields: string[]
}

type TrackResponse = {
  asOf: string
  lastCheckedAt: string | null
  openCount: number
  closedCount: number
  items: TrackItem[]
}

export function BursaryTrackPage() {
  const [data, setData] = useState<TrackResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open')

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

  const visible = useMemo(() => {
    const items = data?.items ?? []
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (filter === 'open' && !item.isOpen) return false
      if (filter === 'closed' && item.isOpen) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.provider.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
      )
    })
  }, [data, filter, query])

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
              <span>Bursary track</span>
            </nav>

            <header className="hubHero">
              <div className="hubHeroText">
                <p className="hubHeroKicker">South Africa · live list</p>
                <h1 className="hubHeroTitle">Bursary & scholarship track</h1>
                <p className="hubHeroIntro">
                  Major South African bursaries and scholarships we track for Apply Once students — NSFAS, Funza
                  Lushaka, all 21 SETAs, provincial schemes, public universities, and large employers. Every morning
                  this list is re-checked: still open stays open; if the close date has passed, it moves to closed.
                  The career questionnaire counts matches from this same list.
                </p>
                <p className="hubDisclaimer">
                  This is the national and major-scheme list, not every bursary in the country. Small municipal,
                  church, and one-off company schemes are too many and change too fast to list completely. Always
                  confirm dates on the provider’s own apply page.
                </p>
              </div>
            </header>

            {error ? <div className="formError">{error}</div> : null}
            {busy ? <p className="formLead">Loading the live list…</p> : null}

            {data ? (
              <>
                <p className="adminMuted bursaryTrackMeta">
                  {data.openCount} open · {data.closedCount} closed
                  {data.lastCheckedAt ? (
                    <> · last automatic check {new Date(data.lastCheckedAt).toLocaleString()}</>
                  ) : (
                    <> · first automatic check runs around 06:00 SAST</>
                  )}
                </p>

                <section className="hubSection" aria-labelledby="bursary-track-filters">
                  <h2 id="bursary-track-filters" className="hubSectionTitle">
                    Find a listing
                  </h2>
                  <div className="hubToolbar bursaryTrackToolbar">
                    <label className="hubFilterField">
                      <span className="hubFilterLabel">Search</span>
                      <input
                        type="search"
                        className="hubFilterInput"
                        placeholder="e.g. NSFAS, Sasol, Funza…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <label className="hubFilterField">
                      <span className="hubFilterLabel">Show</span>
                      <select
                        className="hubFilterInput"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'open' | 'closed' | 'all')}
                      >
                        <option value="open">Open now</option>
                        <option value="closed">Closed</option>
                        <option value="all">All</option>
                      </select>
                    </label>
                  </div>
                </section>

                <section className="hubSection" aria-labelledby="bursary-track-list">
                  <h2 id="bursary-track-list" className="hubSectionTitle">
                    {filter === 'open' ? 'Open now' : filter === 'closed' ? 'Closed' : 'All listings'}
                  </h2>
                  {visible.length === 0 ? (
                    <p className="formLead">No listings match that search.</p>
                  ) : (
                    <div className="adminTableWrap">
                      <table className="adminTable bursaryTrackTable">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Provider</th>
                            <th>Type</th>
                            <th>Closes</th>
                            <th>Status</th>
                            <th>Apply</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map((item) => (
                            <tr key={item.slug}>
                              <td>{item.name}</td>
                              <td>{item.provider}</td>
                              <td>{item.type}</td>
                              <td>{new Date(item.applicationCloses).toLocaleDateString()}</td>
                              <td>
                                {item.isOpen ? (
                                  <span className="adminBursaryBadgeOpen">Open</span>
                                ) : (
                                  <span className="adminBursaryBadgeClosed">Closed</span>
                                )}
                              </td>
                              <td>
                                {item.applyUrl ? (
                                  <a href={item.applyUrl} target="_blank" rel="noreferrer">
                                    Provider site
                                  </a>
                                ) : (
                                  <span className="adminMuted">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
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
