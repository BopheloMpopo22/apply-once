import type { ApsResult, SubjectMark } from './types'

export function apsBest6ExcludingLo(
  marks: SubjectMark[],
  opts?: { note?: string; excludeSubjects?: Array<SubjectMark['subject']> },
): ApsResult {
  const exclude = new Set<SubjectMark['subject']>(['Life Orientation', ...(opts?.excludeSubjects ?? [])])
  const eligible = marks.filter((m) => !exclude.has(m.subject))
  const top = [...eligible].sort((a, b) => b.level - a.level).slice(0, 6)
  const breakdown = top.map((m) => ({ subject: m.subject, level: m.level, points: m.level }))
  const aps = breakdown.reduce((sum, b) => sum + b.points, 0)

  return { aps, breakdown, notes: opts?.note ? [opts.note] : undefined }
}

