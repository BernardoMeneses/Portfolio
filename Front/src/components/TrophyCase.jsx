import React, { useEffect, useRef, useState } from 'react'
import { ACHIEVEMENTS, useAchievements } from '../context/Achievements'
import { useI18n } from '../context/Preferences'

const TrophyCase = () => {
  const { t } = useI18n()
  const { unlocked } = useAchievements()
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)
  const triggerRef = useRef(null)

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

  const score = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).reduce((sum, a) => sum + a.points, 0)

  return (
    <>
      <button ref={triggerRef} type="button" className="trophy-trigger" onClick={() => setOpen(true)}>
        🏆 {t('footer.trophies')} <b>{unlocked.length}/{ACHIEVEMENTS.length}</b>
      </button>

      {open && (
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
                <p>{t('achievements.progress', { count: unlocked.length, total: ACHIEVEMENTS.length })} · G {score}</p>
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
        </div>
      )}
    </>
  )
}

export default TrophyCase
