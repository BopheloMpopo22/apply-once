import { api } from '../api/client'
import type { CareerProfile } from '../types/careerHub'

export type WorkProgrammeProfileResponse = CareerProfile | null

export async function fetchWorkProgrammeProfile(): Promise<WorkProgrammeProfileResponse> {
  const data = await api<{ profile: WorkProgrammeProfileResponse }>('/api/work-programmes/profile')
  return data.profile
}

export async function saveWorkProgrammeProfile(profile: CareerProfile): Promise<CareerProfile> {
  const data = await api<{ profile: CareerProfile }>('/api/work-programmes/profile', {
    method: 'PUT',
    json: profile,
  })
  return data.profile
}

export async function deleteWorkProgrammeProfile(): Promise<void> {
  await api('/api/work-programmes/profile', { method: 'DELETE' })
}
