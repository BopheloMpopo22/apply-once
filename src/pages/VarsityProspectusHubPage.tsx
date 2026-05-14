import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import universities from '../data/varsity/universities.json'
import {
  defaultGuideForHub,
  facultyGuideIframeSrc,
  facultyGuidePdfTabUrl,
  prospectusGuidesForHub,
  type FacultyGuide,
} from '../utils/varsity/facultyGuides'
export function VarsityProspectusHubPage() {
  const { universityId } = useParams<{ universityId: string }>()
  const uniMeta = useMemo(
    () => universities.find((u) => u.id === universityId) as (typeof universities)[number] | undefined,
    [universityId],
  )

  const guides = useMemo(() => (universityId ? prospectusGuidesForHub(universityId) : []), [universityId])
  const [active, setActive] = useState<FacultyGuide | null>(null)

  useEffect(() => {
    if (!universityId) {
      setActive(null)
      return
    }
    setActive(defaultGuideForHub(universityId))
  }, [universityId])

  const iframeSrc = active ? facultyGuideIframeSrc(active) : null
  const tabUrl = active ? facultyGuidePdfTabUrl(active) : '/'

  const title = uniMeta ? `${uniMeta.shortName} prospectus` : 'Prospectus'

  return (
    <div className="appShell">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Varsity calculator', to: '/varsity-calculator' },
        ]}
      />

      <main className="main">
        <div className="container">
          {!universityId || !uniMeta || guides.length === 0 ? (
            <section className="card vcCard">
              <h1 className="pageTitle">Prospectus not available</h1>
              <p className="muted">
                We don’t have a bundled prospectus hub for this university yet. Return to the calculator and use the
                university website link instead.
              </p>
              <Link className="btn" to="/varsity-calculator">
                Back to calculator
              </Link>
            </section>
          ) : (
            <>
              <section className="card vcCard vcHubIntro">
                <div className="vcHubIntroRow">
                  <div>
                    <h1 className="pageTitle">{title}</h1>
                    <p className="vcGuideDescription">
                      Use the table of contents to jump within the PDF. Your calculator subjects and results stay saved in
                      this browser session—open the varsity calculator again from the header to continue where you left off.
                    </p>
                    <div className="vcGuideActions">
                      <Link className="btn" to="/varsity-calculator">
                        ← Back to varsity calculator
                      </Link>
                      {uniMeta.website ? (
                        <a className="btn btnGhost btnSmall" href={uniMeta.website} target="_blank" rel="noreferrer">
                          Official site
                        </a>
                      ) : null}
                      {iframeSrc || active?.embedMode === 'external' ? (
                        <a className="btn btnSmall btnGhost" href={tabUrl} target="_blank" rel="noreferrer">
                          Open PDF in new tab
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <img className="vcHubLogo" src={uniMeta.logo} alt="" />
                </div>
                <p className="vcGuideFinePrint">
                  PDF deep links use <code>#page=N</code> where the file supports it. If a section is slightly off, use the
                  PDF sidebar or search.
                </p>
              </section>

              <div className="vcHubLayout">
                <nav className="card vcCard vcHubToc" aria-label="Prospectus sections">
                  <div className="vcHubTocTitle">In this prospectus</div>
                  <ol className="vcHubTocList">
                    {guides.map((g) => {
                      const isActive = active?.id === g.id
                      const page = Math.max(1, Math.floor(Number(g.pdfPage) || 1))
                      return (
                        <li key={g.id}>
                          <button
                            type="button"
                            className={isActive ? 'vcHubTocBtn vcHubTocBtnActive' : 'vcHubTocBtn'}
                            onClick={() => setActive(g)}
                          >
                            <span className="vcHubTocLabel">{g.title}</span>
                            <span className="vcHubTocPage">p.{page}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                </nav>

                <div className="vcHubMain">
                  {active ? (
                    <section className="card vcCard vcHubViewerCard">
                      <h2 className="vcHubViewerTitle">{active.title}</h2>
                      <p className="vcHubViewerDesc muted">{active.description}</p>
                      {iframeSrc ? (
                        <div className="vcGuideFrameWrap vcHubFrameWrap">
                          <iframe title={active.title} className="vcGuideFrame" src={iframeSrc} key={iframeSrc} loading="lazy" />
                        </div>
                      ) : (
                        <p className="muted">
                          This section points to a PDF on another site, which cannot be embedded here. Use “Open PDF in new
                          tab”, then jump to page {Math.max(1, Math.floor(Number(active.pdfPage) || 1))} if needed.
                        </p>
                      )}
                    </section>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
