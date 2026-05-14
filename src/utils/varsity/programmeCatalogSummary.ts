import type {
  Programme,
  ProgrammeAnyOfRequirement,
  ProgrammeRequirement,
  ProgrammeSubjectRequirement,
} from './types'

function isAnyOf(req: ProgrammeRequirement): req is ProgrammeAnyOfRequirement {
  return Boolean(req && typeof req === 'object' && Array.isArray((req as ProgrammeAnyOfRequirement).anyOf))
}

function formatSingle(req: ProgrammeSubjectRequirement): string {
  const bits: string[] = [req.subject]
  if (typeof req.minLevel === 'number') bits.push(`NSC level ${req.minLevel}+`)
  if (typeof req.minPercent === 'number') bits.push(`${req.minPercent}%+`)
  return bits.join(' · ')
}

function formatAnyOf(req: ProgrammeAnyOfRequirement): string {
  const opts = (req.anyOf ?? []).map(formatSingle).join(' OR ')
  return req.label?.trim() ? `${req.label.trim()}: (${opts})` : `One of: ${opts}`
}

/**
 * Plain-language summary from structured catalogue fields (matches eligibility checks).
 */
export function buildCatalogueRequirementSummary(p: Programme): string {
  const reqs = p.subjectRequirements ?? []
  const reqParts = reqs.map((r) => (isAnyOf(r) ? formatAnyOf(r) : formatSingle(r as ProgrammeSubjectRequirement)))

  const head = `Minimum APS ${p.minAps} in our data.`
  if (reqParts.length === 0) {
    return `${head} No per-subject rules stored yet—always confirm marks and subjects in the official prospectus.`
  }
  return `${head} Subject rules: ${reqParts.join('; ')}.`
}
