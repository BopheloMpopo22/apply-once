import type { CareerAgency } from '../../types/careerHub'

export const CAREER_AGENCIES: CareerAgency[] = [
  {
    id: 'agency-harambee',
    name: 'Harambee Youth Employment Accelerator',
    shortName: 'Harambee',
    scope: 'south-africa',
    website: 'https://www.harambee.co.za',
    summary:
      'Connects unemployed youth to jobs, learnerships, and training — assessment, work readiness, and employer matching nationwide.',
    knownFor: ['Youth jobs', 'Work readiness', 'Employer network', 'Free to candidates'],
    whoItsFor: ['Youth aged 18–34', 'Matric and some post-matric qualifications', 'Unemployed and seeking first job'],
    links: [
      { label: 'Harambee — register', url: 'https://www.harambee.co.za', kind: 'register' },
      { label: 'Opportunities', url: 'https://www.harambee.co.za/opportunities/', kind: 'official' },
    ],
    notes: 'Strong for entry-level and learnership pathways — not only graduate roles.',
  },
  {
    id: 'agency-yes',
    name: 'YES (Youth Employment Service)',
    shortName: 'YES',
    scope: 'south-africa',
    website: 'https://www.yes4youth.co.za',
    summary:
      'Business-led youth employment initiative — 12-month work experiences with YES partners, often combined with training.',
    knownFor: ['12-month placements', 'CV experience', 'National scale'],
    whoItsFor: ['Black South African youth 18–35', 'Matric required for many placements', 'Not currently employed full-time'],
    links: [
      { label: 'YES4Youth register', url: 'https://www.yes4youth.co.za', kind: 'register' },
      { label: 'YES programme info', url: 'https://www.yes4youth.co.za/about-yes/', kind: 'guide' },
    ],
    notes: 'Placements depend on partner availability in your area.',
  },
  {
    id: 'agency-educationusa',
    name: 'EducationUSA Advising (US Embassy)',
    shortName: 'EducationUSA',
    scope: 'abroad',
    website: 'https://za.usembassy.gov/education-culture/educational-advising/',
    summary:
      'Free advising for South Africans applying to accredited US universities — essays, tests, visas, and funding options.',
    knownFor: ['USA study', 'Free advising', 'Centres in major cities'],
    whoItsFor: ['Students planning US undergraduate or postgraduate study', 'Attend info session before 1-on-1 advising'],
    links: [
      {
        label: 'EducationUSA SA',
        url: 'https://za.usembassy.gov/education-culture/educational-advising/',
        kind: 'official',
      },
    ],
    notes: 'Advising only — not a job placement agency.',
  },
  {
    id: 'agency-british-council',
    name: 'British Council — Study UK & skills',
    shortName: 'British Council',
    scope: 'abroad',
    website: 'https://www.britishcouncil.org.za/study-uk',
    summary:
      'Guidance on studying in the UK, scholarships, and English assessments (IELTS) — plus creative and education programmes.',
    knownFor: ['UK study', 'IELTS', 'Scholarships'],
    whoItsFor: ['Students exploring UK degrees', 'Professionals needing IELTS for work abroad'],
    links: [
      { label: 'British Council SA', url: 'https://www.britishcouncil.org.za', kind: 'official' },
      { label: 'Study UK', url: 'https://www.britishcouncil.org.za/study-uk', kind: 'guide' },
    ],
    notes: '',
  },
  {
    id: 'agency-dhet',
    name: 'DHET International Scholarships',
    shortName: 'DHET',
    scope: 'abroad',
    website: 'https://www.internationalscholarships.dhet.gov.za',
    summary:
      'Official government portal for scholarships to study abroad — China, Germany, Russia, and other bilateral programmes.',
    knownFor: ['Government scholarships', 'Study abroad', 'Fully funded options'],
    whoItsFor: ['SA citizens with strong academics', 'Willing to return after studies where required'],
    links: [
      { label: 'DHET scholarships portal', url: 'https://www.internationalscholarships.dhet.gov.za', kind: 'official' },
    ],
    notes: 'Subscribe for deadline alerts on the portal.',
  },
  {
    id: 'agency-saqa',
    name: 'SAQA — Qualifications evaluation',
    shortName: 'SAQA',
    scope: 'both',
    website: 'https://www.saqa.org.za',
    summary:
      'Evaluates foreign qualifications for recognition in South Africa — needed for many returnees and scholarship applications.',
    knownFor: ['Qualification recognition', 'Returning graduates', 'Professional registration'],
    whoItsFor: ['Anyone with a qualification obtained outside SA', 'DHET scholarship applicants'],
    links: [{ label: 'SAQA', url: 'https://www.saqa.org.za', kind: 'official' }],
    notes: 'Paid evaluation service — allow several weeks.',
  },
  {
    id: 'agency-cultural-care',
    name: 'Cultural Care Au Pair (USA)',
    shortName: 'Cultural Care',
    scope: 'abroad',
    website: 'https://www.culturalcare.co.za',
    summary:
      'Au pair placements in the USA — live with a host family, earn a stipend, and gain childcare experience abroad.',
    knownFor: ['Au pair', 'USA', 'Gap year', 'J-1 visa support'],
    whoItsFor: ['SA citizens typically 18–26', 'Childcare experience', 'Good English'],
    links: [
      { label: 'Cultural Care SA', url: 'https://www.culturalcare.co.za', kind: 'official' },
      { label: 'Apply', url: 'https://www.culturalcare.co.za/apply', kind: 'register' },
    ],
    notes: 'Use registered agencies only — compare fees and contracts.',
  },
  {
    id: 'agency-au-pair-intl',
    name: 'Au Pair International',
    shortName: 'API',
    scope: 'abroad',
    website: 'https://www.aupairinternational.co.za',
    summary: 'SA au pair agency for USA, Netherlands, and other destinations with visa guidance.',
    knownFor: ['Au pair', 'Netherlands', 'USA'],
    whoItsFor: ['Young South Africans 18–28', 'Matric + childcare experience'],
    links: [{ label: 'Au Pair International', url: 'https://www.aupairinternational.co.za', kind: 'official' }],
    notes: 'Verify agency registration before paying fees.',
  },
  {
    id: 'agency-manpower',
    name: 'ManpowerGroup South Africa',
    shortName: 'Manpower',
    scope: 'south-africa',
    website: 'https://www.manpowergroup.co.za',
    summary:
      'Recruitment and temp-to-permanent staffing across finance, IT, engineering, and admin — register CV online.',
    knownFor: ['Recruitment', 'Contract work', 'National'],
    whoItsFor: ['Graduates and experienced candidates', 'Open to contract or permanent roles'],
    links: [{ label: 'Manpower SA', url: 'https://www.manpowergroup.co.za', kind: 'official' }],
    notes: 'Also explore Experis (IT) under ManpowerGroup.',
  },
  {
    id: 'agency-adcorp',
    name: 'Adcorp Workforce Solutions',
    shortName: 'Adcorp',
    scope: 'south-africa',
    website: 'https://www.adcorp.co.za',
    summary:
      'Large staffing group — temporary, contract, and permanent placements across industries.',
    knownFor: ['Staffing', 'Temp work', 'National offices'],
    whoItsFor: ['Job seekers with matric to graduate level', 'Flexible on contract assignments'],
    links: [{ label: 'Adcorp', url: 'https://www.adcorp.co.za', kind: 'official' }],
    notes: '',
  },
  {
    id: 'agency-dpsa',
    name: 'DPSA Public Service Vacancies',
    shortName: 'DPSA',
    scope: 'south-africa',
    website: 'https://www.dpsa.gov.za/newsroom/psvc/',
    summary:
      'Official weekly circular of national and provincial government vacancies — including graduate internships in departments.',
    knownFor: ['Government jobs', 'Internships', 'Weekly circular'],
    whoItsFor: ['SA citizens meeting each advert’s requirements', 'Graduates for intern posts'],
    links: [
      { label: 'Public Service Vacancy Circular', url: 'https://www.dpsa.gov.za/newsroom/psvc/', kind: 'official' },
    ],
    notes: 'Download the latest PDF circular every Friday.',
  },
  {
    id: 'agency-pnet',
    name: 'PNet / Job Crystal',
    shortName: 'PNet',
    scope: 'south-africa',
    website: 'https://www.pnet.co.za',
    summary:
      'Major SA job board — graduate, internship, and entry-level listings aggregated from employers and agencies.',
    knownFor: ['Job search', 'Graduate listings', 'CV upload'],
    whoItsFor: ['All job seekers — filter by graduate / internship'],
    links: [
      { label: 'PNet jobs', url: 'https://www.pnet.co.za', kind: 'official' },
      { label: 'Graduate jobs filter', url: 'https://www.pnet.co.za/jobs/graduate', kind: 'register' },
    ],
    notes: 'Also try CareerJunction, Indeed SA, and LinkedIn with “graduate programme South Africa”.',
  },
]
