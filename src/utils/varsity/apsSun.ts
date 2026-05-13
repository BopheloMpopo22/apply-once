import { apsBest6ExcludingLo } from './apsGenericBest6'
import type { ApsResult, SubjectMark } from './types'

/**
 * Stellenbosch publishes minimum **NSC aggregate %** (average excluding LO) in the admissions booklet.
 * When percentages are entered, we show the average % of up to six best subjects (excluding LO).
 * Otherwise fall back to a level-sum estimate (less comparable to published aggregates).
 */
export function apsSun(marks: SubjectMark[]): ApsResult {
  const excludingLo = marks.filter((m) => m.subject !== 'Life Orientation')
  const withPct = excludingLo.filter((m) => m.percent != null)
  if (withPct.length > 0) {
    const sorted = [...withPct].sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0))
    const top = sorted.slice(0, 6)
    const sum = top.reduce((s, m) => s + (m.percent ?? 0), 0)
    const avg = Math.round(sum / top.length)
    return {
      aps: avg,
      breakdown: top.map((m) => ({
        subject: m.subject,
        level: m.level,
        points: m.percent ?? 0,
      })),
      notes: [
        `Stellenbosch aggregate (average % of your best ${top.length} subject(s), excluding LO): ${avg}%. Compare to programme minimum aggregate % in the prospectus. Engineering and Science also use separate selection marks — see maties.com.`,
      ],
    }
  }
  return apsBest6ExcludingLo(marks, {
    note:
      'Enter subject percentages to see your NSC aggregate (average %) as used in the Stellenbosch 2027 booklet. Below is a fallback best‑6 level sum.',
  })
}
