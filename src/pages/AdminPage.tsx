import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, adminDownloadFile, getAdminToken, setAdminToken } from '../api/adminClient'
import { ChatThread, type ChatMessage } from '../components/ChatThread'
import type { ProgrammeRequirement, UniversityId } from '../utils/varsity/types'
import { getStudentCatalogueYear } from '../utils/varsity/studentCatalogueYear'
import {
  PAYMENT_FULLY_PAID_CENTS,
  PAYMENT_INSTALLMENT_CENTS,
  formatPaymentRand,
} from '../constants/payments'

type StudentRow = {
  id: string
  email: string
  createdAt: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  hasAvatar: boolean
  stepIndex: number
  applicationUpdatedAt: string | null
  inboxCount: number
  documentCount: number
  paidCents?: number
  eftPending?: boolean
}

type InboxRow = {
  id: string
  title: string
  body: string
  kind: string
  requiresResponse: boolean
  studentResponse: string | null
  respondedAt: string | null
  createdAt: string
}

type BursaryAdminRow = {
  id: string
  slug: string
  name: string
  provider: string
  type: string
  applicationCloses: string
  applyUrl: string | null
  isOpen: boolean
  active: boolean
  offersJobAfterGrad: boolean
  studyFields: string[]
}

type StudentBursaryMatch = {
  slug: string
  name: string
  provider: string
  type: string
  applicationCloses: string
  applyUrl: string | null
  offersJobAfterGrad: boolean
}

type StudentDetail = {
  id: string
  email: string
  createdAt: string
  hasAvatar: boolean
  profile: Record<string, unknown> | null
  application: {
    stepIndex: number
    updatedAt: string
    payload: unknown
  } | null
  documents: {
    id: string
    category: string
    filename: string
    mimeType: string
    size: number
    createdAt: string
  }[]
  inboxItems: InboxRow[]
  questionnaire?: {
    answers: Record<string, string>
    skipped: boolean
    completedAt: string | null
    bursaryCount: number | null
    scholarshipCount: number | null
    matchedAt: string | null
  } | null
  bursaryMatches?: {
    bursaryCount: number
    scholarshipCount: number
    matchedAt: string
    matches: StudentBursaryMatch[]
  } | null
  paidCents?: number
  payments?: Array<{
    id: string
    plan: string
    amountPaidCents: number
    amountDueCents: number
    status: string
    provider: string
    providerChargeId: string | null
    failureReason: string | null
    createdAt: string
  }>
  pendingEftPayments?: Array<{
    id: string
    plan: string
    amountDueCents: number
    providerChargeId: string | null
    failureReason: string | null
    createdAt: string
  }>
}

type VarsityUniversityRow = {
  id: UniversityId
  name: string
  shortName: string
  website: string
  logoPath: string
  calculatorType: string
  active: boolean
}

type VarsityProgrammeRow = {
  id: string
  universityId: UniversityId
  name: string
  faculty: string
  campus: string | null
  externalCode: string | null
  active: boolean
  ruleSets: Array<{
    id: string
    catalogueYear: number
    minAps: number
    notes: string | null
    requirements: Array<{ id: string; kind: string; label: string | null; payloadJson: string }>
  }>
}

