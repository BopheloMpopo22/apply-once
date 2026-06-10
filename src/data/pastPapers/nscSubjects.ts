import type { NscSubject } from './types'

/** Phase 1 — most-used Grade 12 NSC subjects (national papers, same across provinces). */
export const NSC_GRADE12_SUBJECTS: NscSubject[] = [
  { id: 'mathematics', name: 'Mathematics', dbeSection: 'Mathematics', group: 'sciences' },
  {
    id: 'maths-literacy',
    name: 'Mathematical Literacy',
    dbeSection: 'Mathematical Literacy',
    group: 'sciences',
  },
  { id: 'physical-sciences', name: 'Physical Sciences', dbeSection: 'Physical Sciences', group: 'sciences' },
  { id: 'life-sciences', name: 'Life Sciences', dbeSection: 'Life Sciences', group: 'sciences' },
  {
    id: 'english-hl',
    name: 'English Home Language',
    dbeSection: 'English',
    group: 'languages',
  },
  {
    id: 'english-fal',
    name: 'English First Additional Language',
    dbeSection: 'English',
    group: 'languages',
  },
  { id: 'accounting', name: 'Accounting', dbeSection: 'Accounting', group: 'commerce' },
  { id: 'business-studies', name: 'Business Studies', dbeSection: 'Business Studies', group: 'commerce' },
  { id: 'economics', name: 'Economics', dbeSection: 'Economics', group: 'commerce' },
  { id: 'geography', name: 'Geography', dbeSection: 'Geography', group: 'humanities' },
  { id: 'history', name: 'History', dbeSection: 'History', group: 'humanities' },
  { id: 'life-orientation', name: 'Life Orientation', dbeSection: 'Life Orientation', group: 'other' },
  {
    id: 'cat',
    name: 'Computer Applications Technology',
    dbeSection: 'Computer Application Technology',
    group: 'technology',
  },
  { id: 'it', name: 'Information Technology', dbeSection: 'Information Technology', group: 'technology' },
  {
    id: 'engineering-graphics',
    name: 'Engineering Graphics & Design',
    dbeSection: 'Engineering Graphic and Design',
    group: 'technology',
  },
]

export const DBE_PAST_PAPERS_INDEX =
  'https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx'

export const WCED_PAST_PAPERS = 'https://wcedeportal.co.za/past-papers'
