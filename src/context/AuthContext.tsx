import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getBearerToken, setToken } from '../api/client'
import { HAS_ACCOUNT_STORAGE_KEY } from '../constants'
import { supabase } from '../lib/supabaseClient'

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
  loginWithGoogle: () => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchMe(): Promise<SessionUser> {
  return api<SessionUser>('/api/me')
}

type AuthTokenResponse = {
  token: string
  user?: { id: string; email: string }
}

function minimalUser(u: { id: string; email: string }): SessionUser {
  return {
    id: u.id,
    email: u.email,
    firstName: null,
    lastName: null,
    hasAvatar: false,
  }
}

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    setToken(null)
    setUser(null)
    await supabase?.auth.signOut()
  }, [])

  const refreshSession = useCallback(async () => {
    const token = await getBearerToken()
    if (!token) {
      setUser(null)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
        setToken(null)
        setUser(null)
        await supabase?.auth.signOut()
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const token = await getBearerToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) setUser(me)
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : ''
          if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
            setToken(null)
            setUser(null)
            await supabase?.auth.signOut()
          }
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

  useEffect(() => {
    if (!supabase) return
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setToken(null)
        setUser(null)
        return
      }
      if (session.access_token) {
        setToken(session.access_token)
        await refreshSession()
      }
    })
    return () => subscription.unsubscribe()
  }, [refreshSession])

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) {
      throw new Error(
        'Google sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await supabase?.auth.signOut()
    const res = await api<AuthTokenResponse>('/api/auth/login', {
      method: 'POST',
      json: { email, password },
    })
    setToken(res.token)
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
    if (res.user) setUser(minimalUser(res.user))
    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      if (!res.user) throw new Error('Signed in but could not load your profile. Try again.')
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    await supabase?.auth.signOut()
    const res = await api<AuthTokenResponse>('/api/auth/register', {
      method: 'POST',
      json: { email, password },
    })
    setToken(res.token)
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
    if (res.user) setUser(minimalUser(res.user))
    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      if (!res.user) throw new Error('Account created but could not load your profile. Try signing in.')
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshSession,
      login,
      loginWithGoogle,
      register,
      logout,
    }),
    [user, loading, refreshSession, login, loginWithGoogle, register, logout],
  )

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
