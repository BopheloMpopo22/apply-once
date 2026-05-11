import type { ApsResult, SubjectMark, UniversityId } from './types'
import { apsNwu } from './apsNwu'
import { apsSun } from './apsSun'
import { apsUct } from './apsUct'
import { apsUp } from './apsUp'
import { apsWits } from './apsWits'
import { apsBest6ExcludingLo } from './apsGenericBest6'

export function calculateAps(universityId: UniversityId, marks: SubjectMark[]): ApsResult {
  switch (universityId) {
    case 'wits':
      return apsWits(marks)
    case 'uct':
      return apsUct(marks)
    case 'up':
      return apsUp(marks)
    case 'sun':
      return apsSun(marks)
    case 'nwu':
      return apsNwu(marks)
    case 'uj':
    case 'ukzn':
    case 'ufs':
    case 'ru':
    case 'unisa':
      return apsBest6ExcludingLo(marks, { note: 'APS shown here is an estimate based on best-6 levels (excluding LO).' })
    default:
      return { aps: 0, breakdown: [] }
  }
}

