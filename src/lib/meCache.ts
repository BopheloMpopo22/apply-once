export type CachedSessionUser = {
  id: string
  email: string
  createdAt?: string
  firstName?: string | null
  lastName?: string | null
  hasAvatar?: boolean
}

const ME_CACHE_KEY = 'apply_once_me_cache_v1'
const TOKEN_KEY = 'apply_once_token'

export function readCachedMe(): CachedSessionUser | null {
  try {
    const raw = localStorage.getItem(ME_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const u = parsed as Partial<CachedSessionUser>
    if (!u.id || !u.email) return null
    return {
      id: String(u.id),
      email: String(u.email),
      createdAt: typeof u.createdAt === 'string' ? u.createdAt : undefined,
      firstName: u.firstName ?? null,
      lastName: u.lastName ?? null,
      hasAvatar: Boolean(u.hasAvatar),
    }
  } catch {
    return null
  }
}

export function writeCachedMe(me: CachedSessionUser | null) {
  try {
    if (!me) localStorage.removeItem(ME_CACHE_KEY)
    else localStorage.setItem(ME_CACHE_KEY, JSON.stringify(me))
  } catch {
    /* ignore */
  }
}

export function hasStoredSession(): boolean {
  try {
    return Boolean(localStorage.getItem(TOKEN_KEY) && readCachedMe())
  } catch {
    return false
  }
}
