import { apsBest6ExcludingLo } from './apsGenericBest6'
import type { ApsResult, SubjectMark } from './types'

/**
 * TUT: six recognised subjects; LO and achievement level 1 are not counted (2027 brochure).
 */
export function apsTut(marks: SubjectMark[]): ApsResult {
  const pool = marks.filter((m) => m.subject !== 'Life Orientation' && m.level > 1)
  return apsBest6ExcludingLo(pool, {
    note: 'TUT APS: best six NSC levels excluding LO; subjects with achievement level 1 are omitted.',
  })
}
