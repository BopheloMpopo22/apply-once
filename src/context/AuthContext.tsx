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

const ME_CACHE_KEY = 'apply_once_me_cache_v1'

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
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string, name?: { firstName: string; lastName: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchMe(): Promise<SessionUser> {
  return api<SessionUser>('/api/me')
}

function readCachedMe(): SessionUser | null {
  try {
    const raw = localStorage.getItem(ME_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const u = parsed as Partial<SessionUser>
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

function writeCachedMe(me: SessionUser | null) {
  try {
    if (!me) localStorage.removeItem(ME_CACHE_KEY)
    else localStorage.setItem(ME_CACHE_KEY, JSON.stringify(me))
  } catch {
    /* ignore */
  }
}

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readCachedMe())
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    setToken(null)
    setUser(null)
    writeCachedMe(null)
    await supabase?.auth.signOut()
  }, [])

  const refreshSession = useCallback(async () => {
    const token = await getBearerToken()
    if (!token) {
      setUser(null)
      writeCachedMe(null)
      return
    }
    try {
      const me = await fetchMe()
      setUser(me)
      writeCachedMe(me)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
        setToken(null)
        setUser(null)
        writeCachedMe(null)
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
        if (!cancelled) writeCachedMe(me)
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : ''
          if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
            setToken(null)
            setUser(null)
            writeCachedMe(null)
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

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
    if (!supabase) {
      throw new Error(
        'Email sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    const clean = email.trim().toLowerCase()
    if (!clean) throw new Error('Email is required')
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters')
    const { data, error } = await supabase.auth.signInWithPassword({ email: clean, password })
    if (error) throw error
    if (data.session?.access_token) {
      setToken(data.session.access_token)
      localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
      await refreshSession()
    }
    },
    [refreshSession],
  )

  const registerWithEmail = useCallback(async (email: string, password: string, name?: { firstName: string; lastName: string }) => {
    if (!supabase) {
      throw new Error(
        'Email sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    const clean = email.trim().toLowerCase()
    if (!clean) throw new Error('Email is required')
    if (!password || password.length < 8) throw new Error('Password must be at least 8 characters')
    const { data, error } = await supabase.auth.signUp({
      email: clean,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: name
          ? {
              firstName: name.firstName.trim(),
              lastName: name.lastName.trim(),
            }
          : undefined,
      },
    })
    if (error) throw error
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
    // If email confirmation is OFF, we'll have a session and can refresh immediately.
    if (data.session?.access_token) {
      setToken(data.session.access_token)
      await refreshSession()
    }
  }, [refreshSession])

  const value = useMemo(
    () => ({
      user,
      loading,
      refreshSession,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
    }),
    [
      user,
      loading,
      refreshSession,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
