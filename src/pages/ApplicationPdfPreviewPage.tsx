import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { downloadApplicationPdf, fetchApplicationSnapshot } from '../api/applicationPdf'
import {
  snapshotFilledSectionCount,
  snapshotToPreviewSections,
  type PreviewSection,
} from '../utils/applicationSnapshotView'

type Props = {
  mode: 'student' | 'admin'
}

export function ApplicationPdfPreviewPage(props: Props) {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [sections, setSections] = useState<PreviewSection[] | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [downloadBusy, setDownloadBusy] = useState(false)

  const backTo = props.mode === 'admin' ? '/admin' : '/profile'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBusy(true)
      setError(null)
      try {
        const id = props.mode === 'admin' ? studentId : undefined
        if (props.mode === 'admin' && !id) throw new Error('Missing student id')
        const snap = await fetchApplicationSnapshot(id)
        if (cancelled) return
        setEmail(snap.email)
        setSections(snapshotToPreviewSections(snap))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load preview')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [props.mode, studentId])

  async function onDownload() {
    setDownloadBusy(true)
    setError(null)
    try {
      const id = props.mode === 'admin' ? studentId : undefined
      const safeEmail = (email || 'student').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      await downloadApplicationPdf({
        studentId: id,
        filename: `apply-once-${safeEmail}.pdf`,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed')
    } finally {
      setDownloadBusy(false)
    }
  }

  const filledCount = sections ? snapshotFilledSectionCount(sections) : 0

  return (
    <div className="pdfPreviewShell">
      <Navbar logo={<ApplyOnceLogo />} links={[{ label: 'Back', to: backTo }]} />
      <main className="pdfPreviewMain">
        <div className="pdfPreviewCard">
          <p className="pdfPreviewEyebrow">Application PDF</p>
          <h1 className="pdfPreviewTitle">Preview before you download</h1>
          <p className="pdfPreviewLead">
            This is exactly what goes into your PDF — including sections you have not filled in yet (shown as
            &ldquo;—&rdquo;). You can download anytime, even with a partial application.
          </p>

          {busy ? <p className="muted">Loading your saved answers…</p> : null}
          {error ? <div className="formError">{error}</div> : null}

          {sections && !busy ? (
            <>
              <p className="pdfPreviewMeta">
                <strong>{email}</strong> · {filledCount} section{filledCount === 1 ? '' : 's'} with saved answers
              </p>
              <div className="pdfPreviewSections">
                {sections.map((sec) => (
                  <section
                    key={sec.id}
                    className={
                      sec.hasAnyData || sec.id === 'meta'
                        ? 'pdfPreviewSection'
                        : 'pdfPreviewSection pdfPreviewSectionEmpty'
                    }
                  >
                    <h2 className="pdfPreviewSectionTitle">
                      {sec.title}
                      {!sec.hasAnyData && sec.id !== 'meta' ? (
                        <span className="pdfPreviewBadge">Not filled yet</span>
                      ) : null}
                    </h2>
                    <dl className="pdfPreviewDl">
                      {sec.lines.map((ln) => (
                        <div key={`${sec.id}-${ln.label}`}>
                          <dt>{ln.label}</dt>
                          <dd className={ln.empty ? 'pdfPreviewEmpty' : undefined}>{ln.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </>
          ) : null}

          <div className="pdfPreviewActions">
            <button type="button" className="btn btnGhost" onClick={() => navigate(backTo)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn btnBrand"
              disabled={busy || downloadBusy || !sections}
              onClick={() => void onDownload()}
            >
              {downloadBusy ? 'Preparing PDF…' : 'Download PDF'}
            </button>
          </div>

          {props.mode === 'student' ? (
            <p className="pdfPreviewFoot muted">
              Need to add more? <Link to="/application">Continue your application</Link>
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}
