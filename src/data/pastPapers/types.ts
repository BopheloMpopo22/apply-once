export type NscSessionId = 'november' | 'may-june'

export type NscSubject = {
  id: string
  name: string
  /** Heading text on DBE year pages (must match official spelling). */
  dbeSection: string
  group: 'languages' | 'sciences' | 'commerce' | 'humanities' | 'technology' | 'other'
}

export type NscYearSession = {
  year: number
  session: NscSessionId
  label: string
  dbeUrl: string
}

export type PaperOfTheDayEntry = {
  subject: string
  year: number
  session: string
  title: string
  kind: 'question-paper' | 'memo'
  url: string
  source: 'DBE' | 'WCED'
}
