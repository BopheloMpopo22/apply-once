import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '../../api/adminClient'
import { NEWSLETTER_INDUSTRIES } from '../../data/newsletterIndustries'
import { ISSUE_0_TEMPLATE } from '../../utils/newsletterContent'

type AdminIssue = {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  body: string
  articleType: 'main' | 'industry'
  industry: string
  issueNumber: number
  published: boolean
  publishedAt: string | null
  emailSentAt: string | null
}

export function AdminNewsletterPanel(props: { onError: (msg: string | null) => void }) {
  const { onError } = props
  const [issues, setIssues] = useState<AdminIssue[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [kicker, setKicker] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [slug, setSlug] = useState('')
  const [articleType, setArticleType] = useState<'main' | 'industry'>('main')
  const [industry, setIndustry] = useState('')

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

  function startNew() {
    setEditingId(null)
    setTitle('')
    setKicker('')
    setSummary('')
    setBody('')
    setSlug('')
    setArticleType('main')
    setIndustry('')
    setMessage(null)
  }

  function startEdit(issue: AdminIssue) {
    setEditingId(issue.id)
    setTitle(issue.title)
    setKicker(issue.kicker)
    setSummary(issue.summary)
    setBody(issue.body)
    setSlug(issue.slug)
    setArticleType(issue.articleType === 'industry' ? 'industry' : 'main')
    setIndustry(issue.industry || '')
    setMessage(null)
  }

  function loadTemplate() {
    setArticleType('main')
    setIndustry('')
    setTitle(ISSUE_0_TEMPLATE.title)
    setKicker(ISSUE_0_TEMPLATE.kicker)
    setSummary(ISSUE_0_TEMPLATE.summary)
    setBody(ISSUE_0_TEMPLATE.body)
    setSlug('welcome-school-to-industry')
    setMessage('Loaded welcome main brief — edit, then save & publish.')
  }

  async function onSave(e: FormEvent, publish: boolean) {
    e.preventDefault()
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
        articleType,
        industry: articleType === 'industry' ? industry : '',
        published: publish,
        publish,
      }
      if (editingId) {
        await adminApi(`/api/admin/newsletter/issues/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          json: payload,
        })
        setMessage(publish ? 'Article updated and published.' : 'Article saved as draft.')
      } else {
        const res = await adminApi<{ issue: AdminIssue }>('/api/admin/newsletter/issues', {
          method: 'POST',
          json: payload,
        })
        setEditingId(res.issue.id)
        setSlug(res.issue.slug)
        setMessage(publish ? 'Article created and published.' : 'Draft created.')
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

  return (
    <section className="adminCard adminNewsletterCard">
      <div className="adminCardHeadRow">
        <div>
          <h2 className="adminCardTitle">School → Industry magazine</h2>
          <p className="adminCardLead">
            Public at <code className="adminMono">/newsletter</code> · {activeCount} active subscriber
            {activeCount === 1 ? '' : 's'}. Publish a <strong>main</strong> weekly brief and optional{' '}
            <strong>industry</strong> deep-dives.
          </p>
        </div>
        <div className="adminNewsletterActions">
          <button type="button" className="btn btnOutline btnSmall" disabled={busy} onClick={() => void refresh()}>
            Refresh
          </button>
          <button type="button" className="btn btnOutline btnSmall" onClick={startNew}>
            New article
          </button>
          <button type="button" className="btn btnGhost btnSmall" onClick={loadTemplate}>
            Load welcome template
          </button>
        </div>
      </div>

      {message ? <p className="adminOkMessage">{message}</p> : null}

      <form className="adminNewsletterForm" onSubmit={(e) => void onSave(e, false)}>
        <div className="adminNewsletterRow2">
          <label className="field">
            <span>Article type</span>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value === 'industry' ? 'industry' : 'main')}
            >
              <option value="main">Main weekly brief</option>
              <option value="industry">Industry / career deep-dive</option>
            </select>
          </label>
          {articleType === 'industry' ? (
            <label className="field">
              <span>Industry</span>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} required>
                <option value="">Select industry…</option>
                {NEWSLETTER_INDUSTRIES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Article title" />
        </label>
        <label className="field">
          <span>Kicker (week line)</span>
          <input
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
            placeholder="Week of 10 Aug · SA & Africa"
          />
        </label>
        <label className="field">
          <span>Summary (teaser under title)</span>
          <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One or two sentences" />
        </label>
        <label className="field">
          <span>URL slug (optional)</span>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" />
        </label>
        <label className="field">
          <span>Body (plain text: # Headings, - bullets, **bold**, blank line between paragraphs)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="adminNewsletterBody"
            placeholder="# This week in industry…"
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
            Save & publish
          </button>
        </div>
      </form>

      <h3 className="adminSubhead">Published & drafts</h3>
      {issues.length === 0 ? (
        <p className="adminMuted">No articles yet — load the welcome template and publish the main brief.</p>
      ) : (
        <ul className="adminNewsletterIssueList">
          {issues.map((issue) => (
            <li key={issue.id} className="adminNewsletterIssueRow">
              <div>
                <strong>
                  #{issue.issueNumber} · {issue.title}
                </strong>
                <p className="adminMuted">
                  {issue.articleType === 'industry'
                    ? `Industry · ${issue.industry || '—'}`
                    : 'Main brief'}
                  {' · '}
                  {issue.published ? 'Published' : 'Draft'}
                  {issue.emailSentAt
                    ? ` · emailed ${new Date(issue.emailSentAt).toLocaleString()}`
                    : issue.articleType === 'main'
                      ? ' · not emailed yet'
                      : ''}{' '}
                  · /newsletter?article={issue.slug}
                </p>
              </div>
              <div className="adminNewsletterRowActions">
                <button type="button" className="btn btnGhost btnSmall" onClick={() => startEdit(issue)}>
                  Edit
                </button>
                {issue.published && issue.articleType === 'main' ? (
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
