export type ApplicationSnapshot = {
  email: string
  createdAt: string | null
  stepIndex: number
  profile: Record<string, unknown> | null
  payload: Record<string, unknown>
  documents: Array<{
    category: string
    filename: string
    size: number
    createdAt: string
  }>
}

export type PreviewLine = { label: string; value: string; empty: boolean }

export type PreviewSection = {
  id: string
  title: string
  lines: PreviewLine[]
  hasAnyData: boolean
}

function safeText(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  return String(v)
}

function line(label: string, value: unknown): PreviewLine {
  const v = safeText(value)
  return { label, value: v || '—', empty: !v }
}

function section(id: string, title: string, lines: PreviewLine[]): PreviewSection {
  const hasAnyData = lines.some((l) => !l.empty)
  return { id, title, lines, hasAnyData }
}

export function snapshotToPreviewSections(snapshot: ApplicationSnapshot): PreviewSection[] {
  const p = snapshot.profile || {}
  const a = (snapshot.payload?.academics || {}) as Record<string, unknown>
  const sp = (snapshot.payload?.studyPlan || {}) as Record<string, unknown>
  const h = (snapshot.payload?.household || {}) as Record<string, unknown>
  const f = (snapshot.payload?.financial || {}) as Record<string, unknown>
  const fit = (snapshot.payload?.fit || {}) as Record<string, unknown>
  const c = (snapshot.payload?.compliance || {}) as Record<string, unknown>

  const profileLines = [
    line('Name', [safeText(p.firstName), safeText(p.lastName)].filter(Boolean).join(' ')),
    line('Phone', p.phone),
    line('Date of birth', p.dateOfBirth),
    line('ID number', p.idNumber),
    line('Citizenship', p.citizenship),
    line('Gender', p.gender),
    line('Home language', p.homeLanguage),
    line('Residential address', p.residentialAddress),
    line('Postal address', p.postalAddress),
    line('Disability', p.disability ? 'Yes' : safeText(p.disability) === 'false' ? 'No' : ''),
    ...(p.disability ? [line('Disability notes', p.disabilityNotes)] : []),
  ]

  const docLines =
    snapshot.documents.length > 0
      ? snapshot.documents.map((d) =>
          line(
            d.category,
            `${d.filename} (${Math.round((d.size || 0) / 1024)} KB · ${new Date(d.createdAt).toLocaleDateString()})`,
          ),
        )
      : [line('Documents', '')]

  return [
    section('meta', 'Application status', [
      line('Student email', snapshot.email),
      line('Account created', snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleString() : ''),
      line('Saved progress step', snapshot.stepIndex > 0 ? `Step ${snapshot.stepIndex + 1}` : 'Step 1 (started)'),
    ]),
    section('profile', 'Profile', profileLines),
    section('academics', 'Academics', [
      line('School', a.schoolName),
      line('Grade / year', a.grade),
      line('Curriculum', a.curriculum),
      line('Institution', a.institutionName),
      line('Qualification', a.qualificationName),
      line('Year of study', a.yearOfStudy),
      line('Intended fields', a.intendedFieldsNotes),
      line('Subjects & marks', a.subjectsNotes),
      line('NBT / APS', a.nbtApsNotes),
      line('Achievements', a.achievementsNotes),
    ]),
    section('study', 'Study plan', [
      line('Motivation', sp.motivation),
      line('Career goals', sp.careerGoals),
      line('Location preferences', sp.locationPreferences),
      line('Bursary preferences', sp.bursaryPreferences),
    ]),
    section('household', 'Household', [
      line('Guardian name', h.guardianName),
      line('Relationship', h.relationship),
      line('Guardian phone', h.guardianPhone),
      line('Guardian email', h.guardianEmail),
      line('Household members', h.householdMembersNotes),
      line('Employment notes', h.employmentNotes),
    ]),
    section('financial', 'Financial need', [
      line('Income band', f.incomeBand),
      line('Income sources', f.incomeSourcesNotes),
      line('Expenses', f.expenseNotes),
      line('Other funding', f.otherFundingNotes),
      line('NSFAS status', f.nsfasStatus),
    ]),
    section('fit', 'Leadership & impact', [
      line('Leadership', fit.leadershipNotes),
      line('Community', fit.communityNotes),
      line('Work experience', fit.workExperienceNotes),
    ]),
    section('compliance', 'Consent', [
      line('POPIA consent', c.consentPopia ? 'Yes' : ''),
      line('Truthful declaration', c.declarationTruthful ? 'Yes' : ''),
    ]),
    section('documents', 'Uploaded documents', docLines),
  ]
}

export function snapshotFilledSectionCount(sections: PreviewSection[]): number {
  return sections.filter((s) => s.id !== 'meta' && s.hasAnyData).length
}
