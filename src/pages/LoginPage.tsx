import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

export function LoginPage() {
  const { loginWithGoogle, loginWithFacebook, sendEmailLink, user } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const oauthEnabled = isOAuthConfigured()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
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

  async function onEmailLink() {
    setError(null)
    setBusy(true)
    try {
      sessionStorage.setItem('oauth_redirect', from)
      await sendEmailLink(email)
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send sign-in email')
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
          <p className="formLead">Choose a sign-in method. No passwords required.</p>
          {error ? <div className="formError">{error}</div> : null}
          <div className="formFields">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="formActions">
              <button
                type="button"
                className="btn btnDark"
                disabled={busy || !email.trim()}
                onClick={() => void onEmailLink()}
              >
                {busy ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </div>
            {emailSent ? (
              <p className="formLead">Check your email. Open the link to finish signing in.</p>
            ) : null}

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
