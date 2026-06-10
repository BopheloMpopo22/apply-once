import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { HomeHeroVisual } from '../components/home/HomeHeroVisual'
import { HomePrimaryCard } from '../components/home/HomePrimaryCard'
import { HomeHubCard } from '../components/home/HomeHubCard'
import { HomeSelectCard } from '../components/home/HomeSelectCard'
import { Navbar } from '../components/Navbar'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { HOME_FEATURE_CARDS, HOME_PRIMARY_CARDS, HOME_RESOURCE_CARDS } from '../data/homeCards'
import { getPaperOfTheDay } from '../data/pastPapers/paperOfTheDay'

export function HomePage() {
  const [openResourceId, setOpenResourceId] = useState<string | null>(null)
  const paperOfTheDay = getPaperOfTheDay()

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
          eyebrow="Explore"
          title="Everything in one place for your next step."
          subtitle="Info hubs for universities, colleges, tests, courses, learnerships, and more — separate from your bursary application and varsity calculator."
        >
          <div className="homeSecondaryGrid homeHubGrid">
            {HOME_FEATURE_CARDS.map((card) => (
              <HomeHubCard key={card.id} {...card} />
            ))}
          </div>
        </Section>

        <Section
          id="resources"
          eyebrow="Resources"
          title="Guides that help you stand out"
          subtitle="Short, practical resources that you can actually use."
        >
          <div className="homePaperOfDayBanner">
            <div className="homePaperOfDayText">
              <p className="homePaperOfDayKicker">Paper of the day</p>
              <p className="homePaperOfDayTitle">
                {paperOfTheDay.subject} · {paperOfTheDay.title} ({paperOfTheDay.session}{' '}
                {paperOfTheDay.year})
              </p>
            </div>
            <Link className="btn btnBrand btnSmall" to="/past-papers">
              Open past papers
            </Link>
          </div>
          <div className="homeSecondaryGrid homeSecondaryGrid3">
            {HOME_RESOURCE_CARDS.map((card) => (
              <HomeSelectCard
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                image={card.image}
                imageAlt={card.imageAlt}
                accent={card.accent}
                size="secondary"
                expanded={openResourceId === card.id}
                onToggle={() => setOpenResourceId((prev) => (prev === card.id ? null : card.id))}
                ctaHref={card.id === 'past-papers' ? '/past-papers' : undefined}
                ctaLabel={card.id === 'past-papers' ? 'Browse all matric papers →' : undefined}
              >
                {card.id === 'past-papers' ? (
                  <div className="homeResourceContent">
                    <h4>Grade 12 NSC — official papers</h4>
                    <ul>
                      <li>
                        <strong>15 core subjects</strong> — Maths, Sciences, Accounting, English, and
                        more.
                      </li>
                      <li>
                        <strong>2020–2025</strong> — November and May/June sessions.
                      </li>
                      <li>
                        <strong>Question papers + memos</strong> — linked from DBE and WCED (official
                        government sources).
                      </li>
                      <li>
                        <strong>Paper of the day</strong> — a new paper to practise every day.
                      </li>
                    </ul>
                    <p className="muted" style={{ marginTop: 10 }}>
                      NSC matric finals are national — the same papers apply in every province.
                    </p>
                  </div>
                ) : card.id === 'cv' ? (
                  <div className="homeResourceContent">
                    <h4>What your CV must include</h4>
                    <ul>
                      <li><strong>Contact details</strong>: full name, phone, professional email, city.</li>
                      <li><strong>Short profile (3–4 lines)</strong>: who you are + what you’re applying for + strengths.</li>
                      <li><strong>Education</strong>: school/university, year, qualification, expected completion.</li>
                      <li><strong>Achievements</strong>: awards, top marks, responsibilities.</li>
                      <li><strong>Leadership & community</strong>: prefect, captain, volunteering.</li>
                      <li><strong>Skills</strong>: MS Office/Google, communication, teamwork, time management.</li>
                      <li><strong>References</strong>: 1–2 teachers/coaches/mentors (not family), with permission.</li>
                    </ul>
                    <h4 style={{ marginTop: 12 }}>Simple layout example</h4>
                    <div className="cvExample">
                      <div className="cvExampleHeader">
                        <div className="cvExampleName">Thando Mokoena</div>
                        <div className="cvExampleMeta">Soweto, Gauteng · 07X XXX XXXX · thando@email.com</div>
                      </div>
                      <div className="cvExampleSection">
                        <div className="cvExampleH">PROFILE</div>
                        <div className="cvExampleP">
                          Matric learner applying for bursaries. Strong in Maths &amp; Physical Sciences, reliable, and committed to growth.
                        </div>
                      </div>
                      <div className="cvExampleSection">
                        <div className="cvExampleH">EDUCATION</div>
                        <div className="cvExampleP">School Name — Grade 12 (2026) · Top subjects: Maths, Physical Sciences, English</div>
                      </div>
                    </div>
                    <p className="muted" style={{ marginTop: 10 }}>
                      Keep it clean and minimal. Export as <strong>PDF</strong>. Avoid heavy graphics.
                    </p>
                  </div>
                ) : card.id === 'motivation' ? (
                  <div className="homeResourceContent">
                    <h4>Motivation letter (bursary/study) structure</h4>
                    <ol>
                      <li><strong>Intro</strong>: who you are, what you’re applying for, what you want to study.</li>
                      <li><strong>Academic proof</strong>: key subjects, results, achievements.</li>
                      <li><strong>Career goals</strong>: why this course + how you’ll use it.</li>
                      <li><strong>Financial need</strong>: honest + short — explain the gap.</li>
                      <li><strong>Close</strong>: gratitude + commitment + contact details.</li>
                    </ol>
                    <h4 style={{ marginTop: 12 }}>Cover letter (work) difference</h4>
                    <ul>
                      <li><strong>Cover letter</strong> is job-focused: skills + experience + why this role.</li>
                      <li><strong>Motivation letter</strong> is goal-focused: values + study goals + need/fit.</li>
                    </ul>
                    <p className="muted" style={{ marginTop: 10 }}>
                      Keep it to ~1 page. Tailor it to the provider. Proofread carefully.
                    </p>
                  </div>
                ) : card.id === 'interview' ? (
                  <div className="homeResourceContent">
                    <h4>Fast prep formula</h4>
                    <ul>
                      <li><strong>Research</strong>: what they do, values, role requirements.</li>
                      <li><strong>Stories</strong>: prepare 5–7 STAR stories (leadership, teamwork, conflict, failure, initiative).</li>
                      <li><strong>Practice</strong>: say answers out loud (don’t memorize scripts).</li>
                      <li><strong>Questions</strong>: bring 3–5 smart questions (e.g. “success in first 90 days?”).</li>
                      <li><strong>Follow-up</strong>: thank them within 24 hours.</li>
                    </ul>
                    <h4 style={{ marginTop: 12 }}>First impression checklist</h4>
                    <ul>
                      <li>Arrive early (or join online 5 minutes early).</li>
                      <li>Greet confidently, eye contact, phone away, sit upright.</li>
                      <li>Keep most answers 60–120 seconds.</li>
                    </ul>
                  </div>
                ) : null}
              </HomeSelectCard>
            ))}
          </div>
        </Section>
      </main>

      <SiteFooter
        brand={{ name: 'Apply Once', description: 'Apply once, then match and apply smarter.' }}
      />
    </div>
  )
}
