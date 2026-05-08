export type UniversityId = 'wits' | 'uct' | 'up' | 'sun' | 'nwu'

export type SubjectMarkInput = {
  subject: string
  percent?: number | null
  level?: number | null
}

export type NormalizedSubject =
  | 'English'
  | 'Mathematics'
  | 'Mathematical Literacy'
  | 'Physical Sciences'
  | 'Life Orientation'
  | 'Life Sciences'
  | 'Accounting'
  | 'Business Studies'
  | 'Economics'
  | 'Geography'
  | 'History'
  | 'Afrikaans'
  | 'Xitsonga'
  | 'isiZulu'
  | 'isiXhosa'
  | 'Sesotho'
  | 'Setswana'
  | 'Other'

export type SubjectMark = {
  rawSubject: string
  subject: NormalizedSubject
  percent?: number | null
  level: number
}

export type ApsResult = {
  aps: number
  breakdown: Array<{ subject: NormalizedSubject; level: number; points: number }>
  notes?: string[]
}

export type ProgrammeSubjectRequirement = {
  subject: string
  minLevel?: number
  minPercent?: number
}

export type Programme = {
  id: string
  name: string
  faculty: string
  campus?: string
  minAps: number
  subjectRequirements?: ProgrammeSubjectRequirement[]
  notes?: string
}

export type ProgrammeEligibility = {
  programme: Programme
  eligible: boolean
  reasons: string[]
}

