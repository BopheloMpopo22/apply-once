import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { getHubBySlug } from '../data/hubs/hubRegistry'
import { HubComingSoon } from '../components/hubs/HubComingSoon'
import { UniversityAdmissionsHub } from '../components/hubs/UniversityAdmissionsHub'
import { CollegesHub } from '../components/hubs/CollegesHub'
import { AdmissionsTestsHub } from '../components/hubs/AdmissionsTestsHub'

export function StudentHubPage() {
  const { hubSlug } = useParams<{ hubSlug: string }>()
  const hub = hubSlug ? getHubBySlug(hubSlug) : undefined

  if (!hub) {
    return (
      <div className="formShell hubShell">
        <main className="hubMain">
          <div className="hubContainer hubNotFound">
            <h1>Hub not found</h1>
            <p className="muted">That explore page does not exist yet.</p>
            <Link className="btn btnBrand" to="/#features">
              Back to explore
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (hub.slug === 'universities') {
    return <UniversityAdmissionsHub hub={hub} />
  }

  if (hub.slug === 'colleges') {
    return <CollegesHub hub={hub} />
  }

  if (hub.slug === 'admissions-tests') {
    return <AdmissionsTestsHub hub={hub} />
  }

  return <HubComingSoon hub={hub} />
}
