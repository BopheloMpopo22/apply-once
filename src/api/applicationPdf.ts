import { adminApi, getAdminToken } from './adminClient'
import { api, getBearerToken } from './client'
import type { ApplicationSnapshot } from '../utils/applicationSnapshotView'

export async function fetchApplicationSnapshot(studentId?: string): Promise<ApplicationSnapshot> {
  if (studentId) {
    return adminApi<ApplicationSnapshot>(
      `/api/admin/students/${encodeURIComponent(studentId)}/application/snapshot`,
    )
  }
  return api<ApplicationSnapshot>('/api/application/snapshot')
}

export async function downloadApplicationPdf(opts?: { studentId?: string; filename?: string }) {
  const path = opts?.studentId
    ? `/api/admin/students/${encodeURIComponent(opts.studentId)}/application/pdf`
    : '/api/application/pdf'

  const headers = new Headers()
  const bearer = await getBearerToken()
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`)
  const legacy = getAdminToken()
  if (legacy) headers.set('X-Admin-Token', legacy)

  const res = await fetch(path, { headers })
  if (!res.ok) {
    const text = await res.text()
    let msg = res.statusText
    try {
      const j = JSON.parse(text) as { error?: string }
      if (j.error) msg = j.error
    } catch {
      if (text.trim().startsWith('{')) msg = text.slice(0, 120)
    }
    throw new Error(msg)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = opts?.filename ?? 'apply-once-application.pdf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
