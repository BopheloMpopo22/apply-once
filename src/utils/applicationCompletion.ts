type Profile = {
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  dateOfBirth?: string | null
  idNumber?: string | null
  residentialAddress?: string | null
}

type ApplicationPayload = {
  academics?: {
    schoolName?: string
    grade?: string
    intendedFieldsNotes?: string
    subjectsNotes?: string
  }
  studyPlan?: {
    motivation?: string
    careerGoals?: string
  }
  household?: {
    guardianName?: string
    relationship?: string
    guardianPhone?: string
  }
  financial?: {
    incomeBand?: string
  }
  compliance?: {
    consentPopia?: boolean
    declarationTruthful?: boolean
  }
}

export function computeCompletion(input: {
  profile: Profile
  payload: ApplicationPayload
}): { percent: number; missing: string[] } {
  const missing: string[] = []

  const requiredChecks: Array<{ label: string; ok: boolean }> = [
    { label: 'First name', ok: Boolean(input.profile.firstName?.trim()) },
    { label: 'Last name', ok: Boolean(input.profile.lastName?.trim()) },
    { label: 'Cell phone', ok: Boolean(input.profile.phone?.trim()) },
    { label: 'Date of birth', ok: Boolean(input.profile.dateOfBirth?.trim()) },
    { label: 'SA ID number', ok: Boolean(input.profile.idNumber?.trim()) },
    { label: 'Residential address', ok: Boolean(input.profile.residentialAddress?.trim()) },

    { label: 'School name', ok: Boolean(input.payload.academics?.schoolName?.trim()) },
    { label: 'Grade / year', ok: Boolean(input.payload.academics?.grade?.trim()) },
    { label: 'Intended field(s)', ok: Boolean(input.payload.academics?.intendedFieldsNotes?.trim()) },
    { label: 'Subjects & marks', ok: Boolean(input.payload.academics?.subjectsNotes?.trim()) },

    { label: 'Motivation', ok: Boolean(input.payload.studyPlan?.motivation?.trim()) },
    { label: 'Career goals', ok: Boolean(input.payload.studyPlan?.careerGoals?.trim()) },

    { label: 'Guardian name', ok: Boolean(input.payload.household?.guardianName?.trim()) },
    { label: 'Guardian relationship', ok: Boolean(input.payload.household?.relationship?.trim()) },
    { label: 'Guardian phone', ok: Boolean(input.payload.household?.guardianPhone?.trim()) },

    { label: 'Household income band', ok: Boolean(input.payload.financial?.incomeBand?.trim()) },

    { label: 'POPIA consent', ok: Boolean(input.payload.compliance?.consentPopia) },
    { label: 'Truthful declaration', ok: Boolean(input.payload.compliance?.declarationTruthful) },
  ]

  for (const c of requiredChecks) {
    if (!c.ok) missing.push(c.label)
  }

  const total = requiredChecks.length
  const done = total - missing.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return { percent, missing }
}

