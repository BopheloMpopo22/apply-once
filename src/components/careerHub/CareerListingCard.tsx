import type { CareerListing } from '../../types/careerHub'
import { listingStatusLabel } from '../../utils/careerHub/listingStatus'

type CareerListingCardProps = {
  listing: CareerListing
}

export function CareerListingCard(props: CareerListingCardProps) {
  const { listing } = props
  const statusClass =
    listing.status === 'open'
      ? 'careerListingStatusOpen'
      : listing.status === 'rolling'
        ? 'careerListingStatusRolling'
        : 'careerListingStatusExpired'

  return (
    <article className="careerListingCard">
      <div className="careerListingCardHead">
        <div>
          <h3 className="careerListingTitle">{listing.name}</h3>
          <p className="careerListingOrg muted">{listing.organisation}</p>
        </div>
        <span className={`careerListingStatus ${statusClass}`}>{listingStatusLabel(listing.status)}</span>
      </div>
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
          Opens: {listing.applicationOpens} · Closes: {listing.applicationCloses}
        </p>
      ) : null}
    </article>
  )
}
