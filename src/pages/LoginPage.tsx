import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

export function LoginPage() {
  const { loginWithGoogle, loginWithFacebook, loginWithEmail, user } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const oauthEnabled = isOAuthConfigured()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  async function onGoogle() {
    setError(null)
    setBusy(true)
    try {
      sessionStorage.setItem('oauth_redirect', from)
      await loginWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
      setBusy(false)
    }
  }

  async function onFacebook() {
    setError(null)
    setBusy(true)
    try {
      sessionStorage.setItem('oauth_redirect', from)
      await loginWithFacebook()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Facebook sign-in failed')
      setBusy(false)
    }
  }

  async function onEmailPassword(e: FormEvent) {
    setError(null)
    setBusy(true)
    try {
      e.preventDefault()
      await loginWithEmail(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
    } finally {
      setBusy(false)
    }
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
        <div className="formCard">
          <h1 className="formTitle">Sign in</h1>
          <p className="formLead">Sign in with email/password, or use Google/Facebook.</p>
          {error ? <div className="formError">{error}</div> : null}
          <div className="formFields">
            <form className="formFields" onSubmit={onEmailPassword}>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div className="formActions">
                <button type="submit" className="btn btnDark" disabled={busy || !email.trim()}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>

            {oauthEnabled ? (
              <>
                <p className="formOAuthDivider">or</p>
                <div className="formActions">
                  <button
                    type="button"
                    className="btn btnOutline btnProvider"
                    disabled={busy}
                    onClick={() => void onGoogle()}
                  >
                    <span className="providerIcon" aria-hidden="true">
                      G
                    </span>
                    {busy ? 'Redirecting…' : 'Continue with Google'}
                  </button>
                  <button
                    type="button"
                    className="btn btnOutline btnProvider"
                    disabled={busy}
                    onClick={() => void onFacebook()}
                  >
                    <span className="providerIcon" aria-hidden="true">
                      f
                    </span>
                    {busy ? 'Redirecting…' : 'Continue with Facebook'}
                  </button>
                </div>
              </>
            ) : null}

            <div className="formActions">
              <Link className="btnOutline" to="/register">
                First time here?
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
