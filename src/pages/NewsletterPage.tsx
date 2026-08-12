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
    month: 'long',
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
        <p className="nlGateSection">School → Industry Weekly</p>
        <h1 id="nl-gate-title" className="nlGateTitle">
          Free weekly industry news for learners
        </h1>
        <p className="nlGateLead">
          What&apos;s moving in South Africa and across Africa — industries, school pathways, and where to
          apply. One brief each week, plus deeper stories by career.
        </p>
        <ul className="nlGateBullets">
          <li>Main weekly briefing across industries and opportunities</li>
          <li>Career sections: mining, banking, tech, health, and more</li>
          <li>Free to read online · emailed to the same address</li>
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
          We only use your details for this free brief.{' '}
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

  function openBrief() {
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
  }

  function selectIndustry(id: string) {
    setActiveIndustry(id)
    const hit = industryArticles.find((a) => a.industry === id)
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
  }

  const moreStories = useMemo(() => {
    return issues.filter((i) => i.id !== featured?.id)
  }, [issues, featured?.id])

  const teaser = featured ? articleTeaser(featured) : ''
  const showGate = !unlocked && (!token || !loading)

  const sectionLabel = featured
    ? featured.articleType === 'industry'
      ? industryLabel(featured.industry)
      : 'This week'
    : activeIndustry
      ? industryLabel(activeIndustry)
      : 'Briefing'

  return (
    <div className={`appShell nlShell ${showGate ? 'nlShellLocked' : ''}`}>
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Programmes', to: '/programmes-for-work' },
          { label: 'Newsletter', to: '/newsletter', accent: 'red' },
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

      <main className="container nlNews">
        {loading ? <p className="nlNewsLoading">Loading edition…</p> : null}
        {!loading && unlocked && error ? <div className="formError">{error}</div> : null}

        {!loading && unlocked ? (
          <div className="nlNewsGrid">
            <div className="nlNewsStoryCol">
              <div className="nlNewsMasthead">
                <span className="nlNewsBrand">{NEWSLETTER_BRAND.name}</span>
                <span className="nlNewsMastDot" aria-hidden>
                  ·
                </span>
                <span className="nlNewsMastMeta">SA &amp; Africa</span>
                {data?.subscriber ? (
                  <>
                    <span className="nlNewsMastDot" aria-hidden>
                      ·
                    </span>
                    <button type="button" className="nlNewsTextBtn" onClick={onSignOut}>
                      Signed in as {data.subscriber.firstName}
                    </button>
                  </>
                ) : null}
              </div>

              {featured ? (
                <article className="nlNewsArticle">
                  <p className="nlNewsSection">{sectionLabel}</p>
                  <h1 className="nlNewsHeadline">{featured.title}</h1>
                  <p className="nlNewsByline">
                    By Apply Once
                    {featured.publishedAt ? (
                      <>
                        <span aria-hidden> · </span>
                        <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                      </>
                    ) : null}
                    {featured.kicker ? (
                      <>
                        <span aria-hidden> · </span>
                        <span>{featured.kicker}</span>
                      </>
                    ) : null}
                  </p>

                  {teaser ? <p className="nlNewsStandfirst">{teaser}</p> : null}

                  {expanded && featured.body ? (
                    <div className="nlNewsBody">{renderNewsletterBody(featured.body)}</div>
                  ) : null}

                  {featured.body ? (
                    <button
                      type="button"
                      className="nlNewsContinue"
                      aria-expanded={expanded}
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded ? 'Show less ▲' : 'Continue reading ▼'}
                    </button>
                  ) : null}
                </article>
              ) : activeIndustry ? (
                <article className="nlNewsArticle">
                  <p className="nlNewsSection">{industryLabel(activeIndustry)}</p>
                  <h1 className="nlNewsHeadline">Story coming soon</h1>
                  <p className="nlNewsStandfirst">
                    We&apos;re building industry deep-dives each week. Read this week&apos;s main brief, or
                    choose another career on the right.
                  </p>
                  <button type="button" className="nlNewsContinue" onClick={openBrief}>
                    Back to this week&apos;s brief
                  </button>
                </article>
              ) : (
                <article className="nlNewsArticle">
                  <p className="nlNewsSection">Briefing</p>
                  <h1 className="nlNewsHeadline">First edition coming soon</h1>
                  <p className="nlNewsStandfirst">
                    You&apos;re unlocked. The next weekly brief will land here — headline first, full story
                    below.
                  </p>
                </article>
              )}

              {moreStories.length > 0 ? (
                <section className="nlNewsList" aria-label="More stories">
                  <h2 className="nlNewsListTitle">More stories</h2>
                  <ul className="nlNewsListItems">
                    {moreStories.map((item) => (
                      <li key={item.id}>
                        <button type="button" className="nlNewsListLink" onClick={() => openArticle(item)}>
                          <span className="nlNewsListLabel">
                            {item.articleType === 'industry'
                              ? industryLabel(item.industry)
                              : 'This week'}
                          </span>
                          <span className="nlNewsListHeadline">{item.title}</span>
                          {item.publishedAt ? (
                            <time className="nlNewsListDate" dateTime={item.publishedAt}>
                              {formatDate(item.publishedAt)}
                            </time>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="nlNewsFooterLinks">
                <p>
                  Turn reading into applying —{' '}
                  <Link to="/programmes-for-work">programmes for work</Link>
                  {' · '}
                  <Link to="/application">application form</Link>
                </p>
              </section>
            </div>

            <aside className="nlNewsAside" aria-label="Sections and industries">
              <p className="nlNewsAsideTitle">Sections</p>
              <ul className="nlNewsAsideLinks">
                <li>
                  <button
                    type="button"
                    className={`nlNewsAsideLink ${!activeIndustry ? 'nlNewsAsideLinkActive' : ''}`}
                    onClick={openBrief}
                  >
                    This week&apos;s brief
                  </button>
                </li>
              </ul>

              <p className="nlNewsAsideTitle">Industries</p>
              <ul className="nlNewsAsideLinks">
                {NEWSLETTER_INDUSTRIES.map((ind) => (
                  <li key={ind.id}>
                    <button
                      type="button"
                      className={`nlNewsAsideLink ${activeIndustry === ind.id ? 'nlNewsAsideLinkActive' : ''}`}
                      onClick={() => selectIndustry(ind.id)}
                    >
                      {ind.label}
                    </button>
                  </li>
                ))}
              </ul>

              {mainArticles.length > 1 ? (
                <>
                  <p className="nlNewsAsideTitle">From the archive</p>
                  <ul className="nlNewsAsideLinks">
                    {mainArticles.slice(1, 6).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="nlNewsAsideLink"
                          onClick={() => openArticle(item)}
                        >
                          {item.title}
                          {item.publishedAt ? (
                            <span className="nlNewsAsideDate">{formatDate(item.publishedAt)}</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </aside>
          </div>
        ) : null}

        {!loading && !unlocked ? (
          <p className="nlNewsLoading">Subscribe to open this week&apos;s edition.</p>
        ) : null}
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
      <p className="nlNewsLoading">Opening story…</p>
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
