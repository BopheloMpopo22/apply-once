import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { CareerAgenciesPanel } from '../components/careerHub/CareerAgenciesPanel'
import { CareerCoursesPanel } from '../components/careerHub/CareerCoursesPanel'
import { CareerListingCard } from '../components/careerHub/CareerListingCard'
import { CareerProfileCard } from '../components/careerHub/CareerProfileCard'
import { CareerProfileWizard } from '../components/careerHub/CareerProfileWizard'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'
import {
  CAREER_LISTING_TYPE_LABELS,
  filterListings,
  getCareerHubData,
} from '../data/careerHub'
import type { CareerListingType, CareerProfile } from '../types/careerHub'
import { readCareerProfile } from '../utils/careerHub/profileStorage'

const LISTINGS_PAGE_SIZE = 5

export function CareerProgrammesPage() {
  const hubData = useMemo(() => getCareerHubData(), [])
  const [profile, setProfile] = useState<CareerProfile | null>(() => readCareerProfile())
  const [showWizard, setShowWizard] = useState(() => !readCareerProfile())
  const [listingType, setListingType] = useState<CareerListingType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(LISTINGS_PAGE_SIZE)

  const filtered = useMemo(
    () => filterListings(hubData.listings, listingType, search),
    [hubData.listings, listingType, search],
  )

  const visibleListings = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  )

  const remainingCount = Math.max(0, filtered.length - visibleCount)

  useEffect(() => {
    setVisibleCount(LISTINGS_PAGE_SIZE)
  }, [listingType, search])

  const counts = useMemo(() => {
    return {
      graduate: hubData.listings.filter((l) => l.type === 'graduate').length,
      internship: hubData.listings.filter((l) => l.type === 'internship').length,
      vacation: hubData.listings.filter((l) => l.type === 'vacation').length,
      learnership: hubData.listings.filter((l) => l.type === 'learnership').length,
      open: hubData.listings.filter((l) => l.status === 'open' || l.status === 'rolling').length,
    }
  }, [hubData.listings])

  if (showWizard || !profile) {
    return (
      <div className="appShell careerHubShell">
        <Navbar
          variant="light"
          logo={<ApplyOnceLogo />}
          links={[
            { label: 'Home', to: '/' },
            { label: 'Application', to: '/application' },
          ]}
        />
        <header className="careerHubHero">
          <div className="container careerHubHeroInner">
            <p className="careerHubKicker">Programmes for work 💼</p>
            <h1 className="careerHubTitle">Get experience. Get paid. Build your future.</h1>
            <p className="careerHubLead">
              A South African take on real opportunities — graduate programmes, internships, vacation work,
              skills courses, and agencies that help you find jobs here and abroad.
            </p>
          </div>
        </header>
        <CareerProfileWizard
          onComplete={(p) => {
            setProfile(p)
            setShowWizard(false)
          }}
        />
        <SiteFooter
          brand={{ name: 'Apply Once', description: 'Apply once, then match and apply smarter.' }}
        />
      </div>
    )
  }

  return (
    <div className="appShell careerHubShell">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Home', to: '/' },
          { label: 'Application', to: '/application' },
        ]}
      />

      <header className="careerHubHero careerHubHeroCompact">
        <div className="container careerHubHeroInner">
          <p className="careerHubKicker">Programmes for work 💼</p>
          <h1 className="careerHubTitle">Hey {profile.displayName} — your opportunities are ready</h1>
          <p className="careerHubLead">
            {counts.open}+ programmes to explore · {hubData.courses.length} skills courses ·{' '}
            {hubData.agencies.length} agencies
          </p>
        </div>
      </header>

      <main className="careerHubMain container">
        <div className="careerHubLayout">
          <div className="careerHubLeft">
            <CareerProfileCard
              profile={profile}
              onEdit={() => {
                setShowWizard(true)
              }}
            />
            <CareerCoursesPanel courses={hubData.courses} />
          </div>

          <div className="careerHubCenter">
            <div className="careerHubToolbar">
              <label className="careerHubFilter">
                <span className="muted">Show</span>
                <select
                  className="input"
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value as CareerListingType | 'all')}
                >
                  <option value="all">All programmes ({hubData.listings.length})</option>
                  <option value="graduate">
                    {CAREER_LISTING_TYPE_LABELS.graduate} ({counts.graduate})
                  </option>
                  <option value="internship">
                    {CAREER_LISTING_TYPE_LABELS.internship} ({counts.internship})
                  </option>
                  <option value="vacation">
                    {CAREER_LISTING_TYPE_LABELS.vacation} ({counts.vacation})
                  </option>
                  <option value="learnership">
                    {CAREER_LISTING_TYPE_LABELS.learnership} ({counts.learnership})
                  </option>
                </select>
              </label>
              <input
                className="input careerHubSearch"
                type="search"
                placeholder="Search company, city, industry…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <p className="careerHubDisclaimer muted">
              Dates change every year — always confirm on the official site before you apply. Expired listings
              stay visible so you know what to watch for next cycle.
            </p>

            <div className="careerListingGrid">
              {filtered.length === 0 ? (
                <p className="formLead">No matches — try another filter or search term.</p>
              ) : (
                visibleListings.map((listing) => <CareerListingCard key={listing.id} listing={listing} />)
              )}
            </div>

            {remainingCount > 0 ? (
              <div className="careerListingMoreWrap">
                <button
                  type="button"
                  className="btn btnOutline btnSmall careerListingMoreBtn"
                  onClick={() => setVisibleCount((count) => count + LISTINGS_PAGE_SIZE)}
                >
                  Show more ({remainingCount} remaining)
                </button>
              </div>
            ) : null}
          </div>

          <div className="careerHubRight">
            <CareerAgenciesPanel agencies={hubData.agencies} />
          </div>
        </div>

        <p className="careerHubFoot muted">
          Also explore{' '}
          <Link to="/hubs/learnerships">learnerships</Link>,{' '}
          <Link to="/hubs/courses">courses hub</Link>, and{' '}
          <Link to="/hubs/study-abroad">study abroad</Link>.
        </p>
      </main>

      <SiteFooter
        brand={{ name: 'Apply Once', description: 'Apply once, then match and apply smarter.' }}
      />
    </div>
  )
}
