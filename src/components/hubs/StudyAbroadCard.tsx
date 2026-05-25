import type { StudyAbroadEntry } from '../../types/hubs'
import { STUDY_ABROAD_CATEGORY_LABELS } from '../../types/hubs'
import { flagForDestination, STUDY_ABROAD_ENRICHMENT } from '../../data/hubs/studyAbroadEnrichment'
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

export function StudyAbroadCard(props: { entry: StudyAbroadEntry }) {
  const { entry } = props
  const enrich = STUDY_ABROAD_ENRICHMENT[entry.id]
  const flag = entry.destinationFlag ?? flagForDestination(entry.destination)

  return (
    <article className="hubListingCard hubListingCardRich hubListingCard--wide hubAbroadCard">
      <div className="hubListingCardHead">
        <span className="hubAbroadFlag" aria-hidden>
          {flag}
        </span>
        <span className="hubListingLogoFallback hubListingLogoLg" aria-hidden>
          {initialsFor(entry.shortName)}
        </span>
        <div>
          <h2 className="hubListingTitle hubListingTitleLg">{entry.name}</h2>
          <p className="hubListingMeta hubListingMetaStrong">
            {flag} {entry.destination} · {STUDY_ABROAD_CATEGORY_LABELS[entry.category]}
          </p>
        </div>
      </div>

      <p className="hubBodyText">{entry.whatItOffers}</p>

      {enrich ? (
        <div className="hubAbroadPurpose">
          <h3 className="hubBlockHeading">
            {entry.category === 'international-university'
              ? 'Why SA students consider this'
              : 'What this scholarship is for'}
          </h3>
          <p className="hubBodyText">{enrich.scholarshipPurpose}</p>
          {enrich.coversWhat.length > 0 ? (
            <div className="hubAbroadCovers">
              <span className="hubAbroadCoversLabel">
                {entry.category === 'international-university' ? 'Key points:' : 'Typically covers:'}
              </span>
              <div className="hubTagRow">
                {enrich.coversWhat.map((item) => (
                  <span key={item} className="hubTag hubTagAbroad">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="hubNeededForBlock">
        <h3 className="hubBlockHeading">Who can apply</h3>
        <ul className="hubBulletList hubBulletListDark">
          {entry.whoCanApply.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

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
          <dt>Funding</dt>
          <dd>{entry.fundingLevel}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>
            {flag} {entry.destination}
          </dd>
        </div>
      </dl>

      <HubResourceLinks links={entry.links} title="Official links & guides" />

      <p className="hubBodyText">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
