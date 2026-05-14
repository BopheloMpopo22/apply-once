import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { normalizeMarks } from '../utils/varsity/markParsing'
import { computeEligibilityForUniversity } from '../utils/varsity/eligibility'
import type { Programme, SubjectMarkInput, UniversityId } from '../utils/varsity/types'
import { coercePercent } from '../utils/varsity/levels'
import { validateMarkRows } from '../utils/varsity/validation'
import { fetchVarsityCatalogue } from '../utils/varsity/catalogueClient'
import { persistCalculator, initialCatalogueYear, initialReportType, initialRows, initialSearch, initialShowIneligible } from '../utils/varsity/calculatorPersist'
import { getFacultyGuidesForUniversity } from '../utils/varsity/facultyGuides'
import { groupProgrammesByFaculty } from '../utils/varsity/spotlight'
import { buildCatalogueRequirementSummary } from '../utils/varsity/programmeCatalogSummary'

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

function apsLabelForUniversity(id: UniversityId): string {
  switch (id) {
    case 'uct':
      return 'APS / FPS (600)'
    case 'sun':
      return 'Aggregate % (est.)'
    case 'ru':
      return 'Admission points (APS)'
    case 'ukzn':
      return 'APS (UKZN)'
    case 'nmu':
      return 'Admission score (6×%)'
    case 'tut':
      return 'APS (TUT)'
    default:
      return 'APS (estimate)'
  }
}

function formatApsDisplay(id: UniversityId, aps: number): string {
  if (id === 'ru') return aps.toFixed(1)
  if (Number.isInteger(aps)) return String(aps)
  return String(aps)
}

function emptyRow(): SubjectMarkInput {
  return { subject: '', percent: null }
}

