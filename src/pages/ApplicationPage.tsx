import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { api, uploadDocument } from '../api/client'
import { ApplicationNavModePicker, type ApplicationNavMode } from '../components/application/ApplicationNavModePicker'
import { ApplicationProfileRail } from '../components/application/ApplicationProfileRail'
import { ApplicationStepActions } from '../components/application/ApplicationStepActions'
import {
  ApplicationQuestionnaire,
  type QuestionnaireState,
} from '../components/application/ApplicationQuestionnaire'
import { BursaryLogoMarquee } from '../components/application/BursaryLogoMarquee'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { computeCompletion } from '../utils/applicationCompletion'
import { PaymentPanel } from '../components/PaymentPanel'

type ApplicationUiMeta = {
  navigationMode?: ApplicationNavMode
  navigationModeChosen?: boolean
}

type Profile = {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  dateOfBirth?: string | null
  idNumber?: string | null
  gender?: string | null
  citizenship?: string | null
  disability?: boolean
  disabilityNotes?: string | null
  homeLanguage?: string | null
  residentialAddress?: string | null
  postalAddress?: string | null
}

type ApplicationPayload = {
  academics: {
    schoolName: string
    grade: string
    curriculum: string
    institutionName: string
    qualificationName: string
    yearOfStudy: string
    intendedFieldsNotes: string
    subjectsNotes: string
    achievementsNotes: string
    nbtApsNotes: string
  }
  studyPlan: {
    motivation: string
    careerGoals: string
    locationPreferences: string
    bursaryPreferences: string
  }
  household: {
    guardianName: string
    relationship: string
    guardianPhone: string
    guardianEmail: string
    householdMembersNotes: string
    employmentNotes: string
  }
  financial: {
    incomeBand: string
    incomeSourcesNotes: string
    expenseNotes: string
    otherFundingNotes: string
    nsfasStatus: string
  }
  fit: {
    leadershipNotes: string
    communityNotes: string
    workExperienceNotes: string
  }
  compliance: {
    consentPopia: boolean
    declarationTruthful: boolean
  }
}

const STEP_LABELS = [
  'Profile',
  'Academics',
  'Study plan',
  'Household',
  'Financial need',
  'Leadership & impact',
  'Consent',
  'Documents',
]

const emptyPayload = (): ApplicationPayload => ({
  academics: {
    schoolName: '',
    grade: '',
    curriculum: 'NSC',
    institutionName: '',
    qualificationName: '',
    yearOfStudy: '',
    intendedFieldsNotes: '',
    subjectsNotes: '',
    achievementsNotes: '',
    nbtApsNotes: '',
  },
  studyPlan: {
    motivation: '',
    careerGoals: '',
    locationPreferences: '',
    bursaryPreferences: '',
  },
  household: {
    guardianName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
    householdMembersNotes: '',
    employmentNotes: '',
  },
  financial: {
    incomeBand: '',
    incomeSourcesNotes: '',
    expenseNotes: '',
    otherFundingNotes: '',
    nsfasStatus: '',
  },
  fit: {
    leadershipNotes: '',
    communityNotes: '',
    workExperienceNotes: '',
  },
  compliance: {
    consentPopia: false,
    declarationTruthful: false,
  },
})

export function ApplicationGate(props: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="formShell">
        <Navbar
          logo={<ApplyOnceLogo />}
          links={[
            { label: 'Features', to: '/#features' },
            { label: 'Resources', to: '/#resources' },
          ]}
        />
        <main className="formMain">
          <p className="formLead">Loading your application…</p>
        </main>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return props.children
}

