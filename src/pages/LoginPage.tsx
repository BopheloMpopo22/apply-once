import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { isOAuthConfigured } from '../lib/supabaseClient'

export function LoginPage() {
  const { loginWithGoogle, sendEmailLink, startPhoneSignIn, verifyPhoneCode, user } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const oauthEnabled = isOAuthConfigured()
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [phone, setPhone] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsCode, setSmsCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  const phoneHint = useMemo(() => 'Use international format, e.g. +27XXXXXXXXX', [])

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

  async function onSendSms() {
    setError(null)
    setBusy(true)
    try {
      await startPhoneSignIn(phone)
      setSmsSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send SMS code')
    } finally {
      setBusy(false)
    }
  }

  async function onVerifySms() {
    setError(null)
    setBusy(true)
    try {
      await verifyPhoneCode(phone, smsCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify code')
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
          {oauthEnabled ? (
            <>
              <div className="formActions">
                <button
                  type="button"
                  className="btn btnOutline"
                  disabled={busy}
                  onClick={() => void onGoogle()}
                >
                  {busy ? 'Redirecting…' : 'Continue with Google'}
                </button>
              </div>
              <p className="formOAuthDivider">or</p>
            </>
          ) : null}
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
              <button type="button" className="btn btnDark" disabled={busy || !email.trim()} onClick={() => void onEmailLink()}>
                {busy ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </div>
            {emailSent ? (
              <p className="formLead">Check your email. Open the link to finish signing in.</p>
            ) : null}

            <p className="formOAuthDivider">or</p>

            <div className="field">
              <label htmlFor="login-phone">Phone</label>
              <input
                id="login-phone"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={phoneHint}
              />
            </div>
            {!smsSent ? (
              <div className="formActions">
                <button
                  type="button"
                  className="btn btnDark"
                  disabled={busy || !phone.trim()}
                  onClick={() => void onSendSms()}
                >
                  {busy ? 'Sending…' : 'Send SMS code'}
                </button>
              </div>
            ) : (
              <>
                <div className="field">
                  <label htmlFor="login-sms">SMS code</label>
                  <input
                    id="login-sms"
                    inputMode="numeric"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="123456"
                  />
                </div>
                <div className="formActions">
                  <button
                    type="button"
                    className="btn btnDark"
                    disabled={busy || !smsCode.trim()}
                    onClick={() => void onVerifySms()}
                  >
                    {busy ? 'Verifying…' : 'Verify code'}
                  </button>
                  <button
                    type="button"
                    className="btnOutline"
                    disabled={busy}
                    onClick={() => {
                      setSmsSent(false)
                      setSmsCode('')
                    }}
                  >
                    Change number
                  </button>
                </div>
              </>
            )}

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
