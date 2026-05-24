import type { BridgingEntry } from '../../types/hubs'
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

export function BridgingCard(props: { entry: BridgingEntry }) {
  const { entry } = props

  return (
    <article className="hubListingCard hubListingCardRich hubListingCard--wide hubBridgingCard">
      <div className="hubListingCardHead">
        <span className="hubListingLogoFallback hubListingLogoLg" aria-hidden>
          {initialsFor(entry.shortName)}
        </span>
        <div>
          <h2 className="hubListingTitle hubListingTitleLg">{entry.name}</h2>
          <p className="hubListingMeta hubListingMetaStrong">
            {entry.shortName} · {entry.location} · {entry.categoryLabel}
          </p>
        </div>
      </div>

      <p className="hubBodyText hubBridgingLead">{entry.summary}</p>

      <div className="hubBridgingOffers">
        <h3 className="hubBlockHeading hubBlockHeadingGreen">Where bridging / extended routes exist</h3>
        {entry.offersBridging.map((offer) => (
          <div key={offer.faculty} className="hubBridgingOfferBlock">
            <h4 className="hubBridgingFaculty">{offer.faculty}</h4>
            <p className="hubBridgingRouteType">{offer.routeType}</p>
            <ul className="hubBulletList hubBulletListDark">
              {offer.programmes.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="hubBridgingQualify">
              <strong>Who qualifies:</strong> {offer.whoQualifies}
            </p>
          </div>
        ))}
      </div>

      {entry.noBridgingFor.length > 0 ? (
        <div className="hubBridgingNotOffered">
          <h3 className="hubBlockHeading hubBlockHeadingWarn">Usually no extended route for</h3>
          <ul className="hubBulletList hubBulletListDark">
            {entry.noBridgingFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <dl className="hubFactGrid hubFactGridRich">
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
          <dt>Fees</dt>
          <dd>{entry.compensation}</dd>
        </div>
      </dl>

      <HubResourceLinks links={entry.links} title="Apply & official guides" />

      <p className="hubBodyText">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
