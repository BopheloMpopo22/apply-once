import type { SubjectMarkInput } from './types'

const STORAGE_KEY = 'apply-once-varsity-calculator-v3'

export type VarsityCalculatorPersisted = {
  reportType: 'grade11t4' | 'grade12t1' | 'grade12t2'
  rows: SubjectMarkInput[]
  showIneligible: boolean
  search: string
}

function isReportType(v: unknown): v is VarsityCalculatorPersisted['reportType'] {
  return v === 'grade11t4' || v === 'grade12t1' || v === 'grade12t2'
}

function isRow(v: unknown): v is SubjectMarkInput {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return typeof o.subject === 'string' && (o.percent === null || o.percent === undefined || typeof o.percent === 'number')
}

export function loadPersistedCalculator(): VarsityCalculatorPersisted | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem('apply-once-varsity-calculator-v2')
    if (!raw) return null
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object') return null
    const p = o as Record<string, unknown>
    const rows = Array.isArray(p.rows) ? p.rows.filter(isRow) : []
    if (rows.length === 0) return null
    return {
      reportType: isReportType(p.reportType) ? p.reportType : 'grade11t4',
      rows,
      showIneligible: Boolean(p.showIneligible),
      search: typeof p.search === 'string' ? p.search : '',
    }
  } catch {
    return null
  }
}

export function persistCalculator(data: VarsityCalculatorPersisted): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* quota / private mode */
  }
}

const DEFAULT_ROWS: SubjectMarkInput[] = [
  { subject: 'English HL', percent: 60 },
  { subject: 'Mathematics', percent: 60 },
  { subject: 'Afrikaans HL', percent: 60 },
  { subject: 'Life Orientation', percent: 60 },
  { subject: '', percent: null },
  { subject: '', percent: null },
  { subject: '', percent: null },
]

/** One-shot read for lazy useState initialisers (session restore). */
export function initialReportType(): VarsityCalculatorPersisted['reportType'] {
  const s = loadPersistedCalculator()
  return s && isReportType(s.reportType) ? s.reportType : 'grade11t4'
}

export function initialRows(): SubjectMarkInput[] {
  const s = loadPersistedCalculator()
  return s?.rows?.length ? s.rows : DEFAULT_ROWS
}

export function initialShowIneligible(): boolean {
  return Boolean(loadPersistedCalculator()?.showIneligible)
}

export function initialSearch(): string {
  const s = loadPersistedCalculator()
  return typeof s?.search === 'string' ? s.search : ''
}
