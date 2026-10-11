import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'
import {
  formatNewsletterDate,
  type IssuesResponse,
  type MagArticle,
} from '../components/newsletter/newsletterTypes'
import { api } from '../api/client'
import { NEWSLETTER_INDUSTRIES, industryLabel } from '../data/newsletterIndustries'
import {
  NEWSLETTER_RESERVED_SLUGS,
  NEWSLETTER_TRACKS,
  isNewsletterTrack,
  trackLabel,
  trackMeta,
  type NewsletterTrackId,
} from '../data/newsletterTracks'
import {
  clearNewsletterToken,
  readNewsletterToken,
  writeNewsletterToken,
} from '../utils/newsletterAccess'
import {
  NEWSLETTER_BRAND,
  firstBodyParagraph,
  renderNewsletterBody,
} from '../utils/newsletterContent'

function articleTeaser(article: MagArticle): string {
  if (article.summary?.trim()) return article.summary.trim()
  if (article.body) return firstBodyParagraph(article.body)
  return ''
}

function storyTypeLabel(item: MagArticle): string {
  if (item.articleType === 'industry') return industryLabel(item.industry)
  if (isNewsletterTrack(item.articleType)) return trackLabel(item.articleType)
  return 'This week'
}

function SubscribeGate(props: {
  busy: boolean
  error: string | null
  firstName: string
  lastName: string
  email: string
  onFirstName: (v: string) => void
  onLastName: (v: string) => void
  onEmail: (v: string) => void
  onSubmit: (e: FormEvent) => void
}) {
  const { busy, error, firstName, lastName, email, onFirstName, onLastName, onEmail, onSubmit } =
    props
  return (
    <div className="nlGate" role="dialog" aria-modal="true" aria-labelledby="nl-gate-title">
      <div className="nlGateBackdrop" aria-hidden />
      <div className="nlGateCard">
        <p className="nlGateSection">School → Industry Weekly</p>
        <h1 id="nl-gate-title" className="nlGateTitle">
          Free weekly industry news for learners
        </h1>
        <p className="nlGateLead">
          What you wish someone had told you in matric, at university, and after — plus courses,
          certifications, opportunities, and studying abroad.
        </p>
        <ul className="nlGateBullets">
          <li>Main weekly briefing</li>
          <li>Four mini newsletters with their own pages</li>
          <li>Archive of every past issue · free to read online</li>
        </ul>
        <form className="nlGateForm" onSubmit={onSubmit}>
          <label className="nlGateField">
            <span>First name</span>
            <input
              value={firstName}
              onChange={(e) => onFirstName(e.target.value)}
              required
              autoComplete="given-name"
              placeholder="Thabo"
            />
          </label>
          <label className="nlGateField">
            <span>Surname</span>
            <input
              value={lastName}
              onChange={(e) => onLastName(e.target.value)}
              required
              autoComplete="family-name"
              placeholder="Mokoena"
            />
          </label>
          <label className="nlGateField nlGateFieldFull">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@email.com"
            />
          </label>
          {error ? <p className="nlGateError">{error}</p> : null}
          <button type="submit" className="nlGateSubmit" disabled={busy}>
            {busy ? 'Opening…' : 'Continue reading'}
          </button>
        </form>
        <p className="nlGateFoot">
          We only use your details for this free brief. <Link to="/">Back to Apply Once</Link>
        </p>
      </div>
    </div>
  )
}

function NewsletterChrome(props: {
  showGate: boolean
  gate: ReactNode
  subscriberName?: string
  onSignOut: () => void
  children: ReactNode
}) {
  return (
    <div className={`appShell nlShell ${props.showGate ? 'nlShellLocked' : ''}`}>
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Bursaries', to: '/bursary-track' },
          { label: 'Programmes', to: '/programmes-for-work' },
          { label: 'Newsletter', to: '/newsletter', accent: 'red' },
        ]}
      />
      {props.showGate ? props.gate : null}
      <main className="container nlNews">
        <div className="nlNewsMasthead">
          <Link to="/newsletter" className="nlNewsBrandLink">
            {NEWSLETTER_BRAND.name}
          </Link>
          <span className="nlNewsMastDot" aria-hidden>
            ·
          </span>
          <span className="nlNewsMastMeta">SA &amp; Africa</span>
          {props.subscriberName ? (
            <>
              <span className="nlNewsMastDot" aria-hidden>
                ·
              </span>
              <button type="button" className="nlNewsTextBtn" onClick={props.onSignOut}>
                Signed in as {props.subscriberName}
              </button>
            </>
          ) : null}
        </div>
        {props.children}
      </main>
      <SiteFooter
        brand={{ name: 'Apply Once', description: 'School to industry — one profile, clearer options.' }}
        legalLinks={[
          { label: 'About', to: '/about' },
          { label: 'Newsletter', to: '/newsletter', accent: 'red' },
          { label: 'Terms', to: '/terms' },
          { label: 'Contact', to: '/contact' },
        ]}
      />
    </div>
  )
}

