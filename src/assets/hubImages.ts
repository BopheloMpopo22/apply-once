import type { HubSlug } from '../types/hubs'
import admissionsTestImg from './Admissions-Test.png'
import bridgingImg from './Bridging-programs.png'
import collegesImg from './Colleges and TVET.png'
import coursesImg from './Courses and skills.png'
import learnershipsImg from './Learnerships.png'
import studyAbroadImg from './Studying-abroad.png'
import universitiesImg from './University-Admissions.png'
import vacationWorkImg from './Vacation Work and Internships.png'
import workOpportunitiesImg from './Work-opportunity.png'

export const HUB_CARD_IMAGES: Record<HubSlug, string> = {
  universities: universitiesImg,
  colleges: collegesImg,
  'admissions-tests': admissionsTestImg,
  'study-abroad': studyAbroadImg,
  courses: coursesImg,
  'work-opportunities': workOpportunitiesImg,
  bridging: bridgingImg,
  learnerships: learnershipsImg,
  'vacation-work': vacationWorkImg,
}
