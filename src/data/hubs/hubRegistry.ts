import type { HubMeta, HubSlug } from '../../types/hubs'

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const HUB_DISCLAIMER =
  'Dates, fees, and requirements change every year. Always confirm on the official website before you apply or pay.'

export const HUB_REGISTRY: HubMeta[] = [
  {
    slug: 'universities',
    title: 'University admissions',
    shortTitle: 'Universities',
    description:
      'Application dates, fees, open days, and official links for South African universities.',
    intro:
      'Your one-stop overview of public universities in South Africa — when applications open and close, what it costs to apply, open days, and where to go on the web for the latest undergraduate information.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1523050854058-8df90110c9f1', 600),
    imageAlt: 'University campus buildings',
    accent: 'blue',
    status: 'live',
  },
  {
    slug: 'colleges',
    title: 'Colleges & TVET',
    shortTitle: 'Colleges',
    description:
      'Explore colleges across SA — what they offer, application dates, and official websites.',
    intro:
      'A growing directory of colleges and TVET institutions: what each is known for (engineering, nursing, hospitality, and more), when applications open and close, and direct links to their sites.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1524178232363-7fb08b96f219', 600),
    imageAlt: 'Students in a classroom',
    accent: 'green',
    status: 'coming-soon',
  },
  {
    slug: 'admissions-tests',
    title: 'Admissions tests',
    shortTitle: 'Admissions tests',
    description: 'NBT, SAT, and other tests — dates, costs, and which programmes need them.',
    intro:
      'Understand admissions tests used in South Africa and abroad: what each test is, registration windows, fees, prep resources, and which universities or courses require them.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1434030216411-0b793f4b4173', 600),
    imageAlt: 'Student studying for an exam',
    accent: 'green',
    status: 'coming-soon',
  },
  {
    slug: 'study-abroad',
    title: 'Studying abroad',
    shortTitle: 'Study abroad',
    description:
      'Scholarships, agencies, government programmes, and pathways to study outside SA.',
    intro:
      'Learn how South African students can study overseas — exchange programmes, scholarships, agencies that support African applicants, and government initiatives (including health and other sponsored pathways).',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1523050854058-8df90110c9f1', 600),
    imageAlt: 'Students on an international campus',
    accent: 'blue',
    status: 'coming-soon',
  },
  {
    slug: 'courses',
    title: 'Courses & skills',
    shortTitle: 'Courses',
    description:
      'Free and paid short courses — coding, AI, hospitality, trades, and more.',
    intro:
      'Skills beyond traditional degrees: Harvard and other free online courses, AWS and Microsoft learning, coding bootcamps, artisan and hospitality training, and diplomas that build employability.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1516321318423-f06f85e504b3', 600),
    imageAlt: 'Online learning on a laptop',
    accent: 'blue',
    status: 'coming-soon',
  },
  {
    slug: 'work-opportunities',
    title: 'Work opportunities',
    shortTitle: 'Work',
    description:
      'Paths that do not always need a full degree — au pair, hospitality, aviation, and more.',
    intro:
      'For learners still exploring: paid training, entry-level roles, and programmes in South Africa and abroad that can lead to a career without a traditional four-year degree (some may need a matric or diploma).',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1600880292203-757bb62b4baf', 600),
    imageAlt: 'Young professionals collaborating',
    accent: 'green',
    status: 'coming-soon',
  },
  {
    slug: 'bridging',
    title: 'Bridging programmes',
    shortTitle: 'Bridging',
    description:
      'University bridging courses — who they are for, dates, and how to apply.',
    intro:
      'Bridging and extended programmes at South African universities: improve your marks, meet entry requirements, and move into your target degree — with links and key dates in one place.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1523240795612-9a054b0db644', 600),
    imageAlt: 'Students walking on campus',
    accent: 'blue',
    status: 'coming-soon',
  },
  {
    slug: 'learnerships',
    title: 'Learnerships',
    shortTitle: 'Learnerships',
    description:
      'Learnerships for matric holders — earn while you learn across industries.',
    intro:
      'SETA and employer learnerships for South Africans with a matric (and sometimes other levels): sectors, typical requirements, application timing, and where to find official listings.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1552664730-d307ca884978', 600),
    imageAlt: 'Team meeting in a modern office',
    accent: 'green',
    status: 'coming-soon',
  },
  {
    slug: 'vacation-work',
    title: 'Vacation work & internships',
    shortTitle: 'Vacation work',
    description:
      'Holiday jobs, internships, and work experience while you study.',
    intro:
      'Vacation work and internship opportunities for school leavers and students — build your CV, explore industries, and see closing dates before the holidays pass.',
    disclaimer: HUB_DISCLAIMER,
    image: u('photo-1600880292203-757bb62b4baf', 600),
    imageAlt: 'Interns in an office',
    accent: 'blue',
    status: 'coming-soon',
  },
]

