import { apsBest6ExcludingLo } from './apsGenericBest6'
import type { ApsResult, SubjectMark } from './types'

// UCT uses a points system that can be more complex than a level-sum.
// For v1 we compute a consistent "best-6 levels (excluding LO)" estimate for comparison.
export function apsUct(marks: SubjectMark[]): ApsResult {
  return apsBest6ExcludingLo(marks, { note: 'UCT APS shown here is an estimate based on best-6 levels (excluding LO).' })
}

