import { Link } from 'react-router-dom'
import type { CareerProfile } from '../../types/careerHub'
import { CAREER_STAGE_OPTIONS } from '../../utils/careerHub/profileStorage'

type ProfileWorkProgrammesProps = {
  profile: CareerProfile | null
}

export function ProfileWorkProgrammes(props: ProfileWorkProgrammesProps) {
  const { profile } = props

  if (!profile) {
    return (
      <section className="profileGoalsCard">
        <h2 className="profileSectionTitle">Programmes for work</h2>
        <p className="muted">
          Complete the short questionnaire on{' '}
          <Link to="/programmes-for-work">Programmes for work</Link> so we can show internships, learnerships, and
          graduate programmes that fit your stage.
        </p>
        <Link className="btn btnBrand btnSmall" to="/programmes-for-work">
          Set up work profile
        </Link>
      </section>
    )
  }

  const stageLabel = CAREER_STAGE_OPTIONS.find((s) => s.value === profile.stage)?.label ?? profile.stage

  return (
    <section className="profileGoalsCard">
      <div className="profileGoalsHead">
        <div>
          <h2 className="profileSectionTitle">Programmes for work</h2>
          <p className="profileGoalsLead muted">
            Used to sort graduate programmes, internships, vacation work, and learnerships on your hub.
          </p>
        </div>
        <Link className="btn btnOutline btnSmall" to="/programmes-for-work">
          Open hub
        </Link>
      </div>
      <dl className="careerProfileFacts profileWorkFacts">
        <div>
          <dt>Name</dt>
          <dd>{profile.displayName}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{stageLabel}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>
            {profile.province}
            {profile.locationDetail ? ` · ${profile.locationDetail}` : ''}
          </dd>
        </div>
        <div>
          <dt>Interests</dt>
          <dd>{profile.interests}</dd>
        </div>
        <div>
          <dt>Study</dt>
          <dd>{profile.fieldOfStudy}</dd>
        </div>
        <div>
          <dt>Job goals</dt>
          <dd>{profile.jobInterests}</dd>
        </div>
      </dl>
    </section>
  )
}
