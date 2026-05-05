import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

export function RegisterPage() {
  const { loginWithGoogle, loginWithFacebook, registerWithEmail, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to="/profile" replace />
  }

  async function onGoogle() {
    setError(null)
    setBusy(true)
    try {
      sessionStorage.setItem('oauth_redirect', '/profile')
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
      sessionStorage.setItem('oauth_redirect', '/profile')
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
      await registerWithEmail(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account')
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
          <h1 className="formTitle">Create or open your account</h1>
          <p className="formLead">Create an account with email/password, or use Google/Facebook.</p>
          {error ? <div className="formError">{error}</div> : null}
          <div className="formFields">
            <form className="formFields" onSubmit={onEmailPassword}>
              <div className="field">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 8 chars)"
                  required
                  minLength={8}
                />
              </div>
              <div className="formActions">
                <button type="submit" className="btn btnDark" disabled={busy || !email.trim()}>
                  {busy ? 'Creating…' : 'Create account'}
                </button>
                <Link className="btnOutline" to="/login">
                  Back to sign in
                </Link>
              </div>
            </form>

            {isOAuthConfigured() ? (
              <>
                <p className="formOAuthDivider">or</p>
                <div className="formActions">
                  <button type="button" className="btn btnOutline btnProvider" disabled={busy} onClick={() => void onGoogle()}>
                    <span className="providerIcon" aria-hidden="true">
                      G
                    </span>
                    {busy ? 'Redirecting…' : 'Continue with Google'}
                  </button>
                  <button type="button" className="btn btnOutline btnProvider" disabled={busy} onClick={() => void onFacebook()}>
                    <span className="providerIcon" aria-hidden="true">
                      f
                    </span>
                    {busy ? 'Redirecting…' : 'Continue with Facebook'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
