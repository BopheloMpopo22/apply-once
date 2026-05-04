import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { api, uploadDocument } from '../api/client'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

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
    intendedField: string
    subjectsNotes: string
  }
  household: {
    guardianName: string
    relationship: string
    guardianPhone: string
    guardianEmail: string
  }
  financial: {
    incomeBand: string
    expenseNotes: string
  }
}

const STEP_LABELS = ['Profile', 'Academic', 'Household', 'Financial', 'Documents']

const emptyPayload = (): ApplicationPayload => ({
  academics: {
    schoolName: '',
    grade: '',
    curriculum: 'NSC',
    intendedField: '',
    subjectsNotes: '',
  },
  household: {
    guardianName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
  },
  financial: {
    incomeBand: '',
    expenseNotes: '',
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
        const [p, d] = await Promise.all([
          api<Profile>('/api/profile'),
          api<{ stepIndex: number; payload: ApplicationPayload }>('/api/application'),
        ])
        if (cancelled) return
        setProfile({
          ...p,
          disability: Boolean(p.disability),
        })
        setStep(Math.min(Math.max(d.stepIndex ?? 0, 0), STEP_LABELS.length - 1))
        setPayload({
          ...emptyPayload(),
          ...d.payload,
          academics: { ...emptyPayload().academics, ...(d.payload?.academics ?? {}) },
          household: { ...emptyPayload().household, ...(d.payload?.household ?? {}) },
          financial: { ...emptyPayload().financial, ...(d.payload?.financial ?? {}) },
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
    if (step === 4 && !loading) {
      loadDocs().catch(() => {})
    }
  }, [step, loading, loadDocs])

  async function persist(nextStep: number) {
    setSaveBusy(true)
    setError(null)
    try {
      if (step === 0) {
        await api('/api/profile', {
          method: 'PUT',
          json: profile,
        })
      }
      await api('/api/application', {
        method: 'PUT',
        json: { payload, stepIndex: nextStep },
      })
      setStep(nextStep)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaveBusy(false)
    }
  }

  async function onNext(e: FormEvent) {
    e.preventDefault()
    const next = Math.min(step + 1, STEP_LABELS.length - 1)
    await persist(next)
  }

  async function onBack() {
    const prev = Math.max(step - 1, 0)
    await persist(prev)
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
        <div className="formCard formCardWide">
          <h1 className="formTitle">Your application</h1>
          <p className="formLead">
            Step-by-step profile and application answers — autosaved when you move between steps.
          </p>
          {error ? <div className="formError">{error}</div> : null}

          <div className="wizardBar" role="tablist" aria-label="Application steps">
            {STEP_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={i === step}
                className={i === step ? 'wizardStep wizardStepActive' : 'wizardStep'}
                onClick={() => !loading && !saveBusy && setStep(i)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="formLead">Loading…</p>
          ) : (
            <form className="formFields" onSubmit={onNext}>
              {step === 0 ? (
                <>
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
                </>
              ) : null}

              {step === 1 ? (
                <>
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
                  <div className="field">
                    <label htmlFor="field">Intended field of study</label>
                    <input
                      id="field"
                      value={payload.academics.intendedField}
                      onChange={(e) =>
                        setPayload({
                          ...payload,
                          academics: { ...payload.academics, intendedField: e.target.value },
                        })
                      }
                    />
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
                </>
              ) : null}

              {step === 2 ? (
                <>
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
                </>
              ) : null}

              {step === 3 ? (
                <>
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
                    <label htmlFor="exp">Monthly expenses / notes (optional)</label>
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
                </>
              ) : null}

              {step === 4 ? (
                <>
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
                </>
              ) : null}

              <div className="formActions">
                {step > 0 ? (
                  <button type="button" className="btn btnOutline" onClick={() => void onBack()} disabled={saveBusy}>
                    Back
                  </button>
                ) : (
                  <Link className="btn btnOutline" to="/">
                    Home
                  </Link>
                )}
                <div className="formActionsRight">
                  {step < STEP_LABELS.length - 1 ? (
                    <button type="submit" className="btn btnDark" disabled={saveBusy}>
                      {saveBusy ? 'Saving…' : 'Save & continue'}
                    </button>
                  ) : (
                    <button type="submit" className="btn btnDark" disabled={saveBusy}>
                      {saveBusy ? 'Saving…' : 'Finish & save'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
