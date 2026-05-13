import type { ApsResult, SubjectMark } from './types'
import { approxPercentFromMark } from './percentFromMark'

function admissionPercent(m: SubjectMark): number {
  const p = approxPercentFromMark(m)
  return p < 40 ? 0 : p
}

/**
 * Sum of the best six NSC % marks (excluding LO; under 40% counts as 0).
 * Matches Nelson Mandela University-style totals in the 2027 prospectus (often 300–420+).
 */
export function apsSixSubjectPercentSum(marks: SubjectMark[], note: string): ApsResult {
  const pool = marks.filter((m) => m.subject !== 'Life Orientation')
  const byRaw = new Map<string, SubjectMark>()
  for (const m of pool) {
    const cur = byRaw.get(m.rawSubject)
    if (!cur || admissionPercent(m) > admissionPercent(cur)) byRaw.set(m.rawSubject, m)
  }
  const uniq = [...byRaw.values()]
  const six = [...uniq].sort((a, b) => admissionPercent(b) - admissionPercent(a)).slice(0, 6)
  const breakdown = six.map((m) => ({
    subject: m.subject,
    level: m.level,
    points: admissionPercent(m),
  }))
  const aps = breakdown.reduce((s, b) => s + b.points, 0)
  return { aps, breakdown, notes: [note] }
}

export function apsNmu(marks: SubjectMark[]): ApsResult {
  return apsSixSubjectPercentSum(
    marks,
    'NMU table scores are totals of six NSC % marks (under 40% = 0; LO excluded). Compare your total to the programme minimum from the prospectus.',
  )
}
