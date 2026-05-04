const TOKEN_KEY = 'apply_once_token'

export const API_UNAVAILABLE_HINT =
  'The API server is not reachable or returned the website HTML instead of JSON. Run npm run dev (starts API on port 3001 and Vite together), or in two terminals run npm run dev:api and npm run dev:web.'

export function parseJsonResponse(text: string, pathHint: string): unknown | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('<')) {
    throw new Error(API_UNAVAILABLE_HINT)
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(`${pathHint}: response was not JSON (${trimmed.slice(0, 80)}…)`)
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
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

export async function uploadAvatar(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch('/api/profile/avatar', {
    method: 'POST',
    headers,
    body: fd,
  })
  const text = await res.text()
  const data = parseJsonResponse(text, '/api/profile/avatar')
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: string }).error)
        : res.statusText
    throw new Error(msg)
  }
  return data as { ok: boolean; hasAvatar: boolean }
}

export async function uploadDocument(category: string, file: File) {
  const fd = new FormData()
  fd.append('category', category)
  fd.append('file', file)
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch('/api/documents', {
    method: 'POST',
    headers,
    body: fd,
  })
  const text = await res.text()
  const data = parseJsonResponse(text, '/api/documents')
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: string }).error)
        : res.statusText
    throw new Error(msg)
  }
  return data
}
