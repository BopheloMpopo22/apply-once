import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { StudyFieldCombo } from '../application/StudyFieldCombo'
import {
  labelForAnswer,
  labelForStudyChoice,
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
          Complete the short questionnaire on your <Link to="/application">application form</Link> to see how many open
          bursaries match your plans.
        </p>
      </section>
    )
  }

  if (skipped) {
    return (
      <section className="profileGoalsCard">
        <h2 className="profileSectionTitle">Career goals</h2>
        <p className="muted">You skipped the career questionnaire. Retake it on your application to get a match count.</p>
        <Link className="btn btnBrand btnSmall" to="/application">
          Open application
        </Link>
      </section>
    )
  }

  return (
    <section className="profileGoalsCard">
      <div className="profileGoalsHead">
        <div>
          <h2 className="profileSectionTitle">Career goals</h2>
          <p className="profileGoalsLead muted">
            Change your study path or work sector anytime — we only count bursaries still open for applications.
          </p>
        </div>
        {data?.bursaryCount != null ? (
          <p className="profileGoalsMatch">
            <strong>{data.bursaryCount}</strong> open bursaries · <strong>{data.scholarshipCount}</strong> scholarships
            <span className="profileGoalsMatchMeta">
              {' '}
              (checked {data.matchedAt ? new Date(data.matchedAt).toLocaleDateString() : 'recently'})
            </span>
          </p>
        ) : null}
      </div>

      {!editing ? (
        <>
          <dl className="profileGoalsList">
            <div>
              <dt>Study choices</dt>
              <dd>
                <ol className="profileGoalsStudyList">
                  <li>1st: {labelForStudyChoice(data?.answers.studyChoice1 ?? '') || '—'}</li>
                  <li>2nd: {labelForStudyChoice(data?.answers.studyChoice2 ?? '') || '—'}</li>
                  <li>3rd: {labelForStudyChoice(data?.answers.studyChoice3 ?? '') || '—'}</li>
                </ol>
              </dd>
            </div>
            {QUESTIONNAIRE_QUESTIONS.filter((q) => !q.id.startsWith('studyChoice')).map((q) => (
              <div key={q.id}>
                <dt>{q.title}</dt>
                <dd>{labelForAnswer(q.id, data?.answers[q.id] ?? '') || '—'}</dd>
              </div>
            ))}
          </dl>
          <button type="button" className="btn btnBrand btnSmall" onClick={() => setEditing(true)}>
            Edit career goals & refresh matches
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

  const otherQuestions = QUESTIONNAIRE_QUESTIONS.filter((q) => !q.id.startsWith('studyChoice'))

  return (
    <form
      className="profileGoalsForm"
      onSubmit={(e) => {
        e.preventDefault()
        props.onSave(answers)
      }}
    >
      <div className="profileGoalsStudyGrid">
        <StudyFieldCombo
          label="1st study choice"
          value={answers.studyChoice1}
          onChange={(v) => setAnswers((prev) => ({ ...prev, studyChoice1: v }))}
        />
        <StudyFieldCombo
          label="2nd study choice"
          value={answers.studyChoice2}
          onChange={(v) => setAnswers((prev) => ({ ...prev, studyChoice2: v }))}
        />
        <StudyFieldCombo
          label="3rd study choice"
          value={answers.studyChoice3}
          onChange={(v) => setAnswers((prev) => ({ ...prev, studyChoice3: v }))}
        />
      </div>
      {otherQuestions.map((q) => (
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
