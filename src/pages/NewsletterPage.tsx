import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'
import { api } from '../api/client'
import { NEWSLETTER_INDUSTRIES, industryLabel } from '../data/newsletterIndustries'
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

type MagArticle = {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  body?: string
  articleType: 'main' | 'industry'
  industry: string
  issueNumber: number
  publishedAt: string | null
}

type IssuesResponse = {
  unlocked: boolean
  brand: { name: string; tagline: string }
  issues: MagArticle[]
  subscriber: { firstName: string; lastName: string; email: string } | null
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function articleTeaser(article: MagArticle): string {
  if (article.summary?.trim()) return article.summary.trim()
  if (article.body) return firstBodyParagraph(article.body)
  return ''
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
        <div className="nlGateBadge">Free · weekly</div>
        <h1 id="nl-gate-title" className="nlGateTitle">
          School → Industry Weekly
        </h1>
        <p className="nlGateLead">
          Get the weekly magazine of industry and opportunity news for learners in South Africa —
          and across Africa. What&apos;s moving in banking, mining, tech, healthcare, and more; what
          schools and skills open doors; and where to apply next.
        </p>
        <ul className="nlGateBullets">
          <li>Main weekly brief covering industries, school, and opportunities</li>
          <li>Career rails for mining, banking, engineering, tech, and more</li>
          <li>Free to read online · same email for the weekly send</li>
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
            {busy ? 'Unlocking…' : 'Unlock the magazine'}
          </button>
        </form>
        <p className="nlGateFoot">
          We only use your details for this free brief. No spam.{' '}
          <Link to="/">Back to Apply Once</Link>
        </p>
      </div>
    </div>
  )
}

