import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import {
  emptyQuestionnaireAnswers,
  QUESTIONNAIRE_QUESTIONS,
  type QuestionnaireAnswers,
} from '../../data/questionnaireQuestions'

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
  const [phase, setPhase] = useState<Phase>(() => {
    if (props.initial?.skipped) return 'done'
    if (props.initial?.completedAt && props.initial.bursaryCount != null) return 'results'
    if (props.initial?.completedAt) return 'done'
    return 'questions'
  })
  const [questionIndex, setQuestionIndex] = useState(0)
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

  const total = QUESTIONNAIRE_QUESTIONS.length
  const current = QUESTIONNAIRE_QUESTIONS[questionIndex]
  const currentValue = current ? answers[current.id] : ''

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

  function setAnswer(value: string) {
    if (!current) return
    setAnswers((prev) => ({ ...prev, [current.id]: value }))
  }

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
      }, 1400)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save questionnaire')
    } finally {
      setBusy(false)
    }
  }

  function goNext() {
    if (!currentValue) {
      setError('Choose an option to continue.')
      return
    }
    setError(null)
    if (questionIndex < total - 1) {
      setQuestionIndex((i) => i + 1)
      return
    }
    void finishQuestionnaire(false)
  }

  function goBack() {
    setError(null)
    if (questionIndex > 0) setQuestionIndex((i) => i - 1)
  }

  if (phase === 'done') {
    return (
      <div className="appQuestionnaire appQuestionnaireDone">
        <p className="appQuestionnaireDoneText">
          You can update your career goals anytime from your{' '}
          <Link to="/profile">profile</Link>.
        </p>
      </div>
    )
  }

  if (phase === 'results') {
    const b = counts.bursaryCount ?? 0
    const s = counts.scholarshipCount ?? 0
    return (
      <div className="appQuestionnaire appQuestionnaireResults">
        <p className="appQuestionnaireEyebrow">Matches found</p>
        <h2 className="appQuestionnaireResultsTitle">
          We found <strong>{b}</strong> open bursar{b === 1 ? 'y' : 'ies'} and{' '}
          <strong>{s}</strong> scholarship{s === 1 ? '' : 's'} for your goals
        </h2>
        <p className="appQuestionnaireResultsLead">
          These are real opportunities in our database that are still open and align with what you
          told us. Complete your application below and we can apply on your behalf.
        </p>
        <button
          type="button"
          className="btn btnBrand"
          onClick={() => setPhase('done')}
          disabled={busy}
        >
          Continue to application
        </button>
      </div>
    )
  }

  if (searching) {
    return (
      <div className="appQuestionnaire appQuestionnaireSearching">
        <div className="appQuestionnaireSpinner" aria-hidden />
        <p className="appQuestionnaireSearchingText">Searching open bursaries & scholarships…</p>
      </div>
    )
  }

  return (
    <div className="appQuestionnaire">
      <div className="appQuestionnaireHead">
        <p className="appQuestionnaireEyebrow">Quick career match</p>
        <p className="appQuestionnaireProgress">
          Question {questionIndex + 1} of {total}
        </p>
      </div>

      <div className="appQuestionnaireCard">
        <h2 className="appQuestionnaireQuestion">{current?.title}</h2>
        {current?.subtitle ? <p className="appQuestionnaireSubtitle">{current.subtitle}</p> : null}

        <div className="appQuestionnaireOptions" role="listbox" aria-label={current?.title}>
          {current?.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={currentValue === opt.value}
              className={
                currentValue === opt.value
                  ? 'appQuestionnaireOption appQuestionnaireOptionActive'
                  : 'appQuestionnaireOption'
              }
              onClick={() => setAnswer(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error ? <p className="formError appQuestionnaireError">{error}</p> : null}

        <div className="appQuestionnaireNav">
          <button
            type="button"
            className="btn btnGhost btnSmall appQuestionnaireNavBack"
            onClick={goBack}
            disabled={questionIndex === 0 || busy}
          >
            ← Back
          </button>
          <button type="button" className="btn btnBrand btnSmall" onClick={goNext} disabled={busy}>
            {questionIndex < total - 1 ? 'Next →' : busy ? 'Saving…' : 'See my matches'}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="appQuestionnaireSkip"
        onClick={() => void finishQuestionnaire(true)}
        disabled={busy}
      >
        Skip questionnaire — I am ready to apply
      </button>
    </div>
  )
}
