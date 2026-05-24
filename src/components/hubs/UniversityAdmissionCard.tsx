import type { UniversityAdmissionEntry } from '../../types/hubs'

export function UniversityAdmissionCard(props: { entry: UniversityAdmissionEntry }) {
  const { entry } = props
  return (
    <article className="hubListingCard">
      <div className="hubListingCardHead">
        <img className="hubListingLogo" src={entry.logo} alt="" width={48} height={48} />
        <div>
          <h2 className="hubListingTitle">{entry.name}</h2>
          <p className="hubListingMeta">
            {entry.shortName} · {entry.province}
          </p>
        </div>
      </div>

      <div className="hubTagRow">
        {entry.knownFor.map((tag) => (
          <span key={tag} className="hubTag">
            {tag}
          </span>
        ))}
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
          <dt>Application fee</dt>
          <dd>{entry.applicationFee}</dd>
        </div>
        <div>
          <dt>Open days</dt>
          <dd>{entry.openDays}</dd>
        </div>
      </dl>

      <p className="hubListingNotes">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.applyUrl} target="_blank" rel="noreferrer">
          Apply on official site
        </a>
        <a className="btn btnOutline btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          University website
        </a>
      </div>
    </article>
  )
}
