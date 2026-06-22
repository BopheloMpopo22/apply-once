import type { CareerProfile, CareerStage } from '../../types/careerHub'

const KEY = 'apply_once_career_profile_v1'

export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const

export const CAREER_STAGE_OPTIONS: { value: CareerStage; label: string; emoji: string }[] = [
  { value: 'in_matric', label: 'Still in matric / high school', emoji: '🎒' },
  { value: 'finished_matric', label: 'Finished matric', emoji: '📜' },
  { value: 'in_university', label: 'Busy at university / college', emoji: '🎓' },
  { value: 'finished_university', label: 'Finished university / college', emoji: '💼' },
]

export function readCareerProfile(): CareerProfile | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<CareerProfile>
    if (!p.stage || !p.completedAt) return null
    return p as CareerProfile
  } catch {
    return null
  }
}

export function writeCareerProfile(profile: CareerProfile) {
  localStorage.setItem(KEY, JSON.stringify(profile))
}

export function clearCareerProfile() {
  localStorage.removeItem(KEY)
}
