import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export type PdfTextBlock = {
  title?: string
  text: string
}

function wrapLines(text: string, maxChars = 92): string[] {
  const out: string[] = []
  for (const rawLine of text.split('\n')) {
    const words = rawLine.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      out.push('')
      continue
    }
    let cur = ''
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w
      if (next.length > maxChars && cur) {
        out.push(cur)
        cur = w
      } else {
        cur = next
      }
    }
    if (cur) out.push(cur)
  }
  return out
}

export async function makeSimpleTextPdf(opts: {
  title: string
  subtitle?: string
  blocks: PdfTextBlock[]
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const page = pdf.addPage([595.28, 841.89]) // A4 points
  const { height } = page.getSize()

  const margin = 48
  let y = height - margin

  page.drawText(opts.title, {
    x: margin,
    y: y - 18,
    size: 18,
    font: fontBold,
    color: rgb(0.06, 0.09, 0.16),
  })
  y -= 34

  if (opts.subtitle) {
    for (const ln of wrapLines(opts.subtitle, 95)) {
      page.drawText(ln, {
        x: margin,
        y: y - 12,
        size: 11,
        font,
        color: rgb(0.2, 0.25, 0.33),
      })
      y -= 14
    }
    y -= 8
  }

  for (const b of opts.blocks) {
    if (b.title) {
      page.drawText(b.title, {
        x: margin,
        y: y - 12,
        size: 12,
        font: fontBold,
        color: rgb(0.06, 0.09, 0.16),
      })
      y -= 18
    }
    for (const ln of wrapLines(b.text, 100)) {
      page.drawText(ln, {
        x: margin,
        y: y - 11,
        size: 11,
        font,
        color: rgb(0.06, 0.09, 0.16),
      })
      y -= 14
      if (y < margin + 40) break
    }
    y -= 10
    if (y < margin + 40) break
  }

  return pdf.save()
}

export function downloadBlob(bytes: Uint8Array, filename: string, mime = 'application/pdf') {
  const blob = new Blob([bytes], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

