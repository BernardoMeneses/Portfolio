import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ACHIEVEMENTS, useAchievements } from '../context/Achievements'
import { useI18n } from '../context/Preferences'

const SEEN_KEY = 'bm:trophies-seen'

// How many unlocks the visitor has already looked at (-1 = never opened the case)
const readSeen = () => {
  try {
    const value = localStorage.getItem(SEEN_KEY)
    return value === null ? -1 : Number(value) || 0
  } catch (error) {
    return -1
  }
}

// Navbar badge with progress + the trophy case dialog
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

  const openCase = () => {
    setOpen(true)
    setSeen(unlocked.length)
    try {
      localStorage.setItem(SEEN_KEY, String(unlocked.length))
    } catch (error) {
      // fine, the dot just comes back next visit
    }
  }

  const total = ACHIEVEMENTS.length
  const score = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).reduce((sum, a) => sum + a.points, 0)
  const hasNews = seen < 0 || unlocked.length > seen

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`trophy-trigger${bump ? ' is-bumped' : ''}`}
        onClick={openCase}
        title={t('achievements.button')}
        aria-label={`${t('achievements.button')}: ${t('achievements.progress', { count: unlocked.length, total })}`}
      >
        <span className="trophy-trigger__icon" aria-hidden="true">🏆</span>
        <span className="trophy-trigger__count">
          {unlocked.length}/{total}
        </span>
        <span className="trophy-trigger__bar" aria-hidden="true">
          <span style={{ width: `${(unlocked.length / total) * 100}%` }} />
        </span>
        {hasNews && <span className="trophy-trigger__dot" aria-hidden="true" />}
      </button>

      {/* Portalled: the navbar's backdrop-filter would otherwise trap the fixed overlay */}
      {open && createPortal(
        <div className="trophy-overlay" onClick={() => setOpen(false)}>
          <div
            className="trophy-case"
            role="dialog"
            aria-modal="true"
            aria-labelledby="trophy-case-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="trophy-case__head">
              <div>
                <h3 id="trophy-case-title">{t('achievements.caseTitle')}</h3>
                <p>{t('achievements.progress', { count: unlocked.length, total })} · G {score}</p>
              </div>
              <button ref={closeRef} type="button" className="trophy-case__close" onClick={() => setOpen(false)} aria-label={t('achievements.close')}>
                ✕
              </button>
            </header>

            <ul className="trophy-case__list">
              {ACHIEVEMENTS.map((a) => {
                const isUnlocked = unlocked.includes(a.id)
                return (
                  <li key={a.id} className={isUnlocked ? 'is-unlocked' : ''}>
                    <span className="trophy-case__icon" aria-hidden="true">{isUnlocked ? a.icon : '🔒'}</span>
                    <span className="trophy-case__text">
                      <strong>{t(`achievements.list.${a.id}.title`)}</strong>
                      <small>{t(`achievements.list.${a.id}.desc`)}</small>
                    </span>
                    <span className="trophy-case__points">G {a.points}</span>
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
