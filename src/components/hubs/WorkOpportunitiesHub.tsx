import { WORK_OPPORTUNITIES_BY_POPULARITY } from '../../data/hubs/workOpportunitiesData'
import type { HubMeta } from '../../types/hubs'
import { HubDirectoryHub } from './HubDirectoryHub'

export function WorkOpportunitiesHub(props: { hub: HubMeta }) {
  return (
    <HubDirectoryHub
      hub={props.hub}
      config={{
        entries: WORK_OPPORTUNITIES_BY_POPULARITY,
        bannerTitle: `${WORK_OPPORTUNITIES_BY_POPULARITY.length} work pathways & programmes`,
        bannerText:
          'Careers that do not always need a four-year degree — au pair, hospitality, aviation, retail, trades, and gap-year options in SA and abroad. Official links only.',
        listHeadingSingular: 'opportunity',
        listHeadingPlural: 'opportunities',
        searchPlaceholder: 'Role, industry, or country…',
        sectionId: 'work-list-heading',
        wideCards: true,
      }}
    />
  )
}
