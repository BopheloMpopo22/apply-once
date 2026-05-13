import type { ApsResult, SubjectMark } from './types'
import { approxPercentFromMark } from './percentFromMark'

function ruSubjectPoints(m: SubjectMark): number {
  const p = approxPercentFromMark(m)
  if (p < 40) return 0
  return Math.round((p / 10) * 10) / 10
}

/**
 * Rhodes admission points: sum of six subject scores (percentage ÷ 10), LO excluded.
 * English plus the five best other subjects (by points). Marks below 40% score 0.
 * @see https://www.ru.ac.za/admissiongateway/application/entryrequirements/
 */
export function apsRu(marks: SubjectMark[]): ApsResult {
  const pool = marks.filter((m) => m.subject !== 'Life Orientation')
  const byRaw = new Map<string, SubjectMark>()
  for (const m of pool) {
    const cur = byRaw.get(m.rawSubject)
    if (!cur || ruSubjectPoints(m) > ruSubjectPoints(cur)) byRaw.set(m.rawSubject, m)
  }
  const uniq = [...byRaw.values()]
  const englishCandidates = uniq.filter((m) => m.subject === 'English')
  const english = englishCandidates.sort((a, b) => ruSubjectPoints(b) - ruSubjectPoints(a))[0]
  const others = uniq
    .filter((m) => m !== english)
    .sort((a, b) => ruSubjectPoints(b) - ruSubjectPoints(a))
  const five = others.slice(0, 5)
  const six = [english, ...five].filter(Boolean) as SubjectMark[]

  const breakdown = six.map((m) => ({
    subject: m.subject,
    level: m.level,
    points: ruSubjectPoints(m),
  }))
  const raw = breakdown.reduce((s, b) => s + b.points, 0)
  const aps = Math.round(raw * 10) / 10

  return {
    aps,
    breakdown,
    notes: [
      'Rhodes APS is the sum of six scores (each NSC % ÷ 10, under 40% = 0), including English plus five other best subjects; LO excluded.',
    ],
  }
}
