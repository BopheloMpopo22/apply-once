import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { HomeHeroVisual } from '../components/home/HomeHeroVisual'
import { HomePrimaryCard } from '../components/home/HomePrimaryCard'
import { HomeSelectCard } from '../components/home/HomeSelectCard'
import { Navbar } from '../components/Navbar'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { HOME_FEATURE_CARDS, HOME_PRIMARY_CARDS, HOME_RESOURCE_CARDS } from '../data/homeCards'

export function HomePage() {
  const [selectedSecondary, setSelectedSecondary] = useState<string | null>(null)

  return (
    <div className="appShell homeShell" id="top">
      <Navbar
        variant="light"
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />

      <section className="homeHeroWrap" aria-label="Apply Once introduction">
        <div className="homeHeroOuter">
          <div className="homeHeroPanel">
            <div className="homeHeroShine" aria-hidden />
            <div className="homeHeroGrid">
              <div className="homeHeroContent">
                <p className="homeHeroBrand">Apply Once</p>
                <h1 className="homeHeroTitle">
                  The all-in-one platform for SA learners applying to bursaries and varsity.
                </h1>

                <div className="heroCtas homeHeroCtas" id="get-started">
                  <Link className="btn btnHeroPrimary" to="/register">
                    Get started
                  </Link>
                  <Link className="btn btnHeroSecondary" to="/varsity-calculator">
                    Varsity calculator
                  </Link>
                </div>

                <div className="homeHeroMarquee" aria-hidden>
                  <div className="homeHeroMarqueeTrack">
                    <span>Bursaries</span>
                    <span>Scholarships</span>
                    <span>Universities</span>
                    <span>Learnerships</span>
                    <span>Varsity</span>
                    <span>Bursaries</span>
                    <span>Scholarships</span>
                    <span>Universities</span>
                    <span>Learnerships</span>
                    <span>Varsity</span>
                  </div>
                </div>
              </div>

              <HomeHeroVisual />
            </div>
          </div>
        </div>
      </section>

      <main className="main homeMain">
        <section className="homePrimarySection" aria-labelledby="home-primary-heading">
          <div className="container">
            <h2 id="home-primary-heading" className="homeSectionLabel">
              Start here
            </h2>
            <p className="homeSectionLead muted">Tap a card to open.</p>
            <div className="homePrimaryGrid">
              {HOME_PRIMARY_CARDS.map((card) => (
                <HomePrimaryCard key={card.id} {...card} />
              ))}
            </div>
          </div>
        </section>

        <Section
          id="features"
          eyebrow="Features"
          title="Everything you need for the next phase in your career."
          subtitle="A clean workflow that keeps your info organised, reusable, and ready when applications open."
        >
          <div className="homeSecondaryGrid">
            {HOME_FEATURE_CARDS.map((card) => (
              <HomeSelectCard
                key={card.id}
                {...card}
                size="secondary"
                selected={selectedSecondary === card.id}
                onSelect={() => setSelectedSecondary((prev) => (prev === card.id ? null : card.id))}
              />
            ))}
          </div>
        </Section>

        <Section
          id="resources"
          eyebrow="Resources"
          title="Guides that help you stand out"
          subtitle="Short, practical resources that you can actually use."
        >
          <div className="homeSecondaryGrid homeSecondaryGrid3">
            {HOME_RESOURCE_CARDS.map((card) => (
              <HomeSelectCard
                key={card.id}
                {...card}
                size="secondary"
                selected={selectedSecondary === card.id}
                onSelect={() => setSelectedSecondary((prev) => (prev === card.id ? null : card.id))}
              />
            ))}
          </div>
        </Section>
      </main>

      <SiteFooter
        brand={{ name: 'Apply Once', description: 'Apply once, then match and apply smarter.' }}
        columns={[
          { title: 'Product', links: ['Features', 'Resources'] },
          { title: 'Company', links: ['About', 'Contact', 'Partners'] },
          { title: 'Resources', links: ['Guides', 'Templates', 'FAQs'] },
          { title: 'Social', links: ['Instagram', 'TikTok', 'YouTube'] },
        ]}
      />
    </div>
  )
}
