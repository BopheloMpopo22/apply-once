import fs from 'node:fs'
import path from 'node:path'

const outDir = path.join('public', 'assets', 'universities')

const badges = [
  { id: 'ufh', label: 'UFH', from: '#7c2d12', to: '#ea580c' },
  { id: 'wsu', label: 'WSU', from: '#1e3a8a', to: '#3b82f6' },
  { id: 'univen', label: 'UV', from: '#166534', to: '#22c55e' },
  { id: 'unizulu', label: 'UZ', from: '#581c87', to: '#a855f7' },
  { id: 'smu', label: 'SMU', from: '#0f766e', to: '#14b8a6' },
  { id: 'ump', label: 'UMP', from: '#92400e', to: '#f59e0b' },
  { id: 'spu', label: 'SPU', from: '#be123c', to: '#fb7185' },
  { id: 'dut', label: 'DUT', from: '#1d4ed8', to: '#60a5fa' },
  { id: 'cut', label: 'CUT', from: '#4338ca', to: '#818cf8' },
  { id: 'mut', label: 'MUT', from: '#115e59', to: '#2dd4bf' },
]

function svgFor(label, from, to, gradId) {
  const fontSize = label.length > 3 ? 22 : 28
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}" />
      <stop offset="1" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#${gradId})" />
  <text x="60" y="78" text-anchor="middle" font-family="Inter,Segoe UI,Arial" font-size="${fontSize}" font-weight="900" fill="#ffffff">${label}</text>
</svg>
`
}

for (const b of badges) {
  const file = path.join(outDir, `${b.id}.svg`)
  fs.writeFileSync(file, svgFor(b.label, b.from, b.to, `g${b.id}`))
  console.log('wrote', file)
}
