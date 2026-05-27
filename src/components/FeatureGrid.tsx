import { useState } from 'react'

type Feature = {
  title: string
  description: string
  icon: React.ReactNode
  learnMoreHref?: string
}

export function FeatureGrid(props: { features: Feature[]; columns?: 3 | 4 }) {
  const columns = props.columns ?? 3
  const [activeTitle, setActiveTitle] = useState<string | null>(null)

  return (
    <div className={columns === 4 ? 'featureGrid featureGrid4' : 'featureGrid featureGrid3'}>
      {props.features.map((f) => (
        <button
          key={f.title}
          type="button"
          className={activeTitle === f.title ? 'featureCard featureCardActive animateIn' : 'featureCard animateIn'}
          onClick={() => setActiveTitle((prev) => (prev === f.title ? null : f.title))}
        >
          <div className="featureIcon" aria-hidden="true">
            {f.icon}
          </div>
          <div className="featureTitle">{f.title}</div>
          <div className="featureText">{f.description}</div>
          <div className="featureActions">
            <a className="featureLearnMore" href={f.learnMoreHref ?? '/#features'} onClick={(e) => e.stopPropagation()}>
              Learn more
            </a>
          </div>
        </button>
      ))}
    </div>
  )
}