export function ApplicationPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>({})
  const [payload, setPayload] = useState<ApplicationPayload>(emptyPayload())
  const [docs, setDocs] = useState<
    { id: string; category: string; filename: string; size: number; createdAt: string }[]
  >([])
  const [saveBusy, setSaveBusy] = useState(false)
  const [docCategory, setDocCategory] = useState('id_proof')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [navMode, setNavMode] = useState<ApplicationNavMode>('horizontal')
  const [navModeChosen, setNavModeChosen] = useState(false)
  const [showModePicker, setShowModePicker] = useState(false)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState | null>(null)
  const [paidCents, setPaidCents] = useState<number>(0)
  const [showPayPrompt, setShowPayPrompt] = useState(false)

  const refreshPayment = useCallback(async () => {
    try {
      const s = await api<{ totalPaidCents: number }>('/api/payments/status')
      const total = Number(s.totalPaidCents) || 0
      setPaidCents(total)
      if (total >= 9500) setShowPayPrompt(false)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!loading) void refreshPayment()
  }, [loading, refreshPayment])

  const loadDocs = useCallback(async () => {
    const list = await api<
      { id: string; category: string; filename: string; size: number; createdAt: string }[]
    >('/api/documents')
    setDocs(list)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setLoading(true)
      try {
        const [p, d, q] = await Promise.all([
          api<Profile>('/api/profile'),
          api<{ stepIndex: number; payload: ApplicationPayload & { _meta?: ApplicationUiMeta } }>(
            '/api/application',
          ),
          api<QuestionnaireState>('/api/questionnaire'),
        ])
        if (cancelled) return
        const { _meta, ...payloadRest } = d.payload ?? {}
        setProfile({
          ...p,
          disability: Boolean(p.disability),
        })
        setStep(Math.min(Math.max(d.stepIndex ?? 0, 0), STEP_LABELS.length - 1))
        setNavMode(_meta?.navigationMode ?? 'horizontal')
        setNavModeChosen(Boolean(_meta?.navigationModeChosen))
        setQuestionnaire({
          answers: {
            studyChoice1: q.answers?.studyChoice1 ?? '',
            studyChoice2: q.answers?.studyChoice2 ?? '',
            studyChoice3: q.answers?.studyChoice3 ?? '',
            workSector: q.answers?.workSector ?? '',
            jobLinkedBursary: q.answers?.jobLinkedBursary ?? '',
            careerPriority: q.answers?.careerPriority ?? '',
          },
          skipped: Boolean(q.skipped),
          completedAt: q.completedAt ?? null,
          bursaryCount: q.bursaryCount ?? null,
          scholarshipCount: q.scholarshipCount ?? null,
          matchedAt: q.matchedAt ?? null,
        })
        setPayload({
          ...emptyPayload(),
          ...payloadRest,
          academics: { ...emptyPayload().academics, ...(payloadRest?.academics ?? {}) },
          studyPlan: { ...emptyPayload().studyPlan, ...(payloadRest?.studyPlan ?? {}) },
          household: { ...emptyPayload().household, ...(payloadRest?.household ?? {}) },
          financial: { ...emptyPayload().financial, ...(payloadRest?.financial ?? {}) },
          fit: { ...emptyPayload().fit, ...(payloadRest?.fit ?? {}) },
          compliance: { ...emptyPayload().compliance, ...(payloadRest?.compliance ?? {}) },
        })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loading && (step === STEP_LABELS.length - 1 || navMode === 'vertical')) {
      loadDocs().catch(() => {})
    }
  }, [step, loading, loadDocs, navMode])

  useEffect(() => {
    if (navMode !== 'vertical' || loading) return
    const sections = STEP_LABELS.map((_, i) => document.getElementById(`app-step-${i}`)).filter(
      Boolean,
    ) as HTMLElement[]
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!best?.target.id) return
        const idx = Number(best.target.id.replace('app-step-', ''))
        if (!Number.isNaN(idx)) setStep(idx)
      },
      { rootMargin: '-18% 0px -52% 0px', threshold: [0.12, 0.35, 0.6] },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [navMode, loading])

  function payloadForSave() {
    return {
      ...payload,
      _meta: { navigationMode: navMode, navigationModeChosen: navModeChosen } satisfies ApplicationUiMeta,
    }
  }

  async function persist(nextStep: number) {
    setSaveBusy(true)
    setError(null)
    try {
      await api('/api/profile', {
        method: 'PUT',
        json: profile,
      })
      await api('/api/application', {
        method: 'PUT',
        json: { payload: payloadForSave(), stepIndex: nextStep },
      })
      setStep(nextStep)
      setLastSavedAt(new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaveBusy(false)
    }
  }

  async function onNext(e: FormEvent) {
    e.preventDefault()
    const isLast = step >= STEP_LABELS.length - 1
    const next = Math.min(step + 1, STEP_LABELS.length - 1)
    await persist(next)
    if (isLast && paidCents < 9500) setShowPayPrompt(true)
  }

  async function onBack() {
    const prev = Math.max(step - 1, 0)
    await persist(prev)
  }

  async function chooseNavigationMode(mode: ApplicationNavMode) {
    setNavMode(mode)
    setNavModeChosen(true)
    setShowModePicker(false)
    setSaveBusy(true)
    setError(null)
    try {
      await api('/api/profile', { method: 'PUT', json: profile })
      await api('/api/application', {
        method: 'PUT',
        json: {
          payload: { ...payload, _meta: { navigationMode: mode, navigationModeChosen: true } },
          stepIndex: step,
        },
      })
      setLastSavedAt(new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }))
      requestAnimationFrame(() => {
        document.querySelector('.appFormContent')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save preference')
    } finally {
      setSaveBusy(false)
    }
  }

  function scrollToStep(index: number) {
    setStep(index)
    requestAnimationFrame(() => {
      document.getElementById(`app-step-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function goToStep(index: number) {
    if (saveBusy) return
    setStep(index)
    requestAnimationFrame(() => {
      document.getElementById(`app-step-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function onSaveSection(sectionIndex: number, advance: boolean) {
    const isLast = sectionIndex >= STEP_LABELS.length - 1
    const next = advance && !isLast ? sectionIndex + 1 : sectionIndex
    await persist(next)
    if (advance && isLast && paidCents < 9500) {
      setShowPayPrompt(true)
    }
    if (advance && navMode === 'vertical' && !isLast) {
      requestAnimationFrame(() => scrollToStep(next))
    }
  }

  const showStep = (index: number) => navMode === 'vertical' || step === index

  function renderVerticalStepActions(stepIndex: number) {
    if (navMode !== 'vertical') return null
    const isLast = stepIndex === STEP_LABELS.length - 1
    return (
      <ApplicationStepActions
        stepIndex={stepIndex}
        isLast={isLast}
        saveBusy={saveBusy}
        onBack={stepIndex > 0 ? () => void onSaveSection(stepIndex - 1, false) : undefined}
        onContinue={() => void onSaveSection(stepIndex, !isLast)}
      />
    )
  }

  async function onUpload(file: File | null, category: string) {
    if (!file) return
    setError(null)
    try {
      await uploadDocument(category, file)
      await loadDocs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
  }

  const completion = useMemo(() => computeCompletion({ profile, payload }), [profile, payload])

  function appendTemplate(path: 'academics.intendedFieldsNotes' | 'academics.achievementsNotes') {
    const next =
      path === 'academics.intendedFieldsNotes'
        ? `${payload.academics.intendedFieldsNotes.trim() ? `${payload.academics.intendedFieldsNotes.trim()}\n` : ''}- Option ${Math.max(2, (payload.academics.intendedFieldsNotes.match(/^- Option/gm)?.length ?? 0) + 1)}: `
        : `${payload.academics.achievementsNotes.trim() ? `${payload.academics.achievementsNotes.trim()}\n` : ''}- Achievement: (year) (what) (your role) (impact)\n`

    if (path === 'academics.intendedFieldsNotes') {
      setPayload((p) => ({ ...p, academics: { ...p.academics, intendedFieldsNotes: next } }))
    } else {
      setPayload((p) => ({ ...p, academics: { ...p.academics, achievementsNotes: next } }))
    }
  }

  return (
    <div className="formShell appFormShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="formMain appFormMain">
        <ApplicationProfileRail
          firstName={profile.firstName}
          lastName={profile.lastName}
          completionPercent={completion.percent}
        />
        <div className="formCard formCardWide appFormCard">
          <BursaryLogoMarquee />
          <h1 className="formTitle appFormTitle">South Africa Bursary Application</h1>
          <p className="formLead appFormLead">
            Apply to multiple bursaries with one form. Complete your details below and we&apos;ll match you to
            bursaries you qualify for.
          </p>

          <div className="appQuestionnaireSlot">
            {!loading ? (
              <ApplicationQuestionnaire
                initial={questionnaire}
                onComplete={(state) => setQuestionnaire(state)}
              />
            ) : null}
          </div>

          <div className="progressRow">
            <div className="progressBar" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="progressFill" style={{ width: `${completion.percent}%` }} />
            </div>
            <div className="progressMeta">
              <strong>{completion.percent}%</strong> complete{lastSavedAt ? ` · Saved ${lastSavedAt}` : ''}
            </div>
          </div>
          {error ? <div className="formError">{error}</div> : null}

          {loading ? (
            <p className="formLead">Loading…</p>
          ) : !navModeChosen || showModePicker ? (
            <ApplicationNavModePicker onChoose={(mode) => void chooseNavigationMode(mode)} disabled={saveBusy} />
          ) : (
            <>
              <div className="appNavModeToolbar">
                <span>
                  {navMode === 'horizontal'
                    ? 'Page-by-page mode — use Back and Save & continue.'
                    : 'Scroll mode — all sections visible; use the sidebar to jump.'}
                </span>
                <button type="button" className="appNavModeSwitch" onClick={() => setShowModePicker(true)}>
                  Change navigation style
                </button>
              </div>

              <div className={`appFormLayout ${navMode === 'vertical' ? 'appFormLayoutVertical' : ''}`}>
                {navMode === 'vertical' ? (
                  <aside className="appFormSidebar" aria-label="Application sections">
                    <nav className="appSidebarNav">
                      {STEP_LABELS.map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          className={i === step ? 'appSidebarStep appSidebarStepActive' : 'appSidebarStep'}
                          onClick={() => !saveBusy && scrollToStep(i)}
                        >
                          {i + 1}. {label}
                        </button>
                      ))}
                    </nav>
                  </aside>
                ) : null}

                <div className="appFormContent">
                  {navMode === 'horizontal' ? (
                    <>
                      <label className="wizardMobileSelectLabel" htmlFor="app-step-select">
                        Current section
                      </label>
                      <select
                        id="app-step-select"
                        className="wizardMobileSelect"
                        value={step}
                        disabled={saveBusy}
                        onChange={(e) => goToStep(Number(e.target.value))}
                      >
                        {STEP_LABELS.map((label, i) => (
                          <option key={label} value={i}>
                            {i + 1}. {label}
                          </option>
                        ))}
                      </select>
                      <div className="wizardBar" role="tablist" aria-label="Application steps">
                        {STEP_LABELS.map((label, i) => (
                          <button
                            key={label}
                            type="button"
                            role="tab"
                            aria-selected={i === step}
                            className={i === step ? 'wizardStep wizardStepActive' : 'wizardStep'}
                            onClick={() => goToStep(i)}
                          >
                            {i + 1}. {label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}

                  <form className="formFields" onSubmit={navMode === 'horizontal' ? onNext : (e) => e.preventDefault()}>
              {showStep(0) ? (
                <section id="app-step-0" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">1</span>
                      {STEP_LABELS[0]}
                    </h2>
                  ) : null}
                  <div className="fieldRow">
                    <div className="field">
                      <label htmlFor="fn">First name</label>
                      <input
                        id="fn"
                        value={profile.firstName ?? ''}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="ln">Last name</label>
                      <input
                        id="ln"
                        value={profile.lastName ?? ''}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="fieldRow">
                    <div className="field">
                      <label htmlFor="phone">Cell phone</label>
                      <input
                        id="phone"
                        value={profile.phone ?? ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="dob">Date of birth</label>
                      <input
                        id="dob"
                        type="date"
                        value={profile.dateOfBirth ?? ''}
                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="idn">SA ID number</label>
                    <input
                      id="idn"
                      value={profile.idNumber ?? ''}
                      onChange={(e) => setProfile({ ...profile, idNumber: e.target.value })}
                    />
                  </div>
                  <div className="fieldRow">
                    <div className="field">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        value={profile.gender ?? ''}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      >
                        <option value="">Select…</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Other</option>
                        <option value="prefer_not">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="cit">Citizenship</label>
                      <input
                        id="cit"
                        placeholder="e.g. South African"
                        value={profile.citizenship ?? ''}
                        onChange={(e) => setProfile({ ...profile, citizenship: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="hl">Home language</label>
                    <input
                      id="hl"
                      value={profile.homeLanguage ?? ''}
                      onChange={(e) => setProfile({ ...profile, homeLanguage: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="dis">
                      <input
                        id="dis"
                        type="checkbox"
                        checked={Boolean(profile.disability)}
                        onChange={(e) => setProfile({ ...profile, disability: e.target.checked })}
                      />{' '}
                      Disability or chronic condition (information may be required by some bursaries)
                    </label>
                  </div>
                  {profile.disability ? (
                    <div className="field">
                      <label htmlFor="disn">Notes (optional)</label>
                      <textarea
                        id="disn"
                        value={profile.disabilityNotes ?? ''}
                        onChange={(e) => setProfile({ ...profile, disabilityNotes: e.target.value })}
                      />
                    </div>
                  ) : null}
                  <div className="field">
                    <label htmlFor="addr">Residential address</label>
                    <textarea
                      id="addr"
                      value={profile.residentialAddress ?? ''}
                      onChange={(e) => setProfile({ ...profile, residentialAddress: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="post">Postal address (if different)</label>
                    <textarea
                      id="post"
                      value={profile.postalAddress ?? ''}
                      onChange={(e) => setProfile({ ...profile, postalAddress: e.target.value })}
                    />
                  </div>
                  {renderVerticalStepActions(0)}
                </section>
              ) : null}

              {showStep(1) ? (
                <section id="app-step-1" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">2</span>
                      {STEP_LABELS[1]}
                    </h2>
                  ) : null}
                  <div className="tipBox">
                    <strong>Tips</strong>
                    <ul>
                      <li>Most bursaries ask for your institution, qualification, and your latest results.</li>
                      <li>If you are still in school, use your latest report card and list your subjects + marks.</li>
                    </ul>
                  </div>
                  <div className="field">
                    <label htmlFor="school">School name</label>
                    <input
                      id="school"
                      value={payload.academics.schoolName}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, schoolName: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="fieldRow">
                    <div className="field">
                      <label htmlFor="grade">Grade / year</label>
                      <input
                        id="grade"
                        placeholder="e.g. Grade 11"
                        value={payload.academics.grade}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            academics: { ...payload.academics, grade: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="cur">Curriculum</label>
                      <select
                        id="cur"
                        value={payload.academics.curriculum}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            academics: { ...payload.academics, curriculum: e.target.value },
                          })
                        }
                      >
                        <option value="NSC">NSC (DBE)</option>
                        <option value="IEB">IEB</option>
                        <option value="SACAI">SACAI</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="fieldRow">
                    <div className="field">
                      <label htmlFor="inst">Institution (if known)</label>
                      <input
                        id="inst"
                        placeholder="e.g. University of Pretoria"
                        value={payload.academics.institutionName}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            academics: { ...payload.academics, institutionName: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="qual">Qualification / programme</label>
                      <input
                        id="qual"
                        placeholder="e.g. BEng Electrical Engineering"
                        value={payload.academics.qualificationName}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            academics: { ...payload.academics, qualificationName: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="year">Year of study (if already at university)</label>
                    <input
                      id="year"
                      placeholder="e.g. 1st year"
                      value={payload.academics.yearOfStudy}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, yearOfStudy: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="fields">Intended field(s) of study</label>
                    <textarea
                      id="fields"
                      placeholder="- Option 1: \n- Option 2: "
                      value={payload.academics.intendedFieldsNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, intendedFieldsNotes: e.target.value },
                        })
                      }
                    />
                    <div className="fieldHelpRow">
                      <button type="button" className="btn btnOutline btnSmall" onClick={() => appendTemplate('academics.intendedFieldsNotes')}>
                        Add more
                      </button>
                      <span className="fieldHelp">Many bursaries allow multiple preferences (e.g. Accounting, Finance, Engineering).</span>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="subj">Subjects & marks (paste from report or type)</label>
                    <textarea
                      id="subj"
                      placeholder="e.g. English HL 72%, Mathematics 65%, Physical Sciences 70% …"
                      value={payload.academics.subjectsNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, subjectsNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="nbt">NBT / APS / entrance scores (optional)</label>
                    <textarea
                      id="nbt"
                      placeholder="e.g. NBT: AQL 62, MAT 58, QL 64. APS: 38"
                      value={payload.academics.nbtApsNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, nbtApsNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="ach">Achievements (optional)</label>
                    <textarea
                      id="ach"
                      placeholder="- Achievement: (year) (what) (your role) (impact)"
                      value={payload.academics.achievementsNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, achievementsNotes: e.target.value },
                        })
                      }
                    />
                    <div className="fieldHelpRow">
                      <button type="button" className="btn btnOutline btnSmall" onClick={() => appendTemplate('academics.achievementsNotes')}>
                        Add more
                      </button>
                      <span className="fieldHelp">Include leadership, awards, Olympiads, sport, debate, volunteering.</span>
                    </div>
                  </div>
                  {renderVerticalStepActions(1)}
                </section>
              ) : null}

              {showStep(2) ? (
                <section id="app-step-2" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">3</span>
                      {STEP_LABELS[2]}
                    </h2>
                  ) : null}
                  <div className="tipBox">
                    <strong>Tips</strong>
                    <ul>
                      <li>Good motivations are specific: what you want to study, why, and how you will use it.</li>
                      <li>Use short paragraphs. Mention your background and what support you need.</li>
                    </ul>
                  </div>
                  <div className="field">
                    <label htmlFor="mot">Motivation (why this bursary should support you)</label>
                    <textarea
                      id="mot"
                      placeholder="Write 6–12 sentences. Include your goals and why you need support."
                      value={payload.studyPlan.motivation}
                      onChange={(e) =>
                        setPayload({ ...payload, studyPlan: { ...payload.studyPlan, motivation: e.target.value } })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="goals">Career goals</label>
                    <textarea
                      id="goals"
                      placeholder="What job/industry do you want, and what impact do you want to have?"
                      value={payload.studyPlan.careerGoals}
                      onChange={(e) =>
                        setPayload({ ...payload, studyPlan: { ...payload.studyPlan, careerGoals: e.target.value } })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="loc">Location preferences (optional)</label>
                    <textarea
                      id="loc"
                      placeholder="e.g. Prefer Gauteng or Western Cape. Willing to relocate."
                      value={payload.studyPlan.locationPreferences}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          studyPlan: { ...payload.studyPlan, locationPreferences: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="bpref">Bursary preferences (optional)</label>
                    <textarea
                      id="bpref"
                      placeholder="e.g. Banking bursaries, engineering bursaries, accounting bursaries."
                      value={payload.studyPlan.bursaryPreferences}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          studyPlan: { ...payload.studyPlan, bursaryPreferences: e.target.value },
                        })
                      }
                    />
                  </div>
                  {renderVerticalStepActions(2)}
                </section>
              ) : null}

              {showStep(3) ? (
                <section id="app-step-3" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">4</span>
                      {STEP_LABELS[3]}
                    </h2>
                  ) : null}
                  <div className="field">
                    <label htmlFor="gname">Parent / guardian full name</label>
                    <input
                      id="gname"
                      value={payload.household.guardianName}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          household: { ...payload.household, guardianName: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="rel">Relationship to you</label>
                    <input
                      id="rel"
                      placeholder="e.g. Mother, uncle, legal guardian"
                      value={payload.household.relationship}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          household: { ...payload.household, relationship: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="fieldRow">
                    <div className="field">
                      <label htmlFor="gphone">Guardian phone</label>
                      <input
                        id="gphone"
                        value={payload.household.guardianPhone}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            household: { ...payload.household, guardianPhone: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="gmail">Guardian email</label>
                      <input
                        id="gmail"
                        type="email"
                        value={payload.household.guardianEmail}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            household: { ...payload.household, guardianEmail: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="members">Household members & dependents (optional)</label>
                    <textarea
                      id="members"
                      placeholder="- Person: (relationship) (age) (school/university) (supported by household?)"
                      value={payload.household.householdMembersNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          household: { ...payload.household, householdMembersNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="emp">Guardian employment status & notes (optional)</label>
                    <textarea
                      id="emp"
                      placeholder="e.g. Employed/unemployed, employer (if comfortable), any special circumstances."
                      value={payload.household.employmentNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          household: { ...payload.household, employmentNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  {renderVerticalStepActions(3)}
                </section>
              ) : null}

              {showStep(4) ? (
                <section id="app-step-4" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">5</span>
                      {STEP_LABELS[4]}
                    </h2>
                  ) : null}
                  <div className="tipBox">
                    <strong>Tips</strong>
                    <ul>
                      <li>Banks and institutions often do a financial means test. Be honest and approximate if needed.</li>
                      <li>If you don’t know exact amounts, describe the sources (salary, grant, informal work).</li>
                    </ul>
                  </div>
                  <div className="field">
                    <label htmlFor="band">Approximate household income (annual)</label>
                    <select
                      id="band"
                      value={payload.financial.incomeBand}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          financial: { ...payload.financial, incomeBand: e.target.value },
                        })
                      }
                    >
                      <option value="">Select…</option>
                      <option value="0-150000">R0 – R150 000</option>
                      <option value="150001-300000">R150 001 – R300 000</option>
                      <option value="300001-600000">R300 001 – R600 000</option>
                      <option value="600001+">Above R600 000</option>
                      <option value="prefer_not">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="incomeSources">Income sources (optional)</label>
                    <textarea
                      id="incomeSources"
                      placeholder="e.g. Parent salary, SASSA grant, piece jobs, small business."
                      value={payload.financial.incomeSourcesNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          financial: { ...payload.financial, incomeSourcesNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="exp">Expenses / notes (optional)</label>
                    <textarea
                      id="exp"
                      value={payload.financial.expenseNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          financial: { ...payload.financial, expenseNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="otherfund">Other funding (optional)</label>
                    <textarea
                      id="otherfund"
                      placeholder="e.g. NSFAS applied/approved, other bursaries, family support."
                      value={payload.financial.otherFundingNotes}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          financial: { ...payload.financial, otherFundingNotes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="nsfas">NSFAS status (optional)</label>
                    <select
                      id="nsfas"
                      value={payload.financial.nsfasStatus}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          financial: { ...payload.financial, nsfasStatus: e.target.value },
                        })
                      }
                    >
                      <option value="">Select…</option>
                      <option value="not_applied">Not applied</option>
                      <option value="applied">Applied</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="unknown">Not sure</option>
                    </select>
                  </div>
                  {renderVerticalStepActions(4)}
                </section>
              ) : null}

              {showStep(5) ? (
                <section id="app-step-5" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">6</span>
                      {STEP_LABELS[5]}
                    </h2>
                  ) : null}
                  <div className="tipBox">
                    <strong>Tips</strong>
                    <ul>
                      <li>Many corporate and bank bursaries look for leadership and community involvement.</li>
                      <li>Use the STAR method: Situation → Task → Action → Result.</li>
                    </ul>
                  </div>
                  <div className="field">
                    <label htmlFor="lead">Leadership (optional)</label>
                    <textarea
                      id="lead"
                      placeholder="e.g. Class rep, team captain, club leader — what you did and the outcome."
                      value={payload.fit.leadershipNotes}
                      onChange={(e) => setPayload({ ...payload, fit: { ...payload.fit, leadershipNotes: e.target.value } })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="comm">Community service / volunteering (optional)</label>
                    <textarea
                      id="comm"
                      placeholder="What you did, how often, and who benefited."
                      value={payload.fit.communityNotes}
                      onChange={(e) => setPayload({ ...payload, fit: { ...payload.fit, communityNotes: e.target.value } })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="work">Work experience / exposure (optional)</label>
                    <textarea
                      id="work"
                      placeholder="Holiday job, job shadowing, internships, volunteering."
                      value={payload.fit.workExperienceNotes}
                      onChange={(e) =>
                        setPayload({ ...payload, fit: { ...payload.fit, workExperienceNotes: e.target.value } })
                      }
                    />
                  </div>
                  {renderVerticalStepActions(5)}
                </section>
              ) : null}

              {showStep(6) ? (
                <section id="app-step-6" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">7</span>
                      {STEP_LABELS[6]}
                    </h2>
                  ) : null}
                  <div className="tipBox">
                    <strong>Note</strong>
                    <ul>
                      <li>Some bursaries require consent for processing your personal information (POPIA).</li>
                      <li>Only submit information you believe is accurate.</li>
                    </ul>
                  </div>
                  <div className="field">
                    <label htmlFor="pop">
                      <input
                        id="pop"
                        type="checkbox"
                        checked={payload.compliance.consentPopia}
                        onChange={(e) =>
                          setPayload({ ...payload, compliance: { ...payload.compliance, consentPopia: e.target.checked } })
                        }
                      />{' '}
                      I consent to processing my information for bursary applications (POPIA)
                    </label>
                  </div>
                  <div className="field">
                    <label htmlFor="truth">
                      <input
                        id="truth"
                        type="checkbox"
                        checked={payload.compliance.declarationTruthful}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            compliance: { ...payload.compliance, declarationTruthful: e.target.checked },
                          })
                        }
                      />{' '}
                      I declare the information I provided is truthful to the best of my knowledge
                    </label>
                  </div>
                  {renderVerticalStepActions(6)}
                </section>
              ) : null}

              {showStep(7) ? (
                <section id="app-step-7" className="appStepSection">
                  {navMode === 'vertical' ? (
                    <h2 className="appSectionTitle">
                      <span className="appSectionNum">8</span>
                      {STEP_LABELS[7]}
                    </h2>
                  ) : null}
                  <div className="field">
                    <label htmlFor="cat">Document type</label>
                    <select
                      id="cat"
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                    >
                      <option value="id_proof">Certified ID</option>
                      <option value="academic">Academic report / results</option>
                      <option value="income">Proof of household income</option>
                      <option value="residence">Proof of residence</option>
                      <option value="acceptance">Proof of acceptance / application</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="up">Upload file (PDF or image, max 8 MB)</label>
                    <input
                      id="up"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null
                        void onUpload(file, docCategory)
                        e.target.value = ''
                      }}
                    />
                  </div>
                  <div className="tipBox">
                    <strong>Common bursary documents</strong>
                    <ul>
                      <li>Certified ID</li>
                      <li>Latest academic record (Grade 11/12 report or university transcript)</li>
                      <li>Proof of household income (payslips/affidavit/bank statement)</li>
                      <li>Proof of residence</li>
                      <li>University acceptance / registration (if available)</li>
                    </ul>
                  </div>
                  <div className="docList">
                    {docs.length === 0 ? (
                      <p className="formLead">No documents uploaded yet.</p>
                    ) : (
                      docs.map((d) => (
                        <div key={d.id} className="docRow">
                          <div>
                            <strong>{d.filename}</strong>
                            <div className="docMeta">
                              {d.category} · {(d.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {renderVerticalStepActions(7)}
                </section>
              ) : null}

              {navMode === 'horizontal' ? (
                <div className="formActions">
                  {step > 0 ? (
                    <button type="button" className="btn btnOutline appBtn" onClick={() => void onBack()} disabled={saveBusy}>
                      Back
                    </button>
                  ) : (
                    <Link className="btn btnOutline appBtn" to="/">
                      Home
                    </Link>
                  )}
                  <div className="formActionsRight">
                    {step < STEP_LABELS.length - 1 ? (
                      <button type="submit" className="btn btnDark appBtn" disabled={saveBusy}>
                        {saveBusy ? 'Saving…' : 'Save & continue'}
                      </button>
                    ) : (
                      <button type="submit" className="btn btnDark appBtn" disabled={saveBusy}>
                        {saveBusy ? 'Saving…' : 'Finish & save'}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {showPayPrompt && paidCents < 9500 ? (
        <PaymentPanel
          variant="sticky"
          paidCents={paidCents}
          onRefreshPayment={refreshPayment}
          title="Submit your application"
          successFrom="application"
        />
      ) : null}
    </div>
  )
}
