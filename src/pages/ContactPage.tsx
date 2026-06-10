import { InfoPageShell } from '../components/InfoPageShell'
import { CONTACT_EMAIL, SITE_NAME } from '../constants/site'

export function ContactPage() {
  return (
    <InfoPageShell title="Contact">
      <p>
        Have a question about your profile, application, or payment? We would love to hear from you.
      </p>
      <div className="infoPageContactBlock">
        <p className="infoPageContactLabel">Email</p>
        <a className="infoPageContactEmail" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </div>
      <p className="muted">
        We aim to reply within a few business days. Please include the email address you used to
        register on {SITE_NAME} so we can find your account quickly.
      </p>
    </InfoPageShell>
  )
}
