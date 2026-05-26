import type { QuestionnaireQuestion } from './questionnaireQuestions'
import { QUESTIONNAIRE_QUESTIONS } from './questionnaireQuestions'

export type QuestionnaireStep =
  | { id: 'study-choices'; kind: 'study-choices'; title: string; subtitle?: string }
  | { id: string; kind: 'choice'; question: QuestionnaireQuestion }

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 'study-choices',
    kind: 'study-choices',
    title: 'What do you want to study?',
    subtitle: 'List your 1st, 2nd and 3rd choices — like a university application. Pick from the list or type your own field.',
  },
  {
    id: 'workSector',
    kind: 'choice',
    question: QUESTIONNAIRE_QUESTIONS.find((q) => q.id === 'workSector')!,
  },
  {
    id: 'jobLinkedBursary',
    kind: 'choice',
    question: QUESTIONNAIRE_QUESTIONS.find((q) => q.id === 'jobLinkedBursary')!,
  },
  {
    id: 'careerPriority',
    kind: 'choice',
    question: QUESTIONNAIRE_QUESTIONS.find((q) => q.id === 'careerPriority')!,
  },
]
