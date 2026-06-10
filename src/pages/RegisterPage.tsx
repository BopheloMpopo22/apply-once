import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

const REGISTER_PERKS = [
  {
    title: 'Build once, apply everywhere',
    text: 'Save your story, marks, and documents in one profile — we reuse them for bursary applications.',
  },
  {
    title: 'Matched opportunities',
    text: 'Answer a short career questionnaire and see how many open bursaries fit your path.',
  },
  {
    title: 'Support when you need it',
    text: 'Message our team from your profile and get help completing strong applications.',
  },
]

export function RegisterPage() {
  const { loginWithGoogle, registerWithEmail, user } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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

  async function onEmailPassword(e: FormEvent) {
    setError(null)
    setBusy(true)
    try {
      e.preventDefault()
      await registerWithEmail(email, password, { firstName, lastName })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account')
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
            <ApplyOnceLogo size="hero" />
          </Link>
          <p className="loginWelcome">Join Apply Once</p>
          <h1 className="loginHeadline">One profile. Many bursaries.</h1>
          <p className="loginSubhead">
            Create your free student profile in minutes — then discover bursaries, track your application, and get
            support from our team.
          </p>
          <ul className="loginPerks">
            {REGISTER_PERKS.map((p) => (
              <li key={p.title}>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </li>
            ))}
          </ul>
          <p className="loginStat">
            <span className="loginStatNum">Free</span>
            <span className="loginStatLabel">to sign up — pay only when you activate your application</span>
          </p>
        </aside>

        <main className="loginMain">
          <div className="loginCard">
            <p className="authKicker">Start your journey</p>
            <h2 className="formTitle authTitle">Create your Apply Once account</h2>
            <p className="formLead authLead">
              One profile, many bursaries. Sign up in minutes and we will guide you every step of the way.
            </p>
            {error ? <div className="formError">{error}</div> : null}
            <form className="formFields" onSubmit={onEmailPassword}>
              <div className="fieldRow">
                <div className="field">
                  <label htmlFor="reg-first">First name</label>
                  <input
                    id="reg-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-last">Last name</label>
                  <input
                    id="reg-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
                <button type="submit" className="btn btnBrand btnBlock" disabled={busy || !email.trim()}>
                  {busy ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>

            {isOAuthConfigured() ? (
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
              Already have an account?{' '}
              <Link to="/login" className="loginRegisterLink">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
