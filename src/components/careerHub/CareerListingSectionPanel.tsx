import { useEffect, useState } from 'react'
import type { CareerListing, CareerListingType, CareerProfile } from '../../types/careerHub'
import { CAREER_LISTING_TYPE_LABELS } from '../../data/careerHub'
import { isListingEligibleForStage } from '../../utils/careerHub/listingEligibility'
import { CareerListingCard } from './CareerListingCard'

const SECTION_PAGE_SIZE = 5

type CareerListingSectionPanelProps = {
  type: CareerListingType
  listings: CareerListing[]
  profile: CareerProfile
  eligibleCount: number
  totalCount: number
  searchActive: boolean
  showAll: boolean
}

export function CareerListingSectionPanel(props: CareerListingSectionPanelProps) {
  const { type, listings, profile, eligibleCount, totalCount, searchActive, showAll } = props
  const [visibleCount, setVisibleCount] = useState(SECTION_PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(SECTION_PAGE_SIZE)
  }, [listings, searchActive, showAll])

  const visible = listings.slice(0, visibleCount)
  const remaining = Math.max(0, listings.length - visibleCount)
  const sectionId = `career-section-${type}`

  return (
    <section className="careerListingSection" id={sectionId} aria-labelledby={`${sectionId}-title`}>
      <div className="careerListingSectionHead">
        <div>
          <h2 className="careerListingSectionTitle" id={`${sectionId}-title`}>
            {CAREER_LISTING_TYPE_LABELS[type]}
          </h2>
          <p className="careerListingSectionMeta muted">
            {searchActive || showAll
              ? `${totalCount} listed`
              : `${eligibleCount} matched to you${totalCount > eligibleCount ? ` · ${totalCount} total` : ''}`}
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="careerListingSectionEmpty muted">
          {searchActive
            ? 'No matches in this section — try another search or section.'
            : 'Nothing matched your stage here yet. Use search or “Browse all” to explore every option.'}
        </p>
      ) : (
        <>
          <div className="careerListingGrid careerListingGridSection">
            {visible.map((listing) => (
              <CareerListingCard
                key={listing.id}
                listing={listing}
                showEligibilityHint={!isListingEligibleForStage(listing, profile.stage)}
              />
            ))}
          </div>
          {remaining > 0 ? (
            <div className="careerListingMoreWrap careerListingMoreWrapSection">
              <button
                type="button"
                className="btn btnOutline btnSmall careerListingMoreBtn"
                onClick={() => setVisibleCount((count) => count + SECTION_PAGE_SIZE)}
              >
                Show more {CAREER_LISTING_TYPE_LABELS[type].toLowerCase()} ({remaining} remaining)
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
