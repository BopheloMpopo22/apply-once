import { Link } from 'react-router-dom'

type FooterLegalLink =
  | { label: string; to: string; accent?: 'red' }
  | { label: string; href: string; external?: boolean; accent?: 'red' }

export function SiteFooter(props: {
  brand: { name: string; description: string }
  legalLinks?: FooterLegalLink[]
}) {
  const legalLinks = props.legalLinks ?? [
    { label: 'About', to: '/about' },
    { label: 'Newsletter', to: '/newsletter', accent: 'red' },
    { label: 'Terms & conditions', to: '/terms' },
    { label: 'Contact', to: '/contact' },
  ]

  function linkClass(accent?: 'red') {
    return accent === 'red' ? 'footerLink footerLinkRed' : 'footerLink'
  }

  return (
    <footer className="footer">
      <div className="container footerInner">
        <div className="footerBrandBlock">
          <div className="footerBrand">{props.brand.name}</div>
          <div className="footerDesc">{props.brand.description}</div>
        </div>
      </div>

      <div className="footerBottom">
        <div className="container footerBottomInner">
          <span>© {new Date().getFullYear()} Apply Once</span>
          <span className="footerDot">•</span>
          <span>Built for learners in South Africa</span>
          {legalLinks.length > 0 ? (
            <>
              <span className="footerDot">•</span>
              <nav className="footerLegalNav" aria-label="Legal and contact">
                {legalLinks.map((link, index) => (
                  <span key={'to' in link ? link.to : link.href} className="footerLegalItem">
                    {index > 0 ? <span className="footerDot footerDotInline">•</span> : null}
                    {'to' in link ? (
                      <Link className={linkClass(link.accent)} to={link.to}>
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        className={linkClass(link.accent)}
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {link.label}
                      </a>
                    )}
                  </span>
                ))}
              </nav>
            </>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
