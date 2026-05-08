import { apsBest6ExcludingLo } from './apsGenericBest6'
import type { ApsResult, SubjectMark } from './types'

export function apsNwu(marks: SubjectMark[]): ApsResult {
  return apsBest6ExcludingLo(marks, { note: 'NWU APS shown here is an estimate based on best-6 levels (excluding LO).' })
}