export function AdminPage() {
  const [tokenInput, setTokenInput] = useState('')
  const [unlocked, setUnlocked] = useState(() => Boolean(getAdminToken()))
  const [students, setStudents] = useState<StudentRow[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [listBusy, setListBusy] = useState(false)
  const [detailBusy, setDetailBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgKind, setMsgKind] = useState('information_request')
  const [msgNeedsReply, setMsgNeedsReply] = useState(true)
  const [sendBusy, setSendBusy] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [chatDraft, setChatDraft] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [paymentRecordBusy, setPaymentRecordBusy] = useState(false)
  const [paymentRecordMessage, setPaymentRecordMessage] = useState<string | null>(null)
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [bulkEmailSubject, setBulkEmailSubject] = useState('')
  const [bulkEmailBody, setBulkEmailBody] = useState('')
  const [bulkEmailBusy, setBulkEmailBusy] = useState(false)
  const [bulkEmailMessage, setBulkEmailMessage] = useState<string | null>(null)

  const [varsityYear, setVarsityYear] = useState(2026)
  const [varsityBusy, setVarsityBusy] = useState(false)
  const [varsityError, setVarsityError] = useState<string | null>(null)
  const [varsityProgrammes, setVarsityProgrammes] = useState<VarsityProgrammeRow[]>([])
  const [varsitySelectedProgrammeId, setVarsitySelectedProgrammeId] = useState<string | null>(null)
  const [varsityMinAps, setVarsityMinAps] = useState('')
  const [varsityNotes, setVarsityNotes] = useState('')
  const [varsityRequirementsJson, setVarsityRequirementsJson] = useState('[]')
  const [varsitySeedBusy, setVarsitySeedBusy] = useState(false)
  const [varsitySeedToken, setVarsitySeedToken] = useState('')
  const [varsitySeedMessage, setVarsitySeedMessage] = useState<string | null>(null)

  const [bursaryFilter, setBursaryFilter] = useState<'all' | 'open' | 'closed'>('open')
  const [bursaries, setBursaries] = useState<BursaryAdminRow[]>([])
  const [bursaryMeta, setBursaryMeta] = useState({ openCount: 0, closedCount: 0, total: 0 })
  const [bursaryBusy, setBursaryBusy] = useState(false)
  const [bursarySyncBusy, setBursarySyncBusy] = useState(false)
  const [bursaryMessage, setBursaryMessage] = useState<string | null>(null)

  const refreshList = useCallback(async () => {
    setListBusy(true)
    setError(null)
    try {
      const rows = await adminApi<StudentRow[]>('/api/admin/students')
      setStudents(rows)
      setUnlocked(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load students'
      setError(msg)
      if (/invalid admin token|not an admin/i.test(msg)) {
        setAdminToken(null)
        setUnlocked(false)
        setStudents([])
        setSelectedId(null)
        setDetail(null)
      }
    } finally {
      setListBusy(false)
    }
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    setDetailBusy(true)
    setError(null)
    setEmailSubject('')
    setEmailBody('')
    setEmailMessage(null)
    try {
      const d = await adminApi<StudentDetail>(`/api/admin/students/${encodeURIComponent(id)}`)
      setDetail(d)
      const msgs = await adminApi<ChatMessage[]>(
        `/api/admin/students/${encodeURIComponent(id)}/chat`,
      )
      setChat(msgs)
    } catch (e) {
      setDetail(null)
      setChat([])
      setError(e instanceof Error ? e.message : 'Could not load student')
    } finally {
      setDetailBusy(false)
    }
  }, [])

  useEffect(() => {
    refreshList().catch(() => {})
  }, [refreshList])

  const refreshBursaries = useCallback(async () => {
    setBursaryBusy(true)
    setBursaryMessage(null)
    try {
      const res = await adminApi<{
        items: BursaryAdminRow[]
        openCount: number
        closedCount: number
        total: number
      }>(`/api/admin/bursaries?filter=${encodeURIComponent(bursaryFilter)}`)
      setBursaries(res.items)
      setBursaryMeta({ openCount: res.openCount, closedCount: res.closedCount, total: res.total })
    } catch (e) {
      setBursaryMessage(e instanceof Error ? e.message : 'Could not load bursaries')
    } finally {
      setBursaryBusy(false)
    }
  }, [bursaryFilter])

  const refreshVarsity = useCallback(async () => {
    setVarsityBusy(true)
    setVarsityError(null)
    try {
      const res = await adminApi<{ year: number; universities: VarsityUniversityRow[]; programmes: VarsityProgrammeRow[] }>(
        `/api/admin/varsity/catalogue?year=${encodeURIComponent(String(varsityYear))}`,
      )
      setVarsityProgrammes(res.programmes)
    } catch (e) {
      setVarsityError(e instanceof Error ? e.message : 'Could not load varsity catalogue')
    } finally {
      setVarsityBusy(false)
    }
  }, [varsityYear])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    setPaymentRecordMessage(null)
    loadDetail(selectedId).catch(() => {})
  }, [selectedId, loadDetail])

  useEffect(() => {
    if (!unlocked) return
    refreshVarsity().catch(() => {})
  }, [unlocked, refreshVarsity])

  useEffect(() => {
    if (!unlocked) return
    refreshBursaries().catch(() => {})
  }, [unlocked, refreshBursaries])

  useEffect(() => {
    const p = varsitySelectedProgrammeId
      ? varsityProgrammes.find((x) => x.id === varsitySelectedProgrammeId) ?? null
      : null
    const rs = p?.ruleSets?.[0] ?? null
    if (!rs) {
      setVarsityMinAps('')
      setVarsityNotes('')
      setVarsityRequirementsJson('[]')
      return
    }
    setVarsityMinAps(String(rs.minAps))
    setVarsityNotes(String(rs.notes ?? ''))
    const reqs: ProgrammeRequirement[] = []
    for (const r of rs.requirements ?? []) {
      try {
        reqs.push(JSON.parse(r.payloadJson))
      } catch {
        // ignore
      }
    }
    setVarsityRequirementsJson(JSON.stringify(reqs, null, 2))
  }, [varsitySelectedProgrammeId, varsityProgrammes])

  async function onUnlock(e: FormEvent) {
    e.preventDefault()
    setAdminToken(tokenInput.trim())
    await refreshList()
  }

  function onLogout() {
    setAdminToken(null)
    setUnlocked(false)
    setStudents([])
    setSelectedId(null)
    setDetail(null)
    setTokenInput('')
    setError(null)
  }

  async function onSendMessage(e: FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    setSendBusy(true)
    setError(null)
    try {
      await adminApi('/api/admin/inbox', {
        method: 'POST',
        json: {
          userId: selectedId,
          title: msgTitle.trim(),
          body: msgBody.trim(),
          kind: msgKind,
          requiresResponse: msgNeedsReply,
        },
      })
      setMsgTitle('')
      setMsgBody('')
      await refreshList()
      await loadDetail(selectedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setSendBusy(false)
    }
  }

  async function onChatSend(e: FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    const text = chatDraft.trim()
    if (!text) return
    setChatBusy(true)
    setError(null)
    try {
      await adminApi(`/api/admin/students/${encodeURIComponent(selectedId)}/chat`, {
        method: 'POST',
        json: { body: text },
      })
      setChatDraft('')
      const msgs = await adminApi<ChatMessage[]>(
        `/api/admin/students/${encodeURIComponent(selectedId)}/chat`,
      )
      setChat(msgs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setChatBusy(false)
    }
  }

  const allStudentsSelected =
    students.length > 0 && students.every((row) => selectedStudentIds.has(row.id))

  function toggleStudentSelection(id: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllStudents() {
    if (allStudentsSelected) {
      setSelectedStudentIds(new Set())
      return
    }
    setSelectedStudentIds(new Set(students.map((row) => row.id)))
  }

  async function onBulkEmailSend(e: FormEvent) {
    e.preventDefault()
    const ids = [...selectedStudentIds]
    const subject = bulkEmailSubject.trim()
    const body = bulkEmailBody.trim()
    if (!ids.length || !subject || !body) return
    setBulkEmailBusy(true)
    setError(null)
    setBulkEmailMessage(null)
    try {
      const res = await adminApi<{ sent: number; failed: number }>('/api/admin/students/email-bulk', {
        method: 'POST',
        json: { userIds: ids, subject, body },
      })
      setBulkEmailSubject('')
      setBulkEmailBody('')
      setSelectedStudentIds(new Set())
      setBulkEmailMessage(
        res.failed > 0
          ? `Sent to ${res.sent} student${res.sent === 1 ? '' : 's'}. ${res.failed} failed.`
          : `Email sent to ${res.sent} student${res.sent === 1 ? '' : 's'}.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send bulk email')
    } finally {
      setBulkEmailBusy(false)
    }
  }

  async function onEmailSend(e: FormEvent) {
    e.preventDefault()
    if (!selectedId) return
    const subject = emailSubject.trim()
    const body = emailBody.trim()
    if (!subject || !body) return
    setEmailBusy(true)
    setError(null)
    setEmailMessage(null)
    try {
      await adminApi(`/api/admin/students/${encodeURIComponent(selectedId)}/email`, {
        method: 'POST',
        json: { subject, body },
      })
      setEmailSubject('')
      setEmailBody('')
      setEmailMessage('Email sent to the student.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send email')
    } finally {
      setEmailBusy(false)
    }
  }

  async function onRecordPayment(plan: 'once_off_95' | 'split_50_first' | 'split_50_second') {
    if (!selectedId) return
    setPaymentRecordBusy(true)
    setPaymentRecordMessage(null)
    setError(null)
    try {
      const res = await adminApi<{ paidCents: number }>(
        `/api/admin/students/${encodeURIComponent(selectedId)}/payments/record`,
        { method: 'POST', json: { plan } },
      )
      setPaymentRecordMessage(
        `Recorded — total paid R${(Number(res.paidCents) / 100).toFixed(2)} for this student.`,
      )
      await refreshList()
      await loadDetail(selectedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record payment')
    } finally {
      setPaymentRecordBusy(false)
    }
  }

  function displayName(row: StudentRow) {
    const n = [row.firstName, row.lastName].filter(Boolean).join(' ').trim()
    return n || row.email
  }

  return (
    <div className="adminShell">
      <header className="adminHeader">
        <div className="container adminHeaderInner">
          <h1 className="adminTitle">Apply Once — admin</h1>
          <div className="adminHeaderActions">
            <Link className="adminHomeLink" to="/">
              Student site
            </Link>
            {unlocked ? (
              <button type="button" className="btn btnOutline adminHeaderBtn" onClick={onLogout}>
                Lock admin
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="adminMain container">
        {!unlocked ? (
          <section className="adminCard">
            <h2 className="adminCardTitle">Admin access</h2>
            <p className="adminCardLead">
              Sign in with your admin email on the main site, then return here. If you still use the legacy admin token,
              you can unlock below.
            </p>
            <form className="adminUnlockForm" onSubmit={(ev) => void onUnlock(ev)}>
              <label className="field">
                <span>Admin token</span>
                <input
                  type="password"
                  autoComplete="off"
                  value={tokenInput}
                  onChange={(ev) => setTokenInput(ev.target.value)}
                  placeholder="Paste ADMIN_SECRET"
                />
              </label>
              <button type="submit" className="btn btnDark" disabled={listBusy}>
                {listBusy ? 'Checking…' : 'Unlock'}
              </button>
            </form>
          </section>
        ) : (
          <>
            <div className="adminToolbar">
              <button type="button" className="btn btnOutline btnSmall" disabled={listBusy} onClick={() => refreshList()}>
                {listBusy ? 'Refreshing…' : 'Refresh list'}
              </button>
              <button
                type="button"
                className="btn btnOutline btnSmall"
                disabled={varsityBusy}
                onClick={() => void refreshVarsity()}
              >
                {varsityBusy ? 'Refreshing…' : 'Refresh varsity'}
              </button>
              <p className="adminToolbarMeta">
                {students.length} student{students.length === 1 ? '' : 's'} — data lives in SQLite (see Prisma schema).
              </p>
            </div>

            {error ? <div className="formError adminError">{error}</div> : null}
            {varsityError ? <div className="formError adminError">{varsityError}</div> : null}

            <section className="adminCard" style={{ gridColumn: '1 / -1' }}>
              <div className="adminToolbar" style={{ marginTop: 0 }}>
                <h2 className="adminCardTitle" style={{ margin: 0 }}>
                  Bursaries & scholarships catalogue
                </h2>
                <label className="field" style={{ maxWidth: 160, marginLeft: 'auto' }}>
                  <span>Show</span>
                  <select
                    value={bursaryFilter}
                    onChange={(e) => setBursaryFilter(e.target.value as 'all' | 'open' | 'closed')}
                  >
                    <option value="open">Open only</option>
                    <option value="closed">Closed / inactive</option>
                    <option value="all">All</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btnOutline btnSmall"
                  disabled={bursaryBusy}
                  onClick={() => void refreshBursaries()}
                >
                  {bursaryBusy ? 'Loading…' : 'Refresh'}
                </button>
                <button
                  type="button"
                  className="btn btnDark btnSmall"
                  disabled={bursarySyncBusy}
                  onClick={async () => {
                    setBursarySyncBusy(true)
                    setBursaryMessage(null)
                    try {
                      const res = await adminApi<{ upserted: number }>('/api/admin/bursaries/sync', {
                        method: 'POST',
                        json: {},
                      })
                      setBursaryMessage(`Synced ${res.upserted} opportunities from the built-in catalogue.`)
                      await refreshBursaries()
                    } catch (e) {
                      setBursaryMessage(e instanceof Error ? e.message : 'Sync failed')
                    } finally {
                      setBursarySyncBusy(false)
                    }
                  }}
                >
                  {bursarySyncBusy ? 'Syncing…' : 'Sync catalogue'}
                </button>
              </div>
              <p className="adminCardLead">
                SA bursaries and scholarships used for student match counts. Only <strong>open</strong> rows (closing
                date in the future) count toward questionnaire totals. Run sync after deploy or when you update closing
                dates in <code className="adminMono">server/data/bursaryCatalogue*.js</code>.
              </p>
              {bursaryMessage ? <p className="adminMuted">{bursaryMessage}</p> : null}
              <p className="adminMuted">
                {bursaryMeta.openCount} open · {bursaryMeta.closedCount} closed/inactive · showing {bursaries.length}
              </p>
              <div className="adminTableWrap">
                <table className="adminTable adminBursaryTable">
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
                    {bursaries.map((b) => (
                      <tr key={b.slug}>
                        <td>{b.name}</td>
                        <td>{b.provider}</td>
                        <td>{b.type}</td>
                        <td>{new Date(b.applicationCloses).toLocaleDateString()}</td>
                        <td>
                          {b.isOpen && b.active ? (
                            <span className="adminBursaryBadgeOpen">Open</span>
                          ) : (
                            <span className="adminBursaryBadgeClosed">Closed</span>
                          )}
                        </td>
                        <td>
                          {b.applyUrl ? (
                            <a href={b.applyUrl} target="_blank" rel="noreferrer">
                              Link
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
            </section>

            <div className="adminGrid">
              <section className="adminCard adminCardStretch">
                <h2 className="adminCardTitle">Students</h2>
                <p className="adminMuted adminEmailHint">
                  Select students below to email a group, or open one student for a single email.
                </p>
                {bulkEmailMessage ? <p className="adminOk">{bulkEmailMessage}</p> : null}
                <form className="adminBulkEmailForm" onSubmit={(ev) => void onBulkEmailSend(ev)}>
                  <div className="adminBulkEmailHead">
                    <strong>
                      Email selected ({selectedStudentIds.size}
                      {students.length ? ` of ${students.length}` : ''})
                    </strong>
                    <button
                      type="button"
                      className="btn btnOutline btnSmall"
                      disabled={!students.length}
                      onClick={toggleSelectAllStudents}
                    >
                      {allStudentsSelected ? 'Clear selection' : 'Select all'}
                    </button>
                  </div>
                  <label className="field">
                    <span>Subject</span>
                    <input
                      value={bulkEmailSubject}
                      onChange={(ev) => setBulkEmailSubject(ev.target.value)}
                      placeholder="Message subject for selected students"
                      disabled={selectedStudentIds.size === 0}
                    />
                  </label>
                  <label className="field">
                    <span>Message</span>
                    <textarea
                      rows={4}
                      value={bulkEmailBody}
                      onChange={(ev) => setBulkEmailBody(ev.target.value)}
                      placeholder="Write your email to the selected students…"
                      disabled={selectedStudentIds.size === 0}
                    />
                  </label>
                  <div className="formActions">
                    <button
                      type="submit"
                      className="btn btnDark btnSmall"
                      disabled={bulkEmailBusy || selectedStudentIds.size === 0}
                    >
                      {bulkEmailBusy
                        ? 'Sending…'
                        : `Send to ${selectedStudentIds.size} student${selectedStudentIds.size === 1 ? '' : 's'}`}
                    </button>
                  </div>
                </form>
                <div className="adminTableWrap">
                  <table className="adminTable">
                    <thead>
                      <tr>
                        <th className="adminTableCheckCol">
                          <input
                            type="checkbox"
                            aria-label="Select all students"
                            checked={allStudentsSelected}
                            onChange={toggleSelectAllStudents}
                            disabled={!students.length}
                          />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Payment</th>
                        <th>App step</th>
                        <th>Inbox</th>
                        <th>Docs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((row) => (
                        <tr
                          key={row.id}
                          className={selectedId === row.id ? 'adminTableRowSelected' : undefined}
                        >
                          <td className="adminTableCheckCol">
                            <input
                              type="checkbox"
                              aria-label={`Select ${displayName(row)}`}
                              checked={selectedStudentIds.has(row.id)}
                              onChange={() => toggleStudentSelection(row.id)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="adminSelectBtn"
                              onClick={() => setSelectedId(row.id)}
                            >
                              {displayName(row)}
                            </button>
                          </td>
                          <td className="adminTableEmail">{row.email}</td>
                          <td>
                            {Number(row.paidCents || 0) >= PAYMENT_FULLY_PAID_CENTS ? (
                              <span className="adminBursaryBadgeOpen">PAID</span>
                            ) : Number(row.paidCents || 0) >= PAYMENT_INSTALLMENT_CENTS ? (
                              <span className="adminBursaryBadgeClosed">PART</span>
                            ) : row.eftPending ? (
                              <span className="adminEftBadge">EFT proof</span>
                            ) : (
                              <span className="adminMuted">UNPAID</span>
                            )}
                          </td>
                          <td>{row.stepIndex + 1}</td>
                          <td>{row.inboxCount}</td>
                          <td>{row.documentCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {students.length === 0 && !listBusy ? (
                  <p className="adminMuted">No accounts yet.</p>
                ) : null}
              </section>

              <section className="adminCard adminCardStretch">
                <h2 className="adminCardTitle">Varsity catalogue</h2>
                <p className="adminCardLead">
                  Edit programme rules for a specific year. Changes affect the calculator immediately (no redeploy once seeded).
                </p>

                <div className="adminToolbar" style={{ marginTop: 0 }}>
                  <label className="field" style={{ maxWidth: 220 }}>
                    <span>Catalogue year (admin editing &amp; import)</span>
                    <select value={varsityYear} onChange={(e) => setVarsityYear(Number(e.target.value))}>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </label>
                </div>
                <p className="adminMuted" style={{ marginTop: 12 }}>
                  <strong>Student calculator year:</strong> learners always load the catalogue for year{' '}
                  <code className="adminMono">{getStudentCatalogueYear()}</code> from the frontend env variable{' '}
                  <code className="adminMono">VITE_VARSITY_CATALOGUE_YEAR</code> (defaults to 2026 if unset). Change it in
                  Vercel → Settings → Environment Variables and redeploy the <em>frontend</em> so the public calculator
                  matches the dataset you seeded for that year.
                </p>

                <h3 className="adminSubheading">Import catalogue from JSON</h3>
                <p className="adminMuted">
                  Fills the database from the built-in snapshot under <code className="adminMono">src/data/varsity/</code> for
                  the selected year. Run once after deploy (or again to reset rules from JSON). Sign in on the main site with an
                  allowlisted admin email so your session is sent with this request.
                </p>
                {varsitySeedMessage ? <p className="adminMuted">{varsitySeedMessage}</p> : null}
                <label className="field">
                  <span>Seed token (only if VARSITY_SEED_TOKEN is set on the server)</span>
                  <input
                    type="password"
                    autoComplete="off"
                    value={varsitySeedToken}
                    onChange={(e) => setVarsitySeedToken(e.target.value)}
                    placeholder="Leave empty if not configured"
                  />
                </label>
                <div className="formActions">
                  <button
                    type="button"
                    className="btn btnOutline btnSmall"
                    disabled={varsitySeedBusy}
                    onClick={async () => {
                      setVarsitySeedBusy(true)
                      setVarsitySeedMessage(null)
                      setVarsityError(null)
                      try {
                        let fileStart: number | null = 0
                        let totalProgrammes = 0
                        let totalReqs = 0
                        let totalFiles = 0
                        let universities = 0

                        while (fileStart !== null) {
                          setVarsitySeedMessage(
                            `Importing… (batch starting at file ${fileStart})`,
                          )
                          const batchRes: {
                            ok: boolean
                            catalogueYear: number
                            universityUpserts: number
                            programmeUpserts: number
                            requirementRows: number
                            processedFiles: number
                            totalFiles: number
                            nextFileStart: number | null
                          } = await adminApi(
                            `/api/admin/varsity/seed-from-json?year=${encodeURIComponent(
                              String(varsityYear),
                            )}&fileStart=${encodeURIComponent(String(fileStart))}&fileCount=1`,
                            {
                              method: 'POST',
                              json: varsitySeedToken.trim()
                                ? { seedToken: varsitySeedToken.trim() }
                                : {},
                            },
                          )
                          universities = batchRes.universityUpserts
                          totalProgrammes += batchRes.programmeUpserts
                          totalReqs += batchRes.requirementRows
                          totalFiles = batchRes.totalFiles
                          fileStart = batchRes.nextFileStart
                        }

                        setVarsitySeedMessage(
                          `Imported year ${varsityYear}: ${universities} universities, ${totalProgrammes} programmes, ${totalReqs} requirements (processed ${totalFiles} programme files).`,
                        )
                        await refreshVarsity()
                      } catch (e) {
                        setVarsityError(e instanceof Error ? e.message : 'Seed import failed')
                      } finally {
                        setVarsitySeedBusy(false)
                      }
                    }}
                  >
                    {varsitySeedBusy ? 'Importing…' : `Import JSON snapshot for ${varsityYear}`}
                  </button>
                </div>

                <label className="field">
                  <span>Programme</span>
                  <select
                    value={varsitySelectedProgrammeId ?? ''}
                    onChange={(e) => setVarsitySelectedProgrammeId(e.target.value || null)}
                  >
                    <option value="">Select a programme…</option>
                    {varsityProgrammes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.universityId.toUpperCase()} — {p.faculty} — {p.name}
                      </option>
                    ))}
                  </select>
                </label>

                {!varsitySelectedProgrammeId ? (
                  <p className="adminMuted">Select a programme to edit its APS + requirements for the selected year.</p>
                ) : (
                  <form
                    className="adminCompose"
                    onSubmit={async (ev) => {
                      ev.preventDefault()
                      setVarsityBusy(true)
                      setVarsityError(null)
                      try {
                        const minAps = Number(varsityMinAps)
                        const rs = await adminApi<{ id: string }>(
                          `/api/admin/varsity/programmes/${encodeURIComponent(varsitySelectedProgrammeId)}/ruleset?year=${encodeURIComponent(
                            String(varsityYear),
                          )}`,
                          {
                            method: 'POST',
                            json: { minAps, notes: varsityNotes.trim() || null },
                          },
                        )
                        const reqs = JSON.parse(varsityRequirementsJson || '[]') as ProgrammeRequirement[]
                        await adminApi(`/api/admin/varsity/rulesets/${encodeURIComponent(rs.id)}/requirements`, {
                          method: 'PUT',
                          json: { requirements: reqs },
                        })
                        await refreshVarsity()
                      } catch (e) {
                        setVarsityError(e instanceof Error ? e.message : 'Could not save varsity changes')
                      } finally {
                        setVarsityBusy(false)
                      }
                    }}
                  >
                    <label className="field">
                      <span>Min APS</span>
                      <input value={varsityMinAps} onChange={(e) => setVarsityMinAps(e.target.value)} />
                    </label>
                    <label className="field">
                      <span>Notes</span>
                      <textarea rows={3} value={varsityNotes} onChange={(e) => setVarsityNotes(e.target.value)} />
                    </label>
                    <label className="field">
                      <span>Requirements JSON</span>
                      <textarea
                        rows={10}
                        value={varsityRequirementsJson}
                        onChange={(e) => setVarsityRequirementsJson(e.target.value)}
                      />
                    </label>
                    <div className="formActions">
                      <button type="submit" className="btn btnDark btnSmall" disabled={varsityBusy}>
                        {varsityBusy ? 'Saving…' : 'Save programme rules'}
                      </button>
                    </div>
                  </form>
                )}

                {!selectedId ? (
                  <p className="adminMuted">Select a student in the table to view their data and send messages.</p>
                ) : detailBusy ? (
                  <p className="adminMuted">Loading student…</p>
                ) : detail ? (
                  <>
                    <h2 className="adminCardTitle">{detail.profile?.firstName ? `${String(detail.profile.firstName)} ${String(detail.profile.lastName ?? '')}`.trim() : detail.email}</h2>
                    <p className="adminMono adminMuted">{detail.email}</p>
                    <p className="adminMuted">
                      Signed up {new Date(detail.createdAt).toLocaleString()} · Avatar:{' '}
                      {detail.hasAvatar ? 'yes' : 'no'}
                      {detail.application ? (
                        <>
                          {' '}
                          · Application step {detail.application.stepIndex + 1}
                        </>
                      ) : null}
                    </p>
                    <div className="formActions">
                      <Link
                        className="btn btnOutline btnSmall"
                        to={`/admin/students/${encodeURIComponent(detail.id)}/application-pdf`}
                      >
                        Preview & download PDF
                      </Link>
                    </div>

                    <h3 className="adminSubheading">Application fee</h3>
                    <p className="adminMuted">
                      Students pay by EFT and upload proof on their profile, or via card when Yoco is
                      active. Confirm here after you verify the payment.
                    </p>
                    {detail.pendingEftPayments && detail.pendingEftPayments.length > 0 ? (
                      <div className="adminEftPendingBanner">
                        <strong>EFT proof waiting for you</strong>
                        <ul className="adminEftPendingList">
                          {detail.pendingEftPayments.map((p) => (
                            <li key={p.id}>
                              R{(p.amountDueCents / 100).toFixed(2)} · {p.plan.replace(/_/g, ' ')} ·{' '}
                              {new Date(p.createdAt).toLocaleString()}
                              {p.failureReason ? (
                                <span className="adminMuted"> · Bank ref: {p.failureReason}</span>
                              ) : null}
                              {p.providerChargeId ? (
                                <>
                                  {' '}
                                  <button
                                    type="button"
                                    className="btn btnOutline btnSmall adminEftProofBtn"
                                    onClick={() =>
                                      void adminDownloadFile(
                                        `/api/admin/students/${encodeURIComponent(detail.id)}/documents/${encodeURIComponent(p.providerChargeId!)}/file`,
                                        `payment-proof-${detail.email}`,
                                      ).catch((err) =>
                                        setError(
                                          err instanceof Error ? err.message : 'Could not open proof',
                                        ),
                                      )
                                    }
                                  >
                                    View proof
                                  </button>
                                </>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <p className="adminPaymentStatus">
                      Status:{' '}
                      {Number(detail.paidCents || 0) >= PAYMENT_FULLY_PAID_CENTS ? (
                        <span className="adminBursaryBadgeOpen">PAID ({formatPaymentRand(PAYMENT_FULLY_PAID_CENTS)}+)</span>
                      ) : Number(detail.paidCents || 0) >= PAYMENT_INSTALLMENT_CENTS ? (
                        <span className="adminBursaryBadgeClosed">
                          PART — R{(Number(detail.paidCents) / 100).toFixed(2)} paid
                        </span>
                      ) : (
                        <span className="adminMuted">UNPAID</span>
                      )}
                    </p>
                    {detail.payments && detail.payments.filter((p) => p.status === 'paid').length > 0 ? (
                      <ul className="adminPaymentHistory">
                        {detail.payments
                          .filter((p) => p.status === 'paid')
                          .map((p) => (
                          <li key={p.id}>
                            R{(p.amountPaidCents / 100).toFixed(2)} · {p.plan.replace(/_/g, ' ')} ·{' '}
                            {p.provider} · {new Date(p.createdAt).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="adminMuted">No payments recorded yet.</p>
                    )}
                    {paymentRecordMessage ? <p className="adminOk">{paymentRecordMessage}</p> : null}
                    <div className="formActions adminPaymentActions">
                      {Number(detail.paidCents || 0) < PAYMENT_FULLY_PAID_CENTS ? (
                        <button
                          type="button"
                          className="btn btnDark btnSmall"
                          disabled={paymentRecordBusy}
                          onClick={() => void onRecordPayment('once_off_95')}
                        >
                          Mark {formatPaymentRand(PAYMENT_FULLY_PAID_CENTS)} paid
                        </button>
                      ) : null}
                      {Number(detail.paidCents || 0) < PAYMENT_INSTALLMENT_CENTS ? (
                        <button
                          type="button"
                          className="btn btnOutline btnSmall"
                          disabled={paymentRecordBusy}
                          onClick={() => void onRecordPayment('split_50_first')}
                        >
                          Mark {formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)} paid (1st)
                        </button>
                      ) : null}
                      {Number(detail.paidCents || 0) >= PAYMENT_INSTALLMENT_CENTS &&
                      Number(detail.paidCents || 0) < PAYMENT_FULLY_PAID_CENTS ? (
                        <button
                          type="button"
                          className="btn btnOutline btnSmall"
                          disabled={paymentRecordBusy}
                          onClick={() => void onRecordPayment('split_50_second')}
                        >
                          Mark {formatPaymentRand(PAYMENT_INSTALLMENT_CENTS)} paid (2nd)
                        </button>
                      ) : null}
                    </div>

                    <h3 className="adminSubheading">Career questionnaire & bursary matches</h3>
                    {!detail.questionnaire?.completedAt || detail.questionnaire.skipped ? (
                      <p className="adminMuted">No completed career questionnaire yet.</p>
                    ) : (
                      <>
                        <p className="adminMuted">
                          <strong>{detail.bursaryMatches?.bursaryCount ?? detail.questionnaire.bursaryCount ?? 0}</strong>{' '}
                          open bursaries ·{' '}
                          <strong>
                            {detail.bursaryMatches?.scholarshipCount ?? detail.questionnaire.scholarshipCount ?? 0}
                          </strong>{' '}
                          scholarships
                          {detail.bursaryMatches?.matchedAt ? (
                            <> · matched {new Date(detail.bursaryMatches.matchedAt).toLocaleString()}</>
                          ) : null}
                        </p>
                        {!detail.bursaryMatches?.matches?.length ? (
                          <p className="adminMuted">No open matches for their current answers.</p>
                        ) : (
                          <ul className="adminStudentBursaryList">
                            {detail.bursaryMatches.matches.map((m) => (
                              <li key={m.slug} className="adminStudentBursaryItem">
                                <strong>{m.name}</strong>
                                <span className="adminMuted"> — {m.provider}</span>
                                <br />
                                <span className="adminMuted">
                                  {m.type} · closes {new Date(m.applicationCloses).toLocaleDateString()}
                                  {m.offersJobAfterGrad ? ' · work contract after grad' : ''}
                                </span>
                                <br />
                                {m.applyUrl ? (
                                  <a href={m.applyUrl} target="_blank" rel="noreferrer">
                                    Apply on provider site →
                                  </a>
                                ) : (
                                  <span className="adminMuted">No apply URL on file — search provider careers page</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}

                    <h3 className="adminSubheading">Saved profile</h3>
                    <pre className="adminJson">{JSON.stringify(detail.profile ?? {}, null, 2)}</pre>

                    <h3 className="adminSubheading">Application answers (draft)</h3>
                    <pre className="adminJson">
                      {JSON.stringify(detail.application?.payload ?? {}, null, 2)}
                    </pre>

                    <h3 className="adminSubheading">Uploaded documents</h3>
                    {detail.documents.length === 0 ? (
                      <p className="adminMuted">None yet.</p>
                    ) : (
                      <ul className="adminDocList">
                        {detail.documents.map((d) => (
                          <li key={d.id}>
                            <strong>{d.category === 'payment_proof' ? 'Payment proof' : d.category}</strong>{' '}
                            — {d.filename}{' '}
                            <span className="adminMuted">
                              ({Math.round(d.size / 1024)} KB · {new Date(d.createdAt).toLocaleDateString()})
                            </span>
                            {d.category === 'payment_proof' ? (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  className="btn btnOutline btnSmall adminEftProofBtn"
                                  onClick={() =>
                                    void adminDownloadFile(
                                      `/api/admin/students/${encodeURIComponent(detail.id)}/documents/${encodeURIComponent(d.id)}/file`,
                                      d.filename,
                                    ).catch((err) =>
                                      setError(
                                        err instanceof Error ? err.message : 'Could not open document',
                                      ),
                                    )
                                  }
                                >
                                  View
                                </button>
                              </>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}

                    <h3 className="adminSubheading">Profile inbox & replies</h3>
                    <ul className="adminInboxList">
                      {detail.inboxItems.map((it) => (
                        <li key={it.id} className="adminInboxItem">
                          <div className="adminInboxHead">
                            <strong>{it.title}</strong>
                            <span className="adminMuted">
                              {it.kind}
                              {it.requiresResponse ? ' · needs reply' : ''}
                            </span>
                          </div>
                          <p className="adminInboxBody">{it.body}</p>
                          {it.studentResponse ? (
                            <div className="adminStudentReply">
                              <strong>Student replied:</strong>
                              <p>{it.studentResponse}</p>
                              <span className="adminMuted">
                                {it.respondedAt ? new Date(it.respondedAt).toLocaleString() : ''}
                              </span>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>

                    <h3 className="adminSubheading">Send message to profile</h3>
                    <p className="adminCardLead">
                      Appears on their <strong>/profile</strong> page. Turn on “Needs reply” when you want an essay or extra answer — they submit right there.
                    </p>
                    <form className="adminCompose" onSubmit={(ev) => void onSendMessage(ev)}>
                      <label className="field">
                        <span>Kind</span>
                        <select value={msgKind} onChange={(ev) => setMsgKind(ev.target.value)}>
                          <option value="information_request">Information request (needs reply)</option>
                          <option value="application_status">Status update (FYI)</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Title</span>
                        <input
                          required
                          value={msgTitle}
                          onChange={(ev) => setMsgTitle(ev.target.value)}
                          placeholder="e.g. Essay topic — NSFAS pathway"
                        />
                      </label>
                      <label className="field">
                        <span>Message</span>
                        <textarea
                          required
                          rows={5}
                          value={msgBody}
                          onChange={(ev) => setMsgBody(ev.target.value)}
                          placeholder="Explain what you need from them."
                        />
                      </label>
                      <label className="adminCheckbox">
                        <input
                          type="checkbox"
                          checked={msgNeedsReply}
                          onChange={(ev) => setMsgNeedsReply(ev.target.checked)}
                        />
                        Needs reply from student (essay / clarification)
                      </label>
                      <div className="formActions">
                        <button type="submit" className="btn btnDark btnSmall" disabled={sendBusy}>
                          {sendBusy ? 'Sending…' : 'Send to inbox'}
                        </button>
                      </div>
                    </form>

                    <h3 className="adminSubheading">Email student</h3>
                    <p className="adminMuted adminEmailHint">
                      Sends directly to {detail.email}. Requires Resend on the server — see docs/SETUP-EMAIL.md.
                    </p>
                    {emailMessage ? <p className="adminOk">{emailMessage}</p> : null}
                    <form className="adminCompose" onSubmit={(ev) => void onEmailSend(ev)}>
                      <label className="field">
                        <span>Subject</span>
                        <input
                          required
                          value={emailSubject}
                          onChange={(ev) => setEmailSubject(ev.target.value)}
                          placeholder="e.g. Welcome to Apply Once"
                        />
                      </label>
                      <label className="field">
                        <span>Email message</span>
                        <textarea
                          required
                          rows={5}
                          value={emailBody}
                          onChange={(ev) => setEmailBody(ev.target.value)}
                          placeholder="Write your email to the student…"
                        />
                      </label>
                      <div className="formActions">
                        <button type="submit" className="btn btnDark btnSmall" disabled={emailBusy}>
                          {emailBusy ? 'Sending…' : 'Send email'}
                        </button>
                      </div>
                    </form>

                    <h3 className="adminSubheading">Private chat</h3>
                    <ChatThread messages={chat} role="admin" />
                    <form className="adminCompose" onSubmit={(ev) => void onChatSend(ev)}>
                      <label className="field">
                        <span>Chat message</span>
                        <textarea
                          required
                          rows={4}
                          value={chatDraft}
                          onChange={(ev) => setChatDraft(ev.target.value)}
                          placeholder="Write to the student…"
                        />
                      </label>
                      <div className="formActions">
                        <button type="submit" className="btn btnDark btnSmall" disabled={chatBusy}>
                          {chatBusy ? 'Sending…' : 'Send in chat'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <p className="adminMuted">Could not load this student.</p>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
