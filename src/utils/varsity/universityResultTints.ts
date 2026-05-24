import type { CSSProperties } from 'react'

/**
 * Approximate brand colours for varsity result cards (subtle tint only — not official trademark assets).
 * Keys omitted fall back to default card styling.
 */
export const UNIVERSITY_RESULT_TINT_HEX: Record<string, string> = {
  uct: '#003d7a',
  wits: '#003b6f',
  up: '#006d5b',
  uj: '#f47920',
  nwu: '#6b2d90',
  sun: '#8c2434',
  ufs: '#e87722',
  nmu: '#007749',
  tut: '#c8102e',
  ru: '#6cace4',
  uwc: '#7b1fa2',
  ukzn: '#c8102e',
  ul: '#4a7c23',
  cput: '#005f9e',
  vut: '#00843d',
  unisa: '#003b7a',
  ufh: '#1e4d8c',
  wsu: '#006633',
  univen: '#2e7d32',
  unizulu: '#1565c0',
  smu: '#00838f',
  ump: '#558b2f',
  spu: '#4527a0',
  dut: '#0277bd',
  cut: '#ef6c00',
  mut: '#00695c',
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, '')
  if (h.length !== 6) return null
  const n = Number.parseInt(h, 16)
  if (!Number.isFinite(n)) return null
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Inline styles for a softly tinted result card (works without `color-mix`). */
export function universityResultCardTintStyle(hex: string): CSSProperties {
  const rgb = hexToRgb(hex)
  if (!rgb) return { borderLeft: `5px solid ${hex}` }
  const { r, g, b } = rgb
  return {
    borderLeft: `5px solid ${hex}`,
    background: `linear-gradient(100deg, rgba(${r},${g},${b},0.16) 0%, rgba(255,255,255,0.97) 38%, rgba(255,255,255,0.95) 100%)`,
  }
}
