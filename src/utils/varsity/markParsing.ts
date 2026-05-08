import { coerceLevel, coercePercent, percentToNscLevel } from './levels'
import { normalizeSubjectName } from './subjectNormalization'
import type { SubjectMark, SubjectMarkInput } from './types'

export function normalizeMarks(inputs: SubjectMarkInput[]): SubjectMark[] {
  const out: SubjectMark[] = []

  for (const m of inputs) {
    const rawSubject = (m.subject || '').trim()
    if (!rawSubject) continue

    const percent = coercePercent(m.percent)
    const explicitLevel = coerceLevel(m.level)
    const level = explicitLevel ?? (percent !== null ? percentToNscLevel(percent) : 0)
    if (level <= 0) continue

    out.push({
      rawSubject,
      subject: normalizeSubjectName(rawSubject),
      percent,
      level,
    })
  }

  return out
}

