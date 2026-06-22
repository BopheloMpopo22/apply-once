import type { CareerAgency } from '../../types/careerHub'

type CareerAgenciesPanelProps = {
  agencies: CareerAgency[]
}

function scopeLabel(scope: CareerAgency['scope']) {
  if (scope === 'south-africa') return '🇿🇦 SA jobs'
  if (scope === 'abroad') return '🌍 Abroad'
  return '🇿🇦 + 🌍 Both'
}

export function CareerAgenciesPanel(props: CareerAgenciesPanelProps) {
  const { agencies } = props

  return (
    <section className="careerSidePanel careerAgenciesPanel" aria-labelledby="career-agencies-heading">
      <h2 id="career-agencies-heading" className="careerSidePanelTitle">
        🤝 Agencies & job help
      </h2>
      <p className="careerSidePanelLead muted">
        Find jobs in SA or abroad — placement, advising, and official portals.
      </p>
      <ul className="careerAgenciesList">
        {agencies.map((agency) => (
          <li key={agency.id} className="careerAgencyCard">
            <div className="careerAgencyHead">
              <strong>{agency.shortName}</strong>
              <span className="careerAgencyScope">{scopeLabel(agency.scope)}</span>
            </div>
            <p className="careerAgencySummary">{agency.summary}</p>
            <a className="careerAgencyLink" href={agency.website} target="_blank" rel="noopener noreferrer">
              Visit site →
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
