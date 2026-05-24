import universities from '../varsity/universities.json'
import type { UniversityAdmissionEntry } from '../../types/hubs'

const PROVINCE_BY_ID: Record<string, string> = {
  uct: 'Western Cape',
  wits: 'Gauteng',
  up: 'Gauteng',
  uj: 'Gauteng',
  nwu: 'North West',
  sun: 'Western Cape',
  ufs: 'Free State',
  nmu: 'Eastern Cape',
  tut: 'Gauteng',
  ru: 'Eastern Cape',
  uwc: 'Western Cape',
  ukzn: 'KwaZulu-Natal',
  ul: 'Limpopo',
  cput: 'Western Cape',
  vut: 'Gauteng',
  unisa: 'National (distance learning)',
}

const KNOWN_FOR_BY_ID: Record<string, string[]> = {
  uct: ['Medicine', 'Law', 'Engineering', 'Commerce'],
  wits: ['Mining', 'Health sciences', 'Commerce', 'Engineering'],
  up: ['Veterinary science', 'Engineering', 'Law', 'Education'],
  uj: ['Art', 'Engineering', 'Health', 'Business'],
  nwu: ['Education', 'Agriculture', 'Commerce', 'Engineering'],
  sun: ['Agriculture', 'Wine sciences', 'Engineering', 'Medicine'],
  ufs: ['Health sciences', 'Law', 'Agriculture', 'Humanities'],
  nmu: ['Marine sciences', 'Business', 'Engineering', 'Education'],
  tut: ['Engineering', 'IT', 'Applied sciences', 'Management'],
  ru: ['Journalism', 'Pharmacy', 'Humanities', 'Science'],
  uwc: ['Dentistry', 'Community health', 'Law', 'Natural sciences'],
  ukzn: ['Medicine', 'Agriculture', 'Law', 'Engineering'],
  ul: ['Medicine', 'Health sciences', 'Science', 'Humanities'],
  cput: ['Design', 'Engineering', 'Business', 'Health sciences'],
  vut: ['Engineering', 'Applied sciences', 'Management', 'Humanities'],
  unisa: ['Open distance learning', 'Law', 'Education', 'Business'],
}

const APPLY_PATH: Record<string, string> = {
  uct: '/apply',
  wits: '/study-at-wits',
  up: '/apply',
  uj: '/apply',
  nwu: '/apply',
  sun: '/apply',
  ufs: '/apply',
  nmu: '/apply',
  tut: '/apply',
  ru: '/apply',
  uwc: '/apply',
  ukzn: '/apply',
  ul: '/apply',
  cput: '/apply',
  vut: '/apply',
  unisa: '/apply',
}

function buildEntry(u: (typeof universities)[number]): UniversityAdmissionEntry {
  const base = u.website.replace(/\/$/, '')
  const applyPath = APPLY_PATH[u.id] ?? ''
  return {
    id: u.id,
    name: u.name,
    shortName: u.shortName,
    province: PROVINCE_BY_ID[u.id] ?? 'South Africa',
    website: u.website,
    applyUrl: `${base}${applyPath}`,
    logo: u.logo,
    knownFor: KNOWN_FOR_BY_ID[u.id] ?? ['Undergraduate programmes'],
    applicationOpens: 'Usually March–May (confirm on official site)',
    applicationCloses: 'Usually August–September (varies by faculty)',
    applicationFee: 'See official site for current undergraduate fee',
    openDays: 'Check the university events or open day page on their website',
    notes:
      'Undergraduate requirements differ by faculty. Use the official prospectus and closing dates for your chosen programme.',
  }
}

export const UNIVERSITY_ADMISSIONS: UniversityAdmissionEntry[] = universities.map(buildEntry)

export function getUniversityAdmission(id: string): UniversityAdmissionEntry | undefined {
  return UNIVERSITY_ADMISSIONS.find((u) => u.id === id)
}
