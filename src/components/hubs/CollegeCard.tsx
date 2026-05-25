import type { CollegeEntry } from '../../types/hubs'
import { COLLEGE_CATEGORY_LABELS } from '../../types/hubs'

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function CollegeCard(props: { entry: CollegeEntry }) {
  const { entry } = props

  return (
    <article className="hubListingCard hubListingCardRich">
      <div className="hubListingCardHead">
        <span className="hubListingLogoFallback" aria-hidden>
          {initialsFor(entry.shortName)}
        </span>
        <div>
          <h2 className="hubListingTitle">{entry.name}</h2>
          <p className="hubListingMeta">
            {entry.shortName} · {entry.province} · {entry.institutionType}
          </p>
        </div>
      </div>

      <span className="hubCategoryBadge">{COLLEGE_CATEGORY_LABELS[entry.category]}</span>

      <div className="hubTagRow">
        {entry.knownFor.map((tag) => (
          <span key={tag} className="hubTag">
            {tag}
          </span>
        ))}
      </div>

      {entry.campuses && entry.campuses.length > 0 ? (
        <div className="hubCampusesBlock">
          <h3 className="hubBlockHeading">Campuses & centres</h3>
          <div className="hubTagRow">
            {entry.campuses.map((campus) => (
              <span key={campus} className="hubTag">
                {campus}
              </span>
            ))}
          </div>
        </div>
      ) : null}

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
          <dt>Application fee</dt>
          <dd>{entry.applicationFee}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{COLLEGE_CATEGORY_LABELS[entry.category]}</dd>
        </div>
      </dl>

      <p className="hubListingNotes hubBodyText">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
