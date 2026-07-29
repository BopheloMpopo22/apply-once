import { useMemo, useState } from 'react'
import {
  JOB_SEARCH_CATEGORY_LABELS,
  JOB_SEARCH_CATEGORY_ORDER,
  type JobSearchLink,
  type JobSearchLinkCategory,
} from '../../data/careerHub/jobSearchLinksData'

type CareerJobSearchLinksPanelProps = {
  links: JobSearchLink[]
}

export function CareerJobSearchLinksPanel(props: CareerJobSearchLinksPanelProps) {
  const { links } = props
  const [openCategory, setOpenCategory] = useState<JobSearchLinkCategory | null>('south-africa')

  const grouped = useMemo(() => {
    return JOB_SEARCH_CATEGORY_ORDER.map((category) => ({
      category,
      label: JOB_SEARCH_CATEGORY_LABELS[category],
      items: links.filter((link) => link.category === category),
    })).filter((group) => group.items.length > 0)
  }, [links])

  return (
    <section className="careerSidePanel careerJobSearchPanel" aria-labelledby="career-job-search-heading">
      <h2 id="career-job-search-heading" className="careerSidePanelTitle">
        🔗 Links to help you find jobs
      </h2>
      <p className="careerSidePanelLead muted">
        Apply Once can’t list every job in South Africa. Use these trusted sites to search more vacancies —
        locally, remote, and overseas.
      </p>
      <div className="careerJobSearchList">
        {grouped.map((group) => (
          <details
            key={group.category}
            className="careerJobSearchGroup"
            open={openCategory === group.category}
          >
            <summary
              onClick={(e) => {
                e.preventDefault()
                setOpenCategory((prev) => (prev === group.category ? null : group.category))
              }}
            >
              {group.label} <span className="muted">({group.items.length})</span>
            </summary>
            <ul>
              {group.items.map((link) => (
                <li key={link.id} className="careerJobSearchItem">
                  <a href={link.website} target="_blank" rel="noopener noreferrer">
                    <strong>{link.shortName}</strong>
                  </a>
                  <p className="muted">{link.blurb}</p>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  )
}
