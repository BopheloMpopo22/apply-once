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
    notes: [
      'Approximate APS: best seven NSC levels including Life Orientation. Official Wits APS uses your percentages in a fixed seven-subject layout (English, First Additional Language, Mathematics or Maths Literacy, three electives, Life Orientation) with extra weighting on English and Mathematics and a separate Life Orientation scale—see docs/prospectus/2027/Wits_2027_Prospectus_compressed.pdf p. 13.',
    ],
  }
}

