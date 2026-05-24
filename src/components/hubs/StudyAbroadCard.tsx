import type { StudyAbroadEntry } from '../../types/hubs'
import { STUDY_ABROAD_CATEGORY_LABELS } from '../../types/hubs'
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

  return (
    <article className="hubListingCard hubListingCard--wide">
      <div className="hubListingCardHead">
        <span className="hubListingLogoFallback" aria-hidden>
          {initialsFor(entry.shortName)}
        </span>
        <div>
          <h2 className="hubListingTitle">{entry.name}</h2>
          <p className="hubListingMeta">
            {entry.shortName} · {entry.destination}
          </p>
        </div>
      </div>

      <span className="hubCategoryBadge">{STUDY_ABROAD_CATEGORY_LABELS[entry.category]}</span>

      <p className="hubListingNotes">{entry.whatItOffers}</p>

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
          <dt>Funding</dt>
          <dd>{entry.fundingLevel}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>{entry.destination}</dd>
        </div>
      </dl>

      <HubResourceLinks links={entry.links} title="Official links & guides" />

      <p className="hubListingNotes">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