export function NewsletterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [token, setToken] = useState(() => searchParams.get('token') || readNewsletterToken())
  const [data, setData] = useState<IssuesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    () => searchParams.get('article') || null,
  )

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

  useEffect(() => {
    const a = searchParams.get('article')
    if (a) setSelectedSlug(a)
  }, [searchParams])

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
    setExpanded(false)
    void load(null)
  }

  const unlocked = Boolean(data?.unlocked && token)
  const issues = data?.issues ?? []
  const mainArticles = useMemo(
    () => issues.filter((i) => i.articleType !== 'industry'),
    [issues],
  )
  const industryArticles = useMemo(
    () => issues.filter((i) => i.articleType === 'industry'),
    [issues],
  )

  const featured: MagArticle | null = useMemo(() => {
    if (selectedSlug) {
      const found = issues.find((i) => i.slug === selectedSlug)
      if (found) return found
    }
    if (activeIndustry) {
      const forIndustry = industryArticles.filter((i) => i.industry === activeIndustry)
      if (forIndustry[0]) return forIndustry[0]
    }
    return mainArticles[0] ?? industryArticles[0] ?? null
  }, [selectedSlug, activeIndustry, issues, mainArticles, industryArticles])

  useEffect(() => {
    setExpanded(false)
  }, [featured?.id])

  function openArticle(article: MagArticle) {
    setSelectedSlug(article.slug)
    if (article.articleType === 'industry' && article.industry) {
      setActiveIndustry(article.industry)
    } else {
      setActiveIndustry(null)
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('article', article.slug)
        next.delete('token')
        return next
      },
      { replace: true },
    )
    setExpanded(false)
  }

  const carouselItems = useMemo(() => {
    const rest = issues.filter((i) => i.id !== featured?.id)
    return rest.length ? rest : issues
  }, [issues, featured?.id])

  const teaser = featured ? articleTeaser(featured) : ''
  const industryHasArticle = useMemo(() => {
    const set = new Set(industryArticles.map((i) => i.industry))
    return set
  }, [industryArticles])

  const showGate = !unlocked && (!token || !loading)

  return (
    <div className={`appShell nlShell ${showGate ? 'nlShellLocked' : ''}`}>
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Programmes', to: '/programmes-for-work' },
          { label: 'Newsletter', to: '/newsletter', accent: 'purple' },
        ]}
      />

      {showGate ? (
        <SubscribeGate
          busy={busy}
          error={error}
          firstName={firstName}
          lastName={lastName}
          email={email}
          onFirstName={setFirstName}
          onLastName={setLastName}
          onEmail={setEmail}
          onSubmit={(e) => void onSubscribe(e)}
        />
      ) : null}

      <header className="nlMagHero">
        <div className="container nlMagHeroInner">
          <p className="nlMagKicker">Online magazine · SA & Africa</p>
          <h1 className="nlMagTitle">{NEWSLETTER_BRAND.name}</h1>
          <p className="nlMagLead">{NEWSLETTER_BRAND.tagline}</p>
          {unlocked && data?.subscriber ? (
            <div className="nlMagReader">
              <span>
                Reading as <strong>{data.subscriber.firstName}</strong>
              </span>
              <button type="button" className="nlMagLinkBtn" onClick={onSignOut}>
                Use another email
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="container nlMagLayout">
        {loading ? <p className="formLead">Loading magazine…</p> : null}
        {!loading && unlocked && error ? <div className="formError">{error}</div> : null}

        {!loading && unlocked ? (
          <>
            <aside className="nlMagRail" aria-label="Industries">
              <p className="nlMagRailTitle">Careers & industries</p>
              <button
                type="button"
                className={`nlMagRailItem ${!activeIndustry ? 'nlMagRailItemActive' : ''}`}
                onClick={() => {
                  setActiveIndustry(null)
                  if (mainArticles[0]) openArticle(mainArticles[0])
                  else {
                    setSelectedSlug(null)
                    setSearchParams(
                      (prev) => {
                        const next = new URLSearchParams(prev)
                        next.delete('article')
                        return next
                      },
                      { replace: true },
                    )
                  }
                }}
              >
                This week&apos;s brief
              </button>
              {NEWSLETTER_INDUSTRIES.map((ind) => (
                <button
                  key={ind.id}
                  type="button"
                  className={`nlMagRailItem ${activeIndustry === ind.id ? 'nlMagRailItemActive' : ''}`}
                  onClick={() => {
                    setActiveIndustry(ind.id)
                    const hit = industryArticles.find((a) => a.industry === ind.id)
                    if (hit) openArticle(hit)
                    else {
                      setSelectedSlug(null)
                      setSearchParams(
                        (prev) => {
                          const next = new URLSearchParams(prev)
                          next.delete('article')
                          return next
                        },
                        { replace: true },
                      )
                    }
                  }}
                >
                  {ind.label}
                  {industryHasArticle.has(ind.id) ? (
                    <span className="nlMagRailDot" aria-label="Has articles" />
                  ) : null}
                </button>
              ))}
            </aside>

            <section className="nlMagMain" aria-label="Featured article">
              {featured ? (
                <article className="nlMagArticle">
                  <div className="nlMagArticleMeta">
                    <span className="nlMagChip">
                      {featured.articleType === 'industry'
                        ? industryLabel(featured.industry)
                        : 'Main brief'}
                    </span>
                    {featured.publishedAt ? (
                      <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                    ) : null}
                  </div>
                  {featured.kicker ? <p className="nlMagArticleKicker">{featured.kicker}</p> : null}
                  <h2 className="nlMagArticleTitle">{featured.title}</h2>
                  {teaser ? <p className="nlMagArticleTeaser">{teaser}</p> : null}

                  {expanded && featured.body ? (
                    <div className="nlMagArticleBody">{renderNewsletterBody(featured.body)}</div>
                  ) : null}

                  {featured.body ? (
                    <button
                      type="button"
                      className="nlReadMore"
                      aria-expanded={expanded}
                      onClick={() => setExpanded((v) => !v)}
                    >
                      <span>{expanded ? 'Show less' : 'Read more'}</span>
                      <span className={`nlReadMoreArrow ${expanded ? 'nlReadMoreArrowUp' : ''}`} aria-hidden>
                        ↓
                      </span>
                    </button>
                  ) : (
                    <p className="muted">Full story is loading…</p>
                  )}
                </article>
              ) : activeIndustry ? (
                <div className="nlMagEmpty">
                  <h2>More coming on {industryLabel(activeIndustry)}</h2>
                  <p>
                    We&apos;re building industry deep-dives each week. Check the main brief, or pick
                    another career on the left.
                  </p>
                  <button
                    type="button"
                    className="nlReadMore"
                    onClick={() => {
                      setActiveIndustry(null)
                      if (mainArticles[0]) openArticle(mainArticles[0])
                    }}
                  >
                    Back to this week&apos;s brief
                  </button>
                </div>
              ) : (
                <div className="nlMagEmpty">
                  <h2>First edition coming soon</h2>
                  <p>You&apos;re unlocked — the next weekly magazine drops here.</p>
                </div>
              )}

              {carouselItems.length > 0 ? (
                <section className="nlCarousel" aria-label="More stories">
                  <div className="nlCarouselHead">
                    <h3 className="nlCarouselTitle">Past briefs & industry stories</h3>
                    <p className="nlCarouselHint">Slide through older main pieces and career deep-dives</p>
                  </div>
                  <div className="nlCarouselTrackWrap">
                    <div className="nlCarouselTrack">
                      {[...carouselItems, ...carouselItems].map((item, idx) => (
                        <button
                          key={`${item.id}-${idx}`}
                          type="button"
                          className="nlCarouselCard"
                          onClick={() => openArticle(item)}
                        >
                          <span className="nlCarouselCardTag">
                            {item.articleType === 'industry'
                              ? industryLabel(item.industry)
                              : 'Main brief'}
                          </span>
                          <strong className="nlCarouselCardTitle">{item.title}</strong>
                          <span className="nlCarouselCardDate">{formatDate(item.publishedAt)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="nlCta nlMagCta">
                <h2 className="nlMagCtaTitle">Turn reading into applying</h2>
                <p>Opportunities we mention live on Apply Once — programmes, learnerships, and more.</p>
                <div className="nlCtaActions">
                  <Link className="nlMagBtn" to="/programmes-for-work">
                    Programmes for work
                  </Link>
                  <Link className="nlMagBtn nlMagBtnGhost" to="/application">
                    Application form
                  </Link>
                </div>
              </section>
            </section>
          </>
        ) : null}

        {!loading && !unlocked ? (
          <p className="nlLockedHint muted">Subscribe above to open this week&apos;s magazine.</p>
        ) : null}
      </main>

      <SiteFooter
        brand={{ name: 'Apply Once', description: 'School to industry — one profile, clearer options.' }}
        legalLinks={[
          { label: 'About', to: '/about' },
          { label: 'Newsletter', to: '/newsletter' },
          { label: 'Terms', to: '/terms' },
          { label: 'Contact', to: '/contact' },
        ]}
      />
    </div>
  )
}

export function NewsletterIssuePage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) writeNewsletterToken(token)
    const q = new URLSearchParams()
    if (token) q.set('token', token)
    if (slug) q.set('article', slug)
    navigate(`/newsletter?${q.toString()}`, { replace: true })
  }, [navigate, searchParams, slug])

  return (
    <div className="appShell nlShell">
      <p className="formLead" style={{ padding: '2rem' }}>
        Opening magazine…
      </p>
    </div>
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
          { label: 'Newsletter', to: '/newsletter', accent: 'purple' },
        ]}
      />
      <main className="container nlMagLayout">
        <section className="nlMagEmpty" style={{ gridColumn: '1 / -1' }}>
          <h1 className="nlMagArticleTitle">Newsletter</h1>
          <p>{status === 'idle' ? 'Updating your preference…' : message}</p>
          <Link className="nlMagBtn nlMagBtnGhost" to="/newsletter">
            Back to newsletter
          </Link>
        </section>
      </main>
    </div>
  )
}
