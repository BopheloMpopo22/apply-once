export function Section(props: {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="section" id={props.id}>
      <div className="container">
        <div className="sectionHeader animateIn">
          <div className="eyebrow">{props.eyebrow}</div>
          <h2 className="sectionTitle">{props.title}</h2>
          <p className="sectionSubtitle">{props.subtitle}</p>
        </div>
        <div className="sectionBody">{props.children}</div>
      </div>
    </section>
  )
}