function NewsletterAside(props: {
  activeTrack?: NewsletterTrackId | null
  coveredIndustryIds?: Set<string>
  archivePreview?: MagArticle[]
}) {
  const covered = props.coveredIndustryIds ?? new Set<string>()
  return (
    <aside className="nlNewsAside" aria-label="Sections">
      <p className="nlNewsAsideTitle">Sections</p>
      <ul className="nlNewsAsideLinks">
        <li>
          <Link to="/newsletter" className="nlNewsAsideLink">
            This week&apos;s brief
          </Link>
        </li>
        <li>
          <Link to="/newsletter/archive" className="nlNewsAsideLink">
            Archive
          </Link>
        </li>
      </ul>

      <p className="nlNewsAsideTitle">Mini newsletters</p>
      <ul className="nlNewsAsideLinks">
        {NEWSLETTER_TRACKS.map((track) => (
          <li key={track.id}>
            <Link
              to={`/newsletter/${track.id}`}
              className={`nlNewsAsideLink ${props.activeTrack === track.id ? 'nlNewsAsideLinkActive' : ''}`}
            >
              {track.shortLabel}
            </Link>
          </li>
        ))}
      </ul>

      <p className="nlNewsAsideTitle">Industries this week</p>
      <ul className="nlNewsAsideLinks">
        {NEWSLETTER_INDUSTRIES.map((ind) => {
          const live = covered.has(ind.id)
          return (
            <li key={ind.id}>
              {live ? (
                <Link
                  to={`/newsletter?industry=${encodeURIComponent(ind.id)}`}
                  className="nlNewsAsideLink"
                >
                  {ind.label}
                </Link>
              ) : (
                <span className="nlNewsAsideLink nlNewsAsideLinkMuted" title="Not in this week’s brief">
                  {ind.label}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {props.archivePreview && props.archivePreview.length > 0 ? (
        <>
          <p className="nlNewsAsideTitle">Recent archive</p>
          <ul className="nlNewsAsideLinks">
            {props.archivePreview.map((item) => (
              <li key={item.id}>
                <Link to={articleHref(item)} className="nlNewsAsideLink">
                  {item.title}
                  {item.publishedAt ? (
                    <span className="nlNewsAsideDate">{formatNewsletterDate(item.publishedAt)}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </aside>
  )
}

function articleHref(article: MagArticle): string {
  if (isNewsletterTrack(article.articleType)) {
    return `/newsletter/${article.articleType}?article=${encodeURIComponent(article.slug)}`
  }
  return `/newsletter/${article.slug}`
}

function ArticleReader(props: {
  article: MagArticle
  expanded: boolean
  onToggle: () => void
  sectionLabel: string
}) {
  const { article, expanded, onToggle, sectionLabel } = props
  const teaser = articleTeaser(article)
  return (
    <article className="nlNewsArticle">
      <p className="nlNewsSection">{sectionLabel}</p>
      <h1 className="nlNewsHeadline">{article.title}</h1>
      <p className="nlNewsByline">
        By Apply Once
        {article.publishedAt ? (
          <>
            <span aria-hidden> · </span>
            <time dateTime={article.publishedAt}>{formatNewsletterDate(article.publishedAt)}</time>
          </>
        ) : null}
        {article.kicker ? (
          <>
            <span aria-hidden> · </span>
            <span>{article.kicker}</span>
          </>
        ) : null}
      </p>
      {teaser ? <p className="nlNewsStandfirst">{teaser}</p> : null}
      {expanded && article.body ? (
        <div className="nlNewsBody">{renderNewsletterBody(article.body)}</div>
      ) : null}
      {article.body ? (
        <button type="button" className="nlNewsContinue" aria-expanded={expanded} onClick={onToggle}>
          {expanded ? 'Show less ▲' : 'Continue reading ▼'}
        </button>
      ) : null}
    </article>
  )
}

function useNewsletterAccess() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(() => searchParams.get('token') || readNewsletterToken())
  const [data, setData] = useState<IssuesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  const load = useCallback(async (accessToken: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const q = accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''
      const res = await api<IssuesResponse>(`/api/newsletter/issues${q}`)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load newsletter')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const fromUrl = searchParams.get('token')
    if (fromUrl) {
      writeNewsletterToken(fromUrl)
      setToken(fromUrl)
    }
    void load(fromUrl || readNewsletterToken())
  }, [load, searchParams])

  async function onSubscribe(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await api<{ accessToken: string }>('/api/newsletter/subscribe', {
        method: 'POST',
        json: { firstName, lastName, email },
      })
      writeNewsletterToken(res.accessToken)
      setToken(res.accessToken)
      await load(res.accessToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe')
    } finally {
      setBusy(false)
    }
  }

  function onSignOut() {
    clearNewsletterToken()
    setToken(null)
    setData((prev) => (prev ? { ...prev, unlocked: false, subscriber: null, issues: [] } : prev))
    void load(null)
  }

  const unlocked = Boolean(data?.unlocked && token)
  const showGate = !unlocked && (!token || !loading)

  return {
    token,
    data,
    loading,
    error,
    busy,
    firstName,
    lastName,
    email,
    setFirstName,
    setLastName,
    setEmail,
    onSubscribe,
    onSignOut,
    unlocked,
    showGate,
    issues: data?.issues ?? [],
  }
}

/** Hub: /newsletter — this week’s brief + mini-newsletter boxes */
export function NewsletterPage() {
  const [searchParams] = useSearchParams()
  const access = useNewsletterAccess()
  const [expanded, setExpanded] = useState(true)
  const industryJump = searchParams.get('industry')

  const mainArticles = useMemo(
    () => access.issues.filter((i) => i.articleType === 'main'),
    [access.issues],
  )
  const latestMain = mainArticles[0] ?? null
  const trackLatest = useMemo(() => {
    const map = Object.fromEntries(NEWSLETTER_TRACKS.map((t) => [t.id, null as MagArticle | null])) as Record<
      NewsletterTrackId,
      MagArticle | null
    >
    for (const issue of access.issues) {
      if (isNewsletterTrack(issue.articleType) && !map[issue.articleType]) {
        map[issue.articleType] = issue
      }
    }
    return map
  }, [access.issues])

  const covered = useMemo(() => new Set(latestMain?.coveredIndustries || []), [latestMain])

  useEffect(() => {
    if (!industryJump || !latestMain || !access.unlocked) return
    if (!(latestMain.coveredIndustries || []).includes(industryJump)) return
    const id = `industry-${industryJump}`
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [industryJump, latestMain, access.unlocked, expanded])

  useEffect(() => {
    if (industryJump) setExpanded(true)
  }, [industryJump])

  return (
    <NewsletterChrome
      showGate={access.showGate}
      subscriberName={access.data?.subscriber?.firstName}
      onSignOut={access.onSignOut}
      gate={
        <SubscribeGate
          busy={access.busy}
          error={access.error}
          firstName={access.firstName}
          lastName={access.lastName}
          email={access.email}
          onFirstName={access.setFirstName}
          onLastName={access.setLastName}
          onEmail={access.setEmail}
          onSubmit={(e) => void access.onSubscribe(e)}
        />
      }
    >
      {access.loading ? <p className="nlNewsLoading">Loading edition…</p> : null}
      {!access.loading && access.unlocked && access.error ? (
        <div className="formError">{access.error}</div>
      ) : null}

      {!access.loading && access.unlocked ? (
        <div className="nlNewsGrid">
          <div className="nlNewsStoryCol">
            <section className="nlTrackGrid" aria-label="Mini newsletters">
              <div className="nlTrackGridHead">
                <h2 className="nlTrackGridTitle">Mini newsletters</h2>
                <p className="nlTrackGridLead">
                  Each box opens its own page. New posts stay on top; older ones move into that page’s
                  archive.
                </p>
              </div>
              <div className="nlTrackBoxes">
                {NEWSLETTER_TRACKS.map((track) => {
                  const latest = trackLatest[track.id]
                  return (
                    <Link key={track.id} to={`/newsletter/${track.id}`} className="nlTrackBox">
                      <span className="nlTrackBoxLabel">{track.label}</span>
                      <span className="nlTrackBoxBlurb">{track.blurb}</span>
                      {latest ? (
                        <span className="nlTrackBoxLatest">
                          <span className="nlTrackBoxLatestEyebrow">Latest</span>
                          <span className="nlTrackBoxLatestTitle">{latest.title}</span>
                        </span>
                      ) : (
                        <span className="nlTrackBoxEmpty">Open page · first issue soon</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </section>

            {latestMain ? (
              <ArticleReader
                article={latestMain}
                expanded={expanded}
                onToggle={() => setExpanded((v) => !v)}
                sectionLabel="This week"
              />
            ) : (
              <article className="nlNewsArticle">
                <p className="nlNewsSection">Briefing</p>
                <h1 className="nlNewsHeadline">First edition coming soon</h1>
                <p className="nlNewsStandfirst">
                  You&apos;re unlocked. The next weekly brief will land here.
                </p>
              </article>
            )}

            <section className="nlNewsList" aria-label="Archive shortcut">
              <h2 className="nlNewsListTitle">Old articles</h2>
              <p className="nlTrackGridLead" style={{ marginBottom: '0.75rem' }}>
                Every published issue is saved.{' '}
                <Link to="/newsletter/archive" className="nlInlineLink">
                  Open the full archive
                </Link>
              </p>
              {mainArticles.slice(1, 5).length > 0 ? (
                <ul className="nlNewsListItems">
                  {mainArticles.slice(1, 5).map((item) => (
                    <li key={item.id}>
                      <Link to={articleHref(item)} className="nlNewsListLink">
                        <span className="nlNewsListLabel">{storyTypeLabel(item)}</span>
                        <span className="nlNewsListHeadline">{item.title}</span>
                        {item.publishedAt ? (
                          <time className="nlNewsListDate" dateTime={item.publishedAt}>
                            {formatNewsletterDate(item.publishedAt)}
                          </time>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="nlNewsStandfirst">Past weekly briefs will appear here after you publish more.</p>
              )}
            </section>
          </div>

          <NewsletterAside
            coveredIndustryIds={covered}
            archivePreview={access.issues.filter((i) => i.id !== latestMain?.id).slice(0, 5)}
          />
        </div>
      ) : null}

      {!access.loading && !access.unlocked ? (
        <p className="nlNewsLoading">Subscribe to open this week&apos;s edition.</p>
      ) : null}
    </NewsletterChrome>
  )
}

/** Track page: /newsletter/courses etc. */
export function NewsletterTrackPage() {
  const { pathname } = useLocation()
  const trackId =
    NEWSLETTER_TRACKS.find((t) => pathname === `/newsletter/${t.id}` || pathname.startsWith(`/newsletter/${t.id}?`))
      ?.id || ''
  const [searchParams, setSearchParams] = useSearchParams()
  const access = useNewsletterAccess()
  const [expanded, setExpanded] = useState(true)
  const track = trackMeta(trackId)

  const trackIssues = useMemo(
    () => access.issues.filter((i) => i.articleType === trackId),
    [access.issues, trackId],
  )
  const selectedSlug = searchParams.get('article')
  const featured =
    (selectedSlug && trackIssues.find((i) => i.slug === selectedSlug)) || trackIssues[0] || null
  const older = trackIssues.filter((i) => i.id !== featured?.id)

  useEffect(() => {
    setExpanded(true)
  }, [featured?.id])

  if (!track || !isNewsletterTrack(trackId)) {
    return (
      <div className="appShell nlShell">
        <main className="container nlNews">
          <p className="nlNewsLoading">
            Unknown newsletter. <Link to="/newsletter">Back home</Link>
          </p>
        </main>
      </div>
    )
  }

  return (
    <NewsletterChrome
      showGate={access.showGate}
      subscriberName={access.data?.subscriber?.firstName}
      onSignOut={access.onSignOut}
      gate={
        <SubscribeGate
          busy={access.busy}
          error={access.error}
          firstName={access.firstName}
          lastName={access.lastName}
          email={access.email}
          onFirstName={access.setFirstName}
          onLastName={access.setLastName}
          onEmail={access.setEmail}
          onSubmit={(e) => void access.onSubscribe(e)}
        />
      }
    >
      {access.loading ? <p className="nlNewsLoading">Loading…</p> : null}
      {!access.loading && access.unlocked ? (
        <div className="nlNewsGrid">
          <div className="nlNewsStoryCol">
            <nav className="nlBreadcrumb" aria-label="Breadcrumb">
              <Link to="/newsletter">Newsletter</Link>
              <span aria-hidden>/</span>
              <span>{track.label}</span>
            </nav>
            <p className="nlTrackPageLead">{track.blurb}</p>

            {featured ? (
              <ArticleReader
                article={featured}
                expanded={expanded}
                onToggle={() => setExpanded((v) => !v)}
                sectionLabel={track.label}
              />
            ) : (
              <article className="nlNewsArticle">
                <p className="nlNewsSection">{track.label}</p>
                <h1 className="nlNewsHeadline">First issue soon</h1>
                <p className="nlNewsStandfirst">
                  This page is ready. When the next {track.label.toLowerCase()} issue is posted, it
                  will show here.
                </p>
                <Link className="nlNewsContinue" to="/newsletter">
                  Back to this week&apos;s brief
                </Link>
              </article>
            )}

            <section className="nlNewsList" aria-label="Past issues">
              <h2 className="nlNewsListTitle">Past {track.shortLabel.toLowerCase()} issues</h2>
              {older.length === 0 ? (
                <p className="nlNewsStandfirst">
                  Older issues stay here when a new one is posted.{' '}
                  <Link to="/newsletter/archive" className="nlInlineLink">
                    Full archive
                  </Link>
                </p>
              ) : (
                <ul className="nlNewsListItems">
                  {older.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="nlNewsListLink"
                        onClick={() => {
                          setSearchParams(
                            (prev) => {
                              const next = new URLSearchParams(prev)
                              next.set('article', item.slug)
                              next.delete('token')
                              return next
                            },
                            { replace: true },
                          )
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        <span className="nlNewsListLabel">{track.shortLabel}</span>
                        <span className="nlNewsListHeadline">{item.title}</span>
                        {item.publishedAt ? (
                          <time className="nlNewsListDate" dateTime={item.publishedAt}>
                            {formatNewsletterDate(item.publishedAt)}
                          </time>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <NewsletterAside activeTrack={track.id} />
        </div>
      ) : null}
      {!access.loading && !access.unlocked ? (
        <p className="nlNewsLoading">Subscribe to open this newsletter.</p>
      ) : null}
    </NewsletterChrome>
  )
}

/** Full archive: /newsletter/archive */
export function NewsletterArchivePage() {
  const access = useNewsletterAccess()
  const [filter, setFilter] = useState<'all' | 'main' | NewsletterTrackId>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return access.issues
    return access.issues.filter((i) => i.articleType === filter)
  }, [access.issues, filter])

  return (
    <NewsletterChrome
      showGate={access.showGate}
      subscriberName={access.data?.subscriber?.firstName}
      onSignOut={access.onSignOut}
      gate={
        <SubscribeGate
          busy={access.busy}
          error={access.error}
          firstName={access.firstName}
          lastName={access.lastName}
          email={access.email}
          onFirstName={access.setFirstName}
          onLastName={access.setLastName}
          onEmail={access.setEmail}
          onSubmit={(e) => void access.onSubscribe(e)}
        />
      }
    >
      {access.loading ? <p className="nlNewsLoading">Loading archive…</p> : null}
      {!access.loading && access.unlocked ? (
        <div className="nlNewsGrid">
          <div className="nlNewsStoryCol">
            <nav className="nlBreadcrumb" aria-label="Breadcrumb">
              <Link to="/newsletter">Newsletter</Link>
              <span aria-hidden>/</span>
              <span>Archive</span>
            </nav>
            <article className="nlNewsArticle">
              <p className="nlNewsSection">Archive</p>
              <h1 className="nlNewsHeadline">Old articles</h1>
              <p className="nlNewsStandfirst">
                Every posted newsletter is saved here — weekly briefs and mini-newsletter issues.
              </p>
            </article>

            <div className="nlArchiveFilters" role="tablist" aria-label="Filter archive">
              <button
                type="button"
                className={filter === 'all' ? 'nlArchiveChip nlArchiveChipActive' : 'nlArchiveChip'}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={filter === 'main' ? 'nlArchiveChip nlArchiveChipActive' : 'nlArchiveChip'}
                onClick={() => setFilter('main')}
              >
                Weekly brief
              </button>
              {NEWSLETTER_TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={filter === t.id ? 'nlArchiveChip nlArchiveChipActive' : 'nlArchiveChip'}
                  onClick={() => setFilter(t.id)}
                >
                  {t.shortLabel}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="nlNewsStandfirst">No issues in this filter yet.</p>
            ) : (
              <section className="nlNewsList">
                <ul className="nlNewsListItems">
                  {filtered.map((item) => (
                    <li key={item.id}>
                      <Link to={articleHref(item)} className="nlNewsListLink">
                        <span className="nlNewsListLabel">{storyTypeLabel(item)}</span>
                        <span className="nlNewsListHeadline">{item.title}</span>
                        {item.publishedAt ? (
                          <time className="nlNewsListDate" dateTime={item.publishedAt}>
                            {formatNewsletterDate(item.publishedAt)}
                          </time>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <NewsletterAside />
        </div>
      ) : null}
      {!access.loading && !access.unlocked ? (
        <p className="nlNewsLoading">Subscribe to open the archive.</p>
      ) : null}
    </NewsletterChrome>
  )
}

/** Single issue by slug: /newsletter/:slug */
export function NewsletterIssuePage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const access = useNewsletterAccess()
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) writeNewsletterToken(token)
  }, [searchParams])

  useEffect(() => {
    if (!slug) return
    if (NEWSLETTER_RESERVED_SLUGS.has(slug)) return
    if (!access.unlocked || access.loading) return
    const found = access.issues.find((i) => i.slug === slug)
    if (found && isNewsletterTrack(found.articleType)) {
      navigate(`/newsletter/${found.articleType}?article=${encodeURIComponent(slug)}`, { replace: true })
    }
  }, [slug, access.unlocked, access.loading, access.issues, navigate])

  if (NEWSLETTER_RESERVED_SLUGS.has(slug)) {
    return null
  }

  const article = access.issues.find((i) => i.slug === slug) || null

  return (
    <NewsletterChrome
      showGate={access.showGate}
      subscriberName={access.data?.subscriber?.firstName}
      onSignOut={access.onSignOut}
      gate={
        <SubscribeGate
          busy={access.busy}
          error={access.error}
          firstName={access.firstName}
          lastName={access.lastName}
          email={access.email}
          onFirstName={access.setFirstName}
          onLastName={access.setLastName}
          onEmail={access.setEmail}
          onSubmit={(e) => void access.onSubscribe(e)}
        />
      }
    >
      {access.loading ? <p className="nlNewsLoading">Opening story…</p> : null}
      {!access.loading && access.unlocked ? (
        <div className="nlNewsGrid">
          <div className="nlNewsStoryCol">
            <nav className="nlBreadcrumb" aria-label="Breadcrumb">
              <Link to="/newsletter">Newsletter</Link>
              <span aria-hidden>/</span>
              <Link to="/newsletter/archive">Archive</Link>
              <span aria-hidden>/</span>
              <span>{article?.title || 'Story'}</span>
            </nav>
            {article ? (
              <ArticleReader
                article={article}
                expanded={expanded}
                onToggle={() => setExpanded((v) => !v)}
                sectionLabel={storyTypeLabel(article)}
              />
            ) : (
              <article className="nlNewsArticle">
                <p className="nlNewsSection">Archive</p>
                <h1 className="nlNewsHeadline">Story not found</h1>
                <p className="nlNewsStandfirst">
                  That issue may be unpublished.{' '}
                  <Link to="/newsletter/archive" className="nlInlineLink">
                    Browse the archive
                  </Link>
                </p>
              </article>
            )}
          </div>
          <NewsletterAside />
        </div>
      ) : null}
    </NewsletterChrome>
  )
}

export function NewsletterUnsubscribePage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Missing unsubscribe link.')
      return
    }
    void (async () => {
      try {
        await api('/api/newsletter/unsubscribe', { method: 'POST', json: { token } })
        clearNewsletterToken()
        setStatus('done')
        setMessage('You’ve been unsubscribed from School → Industry Weekly.')
      } catch (e) {
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Could not unsubscribe')
      }
    })()
  }, [searchParams])

  return (
    <div className="appShell nlShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Newsletter', to: '/newsletter', accent: 'red' },
        ]}
      />
      <main className="container nlNews">
        <article className="nlNewsArticle">
          <p className="nlNewsSection">Newsletter</p>
          <h1 className="nlNewsHeadline">Subscription</h1>
          <p className="nlNewsStandfirst">
            {status === 'idle' ? 'Updating your preference…' : message}
          </p>
          <Link className="nlNewsContinue" to="/newsletter">
            Back to the brief
          </Link>
        </article>
      </main>
    </div>
  )
}
