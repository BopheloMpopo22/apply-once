import { InfoPageShell } from '../components/InfoPageShell'
import { CONTACT_EMAIL, SITE_NAME } from '../constants/site'

export function TermsPage() {
  return (
    <InfoPageShell title="Terms & conditions">
      <p className="muted">Last updated: June 2026</p>
      <p>
        By using {SITE_NAME} ({`applyonce.org`}), you agree to these terms. If you do not agree,
        please do not use the platform.
      </p>

      <h2>Who can use {SITE_NAME}</h2>
      <p>
        The platform is intended for learners in South Africa (typically Grade 11–12 or recent
        matriculants) and authorised administrators. You must provide accurate information in your
        profile and application.
      </p>

      <h2>Your account and data</h2>
      <ul>
        <li>You are responsible for keeping your login details secure.</li>
        <li>
          Information you submit (profile, documents, application answers) is used to help you apply
          to bursaries, scholarships, and related opportunities.
        </li>
        <li>
          Do not upload content you do not have the right to share, or false information intended to
          mislead funders or institutions.
        </li>
      </ul>

      <h2>Payments</h2>
      <p>
        Where an application or activation fee applies, payment is processed through our payment
        provider (Yoco). Fees and what they cover are shown before you pay. Refund policies, if
        any, will be communicated at the point of payment.
      </p>

      <h2>Our role</h2>
      <p>
        {SITE_NAME} helps you prepare and submit applications and matches you to opportunities. We do
        not guarantee funding, admission, or interview outcomes. Final decisions rest with bursary
        providers, universities, and other third parties.
      </p>

      <h2>Third-party links</h2>
      <p>
        The site links to external resources (government past papers, university sites, bursary
        portals). We are not responsible for the content or policies of those sites.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the site after changes means
        you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </InfoPageShell>
  )
}
