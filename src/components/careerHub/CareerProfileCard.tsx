import type { CareerProfile } from '../../types/careerHub'
import { CAREER_STAGE_OPTIONS } from '../../utils/careerHub/profileStorage'

type CareerProfileCardProps = {
  profile: CareerProfile
  onEdit: () => void
  onClear: () => void
}

export function CareerProfileCard(props: CareerProfileCardProps) {
  const { profile, onEdit, onClear } = props
  const stageLabel = CAREER_STAGE_OPTIONS.find((s) => s.value === profile.stage)?.label ?? profile.stage
  const stageEmoji = CAREER_STAGE_OPTIONS.find((s) => s.value === profile.stage)?.emoji ?? '👤'

  return (
    <aside className="careerProfileCard">
      <div className="careerProfileCardHead">
        <div className="careerProfileAvatar" aria-hidden="true">
          {stageEmoji}
        </div>
        <div>
          <h2 className="careerProfileName">{profile.displayName}</h2>
          <p className="careerProfileMeta muted">{stageLabel}</p>
        </div>
      </div>
      <dl className="careerProfileFacts">
        <div>
          <dt>📍 Location</dt>
          <dd>
            {profile.province}
            {profile.locationDetail ? ` · ${profile.locationDetail}` : ''}
          </dd>
        </div>
        <div>
          <dt>✨ Interests</dt>
          <dd>{profile.interests}</dd>
        </div>
        <div>
          <dt>📚 Study</dt>
          <dd>{profile.fieldOfStudy}</dd>
        </div>
        <div>
          <dt>🚀 Job goals</dt>
          <dd>{profile.jobInterests}</dd>
        </div>
      </dl>
      <div className="careerProfileCardActions">
        <button type="button" className="btn btnOutline btnSmall" onClick={onEdit}>
          Update answers
        </button>
        <button
          type="button"
          className="btn btnGhost btnSmall"
          onClick={onClear}
        >
          Start over
        </button>
      </div>
    </aside>
  )
}
