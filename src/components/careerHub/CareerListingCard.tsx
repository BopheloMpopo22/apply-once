import type { CareerListing } from '../../types/careerHub'
import { listingStatusLabel } from '../../utils/careerHub/listingStatus'
import { formatListingDate } from '../../utils/careerHub/parseListingDates'

type CareerListingCardProps = {
  listing: CareerListing
  showEligibilityHint?: boolean
}

export function CareerListingCard(props: CareerListingCardProps) {
  const { listing, showEligibilityHint = false } = props
  const statusClass =
    listing.status === 'open'
      ? 'careerListingStatusOpen'
      : listing.status === 'rolling'
        ? 'careerListingStatusRolling'
        : 'careerListingStatusExpired'

  const opensLabel = formatListingDate(listing.opensOn)
  const closesLabel = formatListingDate(listing.closesOn)

  return (
    <article className="careerListingCard">
      <div className="careerListingCardHead">
        <div>
          <h3 className="careerListingTitle">{listing.name}</h3>
          <p className="careerListingOrg muted">{listing.organisation}</p>
        </div>
        <span className={`careerListingStatus ${statusClass}`}>{listingStatusLabel(listing.status)}</span>
      </div>
      {showEligibilityHint ? (
        <p className="careerListingEligibility muted">Usually for a different study stage — confirm on the official site.</p>
      ) : null}
      <p className="careerListingSummary">{listing.summary}</p>
      <p className="careerListingMeta muted">
        📍 {listing.location} · ⏱ {listing.duration} · 💰 {listing.compensation}
      </p>
      <div className="careerListingTags">
        {listing.knownFor.slice(0, 4).map((tag) => (
          <span key={tag} className="careerListingTag">
            {tag}
          </span>
        ))}
      </div>
      <div className="careerListingActions">
        <a className="btn btnBrand btnSmall" href={listing.website} target="_blank" rel="noopener noreferrer">
          View & apply
        </a>
        {listing.links[0] && listing.links[0].url !== listing.website ? (
          <a
            className="btn btnOutline btnSmall"
            href={listing.links[0].url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {listing.links[0].label}
          </a>
        ) : null}
      </div>
      {listing.applicationCloses ? (
        <p className="careerListingDates muted">
          {opensLabel ? `Opens ${opensLabel}` : `Opens: ${listing.applicationOpens}`}
          {' · '}
          {closesLabel ? `Closes ${closesLabel}` : `Closes: ${listing.applicationCloses}`}
        </p>
      ) : null}
    </article>
  )
}
