import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminApi, adminDownloadFile } from '../api/adminClient'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { formatPaymentRand, PAYMENT_FULLY_PAID_CENTS, PAYMENT_INSTALLMENT_CENTS } from '../constants/payments'
import {
  snapshotToPreviewSections,
  type ApplicationSnapshot,
  type PreviewSection,
} from '../utils/applicationSnapshotView'

type PackDocument = {
  id: string
  category: string
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

type PackTask = {
  id: string
  status: string
  blockReasons: string[]
  notes: string
  lastOpenedAt: string | null
  submittedAt: string | null
  bursary: {
    id: string
    slug: string
    name: string
    provider: string
    type: string
    applicationCloses: string
    applyUrl: string | null
    active: boolean
    needsReview: boolean
    linkStatus: string
  } | null
}

type ApplyPack = {
  student: {
    id: string
    email: string
    createdAt: string
    firstName: string
    lastName: string
    phone: string
  }
  paidCents: number
  paidEnoughToStart: boolean
  fullyPaid: boolean
  questionnaireCompleted: boolean
  completeness: { ready: boolean; percent: number; missing: string[]; documentCount: number }
  copyText: string
  documents: PackDocument[]
  snapshot: ApplicationSnapshot | null
  match: {
    bursaryCount: number
    scholarshipCount: number
    matchedAt: string
    matches: Array<{ slug: string; name: string }>
  }
  tasks: PackTask[]
}

const STATUS_LABEL: Record<string, string> = {
  queued: 'Queued',
  blocked: 'Blocked',
  in_progress: 'In progress',
  ready: 'Ready to submit',
  submitted: 'Submitted',
  skipped: 'Skipped',
}

function statusClass(status: string) {
  if (status === 'submitted' || status === 'ready') return 'adminBursaryBadgeOpen'
  if (status === 'blocked' || status === 'skipped') return 'adminBursaryBadgeClosed'
  return 'adminPackStatusMid'
}

export function AdminApplyPackPage() {
  const { studentId } = useParams()
  const [pack, setPack] = useState<ApplyPack | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [actionBusy, setActionBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('todo')

  const load = useCallback(async () => {
    if (!studentId) throw new Error('Missing student id')
    const next = await adminApi<ApplyPack>(`/api/admin/students/${encodeURIComponent(studentId)}/apply-pack`)
    setPack(next)
    setNoteDrafts((prev) => {
      const merged = { ...prev }
      for (const t of next.tasks) {
        if (merged[t.id] === undefined) merged[t.id] = t.notes || ''
      }
      return merged
    })
    return next
  }, [studentId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        await load()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load apply pack')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  async function runAction(fn: () => Promise<ApplyPack>) {
    setActionBusy(true)
    setError(null)
    try {
      const next = await fn()
      setPack(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed')
    } finally {
      setActionBusy(false)
    }
  }

  async function onStart() {
    if (!studentId) return
    await runAction(() =>
      adminApi<ApplyPack>(`/api/admin/students/${encodeURIComponent(studentId)}/apply-pack/start`, {
        method: 'POST',
        json: {},
      }),
    )
  }

  async function patchTask(taskId: string, body: Record<string, unknown>) {
    if (!studentId) return
    await runAction(() =>
      adminApi<ApplyPack>(
        `/api/admin/students/${encodeURIComponent(studentId)}/apply-pack/tasks/${encodeURIComponent(taskId)}`,
        { method: 'PATCH', json: body },
      ),
    )
  }

  async function onOpenForm(task: PackTask) {
    if (!studentId || !task.bursary?.applyUrl) return
    window.open(task.bursary.applyUrl, '_blank', 'noopener,noreferrer')
    await runAction(() =>
      adminApi<ApplyPack>(
        `/api/admin/students/${encodeURIComponent(studentId)}/apply-pack/tasks/${encodeURIComponent(task.id)}/opened`,
        { method: 'POST', json: {} },
      ),
    )
  }

  async function onCopyPack() {
    if (!pack?.copyText) return
    try {
      await navigator.clipboard.writeText(pack.copyText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy. Select the pack text manually.')
    }
  }

  const sections: PreviewSection[] = useMemo(
    () => (pack?.snapshot ? snapshotToPreviewSections(pack.snapshot) : []),
    [pack],
  )

  const visibleTasks = useMemo(() => {
    const tasks = pack?.tasks ?? []
    if (filter === 'done') return tasks.filter((t) => t.status === 'submitted' || t.status === 'skipped')
    if (filter === 'todo') {
      return tasks.filter((t) => t.status !== 'submitted' && t.status !== 'skipped')
    }
    return tasks
  }, [pack, filter])

  const displayName = pack
    ? [pack.student.firstName, pack.student.lastName].filter(Boolean).join(' ') || pack.student.email
    : 'Apply pack'

  const counts = {
    queued: pack?.tasks.filter((t) => t.status === 'queued').length ?? 0,
    blocked: pack?.tasks.filter((t) => t.status === 'blocked').length ?? 0,
    in_progress: pack?.tasks.filter((t) => t.status === 'in_progress').length ?? 0,
    ready: pack?.tasks.filter((t) => t.status === 'ready').length ?? 0,
    submitted: pack?.tasks.filter((t) => t.status === 'submitted').length ?? 0,
  }

  return (
    <div className="adminShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Admin', to: '/admin' },
          { label: 'Student site', to: '/' },
        ]}
      />
      <main className="adminMain container adminApplyPackMain">
        <p className="adminMuted">
          <Link to="/admin">← Students</Link>
        </p>
        <h1 className="adminTitle">{displayName}</h1>
        <p className="adminCardLead">
          Paid-student workbench. Open the provider form, paste this pack, then mark submitted. We do not auto-fill
          third-party sites.
        </p>
        {error ? <div className="formError adminError">{error}</div> : null}
        {busy ? <p className="adminMuted">Loading apply pack…</p> : null}

        {pack ? (
          <div className="adminApplyPackGrid">
            <section className="adminCard">
              <h2 className="adminCardTitle">Student pack</h2>
              <p className="adminMuted">
                {pack.student.email}
                {pack.student.phone ? ` · ${pack.student.phone}` : ''}
              </p>
              <p className="adminPaymentStatus">
                Fee:{' '}
                {pack.fullyPaid ? (
                  <span className="adminBursaryBadgeOpen">PAID ({formatPaymentRand(PAYMENT_FULLY_PAID_CENTS)}+)</span>
                ) : pack.paidEnoughToStart ? (
                  <span className="adminBursaryBadgeClosed">
                    PART — {formatPaymentRand(pack.paidCents)} paid (full fee is{' '}
                    {formatPaymentRand(PAYMENT_FULLY_PAID_CENTS)})
                  </span>
                ) : (
                  <span className="adminMuted">UNPAID — need at least {formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)}</span>
                )}
              </p>
              <p>
                Pack completeness: <strong>{pack.completeness.percent}%</strong>
                {pack.completeness.ready ? ' — ready to apply' : ' — blocked'}
              </p>
              {!pack.completeness.ready ? (
                <div className="adminPackBlocked">
                  <strong>Missing before we submit</strong>
                  <ul>
                    {pack.completeness.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="adminOk">Core fields and ID / results / income docs are on file.</p>
              )}
              {!pack.questionnaireCompleted ? (
                <p className="adminBursaryBadgeClosed">Career questionnaire not completed — no matches yet.</p>
              ) : (
                <p className="adminMuted">
                  {pack.match.bursaryCount} open bursaries · {pack.match.scholarshipCount} scholarships
                </p>
              )}
              <div className="formActions">
                <button type="button" className="btn btnDark btnSmall" onClick={() => void onCopyPack()}>
                  {copied ? 'Copied' : 'Copy pack'}
                </button>
                <Link
                  className="btn btnOutline btnSmall"
                  to={`/admin/students/${encodeURIComponent(pack.student.id)}/application-pdf`}
                >
                  PDF preview
                </Link>
                <button
                  type="button"
                  className="btn btnOutline btnSmall"
                  disabled={actionBusy || !pack.paidEnoughToStart || !pack.questionnaireCompleted}
                  onClick={() => void onStart()}
                >
                  {pack.tasks.length ? 'Refresh matches' : 'Start applications'}
                </button>
              </div>
              {!pack.paidEnoughToStart ? (
                <p className="adminMuted">Start is locked until the student has paid at least the first installment.</p>
              ) : null}

              <h3 className="adminSubheading">Documents</h3>
              {pack.documents.length === 0 ? (
                <p className="adminMuted">None yet.</p>
              ) : (
                <ul className="adminDocList">
                  {pack.documents.map((d) => (
                    <li key={d.id}>
                      <strong>{d.category}</strong> — {d.filename}{' '}
                      <span className="adminMuted">({Math.round(d.size / 1024)} KB)</span>{' '}
                      <button
                        type="button"
                        className="btn btnOutline btnSmall"
                        onClick={() =>
                          void adminDownloadFile(
                            `/api/admin/students/${encodeURIComponent(pack.student.id)}/documents/${encodeURIComponent(d.id)}/file`,
                            d.filename,
                          ).catch((err) => setError(err instanceof Error ? err.message : 'Could not open document'))
                        }
                      >
                        View
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <h3 className="adminSubheading">Copy pack</h3>
              <textarea className="adminPackCopy" readOnly rows={12} value={pack.copyText} />

              {sections.length > 0 ? (
                <>
                  <h3 className="adminSubheading">Application snapshot</h3>
                  {sections.map((section) => (
                    <div key={section.id} className="adminPackSection">
                      <h4>{section.title}</h4>
                      <dl>
                        {section.lines.map((line) => (
                          <div key={`${section.id}-${line.label}`}>
                            <dt>{line.label}</dt>
                            <dd className={line.empty ? 'adminMuted' : undefined}>{line.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </>
              ) : null}
            </section>

            <section className="adminCard">
              <h2 className="adminCardTitle">Application queue</h2>
              <p className="adminMuted">
                {counts.blocked} blocked · {counts.queued} queued · {counts.in_progress} in progress · {counts.ready}{' '}
                ready · {counts.submitted} submitted
              </p>
              <div className="adminPackFilters">
                <button
                  type="button"
                  className={`btn btnSmall ${filter === 'todo' ? 'btnDark' : 'btnOutline'}`}
                  onClick={() => setFilter('todo')}
                >
                  To do
                </button>
                <button
                  type="button"
                  className={`btn btnSmall ${filter === 'done' ? 'btnDark' : 'btnOutline'}`}
                  onClick={() => setFilter('done')}
                >
                  Done
                </button>
                <button
                  type="button"
                  className={`btn btnSmall ${filter === 'all' ? 'btnDark' : 'btnOutline'}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
              </div>

              {!pack.tasks.length ? (
                <p className="adminMuted">
                  No queue yet. When the student has paid and completed the questionnaire, click Start applications.
                </p>
              ) : null}

              <ul className="adminStudentBursaryList">
                {visibleTasks.map((task) => (
                  <li key={task.id} className="adminStudentBursaryItem">
                    <div className="adminPackTaskHead">
                      <strong>{task.bursary?.name || 'Bursary'}</strong>
                      <span className={statusClass(task.status)}>{STATUS_LABEL[task.status] || task.status}</span>
                    </div>
                    <p className="adminMuted">
                      {task.bursary?.provider} · {task.bursary?.type} · closes{' '}
                      {task.bursary?.applicationCloses
                        ? new Date(task.bursary.applicationCloses).toLocaleDateString()
                        : '—'}
                      {task.bursary?.needsReview ? ' · listing needs review' : ''}
                    </p>
                    {task.status === 'blocked' && task.blockReasons.length > 0 ? (
                      <p className="adminMuted">Blocked: {task.blockReasons.join(', ')}</p>
                    ) : null}
                    <div className="formActions adminPackTaskActions">
                      {task.bursary?.applyUrl ? (
                        <button
                          type="button"
                          className="btn btnDark btnSmall"
                          disabled={actionBusy}
                          onClick={() => void onOpenForm(task)}
                        >
                          Open form
                        </button>
                      ) : (
                        <span className="adminMuted">No apply URL</span>
                      )}
                      <button type="button" className="btn btnOutline btnSmall" onClick={() => void onCopyPack()}>
                        Copy pack
                      </button>
                      {task.status !== 'ready' && task.status !== 'submitted' && task.status !== 'skipped' ? (
                        <button
                          type="button"
                          className="btn btnOutline btnSmall"
                          disabled={actionBusy || !pack.completeness.ready}
                          onClick={() => void patchTask(task.id, { status: 'ready' })}
                        >
                          Mark ready
                        </button>
                      ) : null}
                      {task.status !== 'submitted' && task.status !== 'skipped' ? (
                        <button
                          type="button"
                          className="btn btnOutline btnSmall"
                          disabled={actionBusy}
                          onClick={() => void patchTask(task.id, { status: 'submitted' })}
                        >
                          Mark submitted
                        </button>
                      ) : null}
                      {task.status !== 'skipped' && task.status !== 'submitted' ? (
                        <button
                          type="button"
                          className="btn btnOutline btnSmall"
                          disabled={actionBusy}
                          onClick={() => void patchTask(task.id, { status: 'skipped' })}
                        >
                          Skip
                        </button>
                      ) : null}
                    </div>
                    <label className="field">
                      <span>Notes</span>
                      <input
                        value={noteDrafts[task.id] ?? task.notes}
                        onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [task.id]: e.target.value }))}
                        onBlur={() => {
                          const next = (noteDrafts[task.id] ?? '').trim()
                          if (next === (task.notes || '')) return
                          void patchTask(task.id, { notes: next })
                        }}
                        placeholder="Password, extra docs, what you submitted…"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  )
}
