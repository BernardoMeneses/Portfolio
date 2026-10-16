import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ACHIEVEMENTS, useAchievements } from '../context/Achievements'
import { useI18n } from '../context/Preferences'
import AchievementBadge from './AchievementBadge'

const SEEN_KEY = 'bm:trophies-seen'

// How many unlocks the visitor has already looked at (-1 = never opened the panel)
const readSeen = () => {
  try {
    const value = localStorage.getItem(SEEN_KEY)
    return value === null ? -1 : Number(value) || 0
  } catch (error) {
    return -1
  }
}

const HexIcon = () => (
  <svg viewBox="0 0 24 24" className="trophy-trigger__hex" aria-hidden="true">
    <polygon points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8.6 12.3l2.3 2.3 4.5-4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Navbar badge with progress + the achievements panel
const TrophyCase = () => {
  const { t } = useI18n()
  const { unlocked } = useAchievements()
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(readSeen)
  const [bump, setBump] = useState(false)
  const closeRef = useRef(null)
  const triggerRef = useRef(null)
  const previousCount = useRef(unlocked.length)

  // Little jump on the badge every time something unlocks
  useEffect(() => {
    if (unlocked.length <= previousCount.current) return undefined
    previousCount.current = unlocked.length
    setBump(true)
    const timer = setTimeout(() => setBump(false), 900)
    return () => clearTimeout(timer)
  }, [unlocked.length])

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      triggerRef.current?.focus()
    }
  }, [open])

  const openPanel = () => {
    setOpen(true)
    setSeen(unlocked.length)
    try {
      localStorage.setItem(SEEN_KEY, String(unlocked.length))
    } catch (error) {
      // fine, the dot just comes back next visit
    }
  }

  const total = ACHIEVEMENTS.length
  const hasNews = seen < 0 || unlocked.length > seen
  const percent = Math.round((unlocked.length / total) * 100)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`trophy-trigger${bump ? ' is-bumped' : ''}`}
        onClick={openPanel}
        title={t('achievements.button')}
        aria-label={`${t('achievements.button')}: ${t('achievements.progress', { count: unlocked.length, total })}`}
      >
        <HexIcon />
        <span className="trophy-trigger__count">
          {unlocked.length}<span>/{total}</span>
        </span>
        {hasNews && <span className="trophy-trigger__dot" aria-hidden="true" />}
      </button>

      {/* Portalled: the navbar's backdrop-filter would otherwise trap the fixed overlay */}
      {open && createPortal(
        <div className="trophy-overlay" onClick={() => setOpen(false)}>
          <div
            className="ach-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ach-panel-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="ach-panel__head">
              <div>
                <h3 id="ach-panel-title">{t('achievements.caseTitle')}</h3>
                <p>{t('achievements.progress', { count: unlocked.length, total })}</p>
              </div>
              <span className="ach-panel__percent">{percent}%</span>
              <button ref={closeRef} type="button" className="ach-panel__close" onClick={() => setOpen(false)} aria-label={t('achievements.close')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            {/* one segment per achievement, like an XP bar */}
            <div className="ach-panel__bar" aria-hidden="true">
              {ACHIEVEMENTS.map((a, i) => (
                <span key={a.id} className={i < unlocked.length ? 'is-filled' : ''} />
              ))}
            </div>

            <ul className="ach-panel__grid">
              {ACHIEVEMENTS.map((a) => {
                const isUnlocked = unlocked.includes(a.id)
                return (
                  <li key={a.id} className={`ach-card rarity--${a.rarity}${isUnlocked ? ' is-unlocked' : ''}`}>
                    <AchievementBadge id={a.id} locked={!isUnlocked} className="ach-card__badge" />
                    <div className="ach-card__text">
                      <span className="ach-card__rarity">
                        {isUnlocked ? t(`skills.rarity.${a.rarity}`) : t('achievements.locked')}
                      </span>
                      <strong>{t(`achievements.list.${a.id}.title`)}</strong>
                      <small>{t(`achievements.list.${a.id}.desc`)}</small>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default TrophyCase
