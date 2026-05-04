type FooterColumn = { title: string; links: string[] }

export function SiteFooter(props: { brand: { name: string; description: string }; columns: FooterColumn[] }) {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <div className="footerBrandBlock">
          <div className="footerBrand">{props.brand.name}</div>
          <div className="footerDesc">{props.brand.description}</div>
        </div>

        <div className="footerCols" aria-label="Footer links">
          {props.columns.map((c) => (
            <div key={c.title} className="footerCol">
              <div className="footerColTitle">{c.title}</div>
              <div className="footerColLinks">
                {c.links.map((l) => (
                  <a key={l} className="footerLink" href="#top">
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footerBottom">
        <div className="container footerBottomInner">
          <span>© {new Date().getFullYear()} Apply Once</span>
          <span className="footerDot">•</span>
          <span>Built for learners in South Africa</span>
        </div>
      </div>
    </footer>
  )
}

