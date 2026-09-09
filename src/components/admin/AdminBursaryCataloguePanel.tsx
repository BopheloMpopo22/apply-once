import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/adminClient'

export type BursaryAdminRow = {
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
  workSectors?: string[]
  notes?: string | null
  lastCheckedAt?: string | null
  lastVerifiedAt?: string | null
  linkStatus?: string
  linkStatusDetail?: string | null
  needsReview?: boolean
}

type Filter = 'open' | 'closed' | 'review' | 'all'

function toDateInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function emptyDraft(): {
  name: string
  provider: string
  type: 'bursary' | 'scholarship'
  applicationCloses: string
  applyUrl: string
  studyFields: string
  active: boolean
  offersJobAfterGrad: boolean
  notes: string
} {
  return {
    name: '',
    provider: '',
    type: 'bursary',
    applicationCloses: '',
    applyUrl: '',
    studyFields: 'all',
    active: true,
    offersJobAfterGrad: false,
    notes: '',
  }
}

function draftFromRow(row: BursaryAdminRow) {
  return {
    name: row.name,
    provider: row.provider,
    type: (row.type === 'scholarship' ? 'scholarship' : 'bursary') as 'bursary' | 'scholarship',
    applicationCloses: toDateInput(row.applicationCloses),
    applyUrl: row.applyUrl || '',
    studyFields: (row.studyFields || []).join(', '),
    active: row.active,
    offersJobAfterGrad: row.offersJobAfterGrad,
    notes: row.notes || '',
  }
}

function linkBadge(row: BursaryAdminRow) {
  const s = row.linkStatus || 'unknown'
  if (s === 'ok') return { className: 'adminBursaryBadgeOpen', label: 'Link OK' }
  if (s === 'dead') return { className: 'adminBursaryBadgeClosed', label: 'Dead link' }
  if (s === 'no_url') return { className: 'adminBursaryBadgeClosed', label: 'No URL' }
  if (s === 'error') return { className: 'adminBursaryBadgeClosed', label: 'Link error' }
  return { className: 'adminMuted', label: 'Unchecked' }
}

