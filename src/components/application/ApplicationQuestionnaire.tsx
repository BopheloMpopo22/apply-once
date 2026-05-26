import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { QUESTIONNAIRE_STEPS } from '../../data/questionnaireSteps'
import {
  emptyQuestionnaireAnswers,
  type QuestionnaireAnswers,
} from '../../data/questionnaireQuestions'
import { StudyFieldCombo } from './StudyFieldCombo'

export type QuestionnaireState = {
  answers: Partial<QuestionnaireAnswers> & Record<string, string | undefined>
  skipped: boolean
  completedAt: string | null
  bursaryCount: number | null
  scholarshipCount: number | null
  matchedAt: string | null
}

type Phase = 'questions' | 'results' | 'done'

type Props = {
  onComplete: (state: QuestionnaireState) => void
  initial?: QuestionnaireState | null
}

export function ApplicationQuestionnaire(props: Props) {
  const topRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>(() => {
    if (props.initial?.skipped) return 'done'
    if (props.initial?.completedAt && props.initial.bursaryCount != null) return 'results'
    if (props.initial?.completedAt) return 'done'
    return 'questions'
  })
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => ({
    ...emptyQuestionnaireAnswers(),
    ...(props.initial?.answers ?? {}),
  }))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [counts, setCounts] = useState({
    bursaryCount: props.initial?.bursaryCount ?? null,
    scholarshipCount: props.initial?.scholarshipCount ?? null,
  })
  const [searching, setSearching] = useState(false)

  const total = QUESTIONNAIRE_STEPS.length
  const step = QUESTIONNAIRE_STEPS[stepIndex]

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [stepIndex, phase])

  useEffect(() => {
    if (props.initial?.skipped) {
      setPhase('done')
      return
    }
    if (props.initial?.completedAt && props.initial.bursaryCount != null) {
      setCounts({
        bursaryCount: props.initial.bursaryCount,
        scholarshipCount: props.initial.scholarshipCount,
      })
      setPhase('results')
    }
  }, [props.initial])

  async function finishQuestionnaire(skipped: boolean) {
    setBusy(true)
    setError(null)
    try {
      const res = await api<QuestionnaireState>('/api/questionnaire', {
        method: 'PUT',
        json: skipped ? { skipped: true, answers: {} } : { skipped: false, answers },
      })
      props.onComplete(res)
      if (skipped) {
        setPhase('done')
        return
      }
      setCounts({
        bursaryCount: res.bursaryCount,
        scholarshipCount: res.scholarshipCount,
      })
      setSearching(true)
      window.setTimeout(() => {
        setSearching(false)
        setPhase('results')
      }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save questionnaire')
    } finally {
      setBusy(false)
    }
  }

  function validateStep(): boolean {
    if (!step) return false
    if (step.kind === 'study-choices') {
      if (!answers.studyChoice1.trim() || !answers.studyChoice2.trim() || !answers.studyChoice3.trim()) {
        setError('Fill in all three study choices (pick from the list or type your own).')
        return false
      }
      return true
    }
    const v = answers[step.question.id]
    if (!v) {
      setError('Choose an option to continue.')
      return false
    }
    return true
  }

  function goNext() {
    if (!validateStep()) return
    setError(null)
    if (stepIndex < total - 1) {
      setStepIndex((i) => i + 1)
      return
    }
    void finishQuestionnaire(false)
  }

  function goBack() {
    setError(null)
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  if (phase === 'done') {
    return (
      <div className="appQuestionnaire appQuestionnaireCompact appQuestionnaireDone">
        <p className="appQuestionnaireDoneText">
          Career goals saved.{' '}
          <Link to="/profile">Edit them on your profile</Link> anytime to refresh your bursary count.
        </p>
      </div>
    )
  }

  if (phase === 'results') {
    const b = counts.bursaryCount ?? 0
    const s = counts.scholarshipCount ?? 0
    return (
      <div className="appQuestionnaire appQuestionnaireCompact appQuestionnaireResults">
        <p className="appQuestionnaireEyebrow">Matches found</p>
        <h2 className="appQuestionnaireResultsTitle">
          <strong>{b}</strong> open bursar{b === 1 ? 'y' : 'ies'} · <strong>{s}</strong> scholarship
          {s === 1 ? '' : 's'}
        </h2>
        <p className="appQuestionnaireResultsLead">
          Only opportunities still open for applications are counted. Closed programmes (e.g. past closing date) are
          excluded.
        </p>
        <button type="button" className="btn btnBrand btnSmall" onClick={() => setPhase('done')} disabled={busy}>
          Continue to application →
        </button>
      </div>
    )
  }

  if (searching) {
    return (
      <div className="appQuestionnaire appQuestionnaireCompact appQuestionnaireSearching">
        <div className="appQuestionnaireSpinner" aria-hidden />
        <p className="appQuestionnaireSearchingText">Searching open bursaries & scholarships…</p>
      </div>
    )
  }

  const stepTitle =
    step?.kind === 'study-choices' ? step.title : step?.kind === 'choice' ? step.question.title : ''

  return (
    <div className="appQuestionnaire appQuestionnaireCompact" ref={topRef}>
      <div className="appQuestionnaireHead">
        <p className="appQuestionnaireEyebrow">Quick career match</p>
        <p className="appQuestionnaireProgress">
          Step {stepIndex + 1} of {total}
        </p>
      </div>

      <div className="appQuestionnaireCard" key={step?.id ?? stepIndex}>
        <h2 className="appQuestionnaireQuestion">{stepTitle}</h2>
        {step?.kind === 'study-choices' && step.subtitle ? (
          <p className="appQuestionnaireSubtitle">{step.subtitle}</p>
        ) : null}
        {step?.kind === 'choice' && step.question.subtitle ? (
          <p className="appQuestionnaireSubtitle">{step.question.subtitle}</p>
        ) : null}

        {step?.kind === 'study-choices' ? (
          <div className="appQuestionnaireStudyGrid">
            <StudyFieldCombo
              label="1st choice (dream programme)"
              value={answers.studyChoice1}
              onChange={(v) => setAnswers((p) => ({ ...p, studyChoice1: v }))}
            />
            <StudyFieldCombo
              label="2nd choice"
              value={answers.studyChoice2}
              onChange={(v) => setAnswers((p) => ({ ...p, studyChoice2: v }))}
            />
            <StudyFieldCombo
              label="3rd choice"
              value={answers.studyChoice3}
              onChange={(v) => setAnswers((p) => ({ ...p, studyChoice3: v }))}
            />
          </div>
        ) : step?.kind === 'choice' ? (
          <div className="appQuestionnaireOptions appQuestionnaireOptionsCompact" role="listbox">
            {step.question.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={answers[step.question.id] === opt.value}
                className={
                  answers[step.question.id] === opt.value
                    ? 'appQuestionnaireOption appQuestionnaireOptionActive'
                    : 'appQuestionnaireOption'
                }
                onClick={() => setAnswers((p) => ({ ...p, [step.question.id]: opt.value }))}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="formError appQuestionnaireError">{error}</p> : null}

        <div className="appQuestionnaireNav">
          <button
            type="button"
            className="btn btnGhost btnSmall"
            onClick={goBack}
            disabled={stepIndex === 0 || busy}
          >
            ← Back
          </button>
          <button type="button" className="btn btnBrand btnSmall" onClick={goNext} disabled={busy}>
            {stepIndex < total - 1 ? 'Next →' : busy ? 'Saving…' : 'See my matches'}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="appQuestionnaireSkip"
        onClick={() => void finishQuestionnaire(true)}
        disabled={busy}
      >
        Skip — I am ready to apply
      </button>
    </div>
  )
}
