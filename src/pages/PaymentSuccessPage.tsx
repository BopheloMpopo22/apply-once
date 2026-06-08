import { Link, useLocation } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'

type SuccessState = {
  from?: 'profile' | 'application'
}

export function PaymentSuccessPage() {
  const location = useLocation()
  const from = (location.state as SuccessState | null)?.from ?? 'profile'

  return (
    <div className="formShell paymentSuccessShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="formMain paymentSuccessMain">
        <div className="paymentSuccessCard">
          <div className="paymentSuccessIcon" aria-hidden="true">
            ✓
          </div>
          <p className="paymentSuccessKicker">Payment received</p>
          <h1 className="formTitle paymentSuccessTitle">You are all set!</h1>
          <p className="formLead paymentSuccessLead">
            Thank you for activating your application. Your information is now being processed by
            our team.
          </p>
          <ul className="paymentSuccessList">
            <li>We review your profile and match you to open bursaries and scholarships.</li>
            <li>You will receive updates in your profile inbox and by email when we need anything.</li>
            <li>Keep your application up to date — every detail helps us apply on your behalf.</li>
          </ul>
          <div className="paymentSuccessActions">
            <Link to="/profile" className="btn btnBrand">
              Back to my profile
            </Link>
            {from === 'application' ? (
              <Link to="/application" className="btn btnOutline">
                Continue application
              </Link>
            ) : null}
            <Link to="/" className="btn btnOutline">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
