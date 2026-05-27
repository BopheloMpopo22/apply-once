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
import type { QuestionnaireState } from '../components/application/ApplicationQuestionnaire'
import { ChatThread, type ChatMessage } from '../components/ChatThread'
import { ProfileCareerGoals } from '../components/profile/ProfileCareerGoals'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { computeCompletion } from '../utils/applicationCompletion'
import { getYocoPublicKey, loadYocoSdk } from '../lib/yoco'

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
  const [payBusy, setPayBusy] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [paidCents, setPaidCents] = useState<number>(0)
  const [draftStep, setDraftStep] = useState<number>(0)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draftPayload, setDraftPayload] = useState<Record<string, unknown>>({})
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState | null>(null)
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
      const [inboxList, draft, chatList, q] = await Promise.all([
        api<InboxItem[]>('/api/inbox'),
        api<{ stepIndex: number; payload?: unknown }>('/api/application'),
        api<ChatMessage[]>('/api/chat'),
        api<QuestionnaireState>('/api/questionnaire'),
      ])
      setItems(inboxList)
      setDraftStep(typeof draft.stepIndex === 'number' ? draft.stepIndex : 0)
      setDraftPayload(
        draft && typeof draft === 'object' && (draft as { payload?: unknown }).payload && typeof (draft as { payload?: unknown }).payload === 'object'
          ? ((draft as { payload: unknown }).payload as Record<string, unknown>)
          : {},
      )
      setChat(chatList)
      setQuestionnaire({
        answers: {
          studyChoice1: q.answers?.studyChoice1 ?? '',
          studyChoice2: q.answers?.studyChoice2 ?? '',
          studyChoice3: q.answers?.studyChoice3 ?? '',
          workSector: q.answers?.workSector ?? '',
          jobLinkedBursary: q.answers?.jobLinkedBursary ?? '',
          careerPriority: q.answers?.careerPriority ?? '',
        },
        skipped: Boolean(q.skipped),
        completedAt: q.completedAt ?? null,
        bursaryCount: q.bursaryCount ?? null,
        scholarshipCount: q.scholarshipCount ?? null,
        matchedAt: q.matchedAt ?? null,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshPayment = useCallback(async () => {
    try {
      const s = await api<{ totalPaidCents: number }>('/api/payments/status')
      setPaidCents(Number(s.totalPaidCents) || 0)
    } catch {
      // ignore
    }
  }, [])

  async function startYocoPayment(plan: 'once_off_95' | 'split_50_first' | 'split_50_second') {
    const publicKey = getYocoPublicKey()
    if (!publicKey) {
      setPayError('Payments are not configured yet. Please try again later.')
      return
    }
    setPayBusy(true)
    setPayError(null)
    try {
      await loadYocoSdk()
      const YocoSDK = window.YocoSDK
      if (!YocoSDK) throw new Error('Could not load payment form')
      const yoco = new YocoSDK({ publicKey })
      const amountInCents = plan === 'once_off_95' ? 9500 : 5000

      await new Promise<void>((resolve, reject) => {
        yoco.showPopup({
          amountInCents,
          currency: 'ZAR',
          name: plan === 'once_off_95' ? 'Apply Once application fee' : 'Apply Once application installment',
          description: plan === 'once_off_95' ? 'Once-off fee (R95)' : 'Installment (R50)',
          callback: async (result) => {
            if (result?.error) return reject(new Error(result.error.message || 'Payment cancelled'))
            const token = String(result?.id || '').trim()
            if (!token) return reject(new Error('Payment failed (no token)'))
            try {
              setPayBusy(true)
              await api('/api/payments/yoco/charge', { method: 'POST', json: { token, plan } })
              await refreshPayment()
              resolve()
            } catch (e) {
              reject(e instanceof Error ? e : new Error('Payment failed'))
            } finally {
              setPayBusy(false)
            }
          },
        })
        setPayBusy(false)
      })
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Payment failed')
    } finally {
      setPayBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    void refreshPayment()
  }, [refreshPayment])

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
    <div className="formShell profileShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="formMain profileMain">
        <div className="profileHubCard">
          <header className="profileHubHero">
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
              <p className="profileHeroKicker">Your student hub</p>
              <h1 className="formTitle profileHeroTitle">{displayName}</h1>
              <p className="formLead profileHeroEmail">{user?.email}</p>
              <p className="profileHeroHelp">
                You are building something big — one profile, many bursaries. We will guide you,
                cheer you on, and message you here when we need anything extra.
              </p>
            </div>
          </header>

          {error ? <div className="formError">{error}</div> : null}

          {paidCents < 9500 ? (
            <div className="payBanner payBannerStatic" style={{ marginBottom: 16 }}>
              <div className="payBannerInner">
                <div className="payBannerText">
                  <strong>Activate your application</strong>
                  <span className="muted">
                    Pay anytime: R95 once-off, or R50 now and R50 later.
                  </span>
                  <span className="muted">Paid so far: R{(paidCents / 100).toFixed(2)}</span>
                  {payError ? <span className="payBannerError">{payError}</span> : null}
                </div>
                <div className="payBannerActions">
                  <button className="btn btnBrand btnSmall" disabled={payBusy} onClick={() => void startYocoPayment('once_off_95')}>
                    {payBusy ? 'Opening…' : 'Pay R95'}
                  </button>
                  <button className="btn btnOutline btnSmall" disabled={payBusy || paidCents >= 5000} onClick={() => void startYocoPayment('split_50_first')}>
                    Pay R50 now
                  </button>
                  <button className="btn btnOutline btnSmall" disabled={payBusy || paidCents < 5000} onClick={() => void startYocoPayment('split_50_second')}>
                    Pay remaining R50
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="profileHubGrid">
            <section
              className="profilePanel profilePanelProgress"
              aria-labelledby="profile-application-heading"
            >
              <div className="profilePanelHead">
                <h2 id="profile-application-heading" className="profileSectionTitle">
                  Application progress
                </h2>
                <p className="profilePanelTag">Keep going — you are closer than you think</p>
              </div>
              {loading ? (
                <p className="profileMuted">Loading…</p>
              ) : (
                <>
                  <div className="profileProgressRingWrap">
                    <div
                      className="profileProgressRing"
                      style={{
                        background: `conic-gradient(var(--hfc-blue) ${completion.percent}%, rgba(33, 50, 230, 0.12) 0)`,
                      }}
                      aria-hidden="true"
                    >
                      <span className="profileProgressRingValue">{completion.percent}%</span>
                    </div>
                    <div className="profileProgressCopy">
                      <div className="progressRow profileProgressRow">
                        <div
                          className="progressBar profileProgressBar"
                          role="progressbar"
                          aria-valuenow={completion.percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="progressFill profileProgressFill"
                            style={{ width: `${completion.percent}%` }}
                          />
                        </div>
                      </div>
                      <p className="profileSectionLead profileProgressLead">
                        Step{' '}
                        <strong>
                          {draftStep + 1} of {STEP_LABELS.length}
                        </strong>{' '}
                        — <strong>{stepLabel}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="profileStepPills" aria-label="Application sections">
                    {STEP_LABELS.map((label, i) => (
                      <Link
                        key={label}
                        className={
                          i === draftStep
                            ? 'profileStepPill profileStepPillActive'
                            : i < draftStep
                              ? 'profileStepPill profileStepPillDone'
                              : 'profileStepPill'
                        }
                        to="/application"
                        title={`Go to ${label}`}
                      >
                        {i + 1}. {label}
                      </Link>
                    ))}
                  </div>
                  {completion.missing.length ? (
                    <div className="tipBox profileTipBox">
                      <strong>Next to fill in</strong>
                      <ul>
                        {completion.missing.slice(0, 5).map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="profileActionsRow">
                    <Link className="btn btnBrand btnSmall" to="/application">
                      Continue application
                    </Link>
                    <Link className="btn btnOutline btnSmall" to="/profile/application-pdf">
                      Preview & download PDF
                    </Link>
                  </div>
                </>
              )}
            </section>

            <ProfileCareerGoals initial={questionnaire} onUpdated={setQuestionnaire} />

            <section className="profilePanel profilePanelChat" aria-labelledby="profile-chat-heading">
              <div className="profilePanelHead profilePanelHeadChat">
                <h2 id="profile-chat-heading" className="profileSectionTitle">
                  Chat with Apply Once
                </h2>
                <p className="profilePanelTag">We are on your side — ask anything</p>
              </div>
              <ChatThread messages={chat} role="student" />
              <form className="chatComposer profileChatComposer" onSubmit={(ev) => void onChatSend(ev)}>
                <textarea
                  className="chatInput profileChatInput"
                  placeholder="Ask a question, share an update, or tell us which bursaries excite you…"
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                />
                <div className="profileActionsRow">
                  <button type="submit" className="btn btnBrand btnSmall" disabled={chatBusy}>
                    {chatBusy ? 'Sending…' : 'Send message'}
                  </button>
                </div>
              </form>
            </section>
          </div>

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
                                className="btn btnBrand btnSmall"
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

        </div>
      </main>
    </div>
  )
}
