import { Link, useParams } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { getFacultyGuideById, facultyGuideIframeSrc, facultyGuidePdfTabUrl } from '../utils/varsity/facultyGuides'

export function VarsityGuidePage() {
  const { guideId } = useParams<{ guideId: string }>()
  const guide = guideId ? getFacultyGuideById(guideId) : null

  const iframeSrc = guide ? facultyGuideIframeSrc(guide) : null
  const tabUrl = guide ? facultyGuidePdfTabUrl(guide) : '/'

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
          {!guide ? (
            <section className="card vcCard">
              <h1 className="pageTitle">Guide not found</h1>
              <p className="muted">There is no prospectus guide for “{guideId}”. Return to the calculator and pick a link from a university card.</p>
              <Link className="btn" to="/varsity-calculator">
                Back to calculator
              </Link>
            </section>
          ) : (
            <>
              <section className="vcGuideHeader card vcCard">
                <div className="vcGuideHeaderRow">
                  <div>
                    <h1 className="pageTitle">{guide.title}</h1>
                    <p className="vcGuideDescription">{guide.description}</p>
                    <div className="vcGuideActions">
                      <Link className="btn btnGhost btnSmall" to="/varsity-calculator">
                        ← Back to calculator
                      </Link>
                      {guide.officialUrl ? (
                        <a className="btn btnSmall btnGhost" href={guide.officialUrl} target="_blank" rel="noreferrer">
                          Official university site
                        </a>
                      ) : null}
                      {iframeSrc || guide.embedMode === 'external' ? (
                        <a className="btn btnSmall" href={tabUrl} target="_blank" rel="noreferrer">
                          Open PDF in new tab
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
                <p className="vcGuideFinePrint">
                  PDF deep links use the common <code>#page=N</code> convention (supported by most in-browser viewers). If a university reprints the PDF,
                  page numbers can shift—use the PDF’s thumbnail sidebar or search, or open the official PDF from their website.
                </p>
              </section>

              {iframeSrc ? (
                <section className="vcGuideFrameWrap card vcCard">
                  <iframe
                    title={guide.title}
                    className="vcGuideFrame"
                    src={iframeSrc}
                    loading="lazy"
                  />
                </section>
              ) : (
                <section className="card vcCard">
                  <p className="muted">
                    This guide points to a PDF on another website, which often cannot be embedded here. Use “Open PDF in new tab” above, then use{' '}
                    <strong>Ctrl+F</strong> or the viewer’s page tools to find your faculty.
                  </p>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
