import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ACHIEVEMENTS, useAchievements } from '../context/Achievements'
import { useI18n } from '../context/Preferences'
import AchievementStamp from './AchievementStamp'

const SEEN_KEY = 'bm:trophies-seen'
// Hand-placed look: every stamp lands at a slightly different angle
const TILTS = [-14, 9, -5, 16, -11, 6, -17, 12, -7, 10, -3]

// How many unlocks the visitor has already looked at (-1 = never opened the book)
const readSeen = () => {
  try {
    const value = localStorage.getItem(SEEN_KEY)
    return value === null ? -1 : Number(value) || 0
  } catch (error) {
    return -1
  }
}

const SealIcon = () => (
  <svg viewBox="0 0 24 24" className="trophy-trigger__seal" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M9.3 12.2l1.8 1.8 3.6-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// Navbar badge with progress + the achievement book
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

  const openBook = () => {
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`trophy-trigger${bump ? ' is-bumped' : ''}`}
        onClick={openBook}
        title={t('achievements.button')}
        aria-label={`${t('achievements.button')}: ${t('achievements.progress', { count: unlocked.length, total })}`}
      >
        <SealIcon />
        <span className="trophy-trigger__count">
          {unlocked.length}<span>/{total}</span>
        </span>
        {hasNews && <span className="trophy-trigger__dot" aria-hidden="true" />}
      </button>

      {/* Portalled: the navbar's backdrop-filter would otherwise trap the fixed overlay */}
      {open && createPortal(
        <div className="trophy-overlay" onClick={() => setOpen(false)}>
          <div
            className="stamp-book"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stamp-book-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="stamp-book__head">
              <div>
                <h3 id="stamp-book-title">{t('achievements.caseTitle')}</h3>
                <p>{t('achievements.progress', { count: unlocked.length, total })}</p>
              </div>
              <button ref={closeRef} type="button" className="stamp-book__close" onClick={() => setOpen(false)} aria-label={t('achievements.close')}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </header>

            <ul className="stamp-book__grid">
              {ACHIEVEMENTS.map((a, i) => {
                const isUnlocked = unlocked.includes(a.id)
                return (
                  <li
                    key={a.id}
                    className={`stamp-book__item${isUnlocked ? ' is-unlocked' : ''}`}
                    style={{ '--ink': a.ink, '--tilt': `${TILTS[i % TILTS.length]}deg` }}
                  >
                    <AchievementStamp id={a.id} locked={!isUnlocked} />
                    <strong>{t(`achievements.list.${a.id}.title`)}</strong>
                    <small>{t(`achievements.list.${a.id}.desc`)}</small>
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
