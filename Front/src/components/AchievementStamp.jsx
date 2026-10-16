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

export const AchievementIcon = ({ id }) => (
  <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {(ICONS[id] || []).map((d) => (
      <path key={d} d={d} />
    ))}
  </g>
)

// SVG filter that roughens edges and eats little gaps in the ink, like a real rubber stamp.
// Rendered once (see AchievementsProvider).
export const InkFilter = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
    <filter id="bm-ink" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.6" result="rough" />
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="2" result="speckle" />
      <feColorMatrix in="speckle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="wear" />
      <feComposite in="rough" in2="wear" operator="in" />
    </filter>
  </svg>
)

// Round postmark-style stamp: double ring, text around it and the icon in the middle
const AchievementStamp = ({ id, locked = false, className = '' }) => {
  const ring = `ring-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 100 100" className={`stamp${locked ? ' stamp--locked' : ''} ${className}`} aria-hidden="true">
      <defs>
        <path id={ring} d="M50 50 m-32 0 a32 32 0 1 1 64 0 a32 32 0 1 1 -64 0" />
      </defs>
      <g filter={locked ? undefined : 'url(#bm-ink)'}>
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={locked ? '4 5' : undefined} />
        <circle cx="50" cy="50" r="39.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
        {!locked && (
          <text className="stamp__ring-text" fill="currentColor">
            <textPath href={`#${ring}`} textLength="199" lengthAdjust="spacing">
              BERNARDO MENESES · PORTFOLIO · 2026 ·
            </textPath>
          </text>
        )}
        <g transform="translate(36.8 36.8) scale(1.1)">
          <AchievementIcon id={id} />
        </g>
      </g>
    </svg>
  )
}

export default AchievementStamp
