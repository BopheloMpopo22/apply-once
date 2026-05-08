import { apsBest6ExcludingLo } from './apsGenericBest6'
import type { ApsResult, SubjectMark } from './types'

export function apsSun(marks: SubjectMark[]): ApsResult {
  return apsBest6ExcludingLo(marks, {
    note: 'Stellenbosch APS shown here is an estimate based on best-6 levels (excluding LO).',
  })
}

