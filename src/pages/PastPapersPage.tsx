import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import {
  DBE_PAST_PAPERS_INDEX,
  NSC_GRADE12_SUBJECTS,
  WCED_PAST_PAPERS,
} from '../data/pastPapers/nscSubjects'
import { getYearSession, NSC_YEARS, NSC_YEAR_SESSIONS } from '../data/pastPapers/nscSessions'
import { getPaperOfTheDay } from '../data/pastPapers/paperOfTheDay'
import type { NscSessionId, NscSubject } from '../data/pastPapers/types'

const GROUP_LABELS: Record<NscSubject['group'], string> = {
  sciences: 'Sciences & maths',
  commerce: 'Commerce',
  humanities: 'Humanities',
  languages: 'Languages',
  technology: 'Technology',
  other: 'Other',
}

export function PastPapersPage() {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState<number>(2024)
  const [session, setSession] = useState<NscSessionId>('november')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)

  const paperOfTheDay = useMemo(() => getPaperOfTheDay(), [])

  const filteredSubjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NSC_GRADE12_SUBJECTS
    return NSC_GRADE12_SUBJECTS.filter(
      (s) => s.name.toLowerCase().includes(q) || s.dbeSection.toLowerCase().includes(q),
    )
  }, [query])

  const activeSession = getYearSession(year, session)
  const selectedSubject = selectedSubjectId
    ? NSC_GRADE12_SUBJECTS.find((s) => s.id === selectedSubjectId)
    : null

  return (
    <div className="formShell hubShell pastPapersShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="hubMain">
        <div className="hubContainer hubContainerWide">
          <div className="hubPanel">
            <nav className="hubBreadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden>/</span>
              <Link to="/#resources">Resources</Link>
              <span aria-hidden>/</span>
              <span>Past papers</span>
            </nav>

            <header className="hubHero pastPapersHero">
              <div className="hubHeroText">
                <p className="hubHeroKicker">Grade 12 · NSC · Phase 1</p>
                <h1 className="hubHeroTitle">Matric past exam papers</h1>
                <p className="hubHeroIntro">
                  Official National Senior Certificate papers from the Department of Basic Education
                  (2020–2025). NSC finals are national — the same papers apply across provinces.
                  Open a year, pick your subject, then download the question paper and memo from the
                  official site.
                </p>
                <p className="hubDisclaimer">
                  Papers are hosted by DBE and WCED. We link to official sources — always confirm you
                  have the latest memo on the government page.
                </p>
              </div>
            </header>

            <section className="pastPaperOfDay" aria-labelledby="paper-of-day-heading">
              <div className="pastPaperOfDayInner">
                <div>
                  <p className="pastPaperOfDayKicker">Paper of the day</p>
                  <h2 id="paper-of-day-heading" className="pastPaperOfDayTitle">
                    {paperOfTheDay.subject} · {paperOfTheDay.title}
                  </h2>
                  <p className="pastPaperOfDayMeta">
                    {paperOfTheDay.session} {paperOfTheDay.year} ·{' '}
                    {paperOfTheDay.kind === 'memo' ? 'Memo' : 'Question paper'} · Source:{' '}
                    {paperOfTheDay.source}
                  </p>
                </div>
                <a
                  className="btn btnBrand btnSmall"
                  href={paperOfTheDay.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open today&apos;s paper
                </a>
              </div>
            </section>

            <section className="hubSection" aria-labelledby="past-papers-filters-heading">
              <h2 id="past-papers-filters-heading" className="hubSectionTitle">
                Find papers
              </h2>
              <div className="hubToolbar pastPapersToolbar">
                <label className="hubFilterField">
                  <span className="hubFilterLabel">Search subject</span>
                  <input
                    type="search"
                    className="hubFilterInput"
                    placeholder="e.g. Mathematics, Accounting…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <label className="hubFilterField">
                  <span className="hubFilterLabel">Year</span>
                  <select
                    className="hubFilterSelect"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {NSC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="hubFilterField">
                  <span className="hubFilterLabel">Exam session</span>
                  <select
                    className="hubFilterSelect"
                    value={session}
                    onChange={(e) => setSession(e.target.value as NscSessionId)}
                  >
                    <option value="november">November (main matric)</option>
                    <option value="may-june">May/June</option>
                  </select>
                </label>
              </div>

              {activeSession ? (
                <div className="pastPapersOpenBar">
                  <div>
                    <strong>{activeSession.label}</strong>
                    <p className="muted pastPapersOpenHint">
                      Opens the official DBE page for all subjects in this session. Scroll to your
                      subject, then download Paper 1, Paper 2, and marking guidelines.
                    </p>
                  </div>
                  <div className="pastPapersOpenActions">
                    <a
                      className="btn btnBrand btnSmall"
                      href={activeSession.dbeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open {activeSession.label} (DBE)
                    </a>
                    <a
                      className="btn btnOutline btnSmall"
                      href={WCED_PAST_PAPERS}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Browse on WCED ePortal
                    </a>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="hubSection" aria-labelledby="past-papers-subjects-heading">
              <h2 id="past-papers-subjects-heading" className="hubSectionTitle">
                {filteredSubjects.length} subjects
              </h2>
              <div className="pastPapersSubjectGrid">
                {filteredSubjects.map((subject) => {
                  const selected = selectedSubjectId === subject.id
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      className={['pastPapersSubjectCard', selected ? 'pastPapersSubjectCardActive' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedSubjectId(selected ? null : subject.id)}
                    >
                      <span className="pastPapersSubjectGroup">{GROUP_LABELS[subject.group]}</span>
                      <span className="pastPapersSubjectName">{subject.name}</span>
                    </button>
                  )
                })}
              </div>

              {selectedSubject && activeSession ? (
                <div className="pastPapersSubjectDetail">
                  <h3 className="pastPapersSubjectDetailTitle">{selectedSubject.name}</h3>
                  <p className="hubBodyText">
                    On the official <strong>{activeSession.label}</strong> page, look for the section
                    titled <strong>{selectedSubject.dbeSection}</strong>. Download the question paper(s),
                    answer book if listed, and the marking guidelines (memo).
                  </p>
                  <ul className="pastPapersTips">
                    <li>Do the paper under exam conditions first, then mark with the memo.</li>
                    <li>Redo questions you got wrong after a day or two — that builds real memory.</li>
                    <li>Keep a list of topics you struggle with and revise those before the next paper.</li>
                  </ul>
                  <div className="pastPapersOpenActions">
                    <a
                      className="btn btnBrand btnSmall"
                      href={activeSession.dbeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open {activeSession.label} — find {selectedSubject.dbeSection}
                    </a>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="hubSection pastPapersYearTableSection" aria-labelledby="past-papers-years-heading">
              <h2 id="past-papers-years-heading" className="hubSectionTitle">
                All sessions (2020–2025)
              </h2>
              <div className="adminTableWrap">
                <table className="adminTable pastPapersYearTable">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Session</th>
                      <th>Official papers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NSC_YEAR_SESSIONS.map((row) => (
                      <tr key={`${row.year}-${row.session}`}>
                        <td>{row.year}</td>
                        <td>{row.session === 'november' ? 'November' : 'May/June'}</td>
                        <td>
                          <a href={row.dbeUrl} target="_blank" rel="noreferrer">
                            DBE — {row.label}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="muted pastPapersFootnote">
                Full archive and older years:{' '}
                <a href={DBE_PAST_PAPERS_INDEX} target="_blank" rel="noreferrer">
                  DBE past examination papers index
                </a>
                . Grades 10–11 and provincial papers coming in a later phase.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
