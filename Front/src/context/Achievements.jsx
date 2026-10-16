import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from './Preferences'
import AchievementBadge from '../components/AchievementBadge'
import '../components/Styles/Achievements.scss'

// Titles / descriptions live in translations under achievements.list.<id>.
// Rarity uses the same tiers (and colours) as the skills inventory.
export const ACHIEVEMENTS = [
  { id: 'opened', rarity: 'common' },
  { id: 'polyglot', rarity: 'common' },
  { id: 'paper', rarity: 'common' },
  { id: 'firstBlood', rarity: 'common' },
  { id: 'holo', rarity: 'rare' },
  { id: 'reader', rarity: 'rare' },
  { id: 'guest', rarity: 'rare' },
  { id: 'collector', rarity: 'epic' },
  { id: 'archivist', rarity: 'epic' },
  { id: 'exterminator', rarity: 'legendary' },
  { id: 'cheater', rarity: 'legendary' },
]

const STORAGE_KEY = 'bm:achievements'
const POPUP_MS = 4200

const readUnlocked = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

const AchievementsContext = createContext(null)

export const AchievementsProvider = ({ children }) => {
  const { t } = useI18n()
  const [unlocked, setUnlocked] = useState(readUnlocked)
  const [queue, setQueue] = useState([])
  const unlockedRef = useRef(new Set(unlocked))

  const unlock = useCallback((id) => {
    if (unlockedRef.current.has(id) || !ACHIEVEMENTS.some((a) => a.id === id)) return
    unlockedRef.current.add(id)
    const next = [...unlockedRef.current]
    setUnlocked(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      // Not persisted, still celebrated.
    }
    setQueue((q) => [...q, id])
  }, [])

  // Show one popup at a time
  const current = queue[0]
  useEffect(() => {
    if (!current) return undefined
    const timer = setTimeout(() => setQueue((q) => q.slice(1)), POPUP_MS)
    return () => clearTimeout(timer)
  }, [current])

  const value = useMemo(() => ({ unlocked, unlock }), [unlocked, unlock])
  const achievement = ACHIEVEMENTS.find((a) => a.id === current)

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <div className="achievement-live" role="status" aria-live="polite">
        {achievement && (
          <div className={`ach-toast rarity--${achievement.rarity}`} key={achievement.id}>
            <AchievementBadge id={achievement.id} className="ach-toast__badge" />
            <div className="ach-toast__text">
              <small>
                {t('achievements.unlocked')} · {t(`skills.rarity.${achievement.rarity}`)}
              </small>
              <strong>{t(`achievements.list.${achievement.id}.title`)}</strong>
              <span>{t(`achievements.list.${achievement.id}.desc`)}</span>
            </div>
          </div>
        )}
      </div>
    </AchievementsContext.Provider>
  )
}

export const useAchievements = () => useContext(AchievementsContext)
