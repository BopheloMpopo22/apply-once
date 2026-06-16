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
import { markHasAccount } from '../constants'
import { hasStoredSession, readCachedMe, writeCachedMe, type CachedSessionUser } from '../lib/meCache'
import { supabase } from '../lib/supabaseClient'

export type SessionUser = CachedSessionUser

type AuthState = {
  user: SessionUser | null
  loading: boolean
  isAdmin: boolean
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

function sessionUserFromSupabaseUser(
  u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
  fallbackEmail: string,
): SessionUser {
  const meta = u.user_metadata ?? {}
  return {
    id: u.id,
    email: String(u.email || fallbackEmail).trim().toLowerCase(),
    firstName:
      typeof meta.firstName === 'string'
        ? meta.firstName
        : typeof meta.first_name === 'string'
          ? meta.first_name
          : null,
    lastName:
      typeof meta.lastName === 'string'
        ? meta.lastName
        : typeof meta.last_name === 'string'
          ? meta.last_name
          : null,
    hasAvatar: false,
  }
}

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readCachedMe())
  const [loading, setLoading] = useState(() => !hasStoredSession())
  const [isAdmin, setIsAdmin] = useState(false)

  const refreshAdmin = useCallback(async () => {
    try {
      await api('/api/admin/me')
      setIsAdmin(true)
    } catch {
      setIsAdmin(false)
    }
  }, [])

  const logout = useCallback(async () => {
    markHasAccount()
    setToken(null)
    setUser(null)
    writeCachedMe(null)
    setIsAdmin(false)
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
      markHasAccount()
      void refreshAdmin()
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
        setToken(null)
        setUser(null)
        writeCachedMe(null)
        setIsAdmin(false)
        await supabase?.auth.signOut()
      }
    }
  }, [refreshAdmin])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const token = await getBearerToken()
      if (!token) {
        if (!cancelled) setLoading(false)
        return
      }

      const cached = readCachedMe()
      if (cached) {
        if (!cancelled) {
          setUser(cached)
          setLoading(false)
        }
        try {
          const me = await fetchMe()
          if (!cancelled) {
            setUser(me)
            writeCachedMe(me)
            markHasAccount()
          }
        } catch (e) {
          if (!cancelled) {
            const msg = e instanceof Error ? e.message : ''
            if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
              setToken(null)
              setUser(null)
              writeCachedMe(null)
              setIsAdmin(false)
              await supabase?.auth.signOut()
            }
          }
        } finally {
          if (!cancelled) void refreshAdmin()
        }
        return
      }

      try {
        const me = await fetchMe()
        if (!cancelled) {
          setUser(me)
          writeCachedMe(me)
          markHasAccount()
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : ''
          if (/Unauthorized|Invalid token|^Not found$/i.test(msg)) {
            setToken(null)
            setUser(null)
            writeCachedMe(null)
            setIsAdmin(false)
            await supabase?.auth.signOut()
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          void refreshAdmin()
        }
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [refreshAdmin])

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
        markHasAccount()
        if (data.user) {
          const optimistic = sessionUserFromSupabaseUser(data.user, clean)
          setUser(optimistic)
          writeCachedMe(optimistic)
          setLoading(false)
        }
        void refreshSession()
      }
    },
    [refreshSession],
  )

  const registerWithEmail = useCallback(
    async (email: string, password: string, name?: { firstName: string; lastName: string }) => {
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
      markHasAccount()
      if (data.session?.access_token) {
        setToken(data.session.access_token)
        if (data.user) {
          const optimistic = sessionUserFromSupabaseUser(data.user, clean)
          setUser(optimistic)
          writeCachedMe(optimistic)
          setLoading(false)
        }
        void refreshSession()
      }
    },
    [refreshSession],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      refreshSession,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
    }),
    [
      user,
      loading,
      isAdmin,
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
