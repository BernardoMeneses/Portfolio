import React, { useRef } from 'react'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import './Styles/PlayerCard.scss'

// Tweak these freely – they are the "character sheet" shown on the card.
const STATS = [
  { key: 'frontend', value: 88 },
  { key: 'backend', value: 78 },
  { key: 'mobile', value: 70 },
  { key: 'coffee', value: 99 },
]

const PlayerCard = ({ image }) => {
  const { t } = useI18n()
  const { unlock } = useAchievements()
  const cardRef = useRef(null)
  const frame = useRef(0)
  const travel = useRef(0)
  const lastPoint = useRef(null)

  const handlePointerMove = (e) => {
    const card = cardRef.current
    if (!card || e.pointerType === 'touch') return
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    // A proper tilt (not a fly-by) earns the achievement
    if (lastPoint.current) {
      travel.current += Math.abs(e.clientX - lastPoint.current.x) + Math.abs(e.clientY - lastPoint.current.y)
    }
    lastPoint.current = { x: e.clientX, y: e.clientY }
    if (travel.current > 400) unlock('holo')

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      card.style.setProperty('--rx', `${((0.5 - py) * 18).toFixed(2)}deg`)
      card.style.setProperty('--ry', `${((px - 0.5) * 22).toFixed(2)}deg`)
      card.classList.add('is-active')
    })
  }

  const handlePointerLeave = () => {
    const card = cardRef.current
    if (!card) return
    cancelAnimationFrame(frame.current)
    travel.current = 0
    lastPoint.current = null
    card.classList.remove('is-active')
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="player-card-wrap">
      <div
        ref={cardRef}
        className="player-card"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <div className="player-card__face">
          <header className="player-card__head">
            <span className="player-card__name">Bernardo</span>
            <span className="player-card__lvl">
              <small>LVL</small>23
            </span>
          </header>

          <div className="player-card__art">
            <img src={image} alt="Bernardo Meneses" />
            <span className="player-card__type">{t('card.type')}</span>
          </div>

          <p className="player-card__meta">{t('card.meta')}</p>

          <ul className="player-card__stats">
            {STATS.map((stat, i) => (
              <li key={stat.key} style={{ '--value': stat.value, '--i': i }}>
                <span>{t(`card.stats.${stat.key}`)}</span>
                <span className="player-card__bar" />
                <b>{stat.value}</b>
              </li>
            ))}
          </ul>

          <div className="player-card__ability">
            <strong>{t('card.abilityTitle')}</strong>
            <p>{t('card.ability')}</p>
          </div>

          <footer className="player-card__foot">
            <span>#001 · Penafiel, PT</span>
            <span>{t('card.rarity')}</span>
          </footer>
        </div>

        <div className="player-card__holo" aria-hidden="true" />
        <div className="player-card__glare" aria-hidden="true" />
      </div>
    </div>
  )
}

export default PlayerCard
