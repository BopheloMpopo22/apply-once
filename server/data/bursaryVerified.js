/**
 * Official-page facts for the bursary calendar.
 * Only dates published by the funder. Never invent an opening date.
 * Last checked: 9 September 2026.
 *
 * Apply to the live database with: node scripts/applyBursaryVerified.js
 * (Catalogue sync will not overwrite existing rows.)
 */

export const VERIFIED_ON = '2026-09-09'

/**
 * @typedef {object} VerifiedPatch
 * @property {string} slug
 * @property {string} [name]
 * @property {string} [provider]
 * @property {string} [type]
 * @property {string[]} [studyFields]
 * @property {string[]} [workSectors]
 * @property {boolean} [offersJobAfterGrad]
 * @property {string} applyUrl
 * @property {string} sourceUrl
 * @property {string | null} [applicationOpens] YYYY-MM-DD
 * @property {string | null} [applicationCloses] YYYY-MM-DD
 * @property {string | null} [nextExpectedOpens] YYYY-MM-DD
 * @property {boolean} datesConfirmed
 * @property {string[]} [studyLevels]
 * @property {string} [coverage]
 * @property {string} [region]
 * @property {string} [eligibility]
 * @property {string} [requiredDocs]
 * @property {string} notes
 * @property {boolean} [createIfMissing]
 */

