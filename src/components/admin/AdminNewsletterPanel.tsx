import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { adminApi } from '../../api/adminClient'
import { NEWSLETTER_INDUSTRIES } from '../../data/newsletterIndustries'
import {
  NEWSLETTER_TRACKS,
  isNewsletterTrack,
  trackLabel,
  type NewsletterArticleType,
  type NewsletterTrackId,
} from '../../data/newsletterTracks'
import { ISSUE_0_TEMPLATE } from '../../utils/newsletterContent'

type AdminIssue = {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  body: string
  articleType: NewsletterArticleType
  industry: string
  coveredIndustries?: string[]
  issueNumber: number
  published: boolean
  publishedAt: string | null
  emailSentAt: string | null
}

type AdminTab = 'main' | NewsletterTrackId | 'archive'

const TABS: { id: AdminTab; label: string; hint: string }[] = [
  { id: 'main', label: "This week's brief", hint: 'The main weekly newsletter on /newsletter' },
  ...NEWSLETTER_TRACKS.map((t) => ({
    id: t.id as AdminTab,
    label: t.label,
    hint: `Posts to /newsletter/${t.id}`,
  })),
  { id: 'archive', label: 'Archive', hint: 'Every saved draft and published issue' },
]

function issueTypeLabel(issue: AdminIssue): string {
  if (issue.articleType === 'industry') return `Industry · ${issue.industry || '—'}`
  if (isNewsletterTrack(issue.articleType)) return trackLabel(issue.articleType)
  return 'Weekly brief'
}

function publicPath(issue: AdminIssue): string {
  if (isNewsletterTrack(issue.articleType)) {
    return `/newsletter/${issue.articleType}?article=${issue.slug}`
  }
  return `/newsletter/${issue.slug}`
}

