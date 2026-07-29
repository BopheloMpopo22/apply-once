import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { CareerAgenciesPanel } from '../components/careerHub/CareerAgenciesPanel'
import { CareerCoursesPanel } from '../components/careerHub/CareerCoursesPanel'
import { CareerJobSearchLinksPanel } from '../components/careerHub/CareerJobSearchLinksPanel'
import { CareerListingsBoard } from '../components/careerHub/CareerListingsBoard'
import { CareerProfileCard } from '../components/careerHub/CareerProfileCard'
import { CareerProfileWizard } from '../components/careerHub/CareerProfileWizard'
import { Navbar } from '../components/Navbar'
import { SiteFooter } from '../components/SiteFooter'
import { getCareerHubData } from '../data/careerHub'
import { useWorkProgrammeProfile } from '../hooks/useWorkProgrammeProfile'
import { eligibilityLabel } from '../utils/careerHub/listingEligibility'
import { buildCareerListingSections } from '../utils/careerHub/listingQuery'

export function CareerProgrammesPage() {
  const hubData = useMemo(() => getCareerHubData(), [])
  const { profile, loading, saveProfile, clearProfile } = useWorkProgrammeProfile()
  const [showWizard, setShowWizard] = useState(false)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const sections = useMemo(() => {
    if (!profile) return []
    return buildCareerListingSections(hubData.listings, profile, { search, showAll })
  }, [hubData.listings, profile, search, showAll])

  const matchedOpenCount = useMemo(() => {
    if (!profile) return 0
    return hubData.listings.filter(
      (listing) =>
        listing.eligibleStages.includes(profile.stage) &&
        (listing.status === 'open' || listing.status === 'rolling'),
    ).length
  }, [hubData.listings, profile])

  if (loading && !profile) {
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
        <main className="container careerHubMain">
          <p className="formLead">Loading your work programmes profile…</p>
        </main>
      </div>
    )
  }

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
              learnerships, skills courses, and agencies that help you find jobs here and abroad.
            </p>
          </div>
        </header>
        <CareerProfileWizard
          onComplete={async (next) => {
            await saveProfile(next)
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
          { label: 'Profile', to: '/profile' },
        ]}
      />

      <header className="careerHubHero careerHubHeroCompact">
        <div className="container careerHubHeroInner">
          <p className="careerHubKicker">Programmes for work 💼</p>
          <h1 className="careerHubTitle">Hey {profile.displayName} — here’s what fits you first</h1>
          <p className="careerHubLead">
            {matchedOpenCount}+ open for {eligibilityLabel(profile.stage).toLowerCase()} · {hubData.courses.length}{' '}
            skills courses · {hubData.agencies.length} agencies
          </p>
        </div>
      </header>

      <main className="careerHubMain container">
        <div className="careerHubLayout">
          <div className="careerHubLeft">
            <CareerProfileCard
              profile={profile}
              onEdit={() => setShowWizard(true)}
              onClear={async () => {
                await clearProfile()
                setShowWizard(true)
              }}
            />
            <CareerCoursesPanel courses={hubData.courses} />
            <CareerJobSearchLinksPanel links={hubData.jobSearchLinks} />
          </div>

          <div className="careerHubCenter">
            <div className="careerHubToolbar">
              <input
                className="input careerHubSearch"
                type="search"
                placeholder="Search all programmes (including outside your stage)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label className="careerHubBrowseAll">
                <input
                  type="checkbox"
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                />
                Browse all programmes
              </label>
            </div>

            <p className="careerHubDisclaimer muted">
              Sections show what you can typically apply for first. Newer openings appear higher. Always confirm
              dates on the official site — we keep expired listings so you know what to watch next cycle.
            </p>

            <CareerListingsBoard sections={sections} profile={profile} search={search} showAll={showAll} />
          </div>

          <div className="careerHubRight">
            <CareerAgenciesPanel agencies={hubData.agencies} />
          </div>
        </div>

        <p className="careerHubFoot muted">
          Your answers are saved to your <Link to="/profile">Apply Once profile</Link> when you’re signed in.
        </p>
      </main>

      {showWizard ? (
        <div className="careerWizardOverlay" role="dialog" aria-modal="true" aria-label="Update work programmes profile">
          <div className="careerWizardOverlayInner">
            <CareerProfileWizard
              initialProfile={profile}
              onComplete={async (next) => {
                await saveProfile(next)
                setShowWizard(false)
              }}
            />
            <button type="button" className="btn btnGhost btnSmall careerWizardOverlayClose" onClick={() => setShowWizard(false)}>
              Close
            </button>
          </div>
        </div>
      ) : null}

      <SiteFooter
        brand={{ name: 'Apply Once', description: 'Apply once, then match and apply smarter.' }}
      />
    </div>
  )
}
