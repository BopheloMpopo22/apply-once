import type { ApsResult, SubjectMark } from './types'

// UP commonly uses "best 6 subjects" excluding Life Orientation, where each subject contributes its NSC level (1–7).
export function apsUp(marks: SubjectMark[]): ApsResult {
  const eligible = marks.filter((m) => m.subject !== 'Life Orientation')

  const top = [...eligible].sort((a, b) => b.level - a.level).slice(0, 6)
  const breakdown = top.map((m) => ({ subject: m.subject, level: m.level, points: m.level }))
  const aps = breakdown.reduce((sum, b) => sum + b.points, 0)

  return {
    aps,
    breakdown,
    notes: ['UP APS shown here is a best-6 estimate (excluding Life Orientation).'],
  }
}