export function AdminNewsletterPanel(props: { onError: (msg: string | null) => void }) {
  const { onError } = props
  const [issues, setIssues] = useState<AdminIssue[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tab, setTab] = useState<AdminTab>('main')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [kicker, setKicker] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [slug, setSlug] = useState('')
  const [coveredIndustries, setCoveredIndustries] = useState<string[]>([])

  const articleTypeForTab = (t: AdminTab): NewsletterArticleType =>
    t === 'archive' ? 'main' : t

  const refresh = useCallback(async () => {
    setBusy(true)
    onError(null)
    try {
      const [issuesRes, subsRes] = await Promise.all([
        adminApi<{ issues: AdminIssue[] }>('/api/admin/newsletter/issues'),
        adminApi<{ activeCount: number }>('/api/admin/newsletter/subscribers'),
      ])
      setIssues(issuesRes.issues)
      setActiveCount(subsRes.activeCount)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not load newsletter admin')
    } finally {
      setBusy(false)
    }
  }, [onError])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const listForTab = useMemo(() => {
    if (tab === 'archive') return issues
    return issues.filter((i) => i.articleType === tab)
  }, [issues, tab])

  function resetForm(forTab: AdminTab) {
    setEditingId(null)
    setTitle('')
    setKicker('')
    setSummary('')
    setBody('')
    setSlug('')
    setCoveredIndustries([])
    setMessage(null)
    if (forTab !== 'archive' && forTab !== 'main') {
      setKicker(`Week of · ${trackLabel(forTab)}`)
    }
  }

  function switchTab(next: AdminTab) {
    setTab(next)
    resetForm(next)
  }

  function startEdit(issue: AdminIssue) {
    if (issue.articleType === 'main' || isNewsletterTrack(issue.articleType)) {
      setTab(issue.articleType)
    } else {
      setTab('archive')
    }
    setEditingId(issue.id)
    setTitle(issue.title)
    setKicker(issue.kicker)
    setSummary(issue.summary)
    setBody(issue.body)
    setSlug(issue.slug)
    setCoveredIndustries(issue.coveredIndustries || [])
    setMessage(null)
  }

  function loadTemplate() {
    setTab('main')
    setEditingId(null)
    setTitle(ISSUE_0_TEMPLATE.title)
    setKicker(ISSUE_0_TEMPLATE.kicker)
    setSummary(ISSUE_0_TEMPLATE.summary)
    setBody(ISSUE_0_TEMPLATE.body)
    setSlug('welcome-school-to-industry')
    setCoveredIndustries([])
    setMessage('Loaded welcome weekly brief — tick industries you cover, then save & publish.')
  }

  function toggleIndustry(id: string) {
    setCoveredIndustries((prev) => {
      const on = prev.includes(id)
      const next = on ? prev.filter((x) => x !== id) : [...prev, id]
      if (!on) {
        const label = NEWSLETTER_INDUSTRIES.find((i) => i.id === id)?.label || id
        const heading = `## ${label}`
        if (!body.includes(heading)) {
          setBody((b) => `${b.trim()}${b.trim() ? '\n\n' : ''}${heading}\n\nWrite about ${label} here.\n`)
        }
      }
      return next
    })
  }

  async function onSave(e: FormEvent, publish: boolean) {
    e.preventDefault()
    if (tab === 'archive') {
      onError('Pick a newsletter tab (This week’s brief or a mini newsletter) to write.')
      return
    }
    setBusy(true)
    onError(null)
    setMessage(null)
    try {
      const payload = {
        title,
        kicker,
        summary,
        body,
        slug,
        articleType: articleTypeForTab(tab),
        industry: '',
        coveredIndustries: tab === 'main' ? coveredIndustries : [],
        published: publish,
        publish,
      }
      if (editingId) {
        await adminApi(`/api/admin/newsletter/issues/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          json: payload,
        })
        setMessage(publish ? 'Posted — it is live on the site.' : 'Saved as draft.')
      } else {
        const res = await adminApi<{ issue: AdminIssue }>('/api/admin/newsletter/issues', {
          method: 'POST',
          json: payload,
        })
        setEditingId(res.issue.id)
        setSlug(res.issue.slug)
        setMessage(publish ? 'Posted — it is live on the site.' : 'Draft created.')
      }
      await refresh()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not save issue')
    } finally {
      setBusy(false)
    }
  }

  async function onSend(issueId: string) {
    if (!window.confirm(`Email this issue to all ${activeCount} active subscriber(s)?`)) return
    setBusy(true)
    onError(null)
    setMessage(null)
    try {
      const res = await adminApi<{ sent: number; failed: number; total: number; errors?: string[] }>(
        `/api/admin/newsletter/issues/${encodeURIComponent(issueId)}/send`,
        { method: 'POST', json: {} },
      )
      setMessage(
        `Email done — sent ${res.sent}/${res.total}` +
          (res.failed ? ` (${res.failed} failed${res.errors?.length ? `: ${res.errors[0]}` : ''})` : '.'),
      )
      await refresh()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not send emails')
    } finally {
      setBusy(false)
    }
  }

  const tabMeta = TABS.find((t) => t.id === tab)
  const showEditor = tab !== 'archive'

  return (
    <section className="adminCard adminNewsletterCard">
      <div className="adminCardHeadRow">
        <div>
          <h2 className="adminCardTitle">School → Industry magazine</h2>
          <p className="adminCardLead">
            Public at <code className="adminMono">/newsletter</code> · {activeCount} subscriber
            {activeCount === 1 ? '' : 's'}. Each tab is its own newsletter space — write, post, email.
          </p>
        </div>
        <div className="adminNewsletterActions">
          <button type="button" className="btn btnOutline btnSmall" disabled={busy} onClick={() => void refresh()}>
            Refresh
          </button>
          {showEditor ? (
            <button type="button" className="btn btnOutline btnSmall" onClick={() => resetForm(tab)}>
              New blank issue
            </button>
          ) : null}
          <button type="button" className="btn btnGhost btnSmall" onClick={loadTemplate}>
            Load welcome template
          </button>
        </div>
      </div>

      <div className="adminNewsletterTabs" role="tablist" aria-label="Newsletter spaces">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'adminNewsletterTab adminNewsletterTabActive' : 'adminNewsletterTab'}
            onClick={() => switchTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabMeta ? <p className="adminMuted adminNewsletterTabHint">{tabMeta.hint}</p> : null}

      {message ? <p className="adminOkMessage">{message}</p> : null}

      {showEditor ? (
        <form className="adminNewsletterForm" onSubmit={(e) => void onSave(e, false)}>
          {tab === 'main' ? (
            <fieldset className="adminNewsletterIndustries">
              <legend>Industries in this week&apos;s brief</legend>
              <p className="adminMuted">
                Tick an industry when you write about it. That turns the right-side link on for readers
                and adds a <code>## Heading</code> in the body for you to fill in.
              </p>
              <div className="adminNewsletterIndustryGrid">
                {NEWSLETTER_INDUSTRIES.map((ind) => (
                  <label key={ind.id} className="adminNewsletterIndustryCheck">
                    <input
                      type="checkbox"
                      checked={coveredIndustries.includes(ind.id)}
                      onChange={() => toggleIndustry(ind.id)}
                    />
                    <span>{ind.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Issue title" />
          </label>
          <label className="field">
            <span>Kicker (week line)</span>
            <input
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              placeholder="Week of 12 Oct · SA & Africa"
            />
          </label>
          <label className="field">
            <span>Summary (teaser)</span>
            <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One or two sentences" />
          </label>
          <label className="field">
            <span>URL slug (optional)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" />
          </label>
          <label className="field">
            <span>Body (plain text: # Headings, - bullets, **bold**)</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="adminNewsletterBody"
              placeholder={
                tab === 'main'
                  ? '# This week…\n\n## Mining\n\n…'
                  : `# ${tabMeta?.label || 'Issue'}\n\nWrite this week’s finds…`
              }
              required
            />
          </label>
          <div className="adminNewsletterFormActions">
            <button type="submit" className="btn btnOutline" disabled={busy || !title.trim()}>
              Save draft
            </button>
            <button
              type="button"
              className="btn btnDark"
              disabled={busy || !title.trim()}
              onClick={(e) => void onSave(e, true)}
            >
              Post (publish)
            </button>
          </div>
        </form>
      ) : null}

      <h3 className="adminSubhead">
        {tab === 'archive' ? 'All issues' : `Issues in ${tabMeta?.label || 'this space'}`}
      </h3>
      {listForTab.length === 0 ? (
        <p className="adminMuted">
          {tab === 'archive'
            ? 'Nothing saved yet.'
            : 'Blank space ready — write above and press Post. Older posts stay listed here.'}
        </p>
      ) : (
        <ul className="adminNewsletterIssueList">
          {listForTab.map((issue) => (
            <li key={issue.id} className="adminNewsletterIssueRow">
              <div>
                <strong>
                  #{issue.issueNumber} · {issue.title}
                </strong>
                <p className="adminMuted">
                  {issueTypeLabel(issue)}
                  {' · '}
                  {issue.published ? 'Published' : 'Draft'}
                  {issue.articleType === 'main' && issue.coveredIndustries?.length
                    ? ` · industries: ${issue.coveredIndustries.join(', ')}`
                    : ''}
                  {issue.emailSentAt
                    ? ` · emailed ${new Date(issue.emailSentAt).toLocaleString()}`
                    : ' · not emailed yet'}{' '}
                  · {publicPath(issue)}
                </p>
              </div>
              <div className="adminNewsletterRowActions">
                <button type="button" className="btn btnGhost btnSmall" onClick={() => startEdit(issue)}>
                  Edit
                </button>
                {issue.published ? (
                  <button
                    type="button"
                    className="btn btnBrand btnSmall"
                    disabled={busy}
                    onClick={() => void onSend(issue.id)}
                  >
                    Email subscribers
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
