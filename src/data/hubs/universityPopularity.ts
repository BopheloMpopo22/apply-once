/** Default list order — most searched / applied-to SA public universities first. */
export const UNIVERSITY_POPULARITY_ORDER = [
  'uct',
  'wits',
  'up',
  'uj',
  'ukzn',
  'sun',
  'unisa',
  'nwu',
  'ufs',
  'nmu',
  'uwc',
  'ru',
  'tut',
  'cput',
  'dut',
  'ul',
  'vut',
  'cut',
  'ufh',
  'wsu',
  'unizulu',
  'univen',
  'mut',
  'smu',
  'ump',
  'spu',
] as const

export function universityPopularityIndex(id: string): number {
  const index = UNIVERSITY_POPULARITY_ORDER.indexOf(id as (typeof UNIVERSITY_POPULARITY_ORDER)[number])
  return index === -1 ? UNIVERSITY_POPULARITY_ORDER.length : index
}

export function compareUniversitiesByPopularity(aId: string, bId: string): number {
  return universityPopularityIndex(aId) - universityPopularityIndex(bId)
}
