import type { ApsResult, SubjectMark } from './types'

/** NSC % that counts toward UCT APS/FPS; marks below 40% contribute 0 (2027 prospectus). */
function uctPercentFromMark(m: SubjectMark): number {
  if (m.percent != null) return m.percent
  if (m.level >= 7) return 90
  if (m.level === 6) return 75
  if (m.level === 5) return 65
  if (m.level === 4) return 55
  if (m.level === 3) return 45
  return 0
}

function uctAdmissionPoints(m: SubjectMark): number {
  const p = uctPercentFromMark(m)
  return p < 40 ? 0 : p
}

/**
 * English plus the five best other subjects (excluding Life Orientation), using percentage points.
 * Matches UCT APS/FPS (out of 600) for Commerce, EBE, Humanities and Law.
 */
function uctStandardApsAndSix(marks: SubjectMark[]): { aps: number; six: SubjectMark[] } {
  const pool = marks.filter((m) => m.subject !== 'Life Orientation')
  const byRaw = new Map<string, SubjectMark>()
  for (const m of pool) {
    const cur = byRaw.get(m.rawSubject)
    if (!cur || uctAdmissionPoints(m) > uctAdmissionPoints(cur)) byRaw.set(m.rawSubject, m)
  }
  const uniq = [...byRaw.values()]
  const englishCandidates = uniq.filter((m) => m.subject === 'English')
  const english = englishCandidates.sort((a, b) => uctAdmissionPoints(b) - uctAdmissionPoints(a))[0]
  const others = uniq
    .filter((m) => m !== english)
    .sort((a, b) => uctAdmissionPoints(b) - uctAdmissionPoints(a))
  const six = english ? [english, ...others.slice(0, 5)] : others.slice(0, 6)
  const aps = six.reduce((s, m) => s + uctAdmissionPoints(m), 0)
  return { aps, six }
}

/** Science faculty FPS (out of 800): sum of six subject percentages with Mathematics and Physical Sciences doubled. */
function uctScienceFpsFromSix(six: SubjectMark[], baseAps: number): number | undefined {
  const math = six.find((m) => m.subject === 'Mathematics')
  const phys = six.find((m) => m.subject === 'Physical Sciences')
  if (!math || !phys) return undefined
  return baseAps + uctAdmissionPoints(math) + uctAdmissionPoints(phys)
}

export function apsUct(marks: SubjectMark[]): ApsResult {
  const { aps, six } = uctStandardApsAndSix(marks)
  const breakdown = six.map((m) => ({
    subject: m.subject,
    level: m.level,
    points: uctAdmissionPoints(m),
  }))
  const scienceFps = uctScienceFpsFromSix(six, aps)
  const notes = [
    'UCT APS/FPS (600 scale): English plus five other best subjects (%), excluding Life Orientation; marks below 40% count as 0.',
    ...(scienceFps !== undefined
      ? [`Science faculty FPS (800 scale, indicative): ${scienceFps} (Mathematics and Physical Sciences counted twice in that faculty).`]
      : []),
  ]
  return {
    aps,
    breakdown,
    notes,
    ...(scienceFps !== undefined ? { uctScienceFps: scienceFps } : {}),
  }
}
