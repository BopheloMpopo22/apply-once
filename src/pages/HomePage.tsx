import { Link } from 'react-router-dom'
import { ApplyOnceLogo } from '../components/ApplyOnceLogo'
import { FeatureGrid } from '../components/FeatureGrid'
import { Navbar } from '../components/Navbar'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import heroCards from '../assets/hero-cards.png'
import {
  IconBriefcase,
  IconCalculator,
  IconClipboardCheck,
  IconCourses,
  IconExam,
  IconGrid,
} from '../components/FeatureIcons'

export function HomePage() {
  return (
    <div className="appShell" id="top">
      <Navbar
        logo={<ApplyOnceLogo />}
        links={[
          { label: 'Features', to: '/#features' },
          { label: 'Resources', to: '/#resources' },
        ]}
      />

      <header className="hero" aria-label="Apply Once introduction">
        <div className="container heroInner">
          <div className="heroLeft animateIn">
            <div className="heroBadge">Premium, simple, student-first</div>
            <h1 className="heroTitle">Apply once. Get matched to bursaries &amp; opportunities.</h1>
            <p className="heroSubtitle">
              All your bursary and further‑education needs in one place. Create a profile once, then we help you apply
              to opportunities that fit you.
            </p>

            <div className="heroCtas" id="get-started">
              <Link className="btn btnPrimary" to="/register">
                Get Started
              </Link>
            </div>

            <div className="heroPills" role="list" aria-label="What Apply Once helps with">
              <span className="pill" role="listitem">
                Bursaries
              </span>
              <span className="pill" role="listitem">
                Scholarships
              </span>
              <span className="pill" role="listitem">
                Universities
              </span>
              <span className="pill" role="listitem">
                Learnerships
              </span>
            </div>
          </div>

          <div className="heroRight animateIn" aria-hidden="true">
            <div className="heroVisualCard heroVisualTilt">
              <img className="heroImage" src={heroCards} alt="" />
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <Section
          id="features"
          eyebrow="Features"
          title="Everything you need for the next phase in your career."
          subtitle="A clean workflow that keeps your info organised, reusable, and ready when applications open."
        >
          <FeatureGrid
            features={[
              {
                title: 'Application Form',
                description: 'Complete your full application once and reuse it across opportunities.',
                icon: <IconClipboardCheck className="featureSvg" />,
                learnMoreHref: '/register',
              },
              {
                title: 'Varsity Calculator',
                description: 'Estimate your points and compare programmes and entry requirements.',
                icon: <IconCalculator className="featureSvg" />,
                learnMoreHref: '/#features',
              },
              {
                title: 'NBT / SAT',
                description: 'Get ready for admissions tests with checklists and prep resources.',
                icon: <IconExam className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
              {
                title: 'Other Free Courses',
                description: 'Browse short courses and free learning that can boost your application.',
                icon: <IconCourses className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
              {
                title: 'Other Opportunities',
                description: 'Competitions, mentorships, bridging programmes, and more.',
                icon: <IconGrid className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
              {
                title: 'Learnership Applications',
                description: 'Find learnerships and keep your info ready for quick applications.',
                icon: <IconBriefcase className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
              {
                title: 'Vacation Work Applications',
                description: 'Explore vacation work and internships with clean requirements tracking.',
                icon: <IconBriefcase className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
            ]}
          />
        </Section>

        <Section
          id="resources"
          eyebrow="Resources"
          title="Guides that help you stand out"
          subtitle="Short, practical resources that you can actually use."
        >
          <FeatureGrid
            columns={3}
            features={[
              {
                title: 'Motivation letter template',
                description: 'A structure that reads clearly and confidently.',
                icon: <IconClipboardCheck className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
              {
                title: 'Interview prep checklist',
                description: 'Quick practice steps and common questions.',
                icon: <IconExam className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
              {
                title: 'CV basics for learners',
                description: 'A simple CV format that works for bursaries.',
                icon: <IconCourses className="featureSvg" />,
                learnMoreHref: '/#resources',
              },
            ]}
          />
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
