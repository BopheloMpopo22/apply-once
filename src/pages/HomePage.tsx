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

export function HomePage() {
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
          <div className="homeSecondaryGrid homeSecondaryGrid3">
            {HOME_RESOURCE_CARDS.map((card) => (
              <HomeSelectCard
                key={card.id}
                {...card}
                size="secondary"
              />
            ))}
          </div>

          <div className="homeResourceGuides">
            <section className="homeGuideCard" id="resource-cv">
              <h3 className="homeGuideTitle">CV basics (high school + university)</h3>
              <p className="homeGuideLead muted">
                Recruiters and bursary committees skim fast. Your CV must be clean, one page (for most learners), and easy to scan.
              </p>
              <div className="homeGuideGrid">
                <div className="homeGuideCol">
                  <h4 className="homeGuideSub">What your CV must include</h4>
                  <ul className="homeGuideList">
                    <li><strong>Contact details</strong>: full name, phone, professional email, city.</li>
                    <li><strong>Short profile (3–4 lines)</strong>: who you are + what you’re applying for + strengths.</li>
                    <li><strong>Education</strong>: school/university, year, qualification, expected completion.</li>
                    <li><strong>Achievements</strong>: awards, top marks, competitions, responsibilities.</li>
                    <li><strong>Leadership & community</strong>: prefect, captain, tutoring, volunteering.</li>
                    <li><strong>Skills</strong>: MS Office/Google, communication, teamwork, time management.</li>
                    <li><strong>References</strong>: 1–2 teachers/coaches/mentors (not family), with permission.</li>
                  </ul>
                </div>
                <div className="homeGuideCol">
                  <h4 className="homeGuideSub">A simple CV layout (example)</h4>
                  <div className="cvExample">
                    <div className="cvExampleHeader">
                      <div className="cvExampleName">Thando Mokoena</div>
                      <div className="cvExampleMeta">Soweto, Gauteng · 07X XXX XXXX · thando@email.com</div>
                    </div>
                    <div className="cvExampleSection">
                      <div className="cvExampleH">PROFILE</div>
                      <div className="cvExampleP">Matric learner applying for bursaries. Strong in Maths & Physical Sciences, reliable, and committed to community impact.</div>
                    </div>
                    <div className="cvExampleSection">
                      <div className="cvExampleH">EDUCATION</div>
                      <div className="cvExampleP">School Name — Grade 12 (2026) · Top subjects: Maths, Physical Sciences, English</div>
                    </div>
                    <div className="cvExampleSection">
                      <div className="cvExampleH">ACHIEVEMENTS & LEADERSHIP</div>
                      <div className="cvExampleP">Prefect · Tutor (Maths) · Science expo participant · Volunteer clean-up drive</div>
                    </div>
                  </div>
                  <p className="muted" style={{ marginTop: 10 }}>
                    Keep formatting minimal. Export as <strong>PDF</strong>. Avoid heavy graphics that break readability.
                  </p>
                </div>
              </div>
            </section>

            <section className="homeGuideCard" id="resource-motivation">
              <h3 className="homeGuideTitle">Motivation letter (and cover letter)</h3>
              <p className="homeGuideLead muted">
                A motivation letter is for funding/study opportunities. A cover letter is for a job. The structure is similar — the focus is different.
              </p>
              <div className="homeGuideGrid">
                <div className="homeGuideCol">
                  <h4 className="homeGuideSub">Motivation letter structure (1 page)</h4>
                  <ol className="homeGuideList">
                    <li><strong>Intro</strong>: who you are, what you’re applying for, what you want to study.</li>
                    <li><strong>Academic proof</strong>: key subjects, results, achievements, discipline.</li>
                    <li><strong>Career goals</strong>: why this course and what you will do with it.</li>
                    <li><strong>Financial need</strong>: honest, clear, short — explain the gap.</li>
                    <li><strong>Close</strong>: gratitude + commitment + contact details.</li>
                  </ol>
                </div>
                <div className="homeGuideCol">
                  <h4 className="homeGuideSub">What makes it strong</h4>
                  <ul className="homeGuideList">
                    <li><strong>Specific</strong>: name the bursary/company and align with their values.</li>
                    <li><strong>Evidence</strong>: include proof (awards, responsibilities, results).</li>
                    <li><strong>Clear writing</strong>: short paragraphs, no slang, no begging.</li>
                    <li><strong>Tailored</strong>: don’t send the exact same letter everywhere.</li>
                    <li><strong>Proofread</strong>: spelling errors = instant rejection for many reviewers.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="homeGuideCard" id="resource-interview">
              <h3 className="homeGuideTitle">Interview prep checklist</h3>
              <p className="homeGuideLead muted">
                Simple formula: <strong>Research → Stories → Practice → Questions → Follow-up</strong>.
              </p>
              <div className="homeGuideGrid">
                <div className="homeGuideCol">
                  <h4 className="homeGuideSub">Before the interview</h4>
                  <ul className="homeGuideList">
                    <li><strong>Research</strong>: what they do, what they value, and what the role needs.</li>
                    <li><strong>Prepare 5–7 STAR stories</strong>: leadership, teamwork, conflict, failure, initiative, problem-solving.</li>
                    <li><strong>Practice out loud</strong>: don’t memorize; get comfortable speaking clearly.</li>
                    <li><strong>Logistics</strong>: outfit ready, route/data sorted, arrive 10–15 minutes early.</li>
                  </ul>
                </div>
                <div className="homeGuideCol">
                  <h4 className="homeGuideSub">During + after</h4>
                  <ul className="homeGuideList">
                    <li><strong>First impression</strong>: greet, smile, eye contact, sit upright, phone away.</li>
                    <li><strong>Answer clearly</strong>: keep most answers 60–120 seconds.</li>
                    <li><strong>Ask good questions</strong>: “What does success look like in the first 90 days?”</li>
                    <li><strong>Follow up</strong>: message/email within 24 hours thanking them.</li>
                  </ul>
                </div>
              </div>
            </section>
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
