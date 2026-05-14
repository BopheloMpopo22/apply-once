import raw from '../../data/varsity/varsityFacultyGuides.json'

export type FacultyGuideEmbedMode = 'local' | 'external'

export type FacultyGuide = {
  id: string
  universityId: string
  title: string
  description: string
  embedMode: FacultyGuideEmbedMode
  /** Site-root path, e.g. /varsity-prospectus/2027/file.pdf */
  pdfPath?: string
  /** 1-based page index for #page= fragment (Chrome / Edge / Firefox built-in PDF viewers). */
  pdfPage?: number
  /** Full URL to a PDF on another origin (opened in new tab when embedMode is external). */
  externalPdfUrl?: string
  officialUrl?: string
}

const guides = raw as FacultyGuide[]

export function getFacultyGuidesForUniversity(universityId: string): FacultyGuide[] {
  return guides.filter((g) => g.universityId === universityId)
}

export function getFacultyGuideById(id: string): FacultyGuide | null {
  return guides.find((g) => g.id === id) ?? null
}

/** Guides for a university, ordered for the in-app prospectus hub table of contents. */
export function prospectusGuidesForHub(universityId: string): FacultyGuide[] {
  const list = getFacultyGuidesForUniversity(universityId)
  return [...list].sort((a, b) => {
    const pa = Math.max(1, Math.floor(Number(a.pdfPage) || 1))
    const pb = Math.max(1, Math.floor(Number(b.pdfPage) || 1))
    if (pa !== pb) return pa - pb
    return a.title.localeCompare(b.title)
  })
}

/** Default PDF section when opening the hub (first local guide at earliest page). */
export function defaultGuideForHub(universityId: string): FacultyGuide | null {
  const ordered = prospectusGuidesForHub(universityId)
  const locals = ordered.filter((g) => g.embedMode === 'local' && g.pdfPath)
  if (locals.length === 0) return ordered[0] ?? null
  return locals.reduce((best, g) => {
    const pg = Math.max(1, Math.floor(Number(g.pdfPage) || 1))
    const bpg = Math.max(1, Math.floor(Number(best.pdfPage) || 1))
    return pg < bpg ? g : best
  })
}

/** URL to open the PDF in a new tab (relative path for local PDFs; includes #page=). */
export function facultyGuidePdfTabUrl(g: FacultyGuide): string {
  const page = Math.max(1, Math.floor(Number(g.pdfPage) || 1))
  if (g.embedMode === 'local' && g.pdfPath) {
    return `${g.pdfPath}#page=${page}`
  }
  if (g.embedMode === 'external' && g.externalPdfUrl) {
    const base = g.externalPdfUrl.split('#')[0]
    return `${base}#page=${page}`
  }
  return g.officialUrl || '/'
}

/** src for an iframe: same-origin PDF only. */
export function facultyGuideIframeSrc(g: FacultyGuide): string | null {
  if (g.embedMode !== 'local' || !g.pdfPath) return null
  const page = Math.max(1, Math.floor(Number(g.pdfPage) || 1))
  return `${g.pdfPath}#page=${page}`
}
