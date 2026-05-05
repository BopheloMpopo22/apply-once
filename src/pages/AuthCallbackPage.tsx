import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { setToken } from '../api/client'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'

/** OAuth redirect target for Supabase Auth (Google, email link, etc.). */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const client = supabase
    if (!client) {
      setFailed(true)
      return
    }
    const sb = client
    let cancelled = false
    async function run() {
      // Supabase may return with either:
      // - PKCE code in query string (?code=...), which requires exchangeCodeForSession
      // - Tokens in URL hash (implicit), which getSession can pick up after detectSessionInUrl
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        const { data, error } = await sb.auth.exchangeCodeForSession(window.location.href)
        if (cancelled) return
        if (error || !data.session?.access_token) {
          setFailed(true)
          return
        }
        // Clean URL (remove code) after a successful exchange.
        window.history.replaceState({}, document.title, url.origin + url.pathname)
      }

      const { data, error } = await sb.auth.getSession()
      if (cancelled) return
      if (error || !data.session?.access_token) {
        setFailed(true)
        return
      }
      setToken(data.session.access_token)
      const to = sessionStorage.getItem('oauth_redirect') || '/profile'
      sessionStorage.removeItem('oauth_redirect')
      navigate(to, { replace: true })
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  if (failed) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="formShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="formMain">
        <p className="formLead">Completing sign-in…</p>
      </main>
    </div>
  )
}
