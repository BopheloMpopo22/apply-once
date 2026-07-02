import type { CareerProfile } from '../../types/careerHub'
import type { CareerListingSection } from '../../utils/careerHub/listingQuery'
import { CareerListingSectionPanel } from './CareerListingSectionPanel'

type CareerListingsBoardProps = {
  sections: CareerListingSection[]
  profile: CareerProfile
  search: string
  showAll: boolean
}

export function CareerListingsBoard(props: CareerListingsBoardProps) {
  const { sections, profile, search, showAll } = props
  const searchActive = search.trim().length > 0
  const totalVisible = sections.reduce((sum, section) => sum + section.listings.length, 0)

  return (
    <div className="careerListingsBoard">
      <nav className="careerSectionJump" aria-label="Jump to programme type">
        {sections.map((section) => (
          <a key={section.type} className="careerSectionJumpLink" href={`#career-section-${section.type}`}>
            {section.type === 'graduate'
              ? 'Graduate'
              : section.type === 'internship'
                ? 'Internships'
                : section.type === 'vacation'
                  ? 'Vacation'
                  : 'Learnerships'}
            <span className="muted"> ({section.listings.length})</span>
          </a>
        ))}
      </nav>

      {totalVisible === 0 ? (
        <p className="formLead">No programmes match — try another search term or browse all.</p>
      ) : (
        sections.map((section) => (
          <CareerListingSectionPanel
            key={section.type}
            type={section.type}
            listings={section.listings}
            profile={profile}
            eligibleCount={section.eligibleCount}
            totalCount={section.totalCount}
            searchActive={searchActive}
            showAll={showAll}
          />
        ))
      )}
    </div>
  )
}
