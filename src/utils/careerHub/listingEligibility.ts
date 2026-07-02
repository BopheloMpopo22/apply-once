import type { CareerListing, CareerListingType, CareerStage } from '../../types/careerHub'

export const DEFAULT_ELIGIBLE_STAGES: Record<CareerListingType, CareerStage[]> = {
  graduate: ['in_university', 'finished_university'],
  internship: ['finished_matric', 'in_university', 'finished_university'],
  vacation: ['in_university'],
  learnership: ['in_matric', 'finished_matric', 'in_university', 'finished_university'],
}

export const CAREER_LISTING_SECTION_ORDER: CareerListingType[] = [
  'graduate',
  'internship',
  'vacation',
  'learnership',
]

export function defaultEligibleStages(type: CareerListingType): CareerStage[] {
  return DEFAULT_ELIGIBLE_STAGES[type]
}

export function isListingEligibleForStage(listing: CareerListing, stage: CareerStage): boolean {
  return listing.eligibleStages.includes(stage)
}

export function eligibilityLabel(stage: CareerStage): string {
  if (stage === 'in_matric') return 'Still in matric'
  if (stage === 'finished_matric') return 'Finished matric'
  if (stage === 'in_university') return 'At university or college'
  return 'Finished university or college'
}
