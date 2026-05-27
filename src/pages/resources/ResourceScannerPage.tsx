import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PDFDocument } from 'pdf-lib'
import { ApplyOnceLogo } from '../../components/ApplyOnceLogo'
import { Navbar } from '../../components/Navbar'

function downloadBlob(bytes: Uint8Array, filename: string, mime = 'application/pdf') {
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

type PickedFile = {
  id: string
  file: File
  kind: 'pdf' | 'image'
}

function classify(f: File): 'pdf' | 'image' | null {
  if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) return 'pdf'
  if (f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name)) return 'image'
  return null
}

export function ResourceScannerPage() {
  const [files, setFiles] = useState<PickedFile[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const counts = useMemo(() => {
    const pdfs = files.filter((f) => f.kind === 'pdf').length
    const imgs = files.filter((f) => f.kind === 'image').length
    return { pdfs, imgs, total: files.length }
  }, [files])

  async function onPick(list: FileList | null) {
    if (!list || list.length === 0) return
    setError(null)
    const next: PickedFile[] = []
    for (const f of Array.from(list)) {
      const kind = classify(f)
      if (!kind) continue
      next.push({ id: crypto.randomUUID(), file: f, kind })
    }
    if (next.length === 0) {
      setError('Please add PDFs or images (PNG/JPG/WEBP).')
      return
    }
    setFiles((prev) => [...prev, ...next])
  }

  function move(id: string, dir: -1 | 1) {
    setFiles((prev) => {
      const idx = prev.findIndex((x) => x.id === id)
      if (idx < 0) return prev
      const j = idx + dir
      if (j < 0 || j >= prev.length) return prev
      const copy = prev.slice()
      const tmp = copy[idx]
      copy[idx] = copy[j]
      copy[j] = tmp
      return copy
    })
  }

  async function onMerge() {
    setBusy(true)
    setError(null)
    try {
      if (files.length === 0) throw new Error('Add at least one file first.')
      const out = await PDFDocument.create()

      for (const item of files) {
        const buf = await item.file.arrayBuffer()
        if (item.kind === 'pdf') {
          const src = await PDFDocument.load(buf)
          const pages = await out.copyPages(src, src.getPageIndices())
          pages.forEach((p) => out.addPage(p))
        } else {
          const isPng = item.file.type.includes('png') || /\.png$/i.test(item.file.name)
          const img = isPng ? await out.embedPng(buf) : await out.embedJpg(buf)
          // A4 page, fit image within margins (basic "scanner" behaviour)
          const page = out.addPage([595.28, 841.89])
          const margin = 36
          const maxW = page.getWidth() - margin * 2
          const maxH = page.getHeight() - margin * 2
          const scale = Math.min(maxW / img.width, maxH / img.height)
          const w = img.width * scale
          const h = img.height * scale
          page.drawImage(img, {
            x: (page.getWidth() - w) / 2,
            y: (page.getHeight() - h) / 2,
            width: w,
            height: h,
          })
        }
      }

      const bytes = await out.save()
      downloadBlob(bytes, 'apply-once-scanned-documents.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create PDF')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="formShell resourcesShell" id="top">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />
      <main className="resourcesToolMain">
        <div className="container resourcesContainer">
          <nav className="resourcesCrumb">
            <Link to="/#resources">Resources</Link>
            <span aria-hidden>/</span>
            <span>Scanner & PDF tools</span>
          </nav>

          <header className="resourcesToolHero">
            <h1 className="resourcesToolTitle">Scanner & PDF tools</h1>
            <p className="resourcesToolLead">
              Add photos or PDFs, reorder them, then download a single merged PDF. Perfect for bursary uploads.
            </p>
          </header>

          <section className="resourcesToolCard">
            <div className="resourcesToolRow">
              <label className="field" style={{ flex: 1 }}>
                <span>Add files</span>
                <input
                  type="file"
                  multiple
                  accept="application/pdf,image/*"
                  onChange={(e) => void onPick(e.target.files)}
                />
              </label>
              <button
                type="button"
                className="btn btnBrand"
                disabled={busy || files.length === 0}
                onClick={() => void onMerge()}
              >
                {busy ? 'Creating PDF…' : 'Download merged PDF'}
              </button>
            </div>

            <p className="muted">
              {counts.total} file{counts.total === 1 ? '' : 's'} · {counts.imgs} image{counts.imgs === 1 ? '' : 's'} ·{' '}
              {counts.pdfs} PDF{counts.pdfs === 1 ? '' : 's'}
            </p>

            {error ? <div className="formError">{error}</div> : null}

            {files.length === 0 ? (
              <p className="muted">Tip: take photos of documents in good light, then add them here.</p>
            ) : (
              <ol className="resourcesFileList">
                {files.map((f, idx) => (
                  <li key={f.id} className="resourcesFileRow">
                    <div className="resourcesFileMeta">
                      <strong>
                        {idx + 1}. {f.file.name}
                      </strong>
                      <span className="muted">
                        {f.kind.toUpperCase()} · {Math.round(f.file.size / 1024)} KB
                      </span>
                    </div>
                    <div className="resourcesFileActions">
                      <button type="button" className="btn btnGhost btnSmall" onClick={() => move(f.id, -1)}>
                        ↑
                      </button>
                      <button type="button" className="btn btnGhost btnSmall" onClick={() => move(f.id, 1)}>
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn btnOutline btnSmall"
                        onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

