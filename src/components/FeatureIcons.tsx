type IconProps = { className?: string; title?: string }

function IconBase(props: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 64 64"
      role="img"
      aria-label={props.title}
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        {props.children}
      </g>
    </svg>
  )
}

export function IconClipboardCheck(props: IconProps) {
  return (
    <IconBase {...props} title={props.title ?? 'Application form icon'}>
      <path d="M20 14h24a6 6 0 0 1 6 6v30a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" />
      <path d="M24 14a8 8 0 0 1 16 0" />
      <path d="M22 30h10" />
      <path d="M22 38h10" />
      <path d="M38 39l4 4 8-10" />
    </IconBase>
  )
}

export function IconCalculator(props: IconProps) {
  return (
    <IconBase {...props} title={props.title ?? 'Calculator icon'}>
      <path d="M18 12h28a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" />
      <path d="M20 20h24" />
      <path d="M22 30h8" />
      <path d="M34 30h8" />
      <path d="M22 40h8" />
      <path d="M34 40h8" />
      <path d="M22 50h20" />
    </IconBase>
  )
}

export function IconExam(props: IconProps) {
  return (
    <IconBase {...props} title={props.title ?? 'Exam icon'}>
      <path d="M18 14h28a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" />
      <path d="M22 26h20" />
      <path d="M22 34h14" />
      <path d="M22 42h10" />
      <path d="M44 32l6-6" />
      <path d="M44 26l6 6" />
    </IconBase>
  )
}

export function IconCourses(props: IconProps) {
  return (
    <IconBase {...props} title={props.title ?? 'Courses icon'}>
      <path d="M16 20h20a6 6 0 0 1 6 6v18a0 0 0 0 1 0 0H22a6 6 0 0 0-6 6V20a0 0 0 0 1 0 0Z" />
      <path d="M42 20h6a4 4 0 0 1 4 4v26a6 6 0 0 0-6-6h-4" />
      <path d="M22 28h14" />
      <path d="M22 36h10" />
    </IconBase>
  )
}

export function IconGrid(props: IconProps) {
  return (
    <IconBase {...props} title={props.title ?? 'Opportunities icon'}>
      <path d="M18 18h12v12H18z" />
      <path d="M34 18h12v12H34z" />
      <path d="M18 34h12v12H18z" />
      <path d="M34 34h12v12H34z" />
    </IconBase>
  )
}

export function IconBriefcase(props: IconProps) {
  return (
    <IconBase {...props} title={props.title ?? 'Work icon'}>
      <path d="M22 20v-4a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v4" />
      <path d="M14 24h36a4 4 0 0 1 4 4v18a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V28a4 4 0 0 1 4-4Z" />
      <path d="M14 34h40" />
      <path d="M30 34v6h4v-6" />
    </IconBase>
  )
}

