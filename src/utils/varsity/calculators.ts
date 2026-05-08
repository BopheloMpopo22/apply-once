import type { ApsResult, SubjectMark, UniversityId } from './types'
import { apsNwu } from './apsNwu'
import { apsSun } from './apsSun'
import { apsUct } from './apsUct'
import { apsUp } from './apsUp'
import { apsWits } from './apsWits'

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
    default:
      return { aps: 0, breakdown: [] }
  }
}

