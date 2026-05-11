import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { getProgrammes, getUniversities } from '../utils/varsity/data'
import { normalizeMarks } from '../utils/varsity/markParsing'
import { computeEligibilityForUniversity } from '../utils/varsity/eligibility'
import type { SubjectMarkInput, UniversityId } from '../utils/varsity/types'
import { coercePercent } from '../utils/varsity/levels'
import { validateMarkRows } from '../utils/varsity/validation'

const COMMON_SUBJECTS = [
  'English HL',
  'English FAL',
  'Mathematics',
  'Mathematical Literacy',
  'Physical Sciences',
  'Life Sciences',
  'Life Orientation',
  'Accounting',
  'Business Studies',
  'Economics',
  'Geography',
  'History',
  'Afrikaans',
]

type ReportType = 'grade11t4' | 'grade12t1' | 'grade12t2'

function emptyRow(): SubjectMarkInput {
  return { subject: '', percent: null }
}

export function VarsityCalculatorPage() {
  const [reportType, setReportType] = useState<ReportType>('grade11t4')
  const [rows, setRows] = useState<SubjectMarkInput[]>([
    { subject: 'English HL', percent: 60 },
    { subject: 'Mathematics', percent: 60 },
    { subject: 'Physical Sciences', percent: 60 },
    { subject: 'Life Orientation', percent: 60 },
    emptyRow(),
    emptyRow(),
  ])
  const [showIneligible, setShowIneligible] = useState(false)
  const [search, setSearch] = useState('')

  const universities = useMemo(() => getUniversities(), [])
  const validationIssues = useMemo(() => validateMarkRows(rows), [rows])
  const marks = useMemo(() => normalizeMarks(rows), [rows])

  const byUni = useMemo(() => {
    return universities.map((u) => {
      const programmes = getProgrammes(u.id as UniversityId)
      const res = computeEligibilityForUniversity(u.id as UniversityId, marks, programmes)
      return { uni: u, ...res }
    })
  }, [marks, universities])

  const filteredByUni = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return byUni
    return byUni.map((u) => ({
      ...u,
      eligible: u.eligible.filter((p) => p.programme.name.toLowerCase().includes(q) || p.programme.faculty.toLowerCase().includes(q)),
      ineligible: u.ineligible.filter(
        (p) => p.programme.name.toLowerCase().includes(q) || p.programme.faculty.toLowerCase().includes(q),
      ),
    }))
  }, [byUni, search])

  function updateRow(idx: number, patch: Partial<SubjectMarkInput>) {
    setRows((prev) => {
      const next = prev.slice()
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()])
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="appShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Application', to: '/application' },
          { label: 'Profile', to: '/profile' },
        ]}
      />

      <main className="main">
        <div className="container">
          <div className="vcHeader">
            <div>
              <h1 className="pageTitle">Varsity Calculator</h1>
              <p className="pageSubtitle">
                Enter your subjects and marks and see which programmes you’re likely eligible for at selected South African universities.
              </p>
            </div>
            <div className="vcHeaderRight">
              <Link className="btn" to="/register">
                Create profile
              </Link>
            </div>
          </div>

          <section className="card vcCard">
            <div className="vcControls">
              <div className="vcControl">
                <div className="vcLabel">Which report are you using?</div>
                <div className="segmented" role="tablist" aria-label="Report type">
                  <button
                    className={reportType === 'grade11t4' ? 'segBtn segBtnActive' : 'segBtn'}
                    onClick={() => setReportType('grade11t4')}
                    type="button"
                  >
                    Grade 11 Term 4
                  </button>
                  <button
                    className={reportType === 'grade12t1' ? 'segBtn segBtnActive' : 'segBtn'}
                    onClick={() => setReportType('grade12t1')}
                    type="button"
                  >
                    Grade 12 Term 1
                  </button>
                  <button
                    className={reportType === 'grade12t2' ? 'segBtn segBtnActive' : 'segBtn'}
                    onClick={() => setReportType('grade12t2')}
                    type="button"
                  >
                    Grade 12 Term 2
                  </button>
                </div>
                <div className="vcHint">
                  {reportType === 'grade11t4'
                    ? 'Most universities accept Grade 11 final marks for early applications.'
                    : 'Term results help you estimate eligibility before final matric results.'}
                </div>
              </div>

              <div className="vcControl">
                <div className="vcLabel">Search programmes</div>
                <input
                  className="input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Engineering, Accounting, Humanities"
                />
                <label className="checkboxRow">
                  <input type="checkbox" checked={showIneligible} onChange={(e) => setShowIneligible(e.target.checked)} />
                  Show programmes you don’t qualify for (with reasons)
                </label>
              </div>
            </div>

            <div className="vcTips">
              <div className="tipsTitle">Tips</div>
              <ul className="tipsList">
                <li>APS systems differ by university, so the same marks can give different scores.</li>
                <li>Meeting minimum requirements doesn’t guarantee admission—programmes are competitive.</li>
                <li>If a programme requires a minimum percent (e.g. 70%), enter the percent—not only a level.</li>
              </ul>
            </div>

            {validationIssues.length ? (
              <div className="vcValidation">
                <div className="vcValidationTitle">Fix these to improve accuracy</div>
                <ul className="vcValidationList">
                  {validationIssues.slice(0, 6).map((v) => (
                    <li key={`${v.row}-${v.field}-${v.message}`}>
                      Row {v.row + 1}: {v.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="vcMarks">
              <div className="vcMarksHeader">
                <div className="vcMarksTitle">Enter your subjects</div>
                <button type="button" className="btn btnSmall" onClick={addRow}>
                  Add subject
                </button>
              </div>

              <div className="vcTable" role="table" aria-label="Subject marks entry">
                <div className="vcRow vcRowHead" role="row">
                  <div className="vcCell vcCellSubject" role="columnheader">
                    Subject
                  </div>
                  <div className="vcCell vcCellPercent" role="columnheader">
                    %
                  </div>
                  <div className="vcCell vcCellLevel" role="columnheader">
                    Level
                  </div>
                  <div className="vcCell vcCellActions" role="columnheader" aria-label="Row actions"></div>
                </div>

                {rows.map((r, idx) => {
                  const percent = coercePercent(r.percent) ?? null
                  return (
                    <div className="vcRow" role="row" key={idx}>
                      <div className="vcCell vcCellSubject" role="cell">
                        <input
                          className="input"
                          value={r.subject}
                          onChange={(e) => updateRow(idx, { subject: e.target.value })}
                          list="commonSubjects"
                          placeholder="Start typing…"
                        />
                      </div>
                      <div className="vcCell vcCellPercent" role="cell">
                        <input
                          className="input"
                          inputMode="numeric"
                          value={percent === null ? '' : String(percent)}
                          onChange={(e) => {
                            const v = e.target.value.trim()
                            updateRow(idx, { percent: v ? Number(v) : null, level: null })
                          }}
                          placeholder="e.g. 72"
                        />
                      </div>
                      <div className="vcCell vcCellLevel" role="cell">
                        <div className="levelPill">{marks[idx]?.level ? `L${marks[idx].level}` : '—'}</div>
                      </div>
                      <div className="vcCell vcCellActions" role="cell">
                        <button type="button" className="btn btnSmall btnGhost" onClick={() => removeRow(idx)} aria-label="Remove row">
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <datalist id="commonSubjects">
                {COMMON_SUBJECTS.map((s) => (
                  <option value={s} key={s} />
                ))}
              </datalist>
            </div>
          </section>

          <section className="vcResults">
            <div className="vcResultsHeader">
              <h2 className="sectionTitle">Results</h2>
              <div className="muted">
                Enter at least your core subjects (English, Maths/Math Lit, and your best other subjects) for best accuracy.
              </div>
            </div>

            <div className="vcUniGrid">
              {filteredByUni.map((u) => {
                const shownIneligible = showIneligible ? u.ineligible : []

                return (
                  <article className="card vcUniCard" key={u.uni.id}>
                    <div className="vcUniTop">
                      <div className="vcUniBrand">
                        <img className="vcUniLogo" src={u.uni.logo} alt={`${u.uni.shortName} logo`} />
                        <div>
                          <div className="vcUniName">{u.uni.shortName}</div>
                          <a className="vcUniLink" href={u.uni.website} target="_blank" rel="noreferrer">
                            Visit website
                          </a>
                        </div>
                      </div>
                      <div className="vcAps">
                        <div className="vcApsLabel">APS (estimate)</div>
                        <div className="vcApsValue">{u.aps}</div>
                      </div>
                    </div>

                    {u.apsNotes?.length ? <div className="vcApsNotes">{u.apsNotes.join(' ')}</div> : null}

                    <div className="vcProgBlock">
                      <div className="vcProgTitle">Eligible programmes ({u.eligible.length})</div>
                      {u.eligible.length === 0 ? (
                        <div className="muted">No matches yet—add more subjects/marks, or try increasing accuracy.</div>
                      ) : (
                        <ul className="vcProgList">
                          {u.eligible.map((p) => (
                            <li key={p.programme.id} className="vcProgItem">
                              <div className="vcProgName">{p.programme.name}</div>
                              <div className="vcProgMeta">
                                <span className="tag">{p.programme.faculty}</span>
                                <span className="tag">Min APS {p.programme.minAps}</span>
                              </div>
                              {p.programme.notes ? <div className="vcProgNotes">{p.programme.notes}</div> : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {shownIneligible.length ? (
                      <div className="vcProgBlock vcProgBlockMuted">
                        <div className="vcProgTitle">Not eligible (showing {shownIneligible.length})</div>
                        <ul className="vcProgList">
                          {shownIneligible.map((p) => (
                            <li key={p.programme.id} className="vcProgItem">
                              <div className="vcProgName">{p.programme.name}</div>
                              <div className="vcProgMeta">
                                <span className="tag">{p.programme.faculty}</span>
                                <span className="tag">Min APS {p.programme.minAps}</span>
                              </div>
                              {p.programme.notes ? <div className="vcProgNotes">{p.programme.notes}</div> : null}
                              <div className="vcReasons">
                                {p.reasons.slice(0, 3).map((r) => (
                                  <div className="vcReason" key={r}>
                                    {r}
                                  </div>
                                ))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

