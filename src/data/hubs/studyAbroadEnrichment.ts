export const DESTINATION_FLAGS: Record<string, string> = {
  'Multiple countries': '🌍',
  'China': '🇨🇳',
  'Germany': '🇩🇪',
  'Russia': '🇷🇺',
  'Africa (Nigeria, Cameroon, Algeria)': '🌍',
  'United Kingdom': '🇬🇧',
  'United States': '🇺🇸',
  'South Africa (for returning graduates)': '🇿🇦',
  'Australia': '🇦🇺',
  'France': '🇫🇷',
  'European Union': '🇪🇺',
}

export const STUDY_ABROAD_ENRICHMENT: Record<
  string,
  { scholarshipPurpose: string; coversWhat: string[] }
> = {
  'dhet-portal': {
    scholarshipPurpose:
      'Central hub for SA government-nominated scholarships — you apply here to be considered for fully funded study in partner countries, then return to serve SA.',
    coversWhat: ['Tuition abroad', 'Living stipend', 'Return flights', 'Medical checks where required'],
  },
  'china-cgs': {
    scholarshipPurpose:
      'Study a full degree or Chinese language in China with costs covered — in exchange you commit to return and contribute to SA development.',
    coversWhat: ['Tuition', 'Accommodation', 'Monthly stipend', 'International travel'],
  },
  'germany-funda': {
    scholarshipPurpose:
      'Fully funded bachelor\'s, master\'s, or PhD at Constructor University (English-medium) in Bremen — for high achievers who could not self-fund EU study.',
    coversWhat: ['Full tuition', 'Flights', 'Medical insurance', 'Annual allowance', 'Pre-departure support'],
  },
  'russia-gov': {
    scholarshipPurpose:
      'Degree study at Russian universities with Russian government funding — DHET nomination for SA citizens (health sciences excluded 2026).',
    coversWhat: ['Tuition', 'Stipend', 'Accommodation support per Russian scholarship terms'],
  },
  pau: {
    scholarshipPurpose:
      'Master\'s or PhD at an African Union institute — stay on the continent while earning an internationally recognised postgraduate degree.',
    coversWhat: ['Tuition', 'Travel', 'Stipend', 'Research support'],
  },
  chevening: {
    scholarshipPurpose:
      'One-year master\'s at any UK university for future leaders — UK government pays so you can focus on study, then return to SA for at least 2 years.',
    coversWhat: ['Full tuition', 'Flights', 'Monthly living stipend', 'Visa costs', 'Arrival allowance'],
  },
  fulbright: {
    scholarshipPurpose:
      'Postgraduate study or research at a US university — US Embassy programme building academic links between SA and America.',
    coversWhat: ['Tuition', 'Living expenses', 'Health insurance', 'Travel', 'Pre-departure orientation'],
  },
  educationusa: {
    scholarshipPurpose:
      'Free advising only — not a scholarship. Helps you navigate US applications, essays, funding options, and visa steps.',
    coversWhat: ['Advising sessions', 'Application guidance', 'Test prep resources'],
  },
  'british-council': {
    scholarshipPurpose:
      'Information portal for UK study plus IELTS testing — use alongside Chevening or direct university scholarships.',
    coversWhat: ['Course search', 'Scholarship listings', 'IELTS registration'],
  },
  daad: {
    scholarshipPurpose:
      'Find scholarships for study in Germany — many public universities charge low or no tuition; DAAD adds living-cost support.',
    coversWhat: ['Varies by programme — often monthly stipend + travel + insurance'],
  },
  'mastercard-scholars': {
    scholarshipPurpose:
      'Full scholarship at partner universities for talented students from disadvantaged backgrounds — includes leadership training and give-back.',
    coversWhat: ['Full tuition', 'Accommodation', 'Stipend', 'Laptop/books where provided'],
  },
  'australia-awards': {
    scholarshipPurpose:
      'Development-focused master\'s in Australia — designed for Africans who will apply skills back home after graduating.',
    coversWhat: ['Tuition', 'Return air travel', 'Living allowance', 'Introductory programme'],
  },
  'campus-france': {
    scholarshipPurpose:
      'Gateway to studying in France — low public tuition plus Eiffel Excellence and other scholarships for top students.',
    coversWhat: ['Application support', 'Scholarship info', 'Visa guidance'],
  },
  erasmus: {
    scholarshipPurpose:
      'EU mobility and joint master\'s degrees — Erasmus Mundus programmes often include full scholarships for international students.',
    coversWhat: ['Tuition waiver', 'Monthly grant', 'Travel contribution on funded programmes'],
  },
  saqa: {
    scholarshipPurpose:
      'Not a scholarship — evaluates your foreign degree so employers and professional bodies in SA recognise it when you return.',
    coversWhat: ['Qualification evaluation report', 'SAQA verification letter'],
  },
  commonwealth: {
    scholarshipPurpose:
      'UK government master\'s and PhD for Commonwealth citizens — focused on development themes and sustainable growth.',
    coversWhat: ['Full tuition', 'Flights', 'Living stipend', 'Warm clothing allowance where applicable'],
  },
}

export function flagForDestination(destination: string, id?: string): string {
  if (id && STUDY_ABROAD_ENRICHMENT[id]) {
    // use destination map
  }
  return DESTINATION_FLAGS[destination] ?? '🌍'
}
