import { parseJsonResponse } from './client'
import { getBearerToken } from './client'

const ADMIN_SESSION_KEY = 'apply_once_admin_token'

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_SESSION_KEY)
}

export function setAdminToken(token: string | null) {
  if (token) sessionStorage.setItem(ADMIN_SESSION_KEY, token)
  else sessionStorage.removeItem(ADMIN_SESSION_KEY)
}

export async function adminApi<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  // Prefer Supabase bearer token (admin is just a normal signed-in user).
  const bearer = await getBearerToken()
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`)

  // Legacy fallback (older deployments).
  const legacy = getAdminToken()
  if (legacy) headers.set('X-Admin-Token', legacy)
  const res = await fetch(path, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  })
  const text = await res.text()
  const data = parseJsonResponse(text, path)
  if (!res.ok) {
    const msg =
      typeof data === 'object' &&
      data !== null &&
      !Array.isArray(data) &&
      'error' in data
        ? String((data as { error: string }).error)
        : res.statusText
    throw new Error(msg)
  }
  return data as T
}

export async function adminDownloadFile(path: string, filename: string) {
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
      const data = JSON.parse(text) as { error?: string }
      if (data.error) msg = data.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
