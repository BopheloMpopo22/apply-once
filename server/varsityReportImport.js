import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

const PDF_MIME = 'application/pdf'
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const HEADER_OR_NOISE = new RegExp(
  '^(subject|subj|learning area|learning programme|mark|percentage|%|level|result|symbol|code|name|term|grade|average|total|aps|aggregate|promotion|conduct|attendance|days absent|signature|date|school|principal|teacher|learner|student|class|promoted|absent|remarks)\\b',
  'i',
)

function extFromName(name) {
  const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

export function varsityReportMimeFromFile(file) {
  const mt = String(file.mimetype || '').toLowerCase()
  if (mt === PDF_MIME || mt === DOCX_MIME) return mt
  const ext = extFromName(file.originalname)
  if (ext === 'pdf') return PDF_MIME
  if (ext === 'docx') return DOCX_MIME
  return null
}

async function textFromPdf(buffer) {
  const parser = new PDFParse({ data: buffer })
  try {
    const tr = await parser.getText({ lineEnforce: true })
    return String(tr?.text || '').trim()
  } finally {
    await parser.destroy()
  }
}

async function textFromDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer })
  return String(value || '').trim()
}

function cleanSubjectFragment(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .replace(/^[.\-\d\s]+/, '')
    .replace(/[.\-\s]+$/, '')
    .trim()
}

function looksLikeHeaderName(name) {
  const n = cleanSubjectFragment(name)
  if (n.length < 3) return true
  if (HEADER_OR_NOISE.test(n)) return true
  if (/^page\s+\d+/i.test(n)) return true
  return false
}

/**
 * Heuristic extraction of subject + percent (+ optional NSC level) from pasted report text.
 * Works best on text-based PDFs and Word exports; scanned PDFs usually yield nothing useful.
 */
export function parseSubjectMarksFromReportText(raw) {
  const warnings = []
  const text = String(raw || '').replace(/\u00a0/g, ' ')
  if (!text.trim()) {
    warnings.push('No readable text was found in the file.')
    return { rows: [], warnings }
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const candidates = []

  for (const line of lines) {
    const parts = line.split(/\t/).map((p) => p.trim())
    if (parts.length >= 2) {
      const name = cleanSubjectFragment(parts[0])
      const rest = parts.slice(1).join(' ')
      const mPct = rest.match(/(\d{1,3})/)
      const mLvl = rest.match(/\b([1-7])\b/)
      if (!looksLikeHeaderName(name) && mPct) {
        const pct = Number(mPct[1])
        if (pct >= 20 && pct <= 100) {
          candidates.push({
            subject: name,
            percent: pct,
            level: mLvl && Number(mLvl[1]) >= 1 && Number(mLvl[1]) <= 7 ? Number(mLvl[1]) : null,
          })
        }
      }
      continue
    }

    const m2 = line.match(/^(.+?)\s+(\d{1,3})\s+([1-7])\s*$/)
    if (m2) {
      const name = cleanSubjectFragment(m2[1])
      const pct = Number(m2[2])
      const lvl = Number(m2[3])
      if (!looksLikeHeaderName(name) && pct >= 20 && pct <= 100) {
        candidates.push({ subject: name, percent: pct, level: lvl })
      }
      continue
    }

    const m1 = line.match(/^(.+?)\s+(\d{1,3})\s*%?\s*$/)
    if (m1) {
      const name = cleanSubjectFragment(m1[1])
      const pct = Number(m1[2])
      if (!looksLikeHeaderName(name) && pct >= 20 && pct <= 100) {
        candidates.push({ subject: name, percent: pct, level: null })
      }
    }
  }

  const seen = new Set()
  const rows = []
  for (const c of candidates) {
    const key = `${c.subject.toLowerCase()}|${c.percent}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ subject: c.subject, percent: c.percent, level: c.level })
    if (rows.length >= 24) break
  }

  if (!rows.length) {
    warnings.push(
      'Could not confidently find subject rows with percentages. If this is a scanned PDF, try exporting a text PDF from your school system or paste marks manually.',
    )
  } else if (rows.length < 4) {
    warnings.push('Only a few subjects were detected—please check names and percentages before using results.')
  }

  const sample = text.length > 1200 ? `${text.slice(0, 1200)}…` : text
  let confidence = 'low'
  if (rows.length >= 6) confidence = 'high'
  else if (rows.length >= 4) confidence = 'medium'

  return { rows, warnings, textSample: sample, confidence }
}

export async function importVarsityReportMarksFromBuffer({ buffer, mimetype }) {
  const warnings = []
  let plain = ''

  if (mimetype === PDF_MIME) {
    let pdfReadOk = false
    try {
      plain = await textFromPdf(buffer)
      pdfReadOk = true
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      warnings.push(`Could not read PDF: ${msg}`)
    }
    if (pdfReadOk && plain.replace(/\s+/g, '').length < 40) {
      warnings.push(
        'This report looks like a scanned image or photo PDF—we could not read subject names or marks from it. Ask your school for a digital (text) PDF or Word export, or type your marks in manually. Photo/scanned import needs OCR, which we have not added yet.',
      )
    }
  } else if (mimetype === DOCX_MIME) {
    try {
      plain = await textFromDocx(buffer)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      warnings.push(`Could not read Word document: ${msg}`)
    }
  } else {
    warnings.push('Unsupported file type.')
    return { rows: [], warnings, textSample: '', confidence: 'low' }
  }

  const parsed = parseSubjectMarksFromReportText(plain)
  const mergedWarnings = [...warnings, ...parsed.warnings]
  return {
    rows: parsed.rows,
    warnings: mergedWarnings,
    textSample: parsed.textSample,
    confidence: parsed.confidence,
  }
}
