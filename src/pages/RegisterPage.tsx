import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

export function RegisterPage() {
  const { loginWithGoogle, loginWithFacebook, sendEmailLink, user } = useAuth()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
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

  async function onEmailLink() {
    setError(null)
    setBusy(true)
    try {
      sessionStorage.setItem('oauth_redirect', '/profile')
      await sendEmailLink(email)
      setEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send sign-in email')
    } finally {
      setBusy(false)
    }
  }

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault()
    await onEmailLink()
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
          <p className="formLead">No passwords. Use Google, Facebook, or email link.</p>
          {error ? <div className="formError">{error}</div> : null}
          <div className="formFields">
            <form className="formFields" onSubmit={onEmailSubmit}>
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
              <div className="formActions">
                <button type="submit" className="btn btnDark" disabled={busy || !email.trim()}>
                  {busy ? 'Sending…' : 'Send sign-in link'}
                </button>
                <Link className="btnOutline" to="/login">
                  Back to sign in
                </Link>
              </div>
            </form>
            {emailSent ? (
              <p className="formLead">Check your email. Open the link to finish signing in.</p>
            ) : null}

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
