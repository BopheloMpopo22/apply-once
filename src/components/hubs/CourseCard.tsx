import type { CourseEntry } from '../../types/hubs'
import { COURSE_CATEGORY_LABELS } from '../../types/hubs'
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

const COST_LABELS: Record<CourseEntry['costType'], string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  funded: 'Funded programme',
}

export function CourseCard(props: { entry: CourseEntry }) {
  const { entry } = props

  return (
    <article className="hubListingCard">
      <div className="hubListingCardHead">
        <span className="hubListingLogoFallback" aria-hidden>
          {initialsFor(entry.shortName)}
        </span>
        <div>
          <h2 className="hubListingTitle">{entry.name}</h2>
          <p className="hubListingMeta">
            {entry.provider} · {COURSE_CATEGORY_LABELS[entry.category]}
          </p>
        </div>
      </div>

      <div className="hubTagRow">
        <span className={`hubCostBadge hubCostBadge--${entry.costType}`}>
          {COST_LABELS[entry.costType]}
        </span>
        {entry.knownFor.map((tag) => (
          <span key={tag} className="hubTag">
            {tag}
          </span>
        ))}
      </div>

      <p className="hubListingNotes">{entry.whatYouLearn}</p>

      <dl className="hubFactGrid">
        <div>
          <dt>Duration</dt>
          <dd>{entry.duration}</dd>
        </div>
        <div>
          <dt>Cost</dt>
          <dd>{entry.cost}</dd>
        </div>
        <div>
          <dt>Certificate</dt>
          <dd>{entry.certificate}</dd>
        </div>
        <div>
          <dt>Eligibility</dt>
          <dd>{entry.eligibility}</dd>
        </div>
      </dl>

      <HubResourceLinks links={entry.links} title="Course links" />

      <p className="hubListingNotes">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
