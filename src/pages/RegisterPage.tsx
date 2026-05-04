import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

export function RegisterPage() {
  const { register, loginWithGoogle, user } = useAuth()
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await register(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register')
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
          <h1 className="formTitle">Create your account</h1>
          <p className="formLead">Save your profile and one application you can reuse for bursaries.</p>
          {error ? <div className="formError">{error}</div> : null}
          {isOAuthConfigured() ? (
            <>
              <div className="formActions">
                <button type="button" className="btn btnOutline" disabled={busy} onClick={() => void onGoogle()}>
                  {busy ? 'Redirecting…' : 'Continue with Google'}
                </button>
              </div>
              <p className="formOAuthDivider">or register with email</p>
            </>
          ) : null}
          <form className="formFields" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="formActions">
              <button type="submit" className="btn btnDark" disabled={busy}>
                {busy ? 'Creating…' : 'Create account'}
              </button>
              <Link className="btnOutline" to="/login">
                Already have an account
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
