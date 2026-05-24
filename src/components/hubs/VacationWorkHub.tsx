import { VACATION_WORK_BY_POPULARITY } from '../../data/hubs/vacationWorkData'
import type { HubMeta } from '../../types/hubs'
import { HubDirectoryHub } from './HubDirectoryHub'

export function VacationWorkHub(props: { hub: HubMeta }) {
  return (
    <HubDirectoryHub
      hub={props.hub}
      config={{
        entries: VACATION_WORK_BY_POPULARITY,
        bannerTitle: `${VACATION_WORK_BY_POPULARITY.length} vacation work & internship programmes`,
        bannerText:
          'Big 4 vacation work, bank internships, SOE programmes, and research placements — build your CV during university holidays. Most require penultimate-year status.',
        listHeadingSingular: 'programme',
        listHeadingPlural: 'programmes',
        searchPlaceholder: 'Company, industry, or season…',
        sectionId: 'vacation-list-heading',
        wideCards: true,
      }}
    />
  )
}
