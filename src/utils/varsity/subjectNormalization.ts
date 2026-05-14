import type { NormalizedSubject } from './types'

const SUBJECT_ALIASES: Array<[NormalizedSubject, RegExp[]]> = [
  [
    'English',
    [
      /\benglish\b/i,
      /\beng\b/i,
      /\benglish\s*(hl|home language)\b/i,
      /\benglish\s*(fal|first additional language)\b/i,
    ],
  ],
  [
    'Mathematics',
    [
      /\bmathematics\b/i,
      /\bmaths\b/i,
      /\bmath\b/i,
      /\bmathematics\s*hl\b/i,
      /\btechnical mathematics\b/i,
      /\btech\s*maths?\b/i,
    ],
  ],
  ['Mathematical Literacy', [/\bmath\s*lit\b/i, /\bmathematical literacy\b/i]],
  [
    'Physical Sciences',
    [/\bphysical\s*sciences?\b/i, /\bphys\s*sci\b/i, /\bphysics\b/i],
  ],
  ['Life Orientation', [/\blife orientation\b/i, /\blo\b/i]],
  ['Life Sciences', [/\blife\s*sciences?\b/i, /\bbiology\b/i]],
  ['Accounting', [/\baccounting\b/i]],
  ['Business Studies', [/\bbusiness studies\b/i, /\bbusiness\b/i]],
  ['Economics', [/\beconomics\b/i, /\becon\b/i]],
  ['Geography', [/\bgeography\b/i, /\bgeo\b/i]],
  ['History', [/\bhistory\b/i]],
  ['Afrikaans', [/\bafrikaans\b/i]],
  ['Xitsonga', [/\bxitsonga\b/i]],
  ['isiZulu', [/\bisizulu\b/i, /\bzulu\b/i]],
  ['isiXhosa', [/\bisixhosa\b/i, /\bxhosa\b/i]],
  ['Sesotho', [/\bsesotho\b/i, /\bsotho\b/i]],
  ['Setswana', [/\bsetswana\b/i, /\btswana\b/i]],
  ['Sepedi', [/\bsepedi\b/i, /\bnorthern\s*sotho\b/i]],
  ['isiNdebele', [/\bisindebele\b/i, /\bndebele\b/i]],
  ['Tshivenda', [/\btshivenda\b/i, /\bvenda\b/i]],
  ['siSwati', [/\bsiswati\b/i, /\bswati\b/i]],
  [
    'Other',
    [/\bcomputer applications technology\b/i, /^cat$/i, /\binformation technology\b/i],
  ],
]

export function normalizeSubjectName(input: string): NormalizedSubject {
  const s = (input || '').trim()
  if (!s) return 'Other'

  for (const [canonical, patterns] of SUBJECT_ALIASES) {
    if (patterns.some((p) => p.test(s))) return canonical
  }
  return 'Other'
}

export function canonicalSubjectLabel(subject: NormalizedSubject): string {
  return subject
}

