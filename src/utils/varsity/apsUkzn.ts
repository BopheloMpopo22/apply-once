import type { ApsResult, SubjectMark } from './types'

function dedupeExcludingLo(marks: SubjectMark[]): SubjectMark[] {
  const pool = marks.filter((m) => m.subject !== 'Life Orientation')
  const byRaw = new Map<string, SubjectMark>()
  for (const m of pool) {
    const cur = byRaw.get(m.rawSubject)
    if (!cur || m.level > cur.level) byRaw.set(m.rawSubject, m)
  }
  return [...byRaw.values()]
}

/**
 * UKZN APS: English + Mathematics or Maths Literacy + four next-best subjects (LO excluded).
 */
export function apsUkzn(marks: SubjectMark[]): ApsResult {
  const uniq = dedupeExcludingLo(marks)
  const english = uniq.filter((m) => m.subject === 'English').sort((a, b) => b.level - a.level)[0]
  const maths = uniq
    .filter((m) => m.subject === 'Mathematics' || m.subject === 'Mathematical Literacy')
    .sort((a, b) => b.level - a.level)[0]

  const fixed = [english, maths].filter(Boolean) as SubjectMark[]
  const used = new Set(fixed)
  const others = uniq.filter((m) => !used.has(m)).sort((a, b) => b.level - a.level)
  const four = others.slice(0, 4)
  const six = [...fixed, ...four]

  const breakdown = six.map((m) => ({ subject: m.subject, level: m.level, points: m.level }))
  const aps = breakdown.reduce((s, b) => s + b.points, 0)

  return {
    aps,
    breakdown,
    notes: ['UKZN APS: English + Mathematics or Maths Literacy + four other best subjects (LO excluded).'],
  }
}
