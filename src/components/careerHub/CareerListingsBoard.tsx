import { useEffect, useMemo, useRef, useState } from 'react'
import type { CareerListingType, CareerProfile } from '../../types/careerHub'
import { CAREER_LISTING_TYPE_LABELS } from '../../data/careerHub'
import type { CareerListingSection } from '../../utils/careerHub/listingQuery'
import { CareerListingSectionPanel } from './CareerListingSectionPanel'

type CareerListingsBoardProps = {
  sections: CareerListingSection[]
  profile: CareerProfile
  search: string
  showAll: boolean
}

type SectionTab = CareerListingType | 'all'

const TAB_LABELS: Record<SectionTab, string> = {
  all: 'All sections',
  graduate: 'Graduate',
  internship: 'Internships',
  vacation: 'Vacation',
  learnership: 'Learnerships',
}

export function CareerListingsBoard(props: CareerListingsBoardProps) {
  const { sections, profile, search, showAll } = props
  const searchActive = search.trim().length > 0
  const [activeTab, setActiveTab] = useState<SectionTab>('all')
  const boardRef = useRef<HTMLDivElement>(null)

  const visibleSections = useMemo(() => {
    if (activeTab === 'all') return sections
    const selected = sections.find((section) => section.type === activeTab)
    return selected ? [selected] : []
  }, [sections, activeTab])

  const totalVisible = visibleSections.reduce((sum, section) => sum + section.listings.length, 0)

  useEffect(() => {
    setActiveTab('all')
  }, [search, showAll])

  function selectTab(tab: SectionTab) {
    setActiveTab(tab)
    requestAnimationFrame(() => {
      boardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="careerListingsBoard" ref={boardRef}>
      <nav className="careerSectionJump" aria-label="Programme type">
        {(Object.keys(TAB_LABELS) as SectionTab[]).map((tab) => {
          const count =
            tab === 'all'
              ? sections.reduce((sum, section) => sum + section.listings.length, 0)
              : (sections.find((section) => section.type === tab)?.listings.length ?? 0)
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              className={isActive ? 'careerSectionJumpLink careerSectionJumpLinkActive' : 'careerSectionJumpLink'}
              aria-pressed={isActive}
              onClick={() => selectTab(tab)}
            >
              {TAB_LABELS[tab]}
              <span className="muted"> ({count})</span>
            </button>
          )
        })}
      </nav>

      {activeTab !== 'all' ? (
        <p className="careerSectionFocusLead">
          Showing <strong>{CAREER_LISTING_TYPE_LABELS[activeTab]}</strong> first — switch to{' '}
          <button type="button" className="careerInlineLink" onClick={() => selectTab('all')}>
            All sections
          </button>{' '}
          to browse everything together.
        </p>
      ) : null}

      {totalVisible === 0 ? (
        <p className="formLead">No programmes match — try another search term or browse all.</p>
      ) : (
        visibleSections.map((section) => (
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
