import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { setToken } from '../api/client'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'

/** OAuth redirect target — Supabase returns here with tokens in the URL hash; client exchanges session. */
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
