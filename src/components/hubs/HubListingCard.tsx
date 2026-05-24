import type { HubListingEntry } from '../../types/hubs'
import { HubResourceLinks } from './HubResourceLinks'

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function HubListingCard(props: { entry: HubListingEntry; wide?: boolean }) {
  const { entry, wide } = props
  const cardClass = wide ? 'hubListingCard hubListingCard--wide' : 'hubListingCard'

  return (
    <article className={cardClass}>
      <div className="hubListingCardHead">
        <span className="hubListingLogoFallback" aria-hidden>
          {initialsFor(entry.shortName)}
        </span>
        <div>
          <h2 className="hubListingTitle">{entry.name}</h2>
          <p className="hubListingMeta">
            {entry.shortName} · {entry.location}
          </p>
        </div>
      </div>

      <span className="hubCategoryBadge">{entry.categoryLabel}</span>

      <div className="hubTagRow">
        {entry.knownFor.map((tag) => (
          <span key={tag} className="hubTag">
            {tag}
          </span>
        ))}
      </div>

      <p className="hubListingNotes">{entry.summary}</p>

      <div className="hubNeededForBlock">
        <h3 className="hubSubheading">Who can apply</h3>
        <ul className="hubBulletList">
          {entry.whoCanApply.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <dl className="hubFactGrid">
        <div>
          <dt>Applications open</dt>
          <dd>{entry.applicationOpens}</dd>
        </div>
        <div>
          <dt>Applications close</dt>
          <dd>{entry.applicationCloses}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{entry.duration}</dd>
        </div>
        <div>
          <dt>Compensation</dt>
          <dd>{entry.compensation}</dd>
        </div>
      </dl>

      {entry.links.length > 0 ? (
        <HubResourceLinks links={entry.links} title="Official links" />
      ) : null}

      <p className="hubListingNotes">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
