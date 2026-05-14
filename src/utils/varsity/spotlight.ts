import type { ProgrammeEligibility } from './types'

function bucketByFaculty(eligible: ProgrammeEligibility[]): Map<string, ProgrammeEligibility[]> {
  const byFac = new Map<string, ProgrammeEligibility[]>()
  for (const e of eligible) {
    const f = (e.programme.faculty || 'General').trim() || 'General'
    if (!byFac.has(f)) byFac.set(f, [])
    byFac.get(f)!.push(e)
  }
  return byFac
}

/** Group programme results by faculty; programmes sorted by name within each faculty. */
export function groupProgrammesByFaculty(items: ProgrammeEligibility[]): {
  faculty: string
  items: ProgrammeEligibility[]
}[] {
  const byFac = bucketByFaculty(items)
  const keys = [...byFac.keys()].sort((a, b) => a.localeCompare(b))
  return keys.map((faculty) => {
    const list = byFac.get(faculty) ?? []
    const sorted = [...list].sort((a, b) => a.programme.name.localeCompare(b.programme.name))
    return { faculty, items: sorted }
  })
}
