import { InfoPageShell } from '../components/InfoPageShell'
import { SITE_NAME } from '../constants/site'

export function AboutPage() {
  return (
    <InfoPageShell title="About">
      <p>
        {SITE_NAME} helps Grade 11 and Grade 12 learners in South Africa apply to bursaries,
        scholarships, and university opportunities with one comprehensive student profile.
      </p>
      <p>
        Instead of repeating the same information on every application, you build your profile once.
        We help you match to opportunities, keep your documents organised, and apply on your behalf
        where possible.
      </p>
      <h2>What you can do on {SITE_NAME}</h2>
      <ul>
        <li>Build a single student profile and application</li>
        <li>Explore bursaries, scholarships, and varsity guides</li>
        <li>Use tools like the varsity calculator and matric past papers</li>
        <li>Track your application status from your profile</li>
      </ul>
      <p className="muted">
        We are building for learners across South Africa — from township schools to private colleges.
      </p>
    </InfoPageShell>
  )
}
