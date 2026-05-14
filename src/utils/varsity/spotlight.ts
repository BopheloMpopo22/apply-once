import type { ProgrammeEligibility } from './types'

/**
 * Pick up to `perFaculty` eligible programmes per faculty for compact display.
 * Uses highest published minimum APS first (proxy for competitive programmes) then name —
 * we do not yet store real application-volume data in the catalogue.
 */
export function spotlightEligibleByFaculty(
  eligible: ProgrammeEligibility[],
  perFaculty: number,
): { faculty: string; items: ProgrammeEligibility[] }[] {
  const byFac = new Map<string, ProgrammeEligibility[]>()
  for (const e of eligible) {
    const f = (e.programme.faculty || 'General').trim() || 'General'
    if (!byFac.has(f)) byFac.set(f, [])
    byFac.get(f)!.push(e)
  }

  const keys = [...byFac.keys()].sort((a, b) => a.localeCompare(b))
  return keys.map((faculty) => {
    const list = byFac.get(faculty) ?? []
    const sorted = [...list].sort((a, b) => {
      const d = b.programme.minAps - a.programme.minAps
      if (d !== 0) return d
      return a.programme.name.localeCompare(b.programme.name)
    })
    return { faculty, items: sorted.slice(0, perFaculty) }
  })
}

export function countSpotlight(spots: { items: ProgrammeEligibility[] }[]): number {
  return spots.reduce((n, s) => n + s.items.length, 0)
}
