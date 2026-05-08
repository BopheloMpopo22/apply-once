import universities from '../../data/varsity/universities.json'
import programmesWits from '../../data/varsity/programmes.wits.json'
import programmesUct from '../../data/varsity/programmes.uct.json'
import programmesUp from '../../data/varsity/programmes.up.json'
import programmesSun from '../../data/varsity/programmes.sun.json'
import programmesNwu from '../../data/varsity/programmes.nwu.json'
import type { Programme, UniversityId } from './types'

export type UniversityInfo = {
  id: UniversityId
  name: string
  shortName: string
  website: string
  logo: string
}

export function getUniversities(): UniversityInfo[] {
  return (universities as unknown as UniversityInfo[]).slice()
}

export function getProgrammes(universityId: UniversityId): Programme[] {
  switch (universityId) {
    case 'wits':
      return programmesWits as unknown as Programme[]
    case 'uct':
      return programmesUct as unknown as Programme[]
    case 'up':
      return programmesUp as unknown as Programme[]
    case 'sun':
      return programmesSun as unknown as Programme[]
    case 'nwu':
      return programmesNwu as unknown as Programme[]
    default:
      return []
  }
}

