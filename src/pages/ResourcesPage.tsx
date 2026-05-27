import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'

type ResourceCard = {
  title: string
  description: string
  to: string
  badge?: string
}

const RESOURCE_CARDS: ResourceCard[] = [
  {
    title: 'Scanner & PDF tools',
    description: 'Turn photos into a single PDF, merge PDFs, and prepare bursary-ready documents.',
    to: '/resources/scanner',
    badge: 'New',
  },
  {
    title: 'Motivation letter builder',
    description: 'Answer guided questions and generate a strong bursary motivation letter with a clean structure.',
    to: '/resources/motivation-letter',
    badge: 'New',
  },
  {
    title: 'CV builder (SA standards)',
    description: 'Choose the right CV type, fill in your details, and download a professional PDF.',
    to: '/resources/cv-builder',
    badge: 'New',
  },
]

export function ResourcesPage() {
  return (
    <div className="formShell resourcesShell" id="top">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/resources' },
        ]}
      />
      <main className="resourcesMain">
        <div className="container resourcesContainer">
          <header className="resourcesHero">
            <p className="resourcesEyebrow">Resources</p>
            <h1 className="resourcesTitle">Tools and guides that help you stand out</h1>
            <p className="resourcesLead">
              Practical tools learners use every week: scan documents, generate a motivation letter, and build a
              bursary-ready CV.
            </p>
          </header>

          <div className="resourcesGrid">
            {RESOURCE_CARDS.map((c) => (
              <Link key={c.to} to={c.to} className="resourcesCard">
                <div className="resourcesCardTop">
                  <h2 className="resourcesCardTitle">{c.title}</h2>
                  {c.badge ? <span className="resourcesBadge">{c.badge}</span> : null}
                </div>
                <p className="resourcesCardText">{c.description}</p>
                <span className="resourcesCardCta">Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter
        brand={{ name: 'Apply Once', description: 'Apply once, then match and apply smarter.' }}
        columns={[{ title: 'Product', links: ['Features', 'Resources'] }]}
      />
    </div>
  )
}

