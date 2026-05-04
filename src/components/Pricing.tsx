type Plan = {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlight?: boolean
}

export function Pricing(props: { id: string; plans: Plan[] }) {
  return (
    <section className="section" id={props.id}>
      <div className="container">
        <div className="sectionHeader animateIn">
          <div className="eyebrow">Pricing</div>
          <h2 className="sectionTitle">Plans that fit your journey</h2>
          <p className="sectionSubtitle">Start free, then upgrade when you’re ready to apply faster.</p>
        </div>

        <div className="pricingGrid">
          {props.plans.map((p) => (
            <div key={p.name} className={p.highlight ? 'pricingCard pricingCardHighlight animateIn' : 'pricingCard animateIn'}>
              {p.highlight ? <div className="pricingBadge">Most Popular</div> : null}
              <div className="pricingTop">
                <div className="pricingName">{p.name}</div>
                <div className="pricingPrice">{p.price}</div>
                <div className="pricingDesc">{p.description}</div>
              </div>
              <ul className="pricingList">
                {p.features.map((f) => (
                  <li key={f} className="pricingItem">
                    <span className="check" aria-hidden="true">
                      ✓
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a className={p.highlight ? 'btn btnPrimary' : 'btn btnSecondary'} href="#get-started">
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

