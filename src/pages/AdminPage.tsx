import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, getAdminToken, setAdminToken } from '../api/adminClient'
import { ChatThread, type ChatMessage } from '../components/ChatThread'

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

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    loadDetail(selectedId).catch(() => {})
  }, [selectedId, loadDetail])

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
              <p className="adminToolbarMeta">
                {students.length} student{students.length === 1 ? '' : 's'} — data lives in SQLite (see Prisma schema).
              </p>
            </div>

            {error ? <div className="formError adminError">{error}</div> : null}

            <div className="adminGrid">
              <section className="adminCard adminCardStretch">
                <h2 className="adminCardTitle">Students</h2>
                <div className="adminTableWrap">
                  <table className="adminTable">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
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
                      <a
                        className="btn btnOutline btnSmall"
                        href={`/api/admin/students/${encodeURIComponent(detail.id)}/application/pdf`}
                      >
                        Download application PDF
                      </a>
                    </div>

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
                            <strong>{d.category}</strong> — {d.filename}{' '}
                            <span className="adminMuted">
                              ({Math.round(d.size / 1024)} KB · {new Date(d.createdAt).toLocaleDateString()})
                            </span>
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
