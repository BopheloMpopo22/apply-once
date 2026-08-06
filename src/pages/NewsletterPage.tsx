import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'
import { api } from '../api/client'
import {
  clearNewsletterToken,
  readNewsletterToken,
  writeNewsletterToken,
} from '../utils/newsletterAccess'
import { NEWSLETTER_BRAND, renderNewsletterBody } from '../utils/newsletterContent'

type IssueListItem = {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  issueNumber: number
  publishedAt: string | null
}

type FullIssue = IssueListItem & { body: string }

type IssuesResponse = {
  unlocked: boolean
  brand: { name: string; tagline: string }
  issues: IssueListItem[]
  subscriber: { firstName: string; lastName: string; email: string } | null
}

export function NewsletterPage() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(() => searchParams.get('token') || readNewsletterToken())
  const [data, setData] = useState<IssuesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [formMessage, setFormMessage] = useState<string | null>(null)

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
    setFormMessage(null)
    setError(null)
    try {
      const res = await api<{
        accessToken: string
        alreadySubscribed?: boolean
        restored?: boolean
      }>('/api/newsletter/subscribe', {
        method: 'POST',
        json: { firstName, lastName, email },
      })
      writeNewsletterToken(res.accessToken)
      setToken(res.accessToken)
      setFormMessage(
        res.alreadySubscribed
          ? 'Welcome back — you’re unlocked.'
          : 'You’re in. Read this week’s brief below — we’ll also email new issues.',
      )
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
    setData((prev) => (prev ? { ...prev, unlocked: false, subscriber: null } : prev))
    void load(null)
  }

  const unlocked = Boolean(data?.unlocked && token)
  const latest = data?.issues[0] ?? null

  return (
    <div className="appShell nlShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Programmes', to: '/programmes-for-work' },
        ]}
      />

      <header className="nlHero">
        <div className="container nlHeroInner">
          <p className="nlKicker">Free weekly brief · SA learners</p>
          <h1 className="nlTitle">{NEWSLETTER_BRAND.name}</h1>
          <p className="nlLead">{NEWSLETTER_BRAND.tagline}</p>
          <p className="nlHeroMeta muted">
            Share <strong>applyonce.org/newsletter</strong> in your bio — same newspaper online every week.
          </p>
        </div>
      </header>

      <main className="container nlMain">
        {error ? <div className="formError">{error}</div> : null}

        {!unlocked ? (
          <section className="nlSubscribeCard">
            <h2 className="nlSectionTitle">Get free access</h2>
            <p className="nlSectionLead muted">
              Enter your name and email to read every weekly issue on this site. We email new editions to the same
              address. We only use it for this free brief.
            </p>
            <form className="nlSubscribeForm" onSubmit={(e) => void onSubscribe(e)}>
              <label className="nlField">
                <span>First name</span>
                <input
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  placeholder="Thabo"
                />
              </label>
              <label className="nlField">
                <span>Surname</span>
                <input
                  className="input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  placeholder="Mokoena"
                />
              </label>
              <label className="nlField nlFieldFull">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </label>
              <button type="submit" className="btn btnBrand nlSubscribeBtn" disabled={busy}>
                {busy ? 'Saving…' : 'Unlock the newsletter'}
              </button>
            </form>
            {formMessage ? <p className="nlFormOk">{formMessage}</p> : null}
          </section>
        ) : (
          <section className="nlWelcomeBar">
            <p>
              Reading as{' '}
              <strong>
                {data?.subscriber?.firstName} {data?.subscriber?.lastName}
              </strong>{' '}
              ({data?.subscriber?.email})
            </p>
            <button type="button" className="btn btnGhost btnSmall" onClick={onSignOut}>
              Use a different email
            </button>
          </section>
        )}

        {loading ? (
          <p className="formLead">Loading issues…</p>
        ) : (
          <>
            {latest ? (
              <section className="nlLatestCard">
                <p className="nlIssueBadge">Latest · Issue {latest.issueNumber}</p>
                <h2 className="nlLatestTitle">{latest.title}</h2>
                {latest.kicker ? <p className="nlIssueKicker muted">{latest.kicker}</p> : null}
                <p className="nlLatestSummary">{latest.summary}</p>
                {unlocked ? (
                  <Link className="btn btnBrand" to={`/newsletter/${latest.slug}`}>
                    Read this week’s edition
                  </Link>
                ) : (
                  <p className="muted">Subscribe above to open the full newspaper page.</p>
                )}
              </section>
            ) : (
              <section className="nlLatestCard">
                <h2 className="nlLatestTitle">First edition coming soon</h2>
                <p className="nlLatestSummary">
                  Subscribe now so you’re first when Issue 1 goes live — industry news, what to study, and where to
                  apply.
                </p>
              </section>
            )}

            <section className="nlArchive">
              <h2 className="nlSectionTitle">All issues</h2>
              {data?.issues.length ? (
                <ul className="nlArchiveList">
                  {data.issues.map((issue) => (
                    <li key={issue.id}>
                      {unlocked ? (
                        <Link to={`/newsletter/${issue.slug}`} className="nlArchiveLink">
                          <span className="nlArchiveNum">#{issue.issueNumber}</span>
                          <span>
                            <strong>{issue.title}</strong>
                            <span className="muted nlArchiveMeta">
                              {issue.kicker ||
                                (issue.publishedAt
                                  ? new Date(issue.publishedAt).toLocaleDateString('en-ZA', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '')}
                            </span>
                          </span>
                        </Link>
                      ) : (
                        <div className="nlArchiveLink nlArchiveLocked">
                          <span className="nlArchiveNum">#{issue.issueNumber}</span>
                          <span>
                            <strong>{issue.title}</strong>
                            <span className="muted nlArchiveMeta">Subscribe to read</span>
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No published issues yet — check back after the first send.</p>
              )}
            </section>

            <section className="nlCta">
              <h2 className="nlSectionTitle">Turn reading into applying</h2>
              <p className="muted">
                Opportunities we mention live on Apply Once too — graduate programmes, learnerships, courses, and more.
              </p>
              <div className="nlCtaActions">
                <Link className="btn btnBrand" to="/programmes-for-work">
                  Programmes for work
                </Link>
                <Link className="btn btnOutline" to="/application">
                  Application form
                </Link>
              </div>
            </section>
          </>
        )}
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
  const token = useMemo(() => searchParams.get('token') || readNewsletterToken(), [searchParams])
  const [issue, setIssue] = useState<FullIssue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const fromUrl = searchParams.get('token')
    if (fromUrl) writeNewsletterToken(fromUrl)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setLocked(false)
      try {
        const q = token ? `?token=${encodeURIComponent(token)}` : ''
        const res = await api<{ issue: FullIssue }>(`/api/newsletter/issues/${encodeURIComponent(slug)}${q}`)
        if (!cancelled) setIssue(res.issue)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : 'Could not load issue'
        if (/subscribe|locked|403/i.test(msg)) {
          setLocked(true)
          setError(null)
        } else {
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug, token])

  return (
    <div className="appShell nlShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Newsletter', to: '/newsletter' },
          { label: 'Home', to: '/' },
        ]}
      />
      <main className="container nlIssueMain">
        <Link className="nlBack" to="/newsletter">
          ← All issues
        </Link>
        {loading ? <p className="formLead">Loading edition…</p> : null}
        {error ? <div className="formError">{error}</div> : null}
        {locked ? (
          <section className="nlSubscribeCard">
            <h2 className="nlSectionTitle">Subscribe to read this issue</h2>
            <p className="muted">Full editions are free — enter your name and email on the newsletter page.</p>
            <button type="button" className="btn btnBrand" onClick={() => navigate('/newsletter')}>
              Go to subscribe
            </button>
          </section>
        ) : null}
        {issue ? (
          <article className="nlPaper">
            <p className="nlIssueBadge">
              Issue {issue.issueNumber}
              {issue.publishedAt
                ? ` · ${new Date(issue.publishedAt).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}`
                : ''}
            </p>
            {issue.kicker ? <p className="nlIssueKicker">{issue.kicker}</p> : null}
            <h1 className="nlPaperTitle">{issue.title}</h1>
            {issue.summary ? <p className="nlPaperDeck">{issue.summary}</p> : null}
            <div className="nlPaperBody">{renderNewsletterBody(issue.body || '')}</div>
            <footer className="nlPaperFoot">
              <p className="muted">
                From <strong>Apply Once</strong> — explore{' '}
                <Link to="/programmes-for-work">programmes for work</Link> and{' '}
                <Link to="/application">apply once</Link>.
              </p>
            </footer>
          </article>
        ) : null}
      </main>
      <SiteFooter brand={{ name: 'Apply Once', description: 'School to industry — one profile, clearer options.' }} />
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
      <Navbar variant="light" logo={<ApplyOnceLogo />} links={[{ label: 'Home', to: '/' }]} />
      <main className="container nlMain">
        <section className="nlSubscribeCard">
          <h1 className="nlSectionTitle">Newsletter</h1>
          <p>{status === 'idle' ? 'Updating your preference…' : message}</p>
          <Link className="btn btnOutline btnSmall" to="/newsletter">
            Back to newsletter
          </Link>
        </section>
      </main>
    </div>
  )
}
