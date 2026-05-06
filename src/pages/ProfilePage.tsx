import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { api, getBearerToken, uploadAvatar } from '../api/client'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { ChatThread, type ChatMessage } from '../components/ChatThread'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { computeCompletion } from '../utils/applicationCompletion'

const STEP_LABELS = [
  'Profile',
  'Academics',
  'Study plan',
  'Household',
  'Financial need',
  'Leadership & impact',
  'Consent',
  'Documents',
]

type InboxItem = {
  id: string
  title: string
  body: string
  kind: string
  requiresResponse: boolean
  studentResponse: string | null
  respondedAt: string | null
  createdAt: string
}

export function ProfileGate(props: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="formShell">
        <Navbar
          logo={<ApplyOnceLogo />}
          links={[
            { label: 'Features', to: '/#features' },
            { label: 'Resources', to: '/#resources' },
          ]}
        />
        <main className="formMain">
          <p className="formLead">Loading your profile…</p>
        </main>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return props.children
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function ProfilePage() {
  const { user, refreshSession } = useAuth()
  const [items, setItems] = useState<InboxItem[]>([])
  const [draftStep, setDraftStep] = useState<number>(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draftPayload, setDraftPayload] = useState<Record<string, unknown>>({})
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [chatDraft, setChatDraft] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [replyBusyId, setReplyBusyId] = useState<string | null>(null)
  const [draftReply, setDraftReply] = useState<Record<string, string>>({})
  /** Tracks blob: URLs so we revoke them and avoid leaking object URLs across uploads. */
  const avatarBlobRef = useRef<string | null>(null)

  const setAvatarPreview = useCallback((url: string | null) => {
    if (avatarBlobRef.current) {
      URL.revokeObjectURL(avatarBlobRef.current)
      avatarBlobRef.current = null
    }
    if (url?.startsWith('blob:')) {
      avatarBlobRef.current = url
    }
    setBlobUrl(url)
  }, [])

  useEffect(() => {
    return () => {
      if (avatarBlobRef.current) {
        URL.revokeObjectURL(avatarBlobRef.current)
        avatarBlobRef.current = null
      }
    }
  }, [])

  const load = useCallback(async () => {
    setError(null)
    try {
      const [inboxList, draft, chatList] = await Promise.all([
        api<InboxItem[]>('/api/inbox'),
        api<{ stepIndex: number; payload?: unknown }>('/api/application'),
        api<ChatMessage[]>('/api/chat'),
      ])
      setItems(inboxList)
      setDraftStep(typeof draft.stepIndex === 'number' ? draft.stepIndex : 0)
      setDraftPayload(
        draft && typeof draft === 'object' && (draft as { payload?: unknown }).payload && typeof (draft as { payload?: unknown }).payload === 'object'
          ? ((draft as { payload: unknown }).payload as Record<string, unknown>)
          : {},
      )
      setChat(chatList)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    async function loadPhoto() {
      if (!user?.hasAvatar) {
        setAvatarPreview(null)
        return
      }
      const token = await getBearerToken()
      if (!token) return
      const res = await fetch('/api/profile/avatar', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (cancelled) return
      if (!res.ok) {
        if (user?.hasAvatar && res.status !== 401) {
          setError((prev) => prev ?? 'Could not load your photo from storage.')
        }
        return
      }
      const blob = await res.blob()
      if (cancelled) return
      const url = URL.createObjectURL(blob)
      setAvatarPreview(url)
    }
    loadPhoto()
    return () => {
      cancelled = true
    }
  }, [user?.hasAvatar, user?.id, setAvatarPreview])

  const initials = useMemo(() => {
    const f = user?.firstName?.trim()?.[0]
    const l = user?.lastName?.trim()?.[0]
    if (f || l) return `${f ?? ''}${l ?? ''}`.toUpperCase()
    const e = user?.email?.trim()?.[0]
    return e ? e.toUpperCase() : '?'
  }, [user?.firstName, user?.lastName, user?.email])

  const displayName =
    [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(' ') ||
    user?.email ||
    'Student'

  const stepLabel =
    STEP_LABELS[Math.min(Math.max(draftStep, 0), STEP_LABELS.length - 1)] ?? STEP_LABELS[0]

  const completion = useMemo(
    () =>
      computeCompletion({
        profile: {
          firstName: user?.firstName ?? null,
          lastName: user?.lastName ?? null,
          // We intentionally compute completion from what’s saved in the application draft,
          // not from the AuthContext user. (Those extra profile fields are stored on /api/profile.)
          phone: null,
          dateOfBirth: null,
          idNumber: null,
          residentialAddress: null,
        },
        payload: draftPayload as unknown as Parameters<typeof computeCompletion>[0]['payload'],
      }),
    [draftPayload, user?.firstName, user?.lastName],
  )

  const statusItems = items.filter((i) => i.kind === 'application_status')
  const latestStatus = statusItems[0]

  async function onAvatarChange(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    setAvatarBusy(true)
    setError(null)
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    try {
      await uploadAvatar(file)
      await refreshSession()
      await load()
    } catch (e) {
      setAvatarPreview(null)
      setError(e instanceof Error ? e.message : 'Could not upload photo')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function onReplySubmit(e: FormEvent, item: InboxItem) {
    e.preventDefault()
    const text = (draftReply[item.id] ?? '').trim()
    if (!text) return
    setReplyBusyId(item.id)
    setError(null)
    try {
      await api<InboxItem>(`/api/inbox/${encodeURIComponent(item.id)}/reply`, {
        method: 'PUT',
        json: { response: text },
      })
      setDraftReply((prev) => ({ ...prev, [item.id]: '' }))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply')
    } finally {
      setReplyBusyId(null)
    }
  }

  async function onChatSend(e: FormEvent) {
    e.preventDefault()
    const text = chatDraft.trim()
    if (!text) return
    setChatBusy(true)
    setError(null)
    try {
      await api<ChatMessage>('/api/chat', { method: 'POST', json: { body: text } })
      setChatDraft('')
      const list = await api<ChatMessage[]>('/api/chat')
      setChat(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message')
    } finally {
      setChatBusy(false)
    }
  }

  return (
    <div className="formShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="formMain">
        <div className="formCard formCardWide profileHub">
          <div className="profileHubHero">
            <div className="profileHeroAvatarWrap">
              <label className="profileHeroAvatarLabel">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="profileHeroAvatarInput"
                  disabled={avatarBusy}
                  onChange={(ev) => {
                    void onAvatarChange(ev.target.files)
                    ev.target.value = ''
                  }}
                />
                <span className="profileHeroAvatar">
                  {blobUrl ? (
                    <img src={blobUrl} alt="" className="profileHeroAvatarImg" />
                  ) : (
                    <span className="profileHeroAvatarInitials">{initials}</span>
                  )}
                </span>
                <span className="profileHeroAvatarHint">{avatarBusy ? 'Uploading…' : 'Photo'}</span>
              </label>
            </div>
            <div className="profileHeroText">
              <h1 className="formTitle">{displayName}</h1>
              <p className="formLead profileHeroEmail">{user?.email}</p>
              <p className="profileHeroHelp">
                This is your student hub. We’ll message you here if we need anything (documents,
                essays, or extra details) and keep you updated on bursaries we apply for.
              </p>
            </div>
          </div>

          {error ? <div className="formError">{error}</div> : null}

          <section className="profileSection" aria-labelledby="profile-application-heading">
            <h2 id="profile-application-heading" className="profileSectionTitle">
              Application progress
            </h2>
            {loading ? (
              <p className="profileMuted">Loading…</p>
            ) : (
              <>
                <div className="progressRow">
                  <div
                    className="progressBar"
                    role="progressbar"
                    aria-valuenow={completion.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="progressFill" style={{ width: `${completion.percent}%` }} />
                  </div>
                  <div className="progressMeta">
                    <strong>{completion.percent}%</strong> complete
                  </div>
                </div>
                <p className="profileSectionLead">
                  You’re on step{' '}
                  <strong>
                    {draftStep + 1} of {STEP_LABELS.length}
                  </strong>{' '}
                  — <strong>{stepLabel}</strong>. Finish once and reuse your answers everywhere you
                  apply.
                </p>
                {completion.missing.length ? (
                  <div className="tipBox">
                    <strong>Next to fill in</strong>
                    <ul>
                      {completion.missing.slice(0, 6).map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="profileActionsRow">
                  <Link className="btn btnDark btnSmall" to="/application">
                    Continue application
                  </Link>
                </div>
              </>
            )}
          </section>

          <section className="profileSection" aria-labelledby="profile-status-heading">
            <h2 id="profile-status-heading" className="profileSectionTitle">
              Where things stand
            </h2>
            <p className="profileSectionLead">
              Status updates appear here when your application moves forward or when we share news.
              When you hear from a specific bursary, we’ll post requests below — reply right from your
              profile.
            </p>
            {!loading && latestStatus ? (
              <article className="profileCard profileCardHighlight">
                <h3 className="profileCardTitle">{latestStatus.title}</h3>
                <p className="profileCardMeta">{formatWhen(latestStatus.createdAt)}</p>
                <p className="profileCardBody">{latestStatus.body}</p>
              </article>
            ) : null}
            {!loading && statusItems.length === 0 ? (
              <p className="profileMuted">No status updates yet.</p>
            ) : null}
            {!loading && statusItems.length > 1 ? (
              <details className="profileHistory">
                <summary>Earlier updates ({statusItems.length - 1})</summary>
                <ul className="profileHistoryList">
                  {statusItems.slice(1).map((it) => (
                    <li key={it.id}>
                      <strong>{it.title}</strong>
                      <span className="profileMuted"> · {formatWhen(it.createdAt)}</span>
                      <p className="profileHistoryBody">{it.body}</p>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>

          <section className="profileSection" aria-labelledby="profile-inbox-heading">
            <h2 id="profile-inbox-heading" className="profileSectionTitle">
              Messages &amp; requests
            </h2>
            <p className="profileSectionLead">
              If a bursary needs something extra — an essay, a clarifying answer, another document —
              it’ll show up here. Submit your reply once and we’ll attach it to your profile.
            </p>
            {loading ? (
              <p className="profileMuted">Loading…</p>
            ) : (
              <div className="profileInbox">
                {items
                  .filter((i) => i.kind !== 'application_status')
                  .map((item) => (
                    <article key={item.id} className="profileCard">
                      <h3 className="profileCardTitle">{item.title}</h3>
                      <p className="profileCardMeta">{formatWhen(item.createdAt)}</p>
                      <p className="profileCardBody">{item.body}</p>
                      {item.requiresResponse ? (
                        item.studentResponse ? (
                          <div className="profileReplySent">
                            <p className="profileReplySentLabel">Your reply</p>
                            <p className="profileReplySentBody">{item.studentResponse}</p>
                            <p className="profileMuted">
                              Sent {item.respondedAt ? formatWhen(item.respondedAt) : ''}
                            </p>
                          </div>
                        ) : (
                          <form className="profileReplyForm" onSubmit={(ev) => void onReplySubmit(ev, item)}>
                            <label className="field">
                              <span>Your response</span>
                              <textarea
                                required
                                rows={5}
                                placeholder="Paste your essay or answer here…"
                                value={draftReply[item.id] ?? ''}
                                disabled={replyBusyId === item.id}
                                onChange={(ev) =>
                                  setDraftReply((prev) => ({ ...prev, [item.id]: ev.target.value }))
                                }
                              />
                            </label>
                            <div className="formActions">
                              <button
                                type="submit"
                                className="btn btnDark btnSmall"
                                disabled={replyBusyId === item.id}
                              >
                                {replyBusyId === item.id ? 'Sending…' : 'Send reply'}
                              </button>
                            </div>
                          </form>
                        )
                      ) : null}
                    </article>
                  ))}
                {!loading &&
                items.filter((i) => i.kind !== 'application_status').length === 0 ? (
                  <p className="profileMuted">Nothing needs your attention right now.</p>
                ) : null}
              </div>
            )}
          </section>

          <section className="profileSection" aria-labelledby="profile-chat-heading">
            <h2 id="profile-chat-heading" className="profileSectionTitle">
              Private chat with Apply Once
            </h2>
            <p className="profileSectionLead">
              Send a message anytime. Use this space to ask questions, share missing information, or
              tell us which bursaries you want to apply for.
            </p>
            <ChatThread messages={chat} role="student" />
            <form className="chatComposer" onSubmit={(ev) => void onChatSend(ev)}>
              <textarea
                className="chatInput"
                placeholder="Type your message…"
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
              />
              <div className="profileActionsRow">
                <button type="submit" className="btn btnDark btnSmall" disabled={chatBusy}>
                  {chatBusy ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
