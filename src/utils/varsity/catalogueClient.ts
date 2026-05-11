import { api } from '../../api/client'
import type { Programme, ProgrammeRequirement, UniversityId } from './types'

export type VarsityCatalogueResponse = {
  year: number
  universities: Array<{
    id: UniversityId
    name: string
    shortName: string
    website: string
    logo: string
    calculator: string
  }>
  programmes: Array<
    Programme & {
      universityId: UniversityId
      programmeId: string
    }
  >
}

export async function fetchVarsityCatalogue(year: number): Promise<VarsityCatalogueResponse> {
  const y = Number(year)
  const url = `/api/varsity/catalogue?year=${encodeURIComponent(String(Number.isFinite(y) ? y : 2026))}`
  const res = await api<VarsityCatalogueResponse>(url)

  // Normalize requirement typing for TS friendliness
  for (const p of res.programmes) {
    const reqs = (p.subjectRequirements ?? []) as unknown as ProgrammeRequirement[]
    p.subjectRequirements = reqs
  }
  return res
}

