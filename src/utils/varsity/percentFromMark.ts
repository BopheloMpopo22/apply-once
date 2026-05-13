import type { SubjectMark } from './types'

/** Mid-range % for an NSC level when the learner only entered a level (not an official university rule). */
export function approxPercentFromMark(m: SubjectMark): number {
  if (m.percent != null) return m.percent
  if (m.level >= 7) return 90
  if (m.level === 6) return 75
  if (m.level === 5) return 65
  if (m.level === 4) return 55
  if (m.level === 3) return 45
  if (m.level === 2) return 35
  if (m.level === 1) return 25
  return 0
}
