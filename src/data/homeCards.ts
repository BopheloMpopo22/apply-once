import { HOME_PRIMARY_IMAGES } from '../utils/preloadHomeAssets'
import { HUB_REGISTRY } from './hubs/hubRegistry'

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

export const HOME_FEATURE_CARDS = HUB_REGISTRY.map((hub) => ({
  id: hub.slug,
  title: hub.title,
  description: hub.description,
  image: hub.image,
  imageAlt: hub.imageAlt,
  href: `/hubs/${hub.slug}`,
  accent: hub.accent,
  status: hub.status,
}))

export const HOME_RESOURCE_CARDS = [
  {
    id: 'motivation',
    title: 'Motivation letter template',
    description: 'A structure that reads clearly and confidently.',
    image: u('photo-1456513080510-7bf3a84b82f8', 600),
    imageAlt: 'Open notebook for writing',
    href: '/#resource-motivation',
    accent: 'blue' as const,
  },
  {
    id: 'interview',
    title: 'Interview prep checklist',
    description: 'Quick practice steps and common questions.',
    image: u('photo-1521737711867-e3b97375f902', 600),
    imageAlt: 'People in a professional discussion',
    href: '/#resource-interview',
    accent: 'green' as const,
  },
  {
    id: 'cv',
    title: 'CV basics for learners',
    description: 'A simple CV format that works for bursaries.',
    image: u('photo-1586281380349-632531db7ed4', 600),
    imageAlt: 'Resume documents on a desk',
    href: '/#resource-cv',
    accent: 'blue' as const,
  },
  {
    id: 'scanner',
    title: 'CamScanner-style PDF tool',
    description: 'Turn photos into a single PDF and merge documents for uploads.',
    image: u('photo-1520962922320-2038eebab146', 600),
    imageAlt: 'Phone scanning a document',
    href: '/resources/scanner',
    accent: 'blue' as const,
  },
]
