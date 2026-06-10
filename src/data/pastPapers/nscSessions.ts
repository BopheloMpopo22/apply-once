import type { NscYearSession } from './types'
import { DBE_PAST_PAPERS_INDEX } from './nscSubjects'

export const DBE_ORIGIN = 'https://www.education.gov.za'

export function novemberUrl(year: number): string {
  if (year >= 2021) return `${DBE_ORIGIN}/${year}NSCNovemberpastpapers.aspx`
  return DBE_PAST_PAPERS_INDEX
}

function mayJuneUrl(year: number): string {
  if (year >= 2021) {
    return `${DBE_ORIGIN}/Curriculum/NationalSeniorCertificate(NSC)Examinations/${year}MayJuneExamPapers.aspx`
  }
  return DBE_PAST_PAPERS_INDEX
}

/** Grade 12 NSC sessions 2020–2025 (Phase 1). */
export const NSC_YEAR_SESSIONS: NscYearSession[] = [
  { year: 2025, session: 'november', label: 'November 2025', dbeUrl: novemberUrl(2025) },
  {
    year: 2025,
    session: 'may-june',
    label: 'May/June 2025',
    dbeUrl: mayJuneUrl(2025),
  },
  { year: 2024, session: 'november', label: 'November 2024', dbeUrl: novemberUrl(2024) },
  {
    year: 2024,
    session: 'may-june',
    label: 'May/June 2024',
    dbeUrl: mayJuneUrl(2024),
  },
  { year: 2023, session: 'november', label: 'November 2023', dbeUrl: novemberUrl(2023) },
  {
    year: 2023,
    session: 'may-june',
    label: 'May/June 2023',
    dbeUrl: mayJuneUrl(2023),
  },
  { year: 2022, session: 'november', label: 'November 2022', dbeUrl: novemberUrl(2022) },
  {
    year: 2022,
    session: 'may-june',
    label: 'May/June 2022',
    dbeUrl: mayJuneUrl(2022),
  },
  { year: 2021, session: 'november', label: 'November 2021', dbeUrl: novemberUrl(2021) },
  {
    year: 2021,
    session: 'may-june',
    label: 'May/June 2021',
    dbeUrl: mayJuneUrl(2021),
  },
  { year: 2020, session: 'november', label: 'November 2020', dbeUrl: DBE_PAST_PAPERS_INDEX },
  {
    year: 2020,
    session: 'may-june',
    label: 'May/June 2020',
    dbeUrl: DBE_PAST_PAPERS_INDEX,
  },
]

export function sessionsForYear(year: number): NscYearSession[] {
  return NSC_YEAR_SESSIONS.filter((s) => s.year === year)
}

export function getYearSession(year: number, session: NscYearSession['session']): NscYearSession | undefined {
  return NSC_YEAR_SESSIONS.find((s) => s.year === year && s.session === session)
}

export const NSC_YEARS = [2025, 2024, 2023, 2022, 2021, 2020] as const
