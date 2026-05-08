import type { ApsResult, NormalizedSubject, SubjectMark } from './types'

// Wits APS is commonly expressed on a 49-point scale (7 subjects x level 1–7).
// For v1:
// - include Life Orientation
// - take the best 7 subjects by level
export function apsWits(marks: SubjectMark[]): ApsResult {
  const top = [...marks].sort((a, b) => b.level - a.level).slice(0, 7)

  const breakdown = top.map((m) => ({
    subject: m.subject as NormalizedSubject,
    level: m.level,
    points: m.level,
  }))
  const aps = breakdown.reduce((sum, b) => sum + b.points, 0)

  return {
    aps,
    breakdown,
    notes: ['Wits APS shown here is a best-7 estimate (including Life Orientation).'],
  }
}