export function AdminBursaryCataloguePanel(props: { onError: (msg: string | null) => void }) {
  const { onError } = props
  const [filter, setFilter] = useState<Filter>('open')
  const [bursaries, setBursaries] = useState<BursaryAdminRow[]>([])
  const [meta, setMeta] = useState({ openCount: 0, closedCount: 0, reviewCount: 0, total: 0 })
  const [busy, setBusy] = useState(false)
  const [syncBusy, setSyncBusy] = useState(false)
  const [healthBusy, setHealthBusy] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(emptyDraft())

  const refresh = useCallback(async () => {
    setBusy(true)
    setMessage(null)
    try {
      const res = await adminApi<{
        items: BursaryAdminRow[]
        openCount: number
        closedCount: number
        reviewCount?: number
        total: number
      }>(`/api/admin/bursaries?filter=${encodeURIComponent(filter)}`)
      setBursaries(res.items)
      setMeta({
        openCount: res.openCount,
        closedCount: res.closedCount,
        reviewCount: res.reviewCount ?? 0,
        total: res.total,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load bursaries'
      setMessage(msg)
      onError(msg)
    } finally {
      setBusy(false)
    }
  }, [filter, onError])

  useEffect(() => {
    void refresh()
  }, [refresh])

  function startEdit(row: BursaryAdminRow) {
    setCreating(false)
    setEditingId(row.id)
    setDraft(draftFromRow(row))
    setMessage(null)
  }

  function startCreate() {
    setEditingId(null)
    setCreating(true)
    setDraft(emptyDraft())
    setMessage(null)
  }

  async function onSave() {
    setSaveBusy(true)
    setMessage(null)
    onError(null)
    try {
      const body = {
        name: draft.name,
        provider: draft.provider,
        type: draft.type,
        applicationCloses: draft.applicationCloses,
        applyUrl: draft.applyUrl,
        studyFields: draft.studyFields,
        active: draft.active,
        offersJobAfterGrad: draft.offersJobAfterGrad,
        notes: draft.notes,
      }
      if (creating) {
        await adminApi('/api/admin/bursaries', { method: 'POST', json: body })
        setMessage('Added listing. It is flagged for review until you verify it.')
      } else if (editingId) {
        await adminApi(`/api/admin/bursaries/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          json: body,
        })
        setMessage('Saved. Student match counts use this live catalogue, not the code file.')
      }
      setCreating(false)
      setEditingId(null)
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save bursary'
      setMessage(msg)
      onError(msg)
    } finally {
      setSaveBusy(false)
    }
  }

  async function onVerify(id: string) {
    setSaveBusy(true)
    try {
      await adminApi(`/api/admin/bursaries/${encodeURIComponent(id)}/verify`, {
        method: 'POST',
        json: {},
      })
      setMessage('Marked as checked. It will drop out of the review list.')
      await refresh()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not verify'
      setMessage(msg)
      onError(msg)
    } finally {
      setSaveBusy(false)
    }
  }

  const formOpen = creating || Boolean(editingId)

  return (
    <section className="adminCard" style={{ gridColumn: '1 / -1' }}>
      <div className="adminToolbar" style={{ marginTop: 0 }}>
        <h2 className="adminCardTitle" style={{ margin: 0 }}>
          Bursaries & scholarships catalogue
        </h2>
        <Link className="btn btnOutline btnSmall" to="/bursary-track">
          Open bursary track
        </Link>
        <label className="field" style={{ maxWidth: 180, marginLeft: 'auto' }}>
          <span>Show</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="open">Open only</option>
            <option value="review">Needs review</option>
            <option value="closed">Closed / inactive</option>
            <option value="all">All</option>
          </select>
        </label>
        <button type="button" className="btn btnOutline btnSmall" disabled={busy} onClick={() => void refresh()}>
          {busy ? 'Loading…' : 'Refresh'}
        </button>
        <button
          type="button"
          className="btn btnOutline btnSmall"
          disabled={healthBusy}
          onClick={async () => {
            setHealthBusy(true)
            setMessage(null)
            try {
              const res = await adminApi<{
                checked: number
                flagged: number
                probed: number
                closedByDate?: number
              }>('/api/admin/bursaries/health-check', { method: 'POST', json: { force: true } })
              setMessage(
                `Checked ${res.checked} listings (${res.probed} links). ${res.closedByDate ?? 0} closed because the date passed. ${res.flagged} need a look (dead or missing link).`,
              )
              await refresh()
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Health check failed'
              setMessage(msg)
              onError(msg)
            } finally {
              setHealthBusy(false)
            }
          }}
        >
          {healthBusy ? 'Checking links…' : 'Check dates & links'}
        </button>
        <button
          type="button"
          className="btn btnDark btnSmall"
          disabled={syncBusy}
          onClick={async () => {
            setSyncBusy(true)
            setMessage(null)
            try {
              const res = await adminApi<{ created: number; skipped: number; totalInFile: number }>(
                '/api/admin/bursaries/sync',
                { method: 'POST', json: {} },
              )
              setMessage(
                `Imported ${res.created} new listing${res.created === 1 ? '' : 's'} from code. ${res.skipped} already in the database were left unchanged.`,
              )
              await refresh()
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Sync failed'
              setMessage(msg)
              onError(msg)
            } finally {
              setSyncBusy(false)
            }
          }}
        >
          {syncBusy ? 'Importing…' : 'Import new from code'}
        </button>
        <button type="button" className="btn btnOutline btnSmall" onClick={startCreate}>
          Add listing
        </button>
      </div>
      <p className="adminCardLead">
        This is the official live list. The public <strong>Bursary track</strong> page and student match counts
        both read from here. Each morning around 06:00 SAST we re-check: if the close date has passed, the
        listing is switched off automatically. Dead apply links are flagged for you — they are not guessed
        closed from a down page. Import from code only adds missing names.
      </p>
      {message ? <p className="adminMuted">{message}</p> : null}
      <p className="adminMuted">
        {meta.openCount} open · {meta.closedCount} closed/inactive · {meta.reviewCount} need review · showing{' '}
        {bursaries.length}
      </p>

      {formOpen ? (
        <div className="adminBursaryEdit">
          <h3 className="adminSubheading">{creating ? 'New listing' : 'Edit listing'}</h3>
          <div className="adminBursaryEditGrid">
            <label className="field">
              <span>Name</span>
              <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </label>
            <label className="field">
              <span>Provider</span>
              <input value={draft.provider} onChange={(e) => setDraft((d) => ({ ...d, provider: e.target.value }))} />
            </label>
            <label className="field">
              <span>Type</span>
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, type: e.target.value === 'scholarship' ? 'scholarship' : 'bursary' }))
                }
              >
                <option value="bursary">Bursary</option>
                <option value="scholarship">Scholarship</option>
              </select>
            </label>
            <label className="field">
              <span>Closes</span>
              <input
                type="date"
                value={draft.applicationCloses}
                onChange={(e) => setDraft((d) => ({ ...d, applicationCloses: e.target.value }))}
              />
            </label>
            <label className="field adminBursaryEditWide">
              <span>Apply URL</span>
              <input
                value={draft.applyUrl}
                onChange={(e) => setDraft((d) => ({ ...d, applyUrl: e.target.value }))}
                placeholder="https://…"
              />
            </label>
            <label className="field adminBursaryEditWide">
              <span>Study fields (comma-separated slugs, or all)</span>
              <input
                value={draft.studyFields}
                onChange={(e) => setDraft((d) => ({ ...d, studyFields: e.target.value }))}
                placeholder="engineering, it, all"
              />
            </label>
            <label className="field adminBursaryEditWide">
              <span>Notes</span>
              <input value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} />
            </label>
            <label className="adminCheckLabel">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              />
              Active (counts toward matches if still open)
            </label>
            <label className="adminCheckLabel">
              <input
                type="checkbox"
                checked={draft.offersJobAfterGrad}
                onChange={(e) => setDraft((d) => ({ ...d, offersJobAfterGrad: e.target.checked }))}
              />
              Work contract after graduation
            </label>
          </div>
          <div className="formActions">
            <button type="button" className="btn btnDark btnSmall" disabled={saveBusy} onClick={() => void onSave()}>
              {saveBusy ? 'Saving…' : creating ? 'Create' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btnOutline btnSmall"
              onClick={() => {
                setCreating(false)
                setEditingId(null)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="adminTableWrap">
        <table className="adminTable adminBursaryTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Type</th>
              <th>Closes</th>
              <th>Status</th>
              <th>Link</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bursaries.map((b) => {
              const link = linkBadge(b)
              return (
                <tr key={b.id} className={editingId === b.id ? 'adminTableRowSelected' : undefined}>
                  <td>
                    {b.name}
                    {b.needsReview ? <span className="adminBursaryReviewPill">Review</span> : null}
                  </td>
                  <td>{b.provider}</td>
                  <td>{b.type}</td>
                  <td>{new Date(b.applicationCloses).toLocaleDateString()}</td>
                  <td>
                    {b.isOpen && b.active ? (
                      <span className="adminBursaryBadgeOpen">Open</span>
                    ) : (
                      <span className="adminBursaryBadgeClosed">{b.active ? 'Closed' : 'Inactive'}</span>
                    )}
                  </td>
                  <td>
                    <span className={link.className}>{link.label}</span>
                    {b.applyUrl ? (
                      <>
                        {' '}
                        <a href={b.applyUrl} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </>
                    ) : null}
                    {b.linkStatusDetail ? <div className="adminMuted">{b.linkStatusDetail}</div> : null}
                  </td>
                  <td>
                    <div className="adminBursaryRowActions">
                      <button type="button" className="btn btnOutline btnSmall" onClick={() => startEdit(b)}>
                        Edit
                      </button>
                      {b.needsReview ? (
                        <button
                          type="button"
                          className="btn btnDark btnSmall"
                          disabled={saveBusy}
                          onClick={() => void onVerify(b.id)}
                        >
                          Verified
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
