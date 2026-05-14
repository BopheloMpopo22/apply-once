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
