export function StudentsHugIllustration() {
  // Simple inline SVG illustration (no external assets needed).
  return (
    <svg
      className="studentsSvg"
      viewBox="0 0 520 320"
      role="img"
      aria-label="Three students in black and white uniforms hugging"
    >
      <defs>
        <linearGradient id="aoBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.08" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0b1220" floodOpacity="0.16" />
        </filter>
      </defs>

      {/* background */}
      <rect x="18" y="18" width="484" height="284" rx="28" fill="url(#aoBlue)" />
      <rect x="18" y="18" width="484" height="284" rx="28" fill="none" stroke="#1d4ed8" strokeOpacity="0.25" />

      {/* ground */}
      <path d="M70 265C130 235 196 222 260 222c64 0 130 13 190 43" fill="none" stroke="#0f172a" strokeOpacity="0.15" strokeWidth="10" strokeLinecap="round" />

      {/* group */}
      <g filter="url(#softShadow)">
        {/* left student */}
        <g transform="translate(120 72)">
          <circle cx="70" cy="58" r="34" fill="#f5d0c5" />
          <path d="M44 56c9-18 23-28 44-30c18 2 31 11 39 26c-12-3-25-5-39-5c-15 0-29 3-44 9Z" fill="#111827" />
          <path d="M36 148c6-36 25-54 58-54s52 18 58 54c-19 15-40 22-58 22s-39-7-58-22Z" fill="#0f172a" />
          <path d="M60 114h64v44c-10 7-22 11-32 11s-22-4-32-11v-44Z" fill="#f8fafc" />
          <path d="M60 114h64v16H60z" fill="#111827" />
          {/* arm to hug */}
          <path d="M26 140c18-16 40-22 64-18" fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
        </g>

        {/* center student */}
        <g transform="translate(210 50)">
          <circle cx="70" cy="70" r="38" fill="#f5d0c5" />
          <path d="M30 78c6-30 22-47 48-52c31 6 48 25 52 56c-16-8-33-12-52-12c-18 0-34 3-48 8Z" fill="#111827" />
          <path d="M28 188c8-44 31-66 72-66s64 22 72 66c-22 18-48 27-72 27s-50-9-72-27Z" fill="#111827" />
          <path d="M52 142h72v52c-12 9-25 13-36 13s-24-4-36-13v-52Z" fill="#f8fafc" />
          <path d="M52 142h72v18H52z" fill="#0f172a" />
          {/* arms around */}
          <path d="M20 176c24-22 56-30 92-24" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />
          <path d="M160 176c-24-22-56-30-92-24" fill="none" stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />
        </g>

        {/* right student */}
        <g transform="translate(320 72)">
          <circle cx="70" cy="58" r="34" fill="#f5d0c5" />
          <path d="M92 56c-9-18-23-28-44-30c-18 2-31 11-39 26c12-3 25-5 39-5c15 0 29 3 44 9Z" fill="#111827" />
          <path d="M36 148c6-36 25-54 58-54s52 18 58 54c-19 15-40 22-58 22s-39-7-58-22Z" fill="#0f172a" />
          <path d="M60 114h64v44c-10 7-22 11-32 11s-22-4-32-11v-44Z" fill="#f8fafc" />
          <path d="M60 114h64v16H60z" fill="#111827" />
          {/* arm to hug */}
          <path d="M154 140c-18-16-40-22-64-18" fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
        </g>
      </g>

      {/* small accent */}
      <path
        d="M82 86c18-28 44-46 78-54"
        fill="none"
        stroke="#1d4ed8"
        strokeWidth="8"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />
    </svg>
  )
}

