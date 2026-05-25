export type HubSectionNavItem = {
  id: string
  label: string
  count?: number
}

export function HubSectionNav(props: { items: HubSectionNavItem[]; ariaLabel: string }) {
  if (props.items.length === 0) return null

  function scrollToSection(sectionId: string) {
    const el = document.getElementById(sectionId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="hubSectionNav" aria-label={props.ariaLabel}>
      <p className="hubSectionNavHint">Jump to a section on this page</p>
      <div className="hubSectionNavChips">
        {props.items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="hubSectionNavChip"
            onClick={() => scrollToSection(item.id)}
          >
            <span className="hubSectionNavChipLabel">{item.label}</span>
            {item.count != null ? (
              <span className="hubSectionNavChipCount" aria-hidden>
                {item.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  )
}

export function hubSectionId(categoryId: string) {
  return `hub-section-${categoryId}`
}
