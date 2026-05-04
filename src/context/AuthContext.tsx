import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getToken, setToken } from '../api/client'
import { HAS_ACCOUNT_STORAGE_KEY } from '../constants'

export type SessionUser = {
  id: string
  email: string
  createdAt?: string
  firstName?: string | null
  lastName?: string | null
  hasAvatar?: boolean
}

type AuthState = {
  user: SessionUser | null
  loading: boolean
  refreshSession: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchMe(): Promise<SessionUser> {
  return api<SessionUser>('/api/me')
}

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refreshSession = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      setToken(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string }>('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    })
    setToken(res.token)
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
    const me = await fetchMe()
    setUser(me)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string }>('/api/auth/register', {
      method: 'POST',
      json: { email, password },
    })
    setToken(res.token)
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
    const me = await fetchMe()
    setUser(me)
  }, [])

  const value = useMemo(
    () => ({ user, loading, refreshSession, login, register, logout }),
    [user, loading, refreshSession, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
