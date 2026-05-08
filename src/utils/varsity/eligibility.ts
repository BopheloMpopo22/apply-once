import type { Programme, ProgrammeEligibility, SubjectMark, UniversityId } from './types'
import { calculateAps } from './calculators'

function findBestMarkForSubject(marks: SubjectMark[], subjectLabel: string): SubjectMark | null {
  const subjectKey = subjectLabel.trim().toLowerCase()
  if (!subjectKey) return null

  const candidates = marks.filter((m) => m.subject.toLowerCase() === subjectKey)
  if (candidates.length === 0) return null
  return candidates.reduce((best, cur) => (cur.level > best.level ? cur : best), candidates[0])
}

export function checkProgrammeEligibility(
  universityId: UniversityId,
  marks: SubjectMark[],
  programme: Programme,
): ProgrammeEligibility {
  const apsRes = calculateAps(universityId, marks)
  const reasons: string[] = []

  if (apsRes.aps < programme.minAps) {
    reasons.push(`APS too low: need ${programme.minAps}, you have ${apsRes.aps}.`)
  }

  for (const req of programme.subjectRequirements ?? []) {
    const m = findBestMarkForSubject(marks, req.subject)
    if (!m) {
      reasons.push(`Missing subject: ${req.subject}.`)
      continue
    }

    if (typeof req.minLevel === 'number' && m.level < req.minLevel) {
      reasons.push(`${req.subject} level too low: need level ${req.minLevel}, you have level ${m.level}.`)
    }

    if (typeof req.minPercent === 'number') {
      const percent = m.percent ?? null
      if (percent === null) {
        reasons.push(`${req.subject} needs at least ${req.minPercent}%, but you entered only a level.`)
      } else if (percent < req.minPercent) {
        reasons.push(`${req.subject} mark too low: need ${req.minPercent}%, you have ${percent}%.`)
      }
    }
  }

  return { programme, eligible: reasons.length === 0, reasons }
}

export function computeEligibilityForUniversity(
  universityId: UniversityId,
  marks: SubjectMark[],
  programmes: Programme[],
): { aps: number; apsNotes?: string[]; eligible: ProgrammeEligibility[]; ineligible: ProgrammeEligibility[] } {
  const apsRes = calculateAps(universityId, marks)
  const results = programmes.map((p) => checkProgrammeEligibility(universityId, marks, p))
  const eligible = results.filter((r) => r.eligible)
  const ineligible = results.filter((r) => !r.eligible)

  return { aps: apsRes.aps, apsNotes: apsRes.notes, eligible, ineligible }
}