/** @type {VerifiedPatch[]} */
export const BURSARY_VERIFIED = [
  {
    slug: 'nsfas',
    applyUrl: 'https://www.nsfas.org.za',
    sourceUrl: 'https://www.nsfas.org.za/content/',
    applicationOpens: null,
    applicationCloses: '2026-08-23',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate', 'tvet'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'Financial need. Public university or TVET. Apply on myNSFAS. 2027 national cycle dates were not yet published on 9 Sep 2026.',
    requiredDocs: 'SA ID, proof of household income. Check myNSFAS for any missing-document notice.',
    notes:
      'National 2026 applications closed 15 Nov 2025. TVET Trimester 3 closed 23 Aug 2026 (14–23 Aug). NSFAS said 2027 national dates “follow soon” — no date published. Do not use the withdrawn 3–14 Sep 2026 TVET window.',
  },
  {
    slug: 'funza-lushaka',
    applyUrl: 'https://www.eservices.gov.za/FunzaLushaka/',
    sourceUrl: 'https://www.funzalushaka.doe.gov.za/',
    applicationOpens: '2025-10-07',
    applicationCloses: '2026-02-01',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'Teaching qualification in a national-priority subject. First-time applicants must be 30 or younger. Work-back at a public school for each funded year. 2027 dates not published as of 9 Sep 2026.',
    requiredDocs: 'Apply on e-Gov (eservices.gov.za). Police clearance, NSRO and child-protection checks apply.',
    notes:
      'Funza portal: 2026 opened 7 Oct 2025; returning bursars 30 Nov 2025; new applications 1 Feb 2026. DBE page also listed 24 Jan 2026 for new applicants — use e-Gov and the Funza site before applying. Teaching work-back is required.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'sasol-engineering',
    applyUrl: 'https://www.sasolbursaries.com',
    sourceUrl:
      'https://www.sasol.com/media-centre/media-releases/sasol-bursaries-now-open-applications-invited-for-2027-engineering-and-science-studies',
    applicationOpens: '2026-04-01',
    applicationCloses: '2026-05-17',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'SA citizen by birth, permanent SA resident. Full-time undergraduate Engineering or Science at a Sasol-approved public university in 2027. UNISA not considered. Typical Grade 12: Maths and Physical Science Level 6 for BEng/BScEng.',
    requiredDocs: 'Grade 12 or university academic record, proof of registration if already studying, proof of home address. Online psychometric testing.',
    notes: 'Sasol Bursary Programme for 2027 study. Outcomes by end of September 2026. Work after graduation is part of the programme.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'sasol-foundation',
    name: 'Sasol Foundation Bursary',
    applyUrl: 'https://www.sasolbursaries.com',
    sourceUrl: 'https://sasol.com/media-centre/media-releases/sasol-foundation-invites-applications-2027-bursaries',
    applicationOpens: '2026-08-01',
    applicationCloses: '2026-08-23',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      '2027 undergraduate bursaries for learners/students from Sasol local communities, children of Sasol employees, and children of Sasol Khanyisa shareholders. Low-income and missing-middle households. Mainly STEM; limited Accounting and Financial Sciences.',
    notes: 'Sasol Foundation 2027 intake. Window was 1–23 August 2026.',
    offersJobAfterGrad: false,
  },
  {
    slug: 'sasol-mining-women',
    name: 'Sasol Mining Women in Fenceline Communities Bursary',
    provider: 'Sasol Mining',
    type: 'bursary',
    studyFields: ['engineering', 'science'],
    workSectors: ['corporate'],
    offersJobAfterGrad: true,
    createIfMissing: true,
    applyUrl: 'https://www.sasolbursaries.com',
    sourceUrl:
      'https://www.sasol.com/media-centre/media-releases/sasol-mining-opens-applications-women-fenceline-communities-bursary-programme',
    applicationOpens: '2026-08-24',
    applicationCloses: '2026-09-13',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    region: 'Mpumalanga',
    eligibility:
      'Women only, 25 or younger. Live within about 50 km of Sasol Mining Secunda and surrounding communities. Grade 12 or 1st–3rd year at an approved SA university. At least 70% Maths and Physical Science, 60% English. Electrical, Electronic, Mechanical or Mining Engineering; Geology; Mine Surveying.',
    notes: 'Closes midnight 13 September 2026. Separate from the main Sasol Bursary Programme.',
  },
  {
    slug: 'csir',
    applyUrl: 'https://bursaryconnect.csir.co.za',
    sourceUrl: 'https://www.csir.co.za/careers/students-graduates/bursaries',
    applicationOpens: null,
    applicationCloses: '2026-09-15',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate', 'honours', 'masters', 'phd'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'Full-time undergraduate or postgraduate in CSIR priority STEM fields at a local public university. Not permanently employed. Grade 12 STEM applicants: strong Maths and Physical Science (CSIR lists Level 6 preferred). University students must have passed all completed modules.',
    requiredDocs: 'Apply on CSIR Bursary Connect. Supporting documents as listed in the 2027 guidelines on the CSIR site.',
    notes: 'Call open for 2027 academic year; closes Tuesday 15 September 2026. Opening date not published on the bursaries page. Also a CSIR–Sasol Foundation undergraduate stream.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'sanral',
    applyUrl: 'https://www.nra.co.za/bursaries',
    sourceUrl: 'https://www.nra.co.za/bursaries',
    applicationOpens: '2026-07-01',
    applicationCloses: '2026-09-30',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate', 'honours'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'External bursary for 2027. Undergraduate: first year in 2027, 70% average; Civil Engineering, public procurement/SCM, Computer Science/Information Systems. Postgraduate NQF 8: 60% average in listed fields. Financial need considered. Other bursaries disqualify. SANRAL does not charge an application fee.',
    notes: 'SANRAL page: opening date 1 July, closing 30 September 2026. If no contact by 31 January 2027, treat as unsuccessful.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'nrf',
    applyUrl: 'https://nrfconnect.nrf.ac.za/',
    sourceUrl: 'https://www.nrf.ac.za/dsti-nrf-postgraduate-student-funding-for-the-2027-academic-year/',
    applicationOpens: '2026-07-07',
    applicationCloses: '2026-11-23',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['honours', 'masters', 'phd'],
    coverage: 'partial',
    region: 'nationwide',
    eligibility:
      'DSTI-NRF postgraduate funding for 2027. Honours (General) still open 7 July–23 November 2026. First-time Master’s and Doctoral student applications closed 3 July 2026. Apply via NRF Connect through your university.',
    notes:
      'Dates on this listing are the Honours (General) window, which is still open. SARAO and first-time Master’s/Doctoral windows for 2027 have already closed. Check the NRF call page for your level.',
    type: 'scholarship',
  },
  {
    slug: 'allan-gray',
    applyUrl: 'https://allangrayorbis.org/programmes/fellowship/',
    sourceUrl: 'https://allangrayorbis.org/programmes/fellowship/',
    applicationOpens: null,
    applicationCloses: '2026-04-30',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'Grade 12 in the application year, under 21, SA citizen. Min 60% Pure Maths or 80% Maths Literacy; 70% Grade 11 average excluding Life Orientation. Commerce, Science, Engineering, Law, Humanities, Arts, Health Sciences (not Medicine, Vet, Dentistry) at listed partner universities. Household income at or below R1 million: full funding; above that: needs-based.',
    requiredDocs: 'Certified final Grade 11 report and certified ID. Online or hand-delivery preferred.',
    notes: 'Official page: applications closed. Submit by 30 April 2026, 17:00 SAST. Opening date not published on the fellowship page.',
    offersJobAfterGrad: false,
  },
  {
    slug: 'absa',
    applyUrl: 'https://www.absa.africa/fellowship/',
    sourceUrl: 'https://www.absa.africa/corporate-citizenship/',
    applicationOpens: '2026-10-01',
    applicationCloses: '2027-03-31',
    nextExpectedOpens: '2026-10-01',
    datesConfirmed: true,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    region: 'nationwide',
    eligibility: 'Absa Fellowship Programme. 2026 funding cycle is closed. Next cycle opens 1 October 2026 and closes 31 March 2027.',
    notes: 'Official Absa Corporate Citizenship notice, checked 9 Sep 2026.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'chevening-sa',
    applyUrl: 'https://www.chevening.org/scholarship/south-africa/',
    sourceUrl: 'https://www.chevening.org/scholarships/application-timeline/',
    applicationOpens: '2026-08-04',
    applicationCloses: '2026-10-06',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['masters'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'UK government master’s scholarship. Typical rules: undergraduate degree, at least two years’ work experience, return home after studies. Apply on the Chevening site for South Africa.',
    notes: '2027/28 Chevening Scholarships: applications open 4 August 2026 11:00 UTC, close 6 October 2026 11:00 UTC.',
    type: 'scholarship',
  },
  {
    slug: 'fulbright',
    applyUrl: 'https://za.usembassy.gov/fulbright-foreign-student-program/',
    sourceUrl: 'https://za.usembassy.gov/fulbright-foreign-student-program/',
    applicationOpens: null,
    applicationCloses: '2026-04-08',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['masters', 'phd'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'South African citizen (or 5+ years permanent residence). Master’s or PhD in the US, or PhD visiting researcher. Not MBA or clinical medical/vet. Dual US citizenship or US residence not eligible.',
    notes: 'Embassy page: 2027–28 Foreign Student Program applications are closed. Close was midnight SAST 8 April 2026. Opening date not published on that page.',
    type: 'scholarship',
  },
  {
    slug: 'shoprite',
    applyUrl: 'https://www.shopriteholdings.co.za/careers/youth-opportunities.html',
    sourceUrl: 'https://www.shopriteholdings.co.za/newsroom/2026/shoprite-bursary-applications.html',
    applicationOpens: null,
    applicationCloses: '2026-05-31',
    nextExpectedOpens: null,
    datesConfirmed: true,
    studyLevels: ['undergraduate', 'honours'],
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'SA youth under 27, registered for undergraduate or postgraduate study at an accredited university. Fields include retail business management, accounting, supply chain/logistics, biological and agricultural sciences. Work-back with Shoprite Group.',
    notes:
      'Last published close for the 2026 programme: 31 May 2026. Youth page says windows often run Feb–May and again July–September — no 2026 date was published for a second 2026 window as of 9 Sep 2026.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'eskom-engineering',
    applyUrl: 'https://www.eskom.co.za/careers/',
    sourceUrl: 'https://www.eskom.co.za/careers/',
    applicationOpens: null,
    applicationCloses: null,
    nextExpectedOpens: null,
    datesConfirmed: false,
    eligibility:
      'Eskom awards engineering and STEM bursaries, but the recruitment website was unavailable on 9 Sep 2026. No public 2027 application window was published on that careers page.',
    notes:
      'Do not treat the old catalogue close date as official. Careers portal: temporarily unavailable; applicants cannot create profiles. Watch eskom.co.za.',
  },
  {
    slug: 'transnet-engineering',
    applyUrl: 'https://www.transnet.net/YouthDevelopmentProgrammes',
    sourceUrl: 'https://www.transnet.net/YouthDevelopmentProgrammes',
    applicationOpens: null,
    applicationCloses: null,
    nextExpectedOpens: null,
    datesConfirmed: false,
    eligibility:
      'Full-time bursaries according to Transnet’s needs. Technical (engineering) and non-technical degrees. Work-back: one year of service per funded year. Comprehensive cover: tuition, accommodation, meals, books, experiential training.',
    notes:
      'Official page still offered a “Bursary Application Form - 2025” on 9 Sep 2026. No 2026/2027 closing date published. Do not invent a date.',
    offersJobAfterGrad: true,
  },
  {
    slug: 'thuthuka-saica',
    applyUrl: 'https://www.thuthukabursaryfund.co.za/',
    sourceUrl: 'https://www.thuthukabursaryfund.co.za/',
    applicationOpens: null,
    applicationCloses: null,
    nextExpectedOpens: null,
    datesConfirmed: false,
    studyLevels: ['undergraduate'],
    coverage: 'full',
    eligibility:
      'Only students who want to become a Chartered Accountant. Academic performance, NBT, and NSFAS means test. Contract with Thuthuka Education and Upliftment Fund and NSFAS if successful.',
    requiredDocs:
      'Signed consent form, applicant ID, parent/guardian IDs and salary slips, IDs of dependants, Grade 11 results, Grade 12 if completed, university transcript if already at university, provisional acceptance if still in school.',
    notes:
      'Official portal lists documents and CA-stream rules but did not display a 2027 closing date on 9 Sep 2026. Third-party sites quoting 31 August were not used.',
  },
  {
    slug: 'isfap',
    applyUrl: 'https://applyonline.isfap.org.za/',
    sourceUrl: 'https://www.isfap.org.za/students',
    applicationOpens: null,
    applicationCloses: null,
    nextExpectedOpens: null,
    datesConfirmed: false,
    coverage: 'full',
    region: 'nationwide',
    eligibility:
      'SA citizen or permanent resident. Accredited SA university. Occupation of High Demand (e.g. actuarial, accounting, data science, engineering, IT, medicine, nursing). Financial need via means test. Academic performance standards.',
    notes: 'Official student page has Apply Now but no opening or closing date as of 9 Sep 2026. Do not invent dates.',
  },
]
