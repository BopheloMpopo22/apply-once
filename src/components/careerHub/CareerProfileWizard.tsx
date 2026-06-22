import { useMemo, useState } from 'react'
import type { CareerProfile, CareerStage } from '../../types/careerHub'
import {
  CAREER_STAGE_OPTIONS,
  SA_PROVINCES,
  writeCareerProfile,
} from '../../utils/careerHub/profileStorage'

type CareerProfileWizardProps = {
  onComplete: (profile: CareerProfile) => void
}

const STEPS = [
  { key: 'stage', title: 'Where are you at?', emoji: '🎯' },
  { key: 'location', title: 'Where are you based?', emoji: '📍' },
  { key: 'interests', title: 'What excites you?', emoji: '✨' },
  { key: 'study', title: 'What are you studying?', emoji: '📚' },
  { key: 'jobs', title: 'Dream jobs?', emoji: '🚀' },
] as const

export function CareerProfileWizard(props: CareerProfileWizardProps) {
  const { onComplete } = props
  const [step, setStep] = useState(0)
  const [stage, setStage] = useState<CareerStage | ''>('')
  const [province, setProvince] = useState('')
  const [locationDetail, setLocationDetail] = useState('')
  const [interests, setInterests] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [stillInHighSchool, setStillInHighSchool] = useState(false)
  const [jobInterests, setJobInterests] = useState('')
  const [displayName, setDisplayName] = useState('')

  const progress = ((step + 1) / STEPS.length) * 100
  const current = STEPS[step]

  const canNext = useMemo(() => {
    if (step === 0) return Boolean(stage)
    if (step === 1) return Boolean(province.trim())
    if (step === 2) return interests.trim().length >= 2
    if (step === 3) {
      if (stage === 'in_matric') return stillInHighSchool || fieldOfStudy.trim().length >= 2
      if (stage === 'finished_matric') return fieldOfStudy.trim().length >= 2 || stillInHighSchool
      return fieldOfStudy.trim().length >= 2
    }
    if (step === 4) return jobInterests.trim().length >= 2 && displayName.trim().length >= 2
    return false
  }, [step, stage, province, interests, fieldOfStudy, stillInHighSchool, jobInterests, displayName])

  function finish() {
    if (!stage || !canNext) return
    const profile: CareerProfile = {
      stage,
      province: province.trim(),
      locationDetail: locationDetail.trim(),
      interests: interests.trim(),
      fieldOfStudy: stillInHighSchool ? 'Still in high school' : fieldOfStudy.trim(),
      stillInHighSchool,
      jobInterests: jobInterests.trim(),
      displayName: displayName.trim(),
      completedAt: new Date().toISOString(),
    }
    writeCareerProfile(profile)
    onComplete(profile)
  }

  function onNext() {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }

  return (
    <div className="careerWizardShell">
      <div className="careerWizardCard">
        <div className="careerWizardProgressWrap">
          <div className="careerWizardProgressTrack">
            <div className="careerWizardProgressFill" style={{ width: `${progress}%` }} />
          </div>
          <p className="careerWizardProgressLabel">
            Step {step + 1} of {STEPS.length} — almost there! 💙
          </p>
        </div>

        <p className="careerWizardEmoji" aria-hidden="true">
          {current.emoji}
        </p>
        <h2 className="careerWizardTitle">{current.title}</h2>

        {step === 0 ? (
          <div className="careerWizardOptions">
            {CAREER_STAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={stage === opt.value ? 'careerWizardChip careerWizardChipActive' : 'careerWizardChip'}
                onClick={() => {
                  setStage(opt.value)
                  setStillInHighSchool(opt.value === 'in_matric')
                }}
              >
                <span aria-hidden="true">{opt.emoji}</span> {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="careerWizardFields">
            <label className="careerWizardField">
              <span>Province</span>
              <select className="input" value={province} onChange={(e) => setProvince(e.target.value)}>
                <option value="">Choose province…</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="careerWizardField">
              <span>Town / city (optional)</span>
              <input
                className="input"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="e.g. Soweto, Stellenbosch, Durban North"
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <label className="careerWizardField">
            <span>Your interests — tech, finance, helping people, design…</span>
            <textarea
              className="input careerWizardTextarea"
              rows={4}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Tell us what you enjoy — the more we know, the better we can match opportunities 🌟"
            />
          </label>
        ) : null}

        {step === 3 ? (
          <div className="careerWizardFields">
            {stage === 'in_matric' || stage === 'finished_matric' ? (
              <label className="careerWizardCheck">
                <input
                  type="checkbox"
                  checked={stillInHighSchool}
                  onChange={(e) => setStillInHighSchool(e.target.checked)}
                />
                🏫 I&apos;m still in high school / choosing subjects
              </label>
            ) : null}
            {!stillInHighSchool ? (
              <label className="careerWizardField">
                <span>Field of study or plans</span>
                <input
                  className="input"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. BCom Accounting, IT diploma, considering engineering"
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="careerWizardFields">
            <label className="careerWizardField">
              <span>What jobs or industries interest you?</span>
              <textarea
                className="input careerWizardTextarea"
                rows={3}
                value={jobInterests}
                onChange={(e) => setJobInterests(e.target.value)}
                placeholder="e.g. banking graduate programme, software internship, vacation work at an audit firm"
              />
            </label>
            <label className="careerWizardField">
              <span>Your first name (for your profile card)</span>
              <input
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Thabo"
              />
            </label>
          </div>
        ) : null}

        <div className="careerWizardActions">
          {step > 0 ? (
            <button type="button" className="btn btnOutline btnSmall" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn btnBrand btnSmall" disabled={!canNext} onClick={onNext}>
            {step === STEPS.length - 1 ? 'See my opportunities 🎉' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
