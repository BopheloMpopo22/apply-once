import type { AdmissionsTestEntry } from '../../types/hubs'
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

export function AdmissionsTestCard(props: { entry: AdmissionsTestEntry }) {
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
            {entry.shortName} · {entry.region === 'south-africa' ? 'South Africa' : 'International'}
          </p>
        </div>
      </div>

      <p className="hubListingNotes">{entry.whatItIs}</p>

      <div className="hubNeededForBlock">
        <h3 className="hubSubheading">Needed for</h3>
        <ul className="hubBulletList">
          {entry.neededFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <dl className="hubFactGrid">
        <div>
          <dt>Registration opens</dt>
          <dd>{entry.registrationOpens}</dd>
        </div>
        <div>
          <dt>Key deadlines</dt>
          <dd>{entry.keyDeadlines}</dd>
        </div>
        <div>
          <dt>Fee</dt>
          <dd>{entry.fee}</dd>
        </div>
        <div>
          <dt>Test schedule</dt>
          <dd>{entry.testSchedule}</dd>
        </div>
      </dl>

      <div className="hubCentresBlock">
        <h3 className="hubSubheading">Test centres by province</h3>
        <dl className="hubCentresGrid">
          {entry.testCentres.map((row) => (
            <div key={row.province}>
              <dt>{row.province}</dt>
              <dd>{row.centres}</dd>
            </div>
          ))}
        </dl>
        {entry.centresLink ? (
          <a
            className="hubCentresOfficialLink"
            href={entry.centresLink.url}
            target="_blank"
            rel="noreferrer"
          >
            {entry.centresLink.label} →
          </a>
        ) : null}
      </div>

      <HubResourceLinks links={entry.prepResources} title="Prep, past papers & official links" />

      <p className="hubListingNotes">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
