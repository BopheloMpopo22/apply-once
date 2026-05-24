import { Link } from 'react-router-dom'
import type { HubMeta } from '../../types/hubs'
import { COMING_SOON_SECTIONS } from '../../data/hubs/hubRegistry'
import type { HubSlug } from '../../types/hubs'
import { HubShell } from './HubShell'

export function HubComingSoon(props: { hub: HubMeta }) {
  const sections = COMING_SOON_SECTIONS[props.hub.slug as Exclude<HubSlug, 'universities'>]

  return (
    <HubShell hub={props.hub}>
      <section className="hubSection">
        <div className="hubComingSoonBanner">
          <h2 className="hubSectionTitle">Coming soon</h2>
          <p className="hubSectionLead">
            We are building this hub into a full directory with dates, links, and clear guides — the
            same one-stop approach as university admissions.
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.heading} className="hubComingSoonBlock">
            <h3 className="hubComingSoonHeading">{section.heading}</h3>
            <ul className="hubComingSoonList">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="hubComingSoonActions">
          <Link className="btn btnBrand" to="/hubs/universities">
            Explore university admissions
          </Link>
          <Link className="btn btnOutline" to="/#features">
            Back to all hubs
          </Link>
        </div>
      </section>
    </HubShell>
  )
}
