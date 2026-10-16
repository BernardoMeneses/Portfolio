import React, { useEffect, useRef, useState } from 'react'
import { useI18n } from '../context/Preferences'
import { useAchievements } from '../context/Achievements'
import './Styles/DuelCard.scss'

const LEVEL = 8
const ATK = 4096
const DEF = 2048

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// A Yu-Gi-Oh!-style Fusion Monster card (purple frame to match the site). Starts face-down, gets Special Summoned
// (flips face-up) the first time it scrolls into view, and can be flipped by clicking.
const DuelCard = ({ image }) => {
  const { t } = useI18n()
  const { unlock } = useAchievements()
  const cardRef = useRef(null)
  const frame = useRef(0)
  const travel = useRef(0)
  const lastPoint = useRef(null)
  const [faceUp, setFaceUp] = useState(prefersReducedMotion)
  const [summoning, setSummoning] = useState(false)
  const summoned = useRef(prefersReducedMotion())

  useEffect(() => {
    const el = cardRef.current
    if (!el || summoned.current) return undefined
    let timer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        timer = setTimeout(() => {
          summoned.current = true
          setFaceUp(true)
          setSummoning(true)
          timer = setTimeout(() => setSummoning(false), 1600)
        }, 450)
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])

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
    if (travel.current > 400 && faceUp) unlock('holo')

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
      card.style.setProperty('--rx', `${((0.5 - py) * 16).toFixed(2)}deg`)
      card.style.setProperty('--ry', `${((px - 0.5) * 20).toFixed(2)}deg`)
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

  const flip = () => {
    summoned.current = true
    setFaceUp((up) => !up)
  }

  return (
    <div className="duel-card-wrap">
      {summoning && (
        <span className="duel-card__summon-text" aria-hidden="true">
          {t('card.summon')}
        </span>
      )}

      <button
        ref={cardRef}
        type="button"
        className={`duel-card${faceUp ? ' is-face-up' : ''}${summoning ? ' is-summoning' : ''}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={flip}
        aria-pressed={faceUp}
        aria-label={`${t('card.name')} — ${t('card.flip')}`}
      >
        <span className="duel-card__inner">
          {/* ---------- Front ---------- */}
          <span className="duel-card__face duel-card__front" aria-hidden={!faceUp}>
            <span className="duel-card__namebar">
              <span className="duel-card__name">{t('card.name')}</span>
              <span className="duel-card__attribute" title={t('card.attribute')}>闇</span>
            </span>

            <span className="duel-card__stars" aria-label={`Level ${LEVEL}`}>
              {Array.from({ length: LEVEL }, (_, i) => (
                <span key={i} className="duel-card__star" style={{ '--i': i }}>★</span>
              ))}
            </span>

            <span className="duel-card__art">
              <img src={image} alt="Bernardo Meneses" draggable="false" />
              <span className="duel-card__art-holo" />
            </span>

            <span className="duel-card__set">BMDV-PT001</span>

            <span className="duel-card__textbox">
              <span className="duel-card__type">{t('card.typeLine')}</span>
              <span className="duel-card__effect">
                <span className="duel-card__materials">{t('card.materials')}</span>
                {t('card.effect')}
              </span>
              <span className="duel-card__stats">
                ATK/<b>{ATK}</b> DEF/<b>{DEF}</b>
              </span>
            </span>

            <span className="duel-card__footer">
              <span>2026 0001</span>
              <span>© Bernardo Meneses</span>
              <span className="duel-card__seal" />
            </span>

            <span className="duel-card__sparkle" />
            <span className="duel-card__glare" />
          </span>

          {/* ---------- Back ---------- */}
          <span className="duel-card__face duel-card__back" aria-hidden={faceUp}>
            <span className="duel-card__well">
              <span className="duel-card__vortex" />
            </span>
            <span className="duel-card__oval">
              <small>DEV · DUEL</small>
              <strong>BM</strong>
              <small>{t('card.flip')}</small>
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}

export default DuelCard
