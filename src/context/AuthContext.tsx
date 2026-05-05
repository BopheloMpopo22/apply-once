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
  loginWithGoogle: () => Promise<void>
  sendEmailLink: (email: string) => Promise<void>
  startPhoneSignIn: (phoneE164: string) => Promise<void>
  verifyPhoneCode: (phoneE164: string, code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function fetchMe(): Promise<SessionUser> {
  return api<SessionUser>('/api/me')
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

  const sendEmailLink = useCallback(async (email: string) => {
    if (!supabase) {
      throw new Error(
        'Email sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    const clean = email.trim().toLowerCase()
    if (!clean) throw new Error('Email is required')
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
  }, [])

  const startPhoneSignIn = useCallback(async (phoneE164: string) => {
    if (!supabase) {
      throw new Error(
        'Phone sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    const phone = phoneE164.trim()
    if (!phone.startsWith('+')) {
      throw new Error('Phone number must be in international format, e.g. +27XXXXXXXXX')
    }
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) throw error
    localStorage.setItem(HAS_ACCOUNT_STORAGE_KEY, '1')
  }, [])

  const verifyPhoneCode = useCallback(async (phoneE164: string, code: string) => {
    if (!supabase) {
      throw new Error(
        'Phone sign-in is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
    }
    const phone = phoneE164.trim()
    const token = code.trim()
    if (!phone.startsWith('+')) {
      throw new Error('Phone number must be in international format, e.g. +27XXXXXXXXX')
    }
    if (!token) throw new Error('Code is required')
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
    if (error) throw error
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
      sendEmailLink,
      startPhoneSignIn,
      verifyPhoneCode,
      logout,
    }),
    [
      user,
      loading,
      refreshSession,
      loginWithGoogle,
      sendEmailLink,
      startPhoneSignIn,
      verifyPhoneCode,
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
