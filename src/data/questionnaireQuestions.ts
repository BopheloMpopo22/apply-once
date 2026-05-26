export type QuestionnaireOption = { value: string; label: string }

export type QuestionnaireQuestion = {
  id: keyof QuestionnaireAnswers
  title: string
  subtitle?: string
  options: QuestionnaireOption[]
}

export type QuestionnaireAnswers = {
  studyChoice1: string
  studyChoice2: string
  studyChoice3: string
  workSector: string
  jobLinkedBursary: string
  careerPriority: string
}

export const STUDY_FIELD_OPTIONS: QuestionnaireOption[] = [
  { value: 'engineering', label: 'Engineering & built environment' },
  { value: 'health', label: 'Health sciences & medicine' },
  { value: 'commerce', label: 'Commerce, accounting & finance' },
  { value: 'law', label: 'Law' },
  { value: 'education', label: 'Education & teaching' },
  { value: 'it', label: 'IT, computer science & data' },
  { value: 'science', label: 'Pure & applied sciences' },
  { value: 'arts', label: 'Arts, media & humanities' },
  { value: 'agriculture', label: 'Agriculture & environmental' },
  { value: 'hospitality', label: 'Hospitality, tourism & culinary' },
]

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: 'studyChoice1',
    title: 'What do you most want to study? (1st choice)',
    subtitle: 'Your dream programme — like a university first choice on CAO.',
    options: STUDY_FIELD_OPTIONS,
  },
  {
    id: 'studyChoice2',
    title: 'What is your second study choice?',
    subtitle: 'If your first choice does not work out, many bursaries still fund related fields.',
    options: STUDY_FIELD_OPTIONS,
  },
  {
    id: 'studyChoice3',
    title: 'What is your third study choice?',
    subtitle: 'A backup path keeps more funding options open.',
    options: STUDY_FIELD_OPTIONS,
  },
  {
    id: 'workSector',
    title: 'Where do you see yourself working one day?',
    options: [
      { value: 'corporate', label: 'Corporate / private sector' },
      { value: 'government', label: 'Government or public service' },
      { value: 'healthcare', label: 'Hospitals & healthcare' },
      { value: 'entrepreneurship', label: 'Starting my own business' },
      { value: 'research', label: 'Research & university' },
      { value: 'nonprofit', label: 'NGO / community impact' },
      { value: 'trades', label: 'Skilled trades & technical work' },
    ],
  },
  {
    id: 'jobLinkedBursary',
    title: 'Would you consider a bursary with a work contract after graduation?',
    subtitle: 'Some funders pay full fees but expect you to work for them for a few years.',
    options: [
      { value: 'yes_very', label: 'Yes — I want job security after my degree' },
      { value: 'yes_open', label: 'Yes — I am open to it if fees are covered' },
      { value: 'no_obligation', label: 'No — I prefer funding without a work bond' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'careerPriority',
    title: 'What matters most in your dream career?',
    options: [
      { value: 'stability', label: 'Financial stability & a good salary' },
      { value: 'impact', label: 'Making a difference in my community' },
      { value: 'creativity', label: 'Creativity & doing work I love' },
      { value: 'leadership', label: 'Leadership & growing fast' },
      { value: 'flexibility', label: 'Flexibility & work–life balance' },
    ],
  },
]

export const emptyQuestionnaireAnswers = (): QuestionnaireAnswers => ({
  studyChoice1: '',
  studyChoice2: '',
  studyChoice3: '',
  workSector: '',
  jobLinkedBursary: '',
  careerPriority: '',
})

export function labelForAnswer(
  questionId: keyof QuestionnaireAnswers,
  value: string,
): string {
  const q = QUESTIONNAIRE_QUESTIONS.find((x) => x.id === questionId)
  return q?.options.find((o) => o.value === value)?.label ?? value
}
