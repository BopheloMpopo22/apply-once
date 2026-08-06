import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '../../api/adminClient'
import { ISSUE_0_TEMPLATE } from '../../utils/newsletterContent'

type AdminIssue = {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  body: string
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
    setMessage(null)
  }

  function startEdit(issue: AdminIssue) {
    setEditingId(issue.id)
    setTitle(issue.title)
    setKicker(issue.kicker)
    setSummary(issue.summary)
    setBody(issue.body)
    setSlug(issue.slug)
    setMessage(null)
  }

  function loadTemplate() {
    setTitle(ISSUE_0_TEMPLATE.title)
    setKicker(ISSUE_0_TEMPLATE.kicker)
    setSummary(ISSUE_0_TEMPLATE.summary)
    setBody(ISSUE_0_TEMPLATE.body)
    setSlug('welcome-school-to-industry')
    setMessage('Loaded welcome template — edit, then save & publish.')
  }

  async function onSave(e: FormEvent, publish: boolean) {
    e.preventDefault()
    setBusy(true)
    onError(null)
    setMessage(null)
    try {
      if (editingId) {
        await adminApi(`/api/admin/newsletter/issues/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          json: { title, kicker, summary, body, slug, published: publish },
        })
        setMessage(publish ? 'Issue updated and published.' : 'Issue saved as draft.')
      } else {
        const res = await adminApi<{ issue: AdminIssue }>('/api/admin/newsletter/issues', {
          method: 'POST',
          json: { title, kicker, summary, body, slug, publish },
        })
        setEditingId(res.issue.id)
        setSlug(res.issue.slug)
        setMessage(publish ? 'Issue created and published.' : 'Draft created.')
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
          <h2 className="adminCardTitle">School → Industry newsletter</h2>
          <p className="adminCardLead">
            Public at <code className="adminMono">/newsletter</code> · {activeCount} active subscriber
            {activeCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="adminNewsletterActions">
          <button type="button" className="btn btnOutline btnSmall" disabled={busy} onClick={() => void refresh()}>
            Refresh
          </button>
          <button type="button" className="btn btnOutline btnSmall" onClick={startNew}>
            New issue
          </button>
          <button type="button" className="btn btnGhost btnSmall" onClick={loadTemplate}>
            Load welcome template
          </button>
        </div>
      </div>

      {message ? <p className="adminOkMessage">{message}</p> : null}

      <form className="adminNewsletterForm" onSubmit={(e) => void onSave(e, false)}>
        <label className="field">
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Issue title" />
        </label>
        <label className="field">
          <span>Kicker (week / industry line)</span>
          <input
            value={kicker}
            onChange={(e) => setKicker(e.target.value)}
            placeholder="Week of 10 Aug · Banking"
          />
        </label>
        <label className="field">
          <span>Summary (teaser on landing)</span>
          <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One sentence" />
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
        <p className="adminMuted">No issues yet — load the welcome template and publish Issue 1.</p>
      ) : (
        <ul className="adminNewsletterIssueList">
          {issues.map((issue) => (
            <li key={issue.id} className="adminNewsletterIssueRow">
              <div>
                <strong>
                  #{issue.issueNumber} · {issue.title}
                </strong>
                <p className="adminMuted">
                  {issue.published ? 'Published' : 'Draft'}
                  {issue.emailSentAt
                    ? ` · emailed ${new Date(issue.emailSentAt).toLocaleString()}`
                    : ' · not emailed yet'}{' '}
                  · /newsletter/{issue.slug}
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
