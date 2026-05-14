/**
 * Catalogue year shown on the public varsity calculator (no student-facing control).
 * Set `VITE_VARSITY_CATALOGUE_YEAR` in Vite / Vercel (e.g. 2026 or 2027) and redeploy the frontend.
 */
export function getStudentCatalogueYear(): number {
  const raw = import.meta.env.VITE_VARSITY_CATALOGUE_YEAR
  const y = typeof raw === 'string' ? Number(raw.trim()) : typeof raw === 'number' ? raw : NaN
  if (!Number.isFinite(y) || y < 2000 || y > 2100) return 2026
  return Math.floor(y)
}
