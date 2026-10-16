import React, { useId } from 'react'

// Hand-drawn 24×24 line icons, one per achievement (stroke only, no fills)
const ICONS = {
  opened: ['M3 18V6h6l2 2h7v3', 'M3 18l3-7h15l-3 7z'],
  holo: ['M11 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z', 'M19 2v4', 'M17 4h4'],
  polyglot: ['M3 4h11v8H8l-4 3v-3H3z', 'M14 8h6v8h-1v3l-3-3h-4v-3'],
  paper: ['M6 3h9l4 4v14H6z', 'M15 3v4h4', 'M9 12h7', 'M9 16h5'],
  collector: ['M7 9a5 5 0 0 1 10 0v11H7z', 'M9.5 6.5V4h5v2.5', 'M7 13h10', 'M10 13v3h4v-3'],
  archivist: ['M5 3h14v18H5z', 'M5 12h14', 'M10 7h4', 'M10 16h4'],
  firstBlood: ['M12 8c3 0 4 3 4 6s-1.5 6-4 6-4-3-4-6 1-6 4-6z', 'M10 8a2 2 0 0 1 4 0', 'M12 11v9', 'M8 12H4', 'M8 16l-4 2', 'M16 12h4', 'M16 16l4 2', 'M10 7L7 4', 'M14 7l3-3'],
  exterminator: ['M13 3l7 7-3 3-7-7z', 'M11.5 8.5L3 17l3 3 8.5-8.5'],
  guest: ['M4 20l1-4L16 5l3 3L8 19z', 'M14 7l3 3', 'M13 20h7'],
  reader: ['M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z', 'M12 6v14'],
  cheater: ['M6 8h12a4 4 0 0 1 4 4v1a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-1a4 4 0 0 1 4-4z', 'M7 10.5v3', 'M5.5 12h3', 'M16 11h.01', 'M18 13h.01'],
}

const LOCK = ['M8 11V8a4 4 0 0 1 8 0v3', 'M6 11h12v9H6z', 'M12 14.5v2']

const HEX = '50,4 90,27 90,73 50,96 10,73 10,27'
const HEX_INNER = '50,14 81,32 81,68 50,86 19,68 19,32'

const Icon = ({ paths }) => (
  <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </g>
)

// Hexagonal achievement medal tinted by rarity (the colour comes from CSS `color`)
const AchievementBadge = ({ id, locked = false, className = '' }) => {
  const fill = `badge-fill-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 100 100" className={`badge${locked ? ' badge--locked' : ''} ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="#1a0f33" />
        </linearGradient>
      </defs>
      <polygon points={HEX} fill={`url(#${fill})`} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points={HEX_INNER} className="badge__core" stroke="currentColor" strokeWidth="1" strokeOpacity="0.55" strokeLinejoin="round" />
      {/* top-left facet catches the light */}
      <polygon points="50,14 19,32 50,50" className="badge__facet" />
      <g className="badge__icon" transform="translate(34.4 34.4) scale(1.3)">
        <Icon paths={locked ? LOCK : ICONS[id] || []} />
      </g>
    </svg>
  )
}

export default AchievementBadge
