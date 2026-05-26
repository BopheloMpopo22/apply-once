import { useState } from 'react'
import { api } from '../../api/client'
import {
  labelForAnswer,
  QUESTIONNAIRE_QUESTIONS,
  type QuestionnaireAnswers,
} from '../../data/questionnaireQuestions'
import type { QuestionnaireState } from '../application/ApplicationQuestionnaire'

type Props = {
  initial: QuestionnaireState | null
  onUpdated: (state: QuestionnaireState) => void
}

export function ProfileCareerGoals(props: Props) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [local, setLocal] = useState<QuestionnaireState | null>(props.initial)

  const data = local ?? props.initial
  const skipped = data?.skipped

  async function save(answers: QuestionnaireAnswers) {
    setBusy(true)
    setError(null)
    try {
      const res = await api<QuestionnaireState>('/api/questionnaire', {
        method: 'PUT',
        json: { skipped: false, answers },
      })
      setLocal(res)
      props.onUpdated(res)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setBusy(false)
    }
  }

  if (!data?.completedAt && !skipped) {
    return (
      <section className="profileGoalsCard">
        <h2 className="profileSectionTitle">Career goals</h2>
        <p className="muted">
          Complete the short questionnaire on your{' '}
          <a href="/application">application form</a> to see how many bursaries match your plans.
        </p>
      </section>
    )
  }

  if (skipped) {
    return (
      <section className="profileGoalsCard">
        <h2 className="profileSectionTitle">Career goals</h2>
        <p className="muted">You skipped the career questionnaire. You can retake it on your application form.</p>
        <a className="btn btnBrand btnSmall" href="/application">
          Open application
        </a>
      </section>
    )
  }

  return (
    <section className="profileGoalsCard">
      <div className="profileGoalsHead">
        <h2 className="profileSectionTitle">Career goals</h2>
        {data?.bursaryCount != null ? (
          <p className="profileGoalsMatch">
            <strong>{data.bursaryCount}</strong> open bursaries · <strong>{data.scholarshipCount}</strong>{' '}
            scholarships (last checked{' '}
            {data.matchedAt ? new Date(data.matchedAt).toLocaleDateString() : 'recently'})
          </p>
        ) : null}
      </div>

      {!editing ? (
        <>
          <dl className="profileGoalsList">
            {QUESTIONNAIRE_QUESTIONS.map((q) => (
              <div key={q.id}>
                <dt>{q.title}</dt>
                <dd>{labelForAnswer(q.id, data?.answers[q.id] ?? '') || '—'}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className="btn btnGhost btnSmall" onClick={() => setEditing(true)}>
            Edit answers
          </button>
        </>
      ) : (
        <ProfileGoalsEditForm
          initial={data?.answers ?? {}}
          busy={busy}
          error={error}
          onCancel={() => setEditing(false)}
          onSave={(a) => void save(a)}
        />
      )}
    </section>
  )
}

function ProfileGoalsEditForm(props: {
  initial: Partial<QuestionnaireAnswers>
  busy: boolean
  error: string | null
  onCancel: () => void
  onSave: (answers: QuestionnaireAnswers) => void
}) {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    studyChoice1: props.initial.studyChoice1 ?? '',
    studyChoice2: props.initial.studyChoice2 ?? '',
    studyChoice3: props.initial.studyChoice3 ?? '',
    workSector: props.initial.workSector ?? '',
    jobLinkedBursary: props.initial.jobLinkedBursary ?? '',
    careerPriority: props.initial.careerPriority ?? '',
  })

  return (
    <form
      className="profileGoalsForm"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSave(answers)
      }}
    >
      {QUESTIONNAIRE_QUESTIONS.map((q) => (
        <label key={q.id} className="field">
          <span className="fieldLabel">{q.title}</span>
          <select
            className="fieldInput"
            value={answers[q.id]}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            required
          >
            <option value="">Select…</option>
            {q.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {props.error ? <p className="formError">{props.error}</p> : null}
      <div className="profileGoalsFormActions">
        <button type="button" className="btn btnGhost btnSmall" onClick={props.onCancel} disabled={props.busy}>
          Cancel
        </button>
        <button type="submit" className="btn btnBrand btnSmall" disabled={props.busy}>
          {props.busy ? 'Saving…' : 'Save & refresh matches'}
        </button>
      </div>
    </form>
  )
}
