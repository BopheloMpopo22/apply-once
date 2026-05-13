/**
 * Order universities appear in the varsity calculator (student-facing).
 * Keep in sync with src/data/varsity/universities.json ordering.
 */
export const VARSITY_UNIVERSITY_DISPLAY_ORDER = [
  'uct',
  'wits',
  'up',
  'uj',
  'nwu',
  'sun',
  'ufs',
  'nmu',
  'tut',
  'ru',
  'uwc',
  'ukzn',
  'ul',
  'cput',
  'vut',
  'unisa',
]

function displayIndex(universityId) {
  const i = VARSITY_UNIVERSITY_DISPLAY_ORDER.indexOf(universityId)
  return i === -1 ? 999 : i
}

export function sortUniversitiesForCatalogue(universities) {
  return [...universities].sort((a, b) => displayIndex(a.id) - displayIndex(b.id))
}

export function sortProgrammesForCatalogue(programmes) {
  return [...programmes].sort((a, b) => {
    const du = displayIndex(a.universityId) - displayIndex(b.universityId)
    if (du !== 0) return du
    const fa = String(a.faculty || '').localeCompare(String(b.faculty || ''))
    if (fa !== 0) return fa
    return String(a.name || '').localeCompare(String(b.name || ''))
  })
}
