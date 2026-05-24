import { LEARNERSHIPS_BY_POPULARITY } from '../../data/hubs/learnershipsData'
import type { HubMeta } from '../../types/hubs'
import { HubDirectoryHub } from './HubDirectoryHub'

export function LearnershipsHub(props: { hub: HubMeta }) {
  return (
    <HubDirectoryHub
      hub={props.hub}
      config={{
        entries: LEARNERSHIPS_BY_POPULARITY,
        bannerTitle: `${LEARNERSHIPS_BY_POPULARITY.length} learnerships & earn-while-you-learn programmes`,
        bannerText:
          'SETA portals, corporate learnerships (Sasol, Eskom, Transnet), and government routes — matric-friendly pathways to NQF qualifications with a monthly stipend. Never pay to apply.',
        listHeadingSingular: 'learnership',
        listHeadingPlural: 'learnerships',
        searchPlaceholder: 'SETA, sector, or employer…',
        sectionId: 'learnerships-list-heading',
        wideCards: true,
      }}
    />
  )
}
