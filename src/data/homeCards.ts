import { HOME_PRIMARY_IMAGES } from '../utils/preloadHomeAssets'

/** Home page card imagery — Unsplash (free to use with attribution in production). */
const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const HOME_PRIMARY_CARDS = [
  {
    id: 'application',
    title: 'Application Form',
    description: 'Complete your application and allow us to apply to bursaries matched to you.',
    image: HOME_PRIMARY_IMAGES.application,
    imageAlt: 'Application form illustration',
    href: '/application',
    hoverTheme: 'orange' as const,
  },
  {
    id: 'varsity-calculator',
    title: 'Varsity Calculator',
    description: 'Estimate your points and see which programmes you might qualify for.',
    image: HOME_PRIMARY_IMAGES.varsityCalculator,
    imageAlt: 'Varsity calculator illustration',
    href: '/varsity-calculator',
    hoverTheme: 'blue' as const,
  },
]

export const HOME_FEATURE_CARDS = [
  {
    id: 'nbt-sat',
    title: 'NBT / SAT',
    description: 'Checklists and prep resources for admissions tests.',
    image: u('photo-1434030216411-0b793f4b4173', 600),
    imageAlt: 'Student studying for an exam',
    href: '/#resources',
    accent: 'green' as const,
  },
  {
    id: 'courses',
    title: 'Other Free Courses',
    description: 'Short courses and free learning to boost your profile.',
    image: u('photo-1516321318423-f06f85e504b3', 600),
    imageAlt: 'Online learning on a laptop',
    href: '/#resources',
    accent: 'blue' as const,
  },
  {
    id: 'opportunities',
    title: 'Other Opportunities',
    description: 'Competitions, mentorships, bridging programmes, and more.',
    image: u('photo-1523240795612-9a054b0db644', 600),
    imageAlt: 'Group of diverse students outdoors',
    href: '/#resources',
    accent: 'green' as const,
  },
  {
    id: 'learnership',
    title: 'Learnership Applications',
    description: 'Find learnerships and keep your info ready to apply quickly.',
    image: u('photo-1552664730-d307ca884978', 600),
    imageAlt: 'Team meeting in a modern office',
    href: '/#resources',
    accent: 'blue' as const,
  },
  {
    id: 'vacation',
    title: 'Vacation Work Applications',
    description: 'Explore vacation work and internships with clear tracking.',
    image: u('photo-1600880292203-757bb62b4baf', 600),
    imageAlt: 'Young professionals collaborating',
    href: '/#resources',
    accent: 'green' as const,
  },
]

export const HOME_RESOURCE_CARDS = [
  {
    id: 'motivation',
    title: 'Motivation letter template',
    description: 'A structure that reads clearly and confidently.',
    image: u('photo-1456513080510-7bf3a84b82f8', 600),
    imageAlt: 'Open notebook for writing',
    href: '/#resources',
    accent: 'blue' as const,
  },
  {
    id: 'interview',
    title: 'Interview prep checklist',
    description: 'Quick practice steps and common questions.',
    image: u('photo-1521737711867-e3b97375f902', 600),
    imageAlt: 'People in a professional discussion',
    href: '/#resources',
    accent: 'green' as const,
  },
  {
    id: 'cv',
    title: 'CV basics for learners',
    description: 'A simple CV format that works for bursaries.',
    image: u('photo-1586281380349-632531db7ed4', 600),
    imageAlt: 'Resume documents on a desk',
    href: '/#resources',
    accent: 'blue' as const,
  },
]
