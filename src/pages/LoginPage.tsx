import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

const LOGIN_PERKS = [
  {
    title: 'One profile, many bursaries',
    text: 'Apply to hundreds of SA bursaries and scholarships without retyping the same story every time.',
  },
  {
    title: 'See what you qualify for',
    text: 'Check university and programme eligibility, APS tools, and career-match counts in one place.',
  },
  {
    title: 'We help you apply',
    text: 'Save your documents once — our team can use your profile when applying on your behalf.',
  },
]

export function LoginPage() {
  const { loginWithGoogle, loginWithEmail, user } = useAuth()
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
    <div className="loginShell">
      <div className="loginGradient" aria-hidden />
      <div className="loginLayout">
        <aside className="loginHero">
          <Link to="/" className="loginLogoLink">
            <ApplyOnceLogo />
          </Link>
          <p className="loginWelcome">Welcome to Apply Once</p>
          <h1 className="loginHeadline">Your future starts with one application.</h1>
          <p className="loginSubhead">
            Build a single, powerful student profile — then reach bursaries, universities, and opportunities that
            match you.
          </p>
          <ul className="loginPerks">
            {LOGIN_PERKS.map((p) => (
              <li key={p.title}>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
          <p className="loginStat">
            <span className="loginStatNum">100+</span>
            <span className="loginStatLabel">bursaries & scholarships in our growing catalogue</span>
          </p>
        </aside>

        <main className="loginMain">
          <div className="loginCard">
            <p className="authKicker">Sign in</p>
            <h2 className="formTitle authTitle">Pick up where you left off</h2>
            <p className="formLead authLead">
              Your application, messages, and chat with our team — all in one secure place.
            </p>
            {error ? <div className="formError">{error}</div> : null}
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
                <button type="submit" className="btn btnBrand btnBlock" disabled={busy || !email.trim()}>
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
                    className="btn btnOutline btnProvider btnBlock"
                    disabled={busy}
                    onClick={() => void onGoogle()}
                  >
                    <span className="providerIcon" aria-hidden="true">
                      G
                    </span>
                    {busy ? 'Redirecting…' : 'Continue with Google'}
                  </button>
                </div>
              </>
            ) : null}

            <p className="loginRegister">
              First time here?{' '}
              <Link to="/register" className="loginRegisterLink">
                Create your free profile
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
