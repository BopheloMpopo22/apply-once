export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

// NSC levels (common):
// 7: 80–100, 6: 70–79, 5: 60–69, 4: 50–59, 3: 40–49, 2: 30–39, 1: 0–29
export function percentToNscLevel(percent: number): number {
  const p = clamp(Math.round(percent), 0, 100)
  if (p >= 80) return 7
  if (p >= 70) return 6
  if (p >= 60) return 5
  if (p >= 50) return 4
  if (p >= 40) return 3
  if (p >= 30) return 2
  return 1
}

export function coerceLevel(level: number | null | undefined): number | null {
  if (level === null || level === undefined) return null
  if (!Number.isFinite(level)) return null
  return clamp(Math.round(level), 1, 7)
}

export function coercePercent(percent: number | null | undefined): number | null {
  if (percent === null || percent === undefined) return null
  if (!Number.isFinite(percent)) return null
  return clamp(Math.round(percent), 0, 100)
}

