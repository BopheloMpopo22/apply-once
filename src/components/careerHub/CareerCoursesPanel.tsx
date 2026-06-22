import { useMemo, useState } from 'react'
import type { CourseEntry } from '../../types/hubs'
import { COURSE_CATEGORY_LABELS } from '../../types/hubs'

type CareerCoursesPanelProps = {
  courses: CourseEntry[]
}

export function CareerCoursesPanel(props: CareerCoursesPanelProps) {
  const { courses } = props
  const [openId, setOpenId] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, CourseEntry[]>()
    for (const c of courses) {
      const label = COURSE_CATEGORY_LABELS[c.category]
      const list = map.get(label) ?? []
      list.push(c)
      map.set(label, list)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [courses])

  return (
    <section className="careerSidePanel" aria-labelledby="career-courses-heading">
      <h2 id="career-courses-heading" className="careerSidePanelTitle">
        📚 Courses to level up
      </h2>
      <p className="careerSidePanelLead muted">
        Free & paid skills — Google, AWS, coding, and more (not matric or varsity).
      </p>
      <div className="careerCoursesList">
        {grouped.map(([category, items]) => (
          <details key={category} className="careerCoursesGroup" open={openId === category}>
            <summary
              onClick={(e) => {
                e.preventDefault()
                setOpenId((prev) => (prev === category ? null : category))
              }}
            >
              {category} <span className="muted">({items.length})</span>
            </summary>
            <ul>
              {items.map((c) => (
                <li key={c.id}>
                  <a href={c.website} target="_blank" rel="noopener noreferrer">
                    <strong>{c.shortName}</strong>
                  </a>
                  <span className="muted"> · {c.cost}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  )
}