export function getHubBySlug(slug: string): HubMeta | undefined {
  return HUB_REGISTRY.find((h) => h.slug === slug)
}

export function isHubSlug(slug: string): slug is HubSlug {
  return HUB_REGISTRY.some((h) => h.slug === slug)
}

export const COMING_SOON_SECTIONS: Record<
  Exclude<HubSlug, 'universities'>,
  { heading: string; items: string[] }[]
> = {
  colleges: [
    {
      heading: 'What you will find here',
      items: [
        'Public and private colleges across all nine provinces',
        'What each college is known for (e.g. engineering, nursing, IT)',
        'Application open and close dates',
        'Official website and apply links',
        'Open days and campus visit info',
      ],
    },
  ],
  'admissions-tests': [
    {
      heading: 'Tests we are building guides for',
      items: [
        'National Benchmark Tests (NBT) — used by many SA universities',
        'SAT — for US and some international applications',
        'Other tests as we verify requirements (e.g. ACT, IELTS where relevant)',
        'Registration dates, fees, and official prep resources',
        'Which universities or faculties require which test',
      ],
    },
  ],
  'study-abroad': [
    {
      heading: 'What you will find here',
      items: [
        'Government-sponsored study programmes (e.g. health sciences abroad)',
        'Scholarships for African students',
        'Agencies that help with visas, applications, and funding',
        'Language tests and document checklists',
        'Country-specific pathways (UK, US, EU, and more)',
      ],
    },
  ],
  courses: [
    {
      heading: 'Course types we are curating',
      items: [
        'Free online courses (Harvard, Coursera, etc.)',
        'Cloud & tech (AWS, Microsoft, Google)',
        'Coding, AI, and digital skills',
        'Hospitality, tourism, and service industries',
        'Artisan and trades (building, electrical, plumbing)',
        'Short diplomas and certificates',
      ],
    },
  ],
  'work-opportunities': [
    {
      heading: 'Opportunity types',
      items: [
        'Au pair and cultural exchange programmes',
        'Hospitality and culinary training',
        'Aviation and cabin crew pathways',
        'Retail and customer service roles with training',
        'Programmes that accept matric with or without a degree',
      ],
    },
  ],
  bridging: [
    {
      heading: 'What you will find here',
      items: [
        'Bridging programmes by university',
        'Who qualifies (matric results, subjects, age)',
        'Duration, cost, and application dates',
        'Links to faculty bridging pages',
        'How bridging connects to your target degree',
      ],
    },
  ],
  learnerships: [
    {
      heading: 'What you will find here',
      items: [
        'Learnerships that accept matric',
        'Industry sectors (finance, IT, engineering, etc.)',
        'SETA and employer portals',
        'Typical stipends and contract length',
        'How to apply and documents you need',
      ],
    },
  ],
  'vacation-work': [
    {
      heading: 'What you will find here',
      items: [
        'Corporate vacation work programmes',
        'Government and SOE internship intakes',
        'NGO and research vacation placements',
        'Application deadlines by season',
        'Tips for first-time applicants',
      ],
    },
  ],
}
