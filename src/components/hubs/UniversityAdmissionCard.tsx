import type { UniversityAdmissionEntry } from '../../types/hubs'
import { UNIVERSITY_PROGRAMME_HIGHLIGHTS } from '../../data/hubs/universityProgrammeHighlights'
import { UNIVERSITY_RESULT_TINT_HEX, universityResultCardTintStyle } from '../../utils/varsity/universityResultTints'
import type { UniversityId } from '../../utils/varsity/types'

const TYPE_LABELS: Record<UniversityAdmissionEntry['universityType'], string> = {
  traditional: 'Traditional university',
  'university-of-technology': 'University of technology',
  comprehensive: 'Comprehensive university',
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function UniversityAdmissionCard(props: { entry: UniversityAdmissionEntry }) {
  const { entry } = props
  const tint = UNIVERSITY_RESULT_TINT_HEX[entry.id as UniversityId]
  const highlights = UNIVERSITY_PROGRAMME_HIGHLIGHTS[entry.id] ?? []

  return (
    <article
      className={`hubListingCard hubListingCardRich hubUniCard${tint ? ' hubUniCardTint' : ''}`}
      style={tint ? universityResultCardTintStyle(tint) : undefined}
    >
      <div className="hubListingCardHead">
        {entry.logo ? (
          <img className="hubListingLogo hubListingLogoLg" src={entry.logo} alt="" width={56} height={56} />
        ) : (
          <span className="hubListingLogoFallback hubListingLogoLg" aria-hidden>
            {initialsFor(entry.shortName)}
          </span>
        )}
        <div>
          <h2 className="hubListingTitle hubListingTitleLg">{entry.name}</h2>
          <p className="hubListingMeta hubListingMetaStrong">
            {entry.shortName} · {entry.province} · {TYPE_LABELS[entry.universityType]}
          </p>
        </div>
      </div>

      {highlights.length > 0 ? (
        <div className="hubProgrammeHighlights">
          <h3 className="hubBlockHeading">What this university is known for</h3>
          <ul className="hubProgrammeHighlightList">
            {highlights.map((h) => (
              <li key={h.name} className="hubProgrammeHighlightItem">
                <strong className="hubProgrammeHighlightName">{h.name}</strong>
                <p className="hubProgrammeHighlightDesc">{h.description}</p>
              </li>
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
          <dt>Application fee</dt>
          <dd>{entry.applicationFee}</dd>
        </div>
        <div>
          <dt>Open days</dt>
          <dd>{entry.openDays}</dd>
        </div>
      </dl>

      {entry.programmeDeadlines ? (
        <p className="hubListingProgrammeDates hubListingProgrammeDatesStrong">
          <strong>Earlier deadlines:</strong> {entry.programmeDeadlines}
        </p>
      ) : null}

      <p className="hubListingNotes hubBodyText">{entry.notes}</p>

      <div className="hubListingLinks">
        <a className="btn btnBrand btnSmall" href={entry.website} target="_blank" rel="noreferrer">
          Official website
        </a>
      </div>
    </article>
  )
}