export function VarsityCalculatorPage() {
  const [reportType, setReportType] = useState<ReportType>(initialReportType)
  const [catalogueYear, setCatalogueYear] = useState(initialCatalogueYear)
  const [rows, setRows] = useState<SubjectMarkInput[]>(initialRows)
  const [showIneligible, setShowIneligible] = useState(initialShowIneligible)
  const [search, setSearch] = useState(initialSearch)
  const [catalogueBusy, setCatalogueBusy] = useState(false)
  const [catalogueError, setCatalogueError] = useState<string | null>(null)
  const [catalogue, setCatalogue] = useState<{
    year: number
    universities: Array<{
      id: UniversityId
      name: string
      shortName: string
      website: string
      logo: string
      calculator: string
    }>
    programmesByUniversity: Partial<Record<UniversityId, Programme[]>>
  } | null>(null)

  const loadCatalogue = useCallback(async (year: number) => {
    setCatalogueBusy(true)
    setCatalogueError(null)
    try {
      const res = await fetchVarsityCatalogue(year)
      const programmesByUniversity: Partial<Record<UniversityId, Programme[]>> = {}
      for (const p of res.programmes) {
        const k = p.universityId
        programmesByUniversity[k] ||= []
        programmesByUniversity[k].push(p)
      }
      setCatalogue({
        year: res.year,
        universities: res.universities,
        programmesByUniversity,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load varsity catalogue'
      setCatalogueError(msg)
      setCatalogue(null)
    } finally {
      setCatalogueBusy(false)
    }
  }, [])

  useEffect(() => {
    void loadCatalogue(catalogueYear)
  }, [catalogueYear, loadCatalogue])

  useEffect(() => {
    persistCalculator({ reportType, catalogueYear, rows, showIneligible, search })
  }, [reportType, catalogueYear, rows, showIneligible, search])

  const validationIssues = useMemo(() => validateMarkRows(rows), [rows])
  const marks = useMemo(() => normalizeMarks(rows), [rows])

  const byUni = useMemo(() => {
    const universities = catalogue?.universities ?? []
    return universities.map((u) => {
      const programmes = catalogue?.programmesByUniversity?.[u.id] ?? []
      const res = computeEligibilityForUniversity(u.id as UniversityId, marks, programmes)
      return { uni: u, ...res }
    })
  }, [marks, catalogue])

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
                <div className="vcLabel">Catalogue year</div>
                <div className="vcYearRow">
                  <select
                    className="input"
                    value={catalogueYear}
                    onChange={(e) => {
                      const y = Number(e.target.value)
                      setCatalogueYear(y)
                      void loadCatalogue(y)
                    }}
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                  <button
                    type="button"
                    className="btn btnSmall btnGhost"
                    onClick={() => void loadCatalogue(catalogueYear)}
                    disabled={catalogueBusy}
                  >
                    {catalogueBusy ? 'Loading…' : 'Reload'}
                  </button>
                </div>
                {catalogueError ? <div className="vcHint">{catalogueError}</div> : null}

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
                <li>
                  Eligibility uses APS plus subject rules stored in the catalogue (where we have transcribed them). Always
                  confirm subject choices in the official prospectus—especially for health and science programmes.
                </li>
                <li>
                  Your marks and search filters are saved in this browser tab session so you can open a prospectus and return
                  without retyping.
                </li>
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
                const eligibleByFaculty = groupProgrammesByFaculty(u.eligible)
                const ineligibleByFaculty = groupProgrammesByFaculty(shownIneligible)

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
                        <div className="vcApsLabel">{apsLabelForUniversity(u.uni.id as UniversityId)}</div>
                        <div className="vcApsValue">{formatApsDisplay(u.uni.id as UniversityId, u.aps)}</div>
                      </div>
                    </div>

                    {u.apsNotes?.length ? <div className="vcApsNotes">{u.apsNotes.join(' ')}</div> : null}

                    <div className="vcProgBlock">
                      <div className="vcProgTitle">Eligible programmes ({u.eligible.length})</div>
                      {u.eligible.length === 0 ? (
                        <div className="muted">No matches yet—add more subjects/marks, or try increasing accuracy.</div>
                      ) : (
                        <>
                          <p className="vcFacultyHint muted">
                            Programmes are grouped by faculty. The bold summary line is built from the same APS and subject
                            rules the calculator uses. Any extra paragraph is prospectus context (wait-lists, streams)—always
                            confirm details in the official PDF.
                          </p>
                          <div className="vcFacultyStack">
                            {eligibleByFaculty.map(({ faculty, items }) => (
                              <section className="vcFacultySection" key={faculty}>
                                <h3 className="vcFacultyHeading">{faculty}</h3>
                                <ul className="vcProgList">
                                  {items.map((p) => (
                                    <li key={p.programme.id} className="vcProgItem">
                                      <div className="vcProgName">{p.programme.name}</div>
                                      <div className="vcProgMeta">
                                        <span className="tag">Min APS {p.programme.minAps}</span>
                                      </div>
                                      <div className="vcProgNotes">
                                        <div className="vcProgSummaryLine">{buildCatalogueRequirementSummary(p.programme)}</div>
                                        {p.programme.notes?.trim() ? (
                                          <div className="vcProgExtraNotes">{p.programme.notes.trim()}</div>
                                        ) : null}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </section>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {shownIneligible.length ? (
                      <div className="vcProgBlock vcProgBlockMuted">
                        <div className="vcProgTitle">Not eligible (showing {shownIneligible.length})</div>
                        <div className="vcFacultyStack">
                          {ineligibleByFaculty.map(({ faculty, items }) =>
                            items.length ? (
                              <section className="vcFacultySection" key={faculty}>
                                <h3 className="vcFacultyHeading">{faculty}</h3>
                                <ul className="vcProgList">
                                  {items.map((p) => (
                                    <li key={p.programme.id} className="vcProgItem">
                                      <div className="vcProgName">{p.programme.name}</div>
                                      <div className="vcProgMeta">
                                        <span className="tag">Min APS {p.programme.minAps}</span>
                                      </div>
                                      <div className="vcProgNotes">
                                        <div className="vcProgSummaryLine">{buildCatalogueRequirementSummary(p.programme)}</div>
                                        {p.programme.notes?.trim() ? (
                                          <div className="vcProgExtraNotes">{p.programme.notes.trim()}</div>
                                        ) : null}
                                      </div>
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
                              </section>
                            ) : null,
                          )}
                        </div>
                      </div>
                    ) : null}

                    {(() => {
                      const facultyGuides = getFacultyGuidesForUniversity(u.uni.id)
                      if (facultyGuides.length === 0) return null
                      return (
                        <div className="vcGuideBlock">
                          <div className="vcProgTitle">Official prospectus</div>
                          <p className="vcGuideHint">
                            Opens an in-app viewer with a table of contents so you can jump to faculties in the PDF. Minimum
                            requirements in the catalogue are not exhaustive—always confirm in the prospectus.
                          </p>
                          <Link className="vcProspectusBtn" to={`/varsity-guides/uni/${u.uni.id}`}>
                            Open {u.uni.shortName} prospectus viewer
                          </Link>
                        </div>
                      )
                    })()}
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

