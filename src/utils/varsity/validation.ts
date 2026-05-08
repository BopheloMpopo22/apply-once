import type { SubjectMarkInput } from './types'
import { coercePercent } from './levels'

export type VarsityValidationIssue = {
  row: number
  field: 'subject' | 'percent'
  message: string
}

export function validateMarkRows(rows: SubjectMarkInput[]): VarsityValidationIssue[] {
  const issues: VarsityValidationIssue[] = []
  const seen = new Map<string, number>()

  rows.forEach((r, idx) => {
    const subject = (r.subject || '').trim()
    const percent = r.percent

    if (subject) {
      const key = subject.toLowerCase()
      if (seen.has(key)) {
        issues.push({ row: idx, field: 'subject', message: `Duplicate subject (already entered on row ${seen.get(key)! + 1}).` })
      } else {
        seen.set(key, idx)
      }
    }

    const rawPercent = typeof percent === 'number' ? percent : percent === null || percent === undefined ? null : Number(percent)
    if (rawPercent !== null && rawPercent !== undefined && Number.isFinite(rawPercent)) {
      const coerced = coercePercent(rawPercent)
      if (coerced === null) {
        issues.push({ row: idx, field: 'percent', message: 'Enter a number between 0 and 100.' })
      } else if (coerced !== Math.round(rawPercent)) {
        issues.push({ row: idx, field: 'percent', message: 'Percent must be between 0 and 100.' })
      }
    } else if (subject && (percent === '' as unknown)) {
      issues.push({ row: idx, field: 'percent', message: 'Enter a percent.' })
    }
  })

  return issues
}

