import type { ApsResult, SubjectMark, UniversityId } from './types'
import { apsNwu } from './apsNwu'
import { apsNmu } from './apsPercentSumSix'
import { apsRu } from './apsRu'
import { apsSun } from './apsSun'
import { apsTut } from './apsTut'
import { apsUct } from './apsUct'
import { apsUkzn } from './apsUkzn'
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
    case 'ukzn':
      return apsUkzn(marks)
    case 'ru':
      return apsRu(marks)
    case 'nmu':
      return apsNmu(marks)
    case 'tut':
      return apsTut(marks)
    case 'uj':
    case 'ufs':
    case 'uwc':
    case 'cput':
    case 'ul':
    case 'vut':
    case 'unisa':
      return apsBest6ExcludingLo(marks, { note: 'APS shown here is an estimate based on best-6 levels (excluding LO).' })
    default:
      return { aps: 0, breakdown: [] }
  }
}

