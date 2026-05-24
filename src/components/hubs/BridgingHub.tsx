import { BRIDGING_BY_POPULARITY } from '../../data/hubs/bridgingData'
import type { HubMeta } from '../../types/hubs'
import { HubDirectoryHub } from './HubDirectoryHub'

export function BridgingHub(props: { hub: HubMeta }) {
  return (
    <HubDirectoryHub
      hub={props.hub}
      config={{
        entries: BRIDGING_BY_POPULARITY,
        bannerTitle: `${BRIDGING_BY_POPULARITY.length} bridging & extended programmes`,
        bannerText:
          'University extended degrees, foundation years, SciMathUS, and UNISA higher certificates — for students who need an extra year or lower APS entry route into their target qualification.',
        listHeadingSingular: 'programme',
        listHeadingPlural: 'programmes',
        searchPlaceholder: 'University, faculty, or programme type…',
        sectionId: 'bridging-list-heading',
        wideCards: true,
      }}
    />
  )
}
